#!/usr/bin/env node

/**
 * Helper script to get the local IP address for connecting to the API
 */

const os = require('os');

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          interface: name,
          address: iface.address
        });
      }
    }
  }
  
  return ips;
}

const ips = getLocalIPs();

console.log('\n🌐 Network IP Addresses:\n');

if (ips.length === 0) {
  console.log('⚠️  No network interfaces found.');
  console.log('   The API is only accessible via localhost.');
} else {
  ips.forEach(({ interface: name, address }) => {
    console.log(`   ${name}: ${address}`);
    console.log(`   → http://${address}:${process.env.PORT || 3001}`);
  });
}

console.log('\n💡 Use one of these IPs to connect from other devices on your network.\n');

