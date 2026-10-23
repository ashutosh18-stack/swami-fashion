const mysql = require('./backend/node_modules/mysql2/promise');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

async function migrateAdmins() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'swami_fashion',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    await conn.execute('ALTER TABLE admins MODIFY pin_hash VARCHAR(255) NULL');
    console.log('Modified pin_hash to be nullable');
  } catch (e) {
    console.log('pin_hash note:', e.message);
  }

  const [cols] = await conn.execute('DESCRIBE admins');
  const fieldNames = cols.map(c => c.Field);

  if (!fieldNames.includes('role')) {
    await conn.execute("ALTER TABLE admins ADD COLUMN role VARCHAR(30) NOT NULL DEFAULT 'sub_admin'");
    console.log('Added role column');
  }

  if (!fieldNames.includes('is_active')) {
    await conn.execute("ALTER TABLE admins ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1");
    console.log('Added is_active column');
  }

  await conn.execute("UPDATE admins SET role = 'main_admin' WHERE id = 1 OR username = 'swami_admin'");
  console.log('Set swami_admin as main_admin');

  const [updatedCols] = await conn.execute('DESCRIBE admins');
  console.log('Admins columns:', updatedCols.map(c => c.Field));

  const [allAdmins] = await conn.execute('SELECT id, username, full_name, email, role, is_active FROM admins');
  console.log('Current admins:', allAdmins);

  await conn.end();
}

migrateAdmins().catch(console.error);
