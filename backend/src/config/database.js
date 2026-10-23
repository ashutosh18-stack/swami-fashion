const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;

let poolConfig = {};

if (connectionUri) {
  poolConfig = {
    uri: connectionUri,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '123456',
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'swami_fashion',
    port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    decimalNumbers: true
  };
}

// Automatically enable TLS/SSL for cloud databases (TiDB Cloud, Aiven, Railway, etc.)
const hostStr = (poolConfig.host || '').toLowerCase();
const uriStr = (connectionUri || '').toLowerCase();
const isLocalhost = hostStr === 'localhost' || hostStr === '127.0.0.1' || uriStr.includes('localhost') || uriStr.includes('127.0.0.1');

if (
  !isLocalhost ||
  process.env.DB_SSL === 'true' ||
  process.env.MYSQL_SSL === 'true' ||
  hostStr.includes('tidbcloud.com') ||
  poolConfig.port === 4000
) {
  poolConfig.ssl = {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(poolConfig);

// Test connection on startup
pool.getConnection()
  .then(conn => {
    const dbTarget = poolConfig.database || poolConfig.host || 'Cloud Database';
    console.log('✓ Successfully connected to MySQL database: ' + dbTarget);
    conn.release();
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
  });

module.exports = pool;

