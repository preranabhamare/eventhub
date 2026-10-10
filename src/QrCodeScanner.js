import React from 'react';
import QrScanner from 'react-qr-scanner';

const QrCodeScanner = ({ onScan, onError }) => {
  return (
    <div>
      <QrScanner
        delay={300} // Delay between scans in milliseconds
        onError={onError}
        onScan={onScan}
        style={{ width: '100%' }} // Adjust styling as needed
      />
    </div>
  );
};

export default QrCodeScanner;
