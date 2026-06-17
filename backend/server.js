require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const queueRoutes = require('./routes/queueRoutes');

const app = express();

// CORS must be registered before routes; JSON body parser must come after CORS
// (ensures browsers and clients are allowed, and req.body is populated)
// Configure CORS and JSON parsing before mounting routes

// Determine local IP address (IPv4, non-internal)
function getLocalIPv4() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIPv4();
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;
const PORT = process.env.PORT || 4000;

// Use permissive CORS for local development / LAN access so mobile devices
// on the same Wi‑Fi can POST to the backend without strict origin matching.
app.use(cors({
  origin: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

app.use('/api/queue', queueRoutes);

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`SmartQueue backend listening:`);
  // Log both localhost and LAN addresses
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${LOCAL_IP}:${PORT}`);
});
