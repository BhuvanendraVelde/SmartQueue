import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/app-dialog.css';

export default function AppDialog({ open, title, message, variant = 'info', onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const content = (
    <div className="app-dialog-backdrop" onClick={onClose} role="presentation">
      <div
        className={`app-dialog app-dialog--${variant}`}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={title ? 'app-dialog-title' : 'app-dialog-desc'}
        aria-describedby="app-dialog-desc"
      >
        {title ? (
          <h3 id="app-dialog-title" className="app-dialog__title">
            {title}
          </h3>
        ) : null}
        <p id="app-dialog-desc" className="app-dialog__message">
          {message}
        </p>
        <button type="button" className="app-dialog__btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
