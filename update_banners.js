const mysql = require('./backend/node_modules/mysql2/promise');
require('./backend/node_modules/dotenv').config({ path: './backend/.env' });

async function updateBanners() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'swami_fashion',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  await conn.execute('DELETE FROM banners');
  const sql = `INSERT INTO banners (title, subtitle, tag, media_type, media_url, button_text, button_url, sort_order, is_active)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1), (?, ?, ?, ?, ?, ?, ?, ?, 1)`;
  await conn.execute(sql, [
    "MEN'S CASUAL & REGULAR FIT",
    'Breathable Pure Cottons, Relaxed Silhouettes and Everyday Essentials',
    '',
    'image',
    '/uploads/mens_hero_banner.jpg',
    'Shop Collection',
    '/catalogue',
    1,
    'EVERYDAY PIQUE POLOS & DENIMS',
    'Honest Kolhapur Value from ₹299 to ₹1300 with Instant WhatsApp Ordering',
    '',
    'image',
    '/uploads/mens_hero_banner_2.jpg',
    'Explore Polos & Denims',
    '/catalogue?category=polo-tshirts',
    2
  ]);

  console.log('Banners updated in MySQL database successfully!');
  await conn.end();
}

updateBanners();
