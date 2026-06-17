import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SERVICE_OPTIONS = [
  'Paying exam fee',
  'Consulting regarding a particular query',
  'Taking semester hall tickets',
  'Taking semester certificates',
];

export default function QueueForm() {
  const [htno, setHtno] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {}, []);

  function validate() {
    const e = {};
    if (!htno.trim()) e.htno = 'Hall Ticket Number is required';
    if (!name.trim()) e.name = 'Student Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = 'Enter a valid email';
    if (!service) e.service = 'Please select a service type';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    setSubmitting(true);
    try {
      const payload = {
        htno: htno.trim(),
        name: name.trim(),
        email: email.trim(),
        service,
        notes: notes.trim(),
      };

      setSubmitError(null);

      // Determine API base: use env var or current host (supports mobile on same LAN)
      const API_BASE = process.env.REACT_APP_API_BASE || `${window.location.protocol}//${window.location.hostname}:4000`;

      // Send submission to backend for file storage and token generation
      const resp = await fetch(`${API_BASE}/api/queue/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(errText || 'Server error');
      }

      const data = await resp.json();

      // Save last submission (including generated token and datetime)
      const saved = {
        token: data.token,
        htno: payload.htno,
        name: payload.name,
        email: payload.email,
        service: payload.service,
        notes: payload.notes,
        datetime: data.datetime || new Date().toString(),
      };
      localStorage.setItem('smartqueue_last_submission', JSON.stringify(saved));

      // Small delay to simulate processing
      await new Promise((r) => setTimeout(r, 200));
      navigate('/confirmation');

      // reset form state
      setHtno('');
      setName('');
      setEmail('');
      setService('');
      setNotes('');
      setErrors({});
    } catch (err) {
      setSubmitError(err.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setHtno('');
    setName('');
    setEmail('');
    setService('');
    setNotes('');
    setErrors({});
    setSubmitError(null);
  }

  const todayStr = new Date().toLocaleDateString();

  return (
    <section className="form-section">
      <div className="form-card">
        <div className="form-title">
          <div className="form-date">{todayStr}</div>
          <h2>SmartQueue — Student Form</h2>
        </div>

        <form className="queue-form" onSubmit={handleSubmit} noValidate>
        <label>
          Hall Ticket Number*
          <input value={htno} onChange={(e) => setHtno(e.target.value)} placeholder="Enter hall ticket number" />
          {errors.htno && <div className="error">{errors.htno}</div>}
        </label>

        <label>
          Student Name*
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
          {errors.name && <div className="error">{errors.name}</div>}
        </label>

        <label>
          Email ID*
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          {errors.email && <div className="error">{errors.email}</div>}
        </label>

        <label>
          Service Type*
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">-- Select service --</option>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.service && <div className="error">{errors.service}</div>}
        </label>

        <label>
          Additional Notes (optional)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional information" />
        </label>

        {submitError && <div className="error">Submission failed: {String(submitError)}</div>}
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={handleCancel} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
        </form>
      </div>
    </section>
  );
}
