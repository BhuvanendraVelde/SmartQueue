import React, { useMemo, useState, useEffect } from 'react';
import AppDialog from './AppDialog';
import '../styles/admin-table.css';

export default function AdminTable({ records = [] }) {
  const [filter, setFilter] = useState('');
  const [servedDatetimes, setServedDatetimes] = useState(new Set());
  const [dialog, setDialog] = useState(null);

  const services = useMemo(() => Array.from(new Set(records.map((r) => r.service).filter(Boolean))), [records]);

  const API_BASE = process.env.REACT_APP_API_BASE || `${window.location.protocol}//${window.location.hostname}:4000`;

  useEffect(() => {
    const init = new Set();
    for (const r of records) {
      if (r && r.served && r.datetime) init.add(r.datetime);
    }
    setServedDatetimes(init);
  }, [records]);

  const today = new Date();
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const rows = useMemo(() => {
    let list = records.slice().sort((a, b) => (Number(a.token) || 0) - (Number(b.token) || 0));
    // show only today's tokens
    list = list.filter((r) => {
      const dt = new Date(r.datetime);
      return isSameDay(dt, today);
    });
    if (filter) list = list.filter((r) => r.service === filter);
    return list;
  }, [records, filter, today]);

  function formatDateTime(datetime) {
    try {
      const d = new Date(datetime);
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (e) {
      return datetime;
    }
  }

  async function handleNotify(record) {
    if (!record || !record.datetime) return;
    try {
      const resp = await fetch(`${API_BASE}/api/queue/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datetime: record.datetime }),
      });
      if (!resp.ok) throw new Error('Notify failed');
      setDialog({
        title: 'Success',
        message: 'Notification sent successfully.',
        variant: 'success',
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Notify error:', err);
      setDialog({
        title: 'Error',
        message: 'Failed to send notification. Try again.',
        variant: 'error',
      });
    }
  }

  async function handleServe(datetime) {
    if (!datetime) return;
    try {
      const resp = await fetch(`${API_BASE}/api/queue/serve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datetime }),
      });
      if (!resp.ok) throw new Error('Failed to mark served');
      setServedDatetimes((prev) => {
        const next = new Set(prev);
        next.add(datetime);
        return next;
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Serve error:', err);
      setDialog({
        title: 'Error',
        message: 'Failed to mark as served. Try again.',
        variant: 'error',
      });
    }
  }

  return (
    <div className="admin-table">
      <div className="table-controls">
        <label>
          Filter by service:
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All</option>
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <div className="count">Total: {rows.length}</div>
      </div>

      <div className="table-wrap">
        <table>
          <colgroup>
            <col className="admin-col-token" />
            <col className="admin-col-htno" />
            <col className="admin-col-name" />
            <col className="admin-col-email" />
            <col className="admin-col-service" />
            <col className="admin-col-dt" />
            <col className="admin-col-action" />
          </colgroup>
          <thead className="table-header">
            <tr>
              <th>Token</th>
              <th>Hall Ticket</th>
              <th>Name</th>
              <th>Email</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const served = servedDatetimes.has(r.datetime);
              return (
                <tr key={`${r.token}-${r.datetime}`} className={served ? 'row-served' : ''}>
                  <td>{r.token}</td>
                  <td>{r.htno}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.service}</td>
                  <td>{formatDateTime(r.datetime)}</td>
                  <td className="action-cell">
                    <button className="btn btn-notify" onClick={() => handleNotify(r)} disabled={served}>Notify</button>
                    <button className="btn btn-served" onClick={() => handleServe(r.datetime)} disabled={served}>Served</button>
                    {served && <span className="served-label">Served</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AppDialog
        open={Boolean(dialog)}
        title={dialog?.title}
        message={dialog?.message ?? ''}
        variant={dialog?.variant ?? 'info'}
        onClose={() => setDialog(null)}
      />
    </div>
  );
}
