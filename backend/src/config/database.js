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

// Enable SSL if required by cloud provider (e.g. TiDB, Aiven, PlanetScale, Azure)
if (process.env.DB_SSL === 'true' || process.env.MYSQL_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
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

