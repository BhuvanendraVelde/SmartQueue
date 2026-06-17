import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Confirmation() {
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);

  const pollingRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('smartqueue_last_submission'));
      setSubmission(saved);
    } catch (e) {
      setSubmission(null);
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchQueueStatus = useCallback(async (token) => {
    if (!token) return;

    const host = window.location.hostname === 'localhost'
      ? 'localhost'
      : window.location.hostname;
    const baseUrl = `${window.location.protocol}//${host}:4000`;

    try {
      const response = await fetch(`${baseUrl}/api/queue/status?token=${token}`);
      const data = await response.json();
      if (data.error) {
        console.error('Error fetching queue status:', data.error);
        return;
      }
      setQueueStatus(data);
      setCountdown(data.estimatedWaitMinutes * 60);
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!submission?.token) {
      setLoading(false);
      return;
    }

    fetchQueueStatus(submission.token);
    pollingRef.current = setInterval(() => fetchQueueStatus(submission.token), 10000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [submission, fetchQueueStatus]);

  useEffect(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    if (countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown((current) => Math.max(current - 1, 0));
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [countdown]);

  if (!submission) {
    return (
      <section className="confirmation">
        <div className="confirmation-inner">
          <div className="success">ℹ️</div>
          <h2>No recent submission</h2>
          <p className="confirm-message">No submission found. Please scan the QR to open the form.</p>
          <div className="confirm-actions">
            <button className="btn" onClick={() => navigate('/')}>Back to QR</button>
          </div>
        </div>
      </section>
    );
  }

  const { token, name, service, datetime } = submission;

  return (
    <section className="confirmation">
      <div className="confirmation-inner">
        <div className="success">✅</div>
        <h2>Submission Confirmed</h2>
        <p className="confirm-message">Your token has been generated successfully. Please stay nearby and wait for your turn.</p>

        <div className="token-card">
          <div className="token-number">Your Token: <strong>{token}</strong></div>
          <div className="token-row">Name: {name}</div>
          <div className="token-row">Service: {service}</div>
          <div className="token-row">Date & Time: {new Date(datetime).toLocaleString()}</div>
        </div>

        {loading ? (
          <div className="queue-status">
            <p>Loading queue status...</p>
          </div>
        ) : queueStatus ? (
          <div className="queue-status">
            {queueStatus.isServed ? (
              <div className="served-message">
                <div className="success">🎉</div>
                <h3>It's Your Turn!</h3>
                <p>Please proceed to the service counter. Your token has been called.</p>
              </div>
            ) : (
              <>
                <div className="status-card">
                  <div className="status-row">
                    <span className="status-label">Currently Serving:</span>
                    <span className="status-value">{queueStatus.currentServing || 'None'}</span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">Your Position:</span>
                    <span className="status-value">{queueStatus.peopleAhead + 1}</span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">People Ahead:</span>
                    <span className="status-value">{queueStatus.peopleAhead}</span>
                  </div>
                  <div className="status-row">
                    <span className="status-label">Estimated Wait:</span>
                    <span className="status-value">{queueStatus.estimatedWaitMinutes} minutes</span>
                  </div>
                  {countdown > 0 && (
                    <div className="countdown-timer">
                      <div className="timer-label">Time Remaining:</div>
                      <div className="timer-display">{formatTime(countdown)}</div>
                    </div>
                  )}
                </div>
                <div className="instruction-message">
                  <p>📍 Please stay nearby and keep this page open. You will be notified via email when it's your turn.</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="queue-status">
            <p>Unable to load queue status. Please refresh the page.</p>
          </div>
        )}

        <div className="confirm-actions">
          <button className="btn" onClick={() => navigate('/')}>Back to QR</button>
        </div>
      </div>
    </section>
  );
}
