import React from 'react';

export default function QRDisplay() {
  const formUrl = `${window.location.origin}/form`;

  return (
    <div className="qr-only full-screen-qr">
      <div className="qr-inner">
        <div className="qr-copy">
          <h2 className="qr-title">SmartQueue</h2>
        </div>
        <div className="qr-card-center">
          <img
            className="qr-image"
            alt="Scan to open SmartQueue form"
            src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
              formUrl
            )}`}
          />
        </div>
        <p className="qr-hint">Scan this QR code to open the SmartQueue form.</p>
        <p className="qr-sub">Scan to Join Examination Queue</p>
      </div>
    </div>
  );
}
