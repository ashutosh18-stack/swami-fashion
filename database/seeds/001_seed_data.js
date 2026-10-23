// Swami Fashion - Men's Casual & Regular Fit Seed Script
// Light Theme, Prices between ₹299 to ₹1300, Kolhapur Atelier Details
const path = require('path');
const mysql = require(path.join(__dirname, '../../backend/node_modules/mysql2/promise'));
const argon2 = require(path.join(__dirname, '../../backend/node_modules/argon2'));
require(path.join(__dirname, '../../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../../backend/.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'swami_fashion',
  port: parseInt(process.env.DB_PORT || '3306')
};

async function seed() {
  console.log('Connecting to database:', DB_CONFIG.database);
  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    const adminUser = process.env.ADMIN_INIT_USER || 'swami_admin';
    const adminPass = process.env.ADMIN_INIT_PASS || 'SwamiLuxury@2026!';
    const adminPin = process.env.ADMIN_INIT_PIN || '882200';

    const passwordHash = await argon2.hash(adminPass, { type: argon2.argon2id });
    const pinHash = await argon2.hash(adminPin, { type: argon2.argon2id });

    // Seed or update Admin
    const [existingAdmins] = await conn.execute('SELECT id FROM admins WHERE username = ?', [adminUser]);
    if (existingAdmins.length === 0) {
      await conn.execute(
        `INSERT INTO admins (username, password_hash, pin_hash, full_name, email)
         VALUES (?, ?, ?, 'Swami Fashion Store Manager', 'contact@swamifashion.com')`,
        [adminUser, passwordHash, pinHash]
      );
    } else {
      await conn.execute(
        `UPDATE admins SET password_hash = ?, pin_hash = ? WHERE username = ?`,
        [passwordHash, pinHash, adminUser]
      );
    }

    // Light Theme Website Settings
    const settings = [
      { key: 'brand_name', val: 'SWAMI FASHION' },
      { key: 'brand_tagline', val: "Men's Casual & Regular Fit Clothing" },
      { key: 'logo_url', val: '/logo.jpg' },
      { key: 'primary_color', val: '#5A2A18' },      // Imperial Cognac Bronze (from logo)
      { key: 'secondary_color', val: '#C5A059' },    // Champagne Gold Accent
      { key: 'accent_color', val: '#8E163B' },       // Ruby Accent
      { key: 'secondary_accent', val: '#1B2A4A' },   // Midnight Navy
      { key: 'background_color', val: '#FAF8F5' },   // Light Warm Ivory / Cream
      { key: 'surface_color', val: '#FFFFFF' },      // Pure Card White
      { key: 'text_color', val: '#1C1410' },         // Dark Espresso / Crisp Charcoal
      { key: 'muted_color', val: '#6E5D53' },        // Warm Taupe Muted
      { key: 'border_color', val: 'rgba(90, 42, 24, 0.12)' }, // Subtle luxury border
      { key: 'whatsapp_number', val: '918180004630' },
      { key: 'instagram_url', val: 'https://www.instagram.com/swami_fashion_09/' },
      { key: 'business_address', val: 'Chhatrapati Shivaji Peth, near School No. 8, Tiranga Chowk, Kolhapur.' },
      { key: 'contact_email', val: 'contact@swamifashion.com' },
      { key: 'business_hours', val: 'Mon - Sun: 10:00 AM - 09:30 PM' },
      { key: 'footer_description', val: 'Swami Fashion Kolhapur - Premium men’s casual & regular fit collection crafted for comfort, daily style, and unmatched everyday value.' },
      { key: 'about_story', val: 'Located in the historic heart of Kolhapur at Chhatrapati Shivaji Peth, Swami Fashion brings modern regular-fit fashion, breathable cottons, and versatile menswear directly to everyday men. We focus on durable stitching, comfortable fits, and clean designs that look sharp anywhere.' },
      { key: 'about_philosophy', val: 'Comfortable regular fit cuts, high-grade breathable cottons, and honest pricing. From crisp linen casual shirts to durable stretch denims, Swami Fashion is your everyday wardrobe partner.' }
    ];

    for (const s of settings) {
      await conn.execute(
        `INSERT INTO website_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [s.key, s.val]
      );
    }
    console.log('Website settings seeded.');

    // Categories: Men's Casual & Regular Fit Only
    const categories = [
      {
        name: 'Casual Regular Fit Shirts',
        slug: 'casual-shirts',
        description: 'Crisp cotton and Oxford weave button-down casual shirts designed for all-day comfort and effortless styling.',
        image_url: '/uploads/mens_casual_shirt.jpg',
        sort_order: 1
      },
      {
        name: 'Classic Polo & T-Shirts',
        slug: 'polo-tshirts',
        description: 'Bio-washed combed cotton t-shirts and breathable pique polo shirts in classic shades.',
        image_url: '/uploads/mens_polo_tshirt.jpg',
        sort_order: 2
      },
      {
        name: 'Everyday Denims & Jeans',
        slug: 'denims-jeans',
        description: 'Durable regular fit stretch denim jeans in clean dark indigo, stone wash, and black.',
        image_url: '/uploads/mens_denim_jeans.jpg',
        sort_order: 3
      },
      {
        name: 'Casual Chinos & Cargo Pants',
        slug: 'chinos-cargos',
        description: 'Flat-front regular fit cotton chinos and utility cargo trousers for versatile casual wear.',
        image_url: '/uploads/mens_chino_cargo.jpg',
        sort_order: 4
      },
      {
        name: 'Linen Blend Casuals',
        slug: 'linen-casuals',
        description: 'Lightweight linen blend casual shirts and mandarin collar tunics perfect for warm climates.',
        image_url: '/uploads/mens_check_shirt.jpg',
        sort_order: 5
      }
    ];

    const catMap = {};
    for (const cat of categories) {
      await conn.execute(
        `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), image_url = VALUES(image_url)`,
        [cat.name, cat.slug, cat.description, cat.image_url, cat.sort_order]
      );
      const [rows] = await conn.execute('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
      catMap[cat.slug] = rows[0].id;
    }
    console.log('Categories seeded.');

    // Collections
    const collections = [
      {
        name: 'Essential Regular Fit Shirts',
        slug: 'regular-fit-shirts',
        tagline: 'All-Day Casual Comfort',
        description: 'Classic solid, striped, and checked cotton shirts tailored in an easy regular fit silhouette.',
        image_url: '/uploads/mens_casual_shirt.jpg',
        sort_order: 1
      },
      {
        name: 'Everyday Polos & Tees',
        slug: 'everyday-tees',
        tagline: '100% Breathable Combed Cotton',
        description: 'Rich colors, durable collar construction, and super soft bio-washed fabric for daily wear.',
        image_url: '/uploads/mens_polo_tshirt.jpg',
        sort_order: 2
      },
      {
        name: 'Kolhapur Denim & Chino Edit',
        slug: 'denim-chino-edit',
        tagline: 'Rugged Durability & Stretch',
        description: 'Everyday bottomwear crafted with flexible waistband comfort and reinforced twin stitching.',
        image_url: '/uploads/mens_denim_jeans.jpg',
        sort_order: 3
      }
    ];

    const collMap = {};
    for (const c of collections) {
      await conn.execute(
        `INSERT INTO collections (name, slug, tagline, description, image_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), tagline = VALUES(tagline), description = VALUES(description), image_url = VALUES(image_url)`,
        [c.name, c.slug, c.tagline, c.description, c.image_url, c.sort_order]
      );
      const [rows] = await conn.execute('SELECT id FROM collections WHERE slug = ?', [c.slug]);
      collMap[c.slug] = rows[0].id;
    }
    console.log('Collections seeded.');

    // Hero Banners (Clean, Men's Casual & Regular fit, no Campaign Badge Tag)
    const banners = [
      {
        title: 'MEN’S CASUAL & REGULAR FIT',
        subtitle: 'Effortless Daily Shirts, Breathable Polos & Rugged Denims',
        tag: '',
        media_type: 'image',
        media_url: '/uploads/mens_hero_banner.jpg',
        button_text: 'Shop Collection',
        button_url: '/catalogue',
        sort_order: 1
      },
      {
        title: 'EVERYDAY COMFORT COTTONS',
        subtitle: 'Regular Fit Button-Downs & Pique Cotton Polos from ₹299 to ₹1300',
        tag: '',
        media_type: 'image',
        media_url: '/uploads/mens_casual_shirt.jpg',
        button_text: 'Explore Shirts & Tees',
        button_url: '/catalogue?category=casual-shirts',
        sort_order: 2
      },
      {
        title: 'SWAMI FASHION KOLHAPUR',
        subtitle: 'Visit Our Store at Chhatrapati Shivaji Peth or Order via WhatsApp',
        tag: '',
        media_type: 'image',
        media_url: '/uploads/mens_denim_jeans.jpg',
        button_text: 'View Denims & Chinos',
        button_url: '/catalogue?category=denims-jeans',
        sort_order: 3
      }
    ];

    await conn.execute('DELETE FROM banners');
    for (const b of banners) {
      await conn.execute(
        `INSERT INTO banners (title, subtitle, tag, media_type, media_url, button_text, button_url, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [b.title, b.subtitle, b.tag, b.media_type, b.media_url, b.button_text, b.button_url, b.sort_order]
      );
    }
    console.log('Banners seeded.');

    // Clean old products
    await conn.execute('DELETE FROM collection_products');
    await conn.execute('DELETE FROM product_images');
    await conn.execute('DELETE FROM products');

    // Seed Realistic Men's Casual & Regular Fit Products with prices between ₹299 and ₹1300
    const products = [
      {
        name: 'Regular Fit Pure Cotton Casual Shirt in Sky Blue',
        slug: 'regular-fit-cotton-casual-shirt-sky-blue',
        sku: 'SWAMI-SHT-01',
        category_slug: 'casual-shirts',
        collection_slug: 'regular-fit-shirts',
        description: 'Made from 100% premium breathable cotton, this regular fit button-down shirt delivers relaxed comfort and clean styling. Features a spread collar, single chest pocket, and curved hem for tucked or untucked wear.',
        fabric: '100% Combed Cotton Oxford Weave',
        care_instructions: 'Machine wash cold with like colors. Warm iron if needed.',
        selling_price: 699.00,
        original_price: 999.00,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Sky Blue', 'White', 'Navy Blue', 'Dusty Olive'],
        stock_quantity: 18,
        is_featured: 1,
        is_new_arrival: 1,
        images: [
          '/uploads/mens_casual_shirt.jpg',
          '/uploads/mens_check_shirt.jpg'
        ]
      },
      {
        name: 'Classic Pique Cotton Polo T-Shirt in Navy',
        slug: 'classic-pique-cotton-polo-tshirt-navy',
        sku: 'SWAMI-POLO-02',
        category_slug: 'polo-tshirts',
        collection_slug: 'everyday-tees',
        description: 'Crafted with premium honeycomb pique cotton knit, this polo features a ribbed collar, two-button placket, and side split hem. Durable color-lock fabric retains vibrancy after repeated washes.',
        fabric: '220 GSM 100% Pique Cotton Knit',
        care_instructions: 'Machine wash cold, do not bleach. Dry in shade.',
        selling_price: 499.00,
        original_price: 799.00,
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: ['Navy Blue', 'Classic White', 'Jet Black', 'Wine Red'],
        stock_quantity: 24,
        is_featured: 1,
        is_new_arrival: 1,
        images: [
          '/uploads/mens_polo_tshirt.jpg',
          '/uploads/mens_casual_shirt.jpg'
        ]
      },
      {
        name: 'Everyday Regular Fit Stretch Denim Jeans in Deep Indigo',
        slug: 'everyday-regular-fit-stretch-denim-jeans',
        sku: 'SWAMI-JNS-03',
        category_slug: 'denims-jeans',
        collection_slug: 'denim-chino-edit',
        description: 'Engineered for real-world daily mobility. Features 98% cotton with 2% elastane stretch, five-pocket regular fit silhouette, sturdy brass zipper fly, and reinforced belt loops.',
        fabric: '11.5 oz Stretch Cotton Denim (98% Cotton, 2% Elastane)',
        care_instructions: 'Turn inside out and wash in cold water to preserve deep indigo shade.',
        selling_price: 1199.00,
        original_price: 1599.00,
        sizes: ['30', '32', '34', '36', '38'],
        colors: ['Deep Indigo', 'Charcoal Black', 'Mid Stone Wash'],
        stock_quantity: 15,
        is_featured: 1,
        is_new_arrival: 1,
        images: [
          '/uploads/mens_denim_jeans.jpg',
          '/uploads/mens_chino_cargo.jpg'
        ]
      },
      {
        name: 'Casual Check Regular Fit Cotton Shirt in Forest Green',
        slug: 'casual-check-regular-fit-cotton-shirt-green',
        sku: 'SWAMI-SHT-04',
        category_slug: 'casual-shirts',
        collection_slug: 'regular-fit-shirts',
        description: 'Classic windowpane check shirt woven from soft-spun twill cotton. Looks great worn open over a plain t-shirt or buttoned up with chinos.',
        fabric: '100% Pre-washed Twill Cotton',
        care_instructions: 'Machine wash regular, tumble dry low.',
        selling_price: 749.00,
        original_price: 1099.00,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Forest Green & White Check', 'Navy & Crimson Check', 'Grey & Black Check'],
        stock_quantity: 12,
        is_featured: 1,
        is_new_arrival: 0,
        images: [
          '/uploads/mens_check_shirt.jpg',
          '/uploads/mens_casual_shirt.jpg'
        ]
      },
      {
        name: 'Comfort Fit Flat-Front Cotton Chino Pants in Khaki',
        slug: 'comfort-fit-flat-front-cotton-chino-khaki',
        sku: 'SWAMI-TR-05',
        category_slug: 'chinos-cargos',
        collection_slug: 'denim-chino-edit',
        description: 'Versatile everyday casual trouser made with soft peach-finish cotton twill. Flat-front clean styling with slanted side pockets and double welt back pockets.',
        fabric: '97% Cotton, 3% Spandex Soft Stretch Twill',
        care_instructions: 'Machine wash cold, iron medium heat.',
        selling_price: 999.00,
        original_price: 1399.00,
        sizes: ['30', '32', '34', '36', '38'],
        colors: ['Khaki Beige', 'Olive Drab', 'Slate Navy', 'Jet Black'],
        stock_quantity: 14,
        is_featured: 1,
        is_new_arrival: 0,
        images: [
          '/uploads/mens_chino_cargo.jpg',
          '/uploads/mens_denim_jeans.jpg'
        ]
      },
      {
        name: 'Bio-Wash Heavyweight Round Neck T-Shirt in Jet Black',
        slug: 'bio-wash-heavyweight-round-neck-tshirt-black',
        sku: 'SWAMI-TEE-06',
        category_slug: 'polo-tshirts',
        collection_slug: 'everyday-tees',
        description: 'Essential premium everyday basic. 180 GSM single jersey combed cotton, treated with bio-silicon wash for an ultra smooth hand feel and zero pill resistance.',
        fabric: '100% Super Combed Bio-Washed Cotton (180 GSM)',
        care_instructions: 'Machine wash cold. Do not iron directly on inner label.',
        selling_price: 299.00,
        original_price: 499.00,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Jet Black', 'Pure White', 'Charcoal Melange', 'Army Green'],
        stock_quantity: 35,
        is_featured: 0,
        is_new_arrival: 1,
        images: [
          '/uploads/mens_polo_tshirt.jpg',
          '/uploads/mens_casual_shirt.jpg'
        ]
      },
      {
        name: 'Mandarin Collar Linen Blend Casual Shirt in Ivory Cream',
        slug: 'mandarin-collar-linen-blend-casual-shirt-ivory',
        sku: 'SWAMI-SHT-07',
        category_slug: 'linen-casuals',
        collection_slug: 'regular-fit-shirts',
        description: 'Breezy and relaxed, this mandarin collar shirt is tailored from a natural linen-cotton blend that naturally wicks moisture and breathes easily under the sun.',
        fabric: '55% Natural Linen, 45% Breathable Cotton',
        care_instructions: 'Gentle cycle wash, line dry. Iron damp for best results.',
        selling_price: 899.00,
        original_price: 1299.00,
        sizes: ['M', 'L', 'XL', 'XXL'],
        colors: ['Ivory Cream', 'Sage Green', 'Dusty Rose', 'Sky Blue'],
        stock_quantity: 16,
        is_featured: 1,
        is_new_arrival: 1,
        images: [
          '/uploads/mens_casual_shirt.jpg',
          '/uploads/mens_check_shirt.jpg'
        ]
      },
      {
        name: 'Multi-Pocket Tactical Casual Cargo Trousers in Olive',
        slug: 'multi-pocket-casual-cargo-trousers-olive',
        sku: 'SWAMI-CRG-08',
        category_slug: 'chinos-cargos',
        collection_slug: 'denim-chino-edit',
        description: 'Rugged regular fit cargo trousers featuring 6 functional pockets, heavy-duty zipper closure, and comfortable regular leg taper.',
        fabric: 'Heavy Cotton Canvas Twill (100% Cotton)',
        care_instructions: 'Machine wash warm, tumble dry normal.',
        selling_price: 1249.00,
        original_price: 1699.00,
        sizes: ['30', '32', '34', '36', '38'],
        colors: ['Military Olive', 'Desert Khaki', 'Black'],
        stock_quantity: 11,
        is_featured: 0,
        is_new_arrival: 1,
        images: [
          '/uploads/mens_chino_cargo.jpg',
          '/uploads/mens_denim_jeans.jpg'
        ]
      }
    ];

    for (const p of products) {
      const catId = catMap[p.category_slug] || 1;
      await conn.execute(
        `INSERT INTO products (
          name, slug, sku, category_id, description, fabric, care_instructions,
          selling_price, original_price, available_sizes, available_colors,
          stock_quantity, is_featured, is_new_arrival, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name), description = VALUES(description), fabric = VALUES(fabric),
          care_instructions = VALUES(care_instructions), selling_price = VALUES(selling_price),
          original_price = VALUES(original_price), available_sizes = VALUES(available_sizes),
          available_colors = VALUES(available_colors), stock_quantity = VALUES(stock_quantity),
          is_featured = VALUES(is_featured), is_new_arrival = VALUES(is_new_arrival)`,
        [
          p.name, p.slug, p.sku, catId, p.description, p.fabric, p.care_instructions,
          p.selling_price, p.original_price, JSON.stringify(p.sizes), JSON.stringify(p.colors),
          p.stock_quantity, p.is_featured, p.is_new_arrival
        ]
      );

      const [pRows] = await conn.execute('SELECT id FROM products WHERE slug = ?', [p.slug]);
      const productId = pRows[0].id;

      // Images
      await conn.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);
      for (let i = 0; i < p.images.length; i++) {
        await conn.execute(
          `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?)`,
          [productId, p.images[i], i === 0 ? 1 : 0, i]
        );
      }

      // Link Collection
      if (p.collection_slug && collMap[p.collection_slug]) {
        await conn.execute(
          `INSERT IGNORE INTO collection_products (collection_id, product_id)
           VALUES (?, ?)`,
          [collMap[p.collection_slug], productId]
        );
      }
    }
    console.log('Men casual products seeded.');

    console.log('✓ Seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  } finally {
    await conn.end();
  }
}

seed();
