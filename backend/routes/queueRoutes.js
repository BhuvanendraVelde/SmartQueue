const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');

// Debug: verify API key loaded before configuring SendGrid
console.log(
  'SENDGRID_API_KEY loaded:',
  process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith('SG.')
);

// Configure SendGrid from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'smartqueue-records.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

function todayKey(date = new Date()) {
  // Use local date components to avoid UTC conversion issues (keeps local midnight)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD (local time)
}

router.post('/submit', async (req, res) => {
  try {
    const payload = req.body;

    // Temporary debug to verify request body from clients (remove after testing)
    // eslint-disable-next-line no-console
    console.log('REQ BODY:', payload);

    // Safe validation: ensure fields are strings and non-empty after trimming
    const { htno, name, email, service } = payload || {};

    if (
      typeof htno !== 'string' || !htno.trim() ||
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof service !== 'string' || !service.trim()
    ) {
      return res.status(400).json({ error: 'Invalid submission' });
    }

    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    let existing = [];
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf8');
      existing = JSON.parse(raw || '[]');
      if (!Array.isArray(existing)) existing = [];
    } catch (err) {
      existing = [];
    }

    // compute today's date key and filter today's records
    const today = todayKey(new Date());
    const todaysRecords = existing.filter((r) => {
      if (!r.datetime) return false;
      try {
        const recordDate = new Date(r.datetime);
        return todayKey(recordDate) === today;
      } catch (e) {
        return false;
      }
    });

    // find max token among today's records
    let maxToken = 0;
    for (const r of todaysRecords) {
      if (typeof r.token === 'number' && r.token > maxToken) {
        maxToken = r.token;
      }
    }

    const nextToken = maxToken + 1;

    const now = new Date();
    const record = {
      token: nextToken,
      htno: String(payload.htno || '').trim(),
      name: String(payload.name || '').trim(),
      email: String(payload.email || '').trim(),
      service: String(payload.service || '').trim(),
      notes: String(payload.notes || '').trim(),
      datetime: now.toString(),
    };

    existing.push(record);

    await fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), 'utf8');

    return res.json({ success: true, token: nextToken, datetime: record.datetime });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error writing record:', err);
    return res.status(500).json({ error: 'Failed to save record' });
  }
});

// Mark a record as served (by datetime string)
router.post('/serve', async (req, res) => {
  try {
    const { datetime } = req.body || {};
    if (!datetime) return res.status(400).json({ error: 'Missing datetime' });

    let existing = [];
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf8');
      existing = JSON.parse(raw || '[]');
      if (!Array.isArray(existing)) existing = [];
    } catch (err) {
      existing = [];
    }

    // find the first record that matches the datetime string exactly
    const idx = existing.findIndex((r) => r && r.datetime === datetime);
    if (idx === -1) return res.status(404).json({ error: 'Record not found' });

    existing[idx].served = true;
    existing[idx].servedAt = new Date().toString();

    await fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), 'utf8');

    return res.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error marking served:', err);
    return res.status(500).json({ error: 'Failed to mark served' });
  }
});

// Notify a single record by exact datetime string using SendGrid Dynamic Template
router.post('/notify', async (req, res) => {
  try {
    const { datetime } = req.body || {};
    if (!datetime) return res.status(400).json({ error: 'Datetime required' });

    let existing = [];
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf8');
      existing = JSON.parse(raw || '[]');
      if (!Array.isArray(existing)) existing = [];
    } catch (err) {
      existing = [];
    }

    const record = existing.find((r) => r && r.datetime === datetime);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    // send email using dynamic template data (only name, token, service)
    await sgMail.send({
      to: record.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      templateId: process.env.SENDGRID_TEMPLATE_ID,
      dynamicTemplateData: {
        name: record.name,
        token: record.token,
        service: record.service,
      },
    });

    return res.json({ success: true });
  } catch (err) {
    // Detailed SendGrid error logging for diagnosis
    // eslint-disable-next-line no-console
    console.error('❌ SendGrid Notify Error');

    if (err && err.response) {
      try {
        // Some SendGrid errors expose response.statusCode and response.body
        console.error('Status Code:', err.response.statusCode);
        console.error('Response Body:', err.response.body);
        console.error('Response Headers:', err.response.headers);
      } catch (inner) {
        console.error('Error logging SendGrid response:', inner);
      }
    } else {
      console.error(err);
    }

    return res.status(500).json({ error: 'Notify failed' });
  }
});

  // Return all records (read-only) for admin dashboard
  router.get('/records', async (req, res) => {
    try {
      let existing = [];
      try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        existing = JSON.parse(raw || '[]');
        if (!Array.isArray(existing)) existing = [];
      } catch (err) {
        existing = [];
      }
      return res.json(existing);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error reading records:', err);
      return res.status(500).json({ error: 'Failed to read records' });
    }
  });

// Get queue status for a specific token
router.get('/status', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: 'Token required' });

    let existing = [];
    try {
      const raw = await fs.readFile(DATA_FILE, 'utf8');
      existing = JSON.parse(raw || '[]');
      if (!Array.isArray(existing)) existing = [];
    } catch (err) {
      existing = [];
    }

    // Filter today's records
    const today = todayKey(new Date());
    const todaysRecords = existing.filter((r) => {
      if (!r.datetime) return false;
      try {
        const recordDate = new Date(r.datetime);
        return todayKey(recordDate) === today;
      } catch (e) {
        return false;
      }
    });

    // Find the current token being served (highest served token)
    let currentServing = 0;
    for (const r of todaysRecords) {
      if (r.served && typeof r.token === 'number' && r.token > currentServing) {
        currentServing = r.token;
      }
    }

    const userToken = parseInt(token, 10);
    if (isNaN(userToken)) return res.status(400).json({ error: 'Invalid token' });

    // Find user's record
    const userRecord = todaysRecords.find(r => r.token === userToken);
    if (!userRecord) return res.status(404).json({ error: 'Token not found' });

    // Count people ahead (tokens between currentServing + 1 and userToken - 1)
    const ahead = todaysRecords.filter(r => 
      r.token > currentServing && r.token < userToken && !r.served
    ).length;

    // Assume average service time of 5 minutes per person
    const avgServiceTimeMinutes = 5;
    const estimatedWaitMinutes = ahead * avgServiceTimeMinutes;

    return res.json({
      currentServing,
      userToken,
      peopleAhead: ahead,
      estimatedWaitMinutes,
      isServed: userRecord.served || false
    });
  } catch (err) {
    console.error('Error getting status:', err);
    return res.status(500).json({ error: 'Failed to get status' });
  }
});

// Admin login (validate against local admin.json with bcrypt-hashed password)
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    let admins = [];
    try {
      const raw = await fs.readFile(ADMIN_FILE, 'utf8');
      admins = JSON.parse(raw || '[]');
      if (!Array.isArray(admins)) admins = [];
    } catch (e) {
      return res.status(500).json({ error: 'Admin file not found' });
    }

    const admin = admins.find((a) => a.username === username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.json({
      success: true,
      username: admin.username,
      email: admin.email,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
