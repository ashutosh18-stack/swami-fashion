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

    // Auto-migrate schema updates for existing admins table
    try {
      const [cols] = await conn.execute('DESCRIBE admins');
      const fieldNames = cols.map(c => c.Field);
      if (!fieldNames.includes('role')) {
        await conn.execute("ALTER TABLE admins ADD COLUMN role VARCHAR(30) NOT NULL DEFAULT 'main_admin'");
        console.log('✓ Added role column to admins');
      }
      if (!fieldNames.includes('is_active')) {
        await conn.execute("ALTER TABLE admins ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
        console.log('✓ Added is_active column to admins');
      }
      await conn.execute("ALTER TABLE admins MODIFY pin_hash VARCHAR(255) NULL");
      await conn.execute("UPDATE admins SET role = 'main_admin', is_active = 1 WHERE username = 'swami_admin' OR id = 1");
      console.log('✓ Admins table verified and updated.');
    } catch (schemaErr) {
      console.warn('Admins column check note:', schemaErr.message);
    }
  } catch (err) {
    console.error('✗ Migration failed:', err.message);
    throw err;
  } finally {
    conn.release();
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
