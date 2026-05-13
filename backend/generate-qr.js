const QRCode = require('qrcode');
const os = require('os');
const path = require('path');

// Get local IP address (Windows compatible)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1'; // Fallback
}

const frontendPort = 5173; // Default Vite port
const ipAddress = getLocalIP();
const shopUrl = `http://${ipAddress}:${frontendPort}`;

console.log('----------------------------------------');
console.log(`Your Mercury Shop URL is: \x1b[36m${shopUrl}\x1b[0m`);
console.log('Ensure both frontend and backend are running.');
console.log('----------------------------------------');

// Generate QR Code in Terminal
QRCode.toString(shopUrl, { type: 'terminal', small: true }, function (err, url) {
  if (err) throw err;
  console.log('\nScan this QR Code from a mobile device on the same network:');
  console.log(url);
});

// Optionally generate a file
const filePath = path.join(__dirname, '..', 'shop-qr-code.png');
QRCode.toFile(filePath, shopUrl, {
  color: {
    dark: '#2563eb',  // Blue dots
    light: '#ffffff' // Transparent background
  }
}, function (err) {
  if (err) throw err;
  console.log(`\nA printable QR code image has been saved to: \x1b[32m${filePath}\x1b[0m\n`);
});
