const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows DNS SRV lookup ECONNREFUSED error on Node.js c-ares DNS resolver
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('DNS server configuration warning:', dnsErr.message);
}

/**
 * Ensure the MongoDB URI always targets the `smart_inventory` database.
 * Atlas URIs that come without a database path (e.g. ...mongodb.net/?appName=...)
 * would connect to the default `test` database, so we inject the name here.
 */
const ensureDatabaseName = (uri) => {
  if (!uri) return uri;
  // Pattern: ...mongodb.net/?...  → inject database name before the `?`
  if (uri.includes('mongodb.net/?')) {
    return uri.replace('mongodb.net/?', 'mongodb.net/smart_inventory?');
  }
  // Pattern: ...mongodb.net/  (no DB name, no query string)
  if (/mongodb\.net\/?$/.test(uri)) {
    return uri.replace(/\/?$/, '/smart_inventory');
  }
  return uri;
};

const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    console.error('FATAL: MONGODB_URI environment variable is not set.');
    process.exit(1);
  }

  const uri = ensureDatabaseName(rawUri);

  // Log masked URI so we can verify the database name without exposing credentials
  const maskedUri = uri.replace(/:([^@]+)@/, ':***@');
  console.log('Connecting to MongoDB:', maskedUri);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    const dbHost = conn.connection.host;
    const dbName = conn.connection.name;
    const readyState = mongoose.connection.readyState; // 1 = connected

    console.log('=== MONGODB CONNECTION STATUS ===');
    console.log(`Host      : ${dbHost}`);
    console.log(`Database  : ${dbName}`);
    console.log(`ReadyState: ${readyState} (1 = connected)`);
    console.log('=================================');

    if (dbName !== 'smart_inventory') {
      console.warn(
        `WARNING: Connected to database "${dbName}" instead of "smart_inventory". ` +
          'Products will NOT appear where expected. Check your MONGODB_URI.'
      );
    }
  } catch (error) {
    console.error('=== MONGODB CONNECTION FAILED ===');
    console.error(`Error: ${error.message}`);
    console.error('');
    console.error('Possible causes:');
    console.error('  1. Network/internet connectivity issue');
    console.error('  2. Wrong MONGODB_URI in backend/.env');
    console.error('  3. MongoDB Atlas IP whitelist does not include this machine (add 0.0.0.0/0 for dev)');
    console.error('  4. Wrong Atlas username/password in the connection string');
    console.error('  5. Atlas cluster is paused or deleted');
    console.error('=================================');
    process.exit(1);
  }
};

module.exports = connectDB;
