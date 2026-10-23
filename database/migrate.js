const fs = require('fs');
const path = require('path');
const pool = require('../backend/src/config/database');

async function migrate() {
  console.log('--- Starting Database Migration for Swami Fashion ---');
  const sqlPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
  const rawSql = fs.readFileSync(sqlPath, 'utf8');

  // Remove full-line comments and clean up SQL
  const cleanSql = rawSql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

  // Split by semicolon, filter empty statements, and omit CREATE DATABASE / USE statements
  const statements = cleanSql
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => {
      if (!stmt) return false;
      const upper = stmt.toUpperCase();
      if (upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) {
        return false;
      }
      return true;
    });

  const conn = await pool.getConnection();

  try {
    for (const statement of statements) {
      if (statement.length > 5) {
        await conn.query(statement);
      }
    }
    console.log('✓ Successfully executed all database schema migrations.');
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    throw err;
  } finally {
    conn.release();
    // Do not call process.exit if called from an automated script
  }
}

if (require.main === module) {
  migrate()
    .then(() => {
      console.log('--- Migration Finished Successfully ---');
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = migrate;
