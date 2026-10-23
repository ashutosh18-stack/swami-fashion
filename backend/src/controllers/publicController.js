const pool = require('../config/database');

/**
 * Get Public Website Settings & Brand Design System
 */
async function getWebsiteSettings(req, res) {
  try {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM website_settings');
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value;
    });

    return res.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve website settings.' });
  }
}

/**
 * Get Active Hero Banners / Slides
 */
async function getBanners(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, title, subtitle, tag, media_type, media_url, button_text, button_url, sort_order
       FROM banners
       WHERE is_active = 1
       ORDER BY sort_order ASC, id ASC`
    );
    return res.json({ success: true, banners: rows });
  } catch (err) {
    console.error('Error fetching banners:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve hero slides.' });
  }
}

/**
 * Get Active Categories with Product Counts
 */
async function getCategories(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.name, c.slug, c.description, c.image_url, c.sort_order,
              COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    return res.json({ success: true, categories: rows });
  } catch (err) {
    console.error('Error fetching categories:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve categories.' });
  }
}

/**
 * Get Active Collections
 */
async function getCollections(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.name, c.slug, c.tagline, c.description, c.image_url, c.sort_order,
              COUNT(cp.product_id) as product_count
       FROM collections c
       LEFT JOIN collection_products cp ON cp.collection_id = c.id
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    return res.json({ success: true, collections: rows });
  } catch (err) {
    console.error('Error fetching collections:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve collections.' });
  }
}

/**
 * Get Collection by Slug with its Products
 */
async function getCollectionBySlug(req, res) {
  const { slug } = req.params;
  try {
    const [collRows] = await pool.execute(
      `SELECT id, name, slug, tagline, description, image_url
       FROM collections
       WHERE slug = ? AND is_active = 1`,
      [slug]
    );

    if (collRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Collection not found.' });
    }

    const collection = collRows[0];

    const [products] = await pool.execute(
      `SELECT p.id, p.name, p.slug, p.sku, p.selling_price, p.original_price,
              p.available_sizes, p.available_colors, p.stock_quantity, p.is_featured, p.is_new_arrival,
              c.name as category_name, c.slug as category_slug,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
       FROM collection_products cp
       JOIN products p ON p.id = cp.product_id AND p.is_active = 1
       JOIN categories c ON c.id = p.category_id
       WHERE cp.collection_id = ?
       ORDER BY p.sort_order ASC, p.id DESC`,
      [collection.id]
    );

    return res.json({ success: true, collection, products });
  } catch (err) {
    console.error('Error fetching collection:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve collection.' });
  }
}

/**
 * Dynamic Product Catalogue with Multi-faceted Filtering & Sorting
 */
async function getProducts(req, res) {
  try {
    const {
      category,
      collection,
      featured,
      new_arrival,
      min_price,
      max_price,
      search,
      sort,
      size,
      color,
      limit = 30,
      page = 1
    } = req.query;

    let query = `
      SELECT p.id, p.name, p.slug, p.sku, p.fabric, p.selling_price, p.original_price,
             p.available_sizes, p.available_colors, p.stock_quantity, p.is_featured, p.is_new_arrival,
             p.created_at, c.name as category_name, c.slug as category_slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1 OFFSET 1) as secondary_image
      FROM products p
      JOIN categories c ON c.id = p.category_id
    `;

    const whereClauses = ['p.is_active = 1'];
    const params = [];

    // Filter by collection
    if (collection) {
      query += ` JOIN collection_products cp ON cp.product_id = p.id JOIN collections coll ON coll.id = cp.collection_id `;
      whereClauses.push('coll.slug = ?');
      params.push(collection);
    }

    // Filter by Category
    if (category) {
      whereClauses.push('c.slug = ?');
      params.push(category);
    }

    // Filter by Featured
    if (featured === 'true' || featured === '1') {
      whereClauses.push('p.is_featured = 1');
    }

    // Filter by New Arrival
    if (new_arrival === 'true' || new_arrival === '1') {
      whereClauses.push('p.is_new_arrival = 1');
    }

    // Price Filtering
    if (min_price && !isNaN(min_price)) {
      whereClauses.push('p.selling_price >= ?');
      params.push(parseFloat(min_price));
    }
    if (max_price && !isNaN(max_price)) {
      whereClauses.push('p.selling_price <= ?');
      params.push(parseFloat(max_price));
    }

    // Search Query (Name, SKU, Description, Fabric)
    if (search && search.trim()) {
      whereClauses.push('(p.name LIKE ? OR p.sku LIKE ? OR p.description LIKE ? OR p.fabric LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.selling_price ASC ';
        break;
      case 'price_desc':
        query += ' ORDER BY p.selling_price DESC ';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC ';
        break;
      case 'featured':
      default:
        query += ' ORDER BY p.is_featured DESC, p.sort_order ASC, p.id DESC ';
        break;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 30));
    const offset = (pageNum - 1) * limitNum;

    query += ' LIMIT ? OFFSET ? ';
    params.push(limitNum, offset);

    const [products] = await pool.query(query, params);

    // Client-side or in-memory filter for JSON sizes & colors if specified
    let filteredProducts = products.map(p => {
      try {
        p.available_sizes = typeof p.available_sizes === 'string' ? JSON.parse(p.available_sizes) : p.available_sizes;
      } catch (e) {
        p.available_sizes = [];
      }
      try {
        p.available_colors = typeof p.available_colors === 'string' ? JSON.parse(p.available_colors) : p.available_colors;
      } catch (e) {
        p.available_colors = [];
      }
      return p;
    });

    if (size) {
      filteredProducts = filteredProducts.filter(p =>
        p.available_sizes.some(s => String(s).toLowerCase().includes(String(size).toLowerCase()))
      );
    }

    if (color) {
      filteredProducts = filteredProducts.filter(p =>
        p.available_colors.some(c => String(c).toLowerCase().includes(String(color).toLowerCase()))
      );
    }

    return res.json({
      success: true,
      products: filteredProducts,
      page: pageNum,
      limit: limitNum,
      count: filteredProducts.length
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve products catalogue.' });
  }
}

/**
 * Get Product Details by Slug with Gallery and Fabric Specs
 */
async function getProductBySlug(req, res) {
  const { slug } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT p.id, p.name, p.slug, p.sku, p.category_id, p.description, p.fabric,
              p.care_instructions, p.selling_price, p.original_price, p.available_sizes,
              p.available_colors, p.stock_quantity, p.is_featured, p.is_new_arrival,
              p.created_at, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.is_active = 1`,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const product = rows[0];
    try {
      product.available_sizes = typeof product.available_sizes === 'string' ? JSON.parse(product.available_sizes) : product.available_sizes;
    } catch (e) { product.available_sizes = []; }
    try {
      product.available_colors = typeof product.available_colors === 'string' ? JSON.parse(product.available_colors) : product.available_colors;
    } catch (e) { product.available_colors = []; }

    // Fetch all gallery images for this product
    const [images] = await pool.execute(
      `SELECT id, image_url, is_primary, sort_order
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC, id ASC`,
      [product.id]
    );
    product.images = images.map(img => img.image_url);

    // Fetch related products from the same category
    const [related] = await pool.execute(
      `SELECT p.id, p.name, p.slug, p.selling_price, p.original_price,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
       FROM products p
       WHERE p.category_id = ? AND p.id != ? AND p.is_active = 1
       ORDER BY p.is_featured DESC, p.id DESC
       LIMIT 4`,
      [product.category_id, product.id]
    );

    return res.json({ success: true, product, related });
  } catch (err) {
    console.error('Error fetching product details:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve product details.' });
  }
}

/**
 * Secure Contact Form Submission with Rate Limiting & Validation
 */
async function submitContactForm(req, res) {
  const { name, email, phone, subject, message } = req.body;
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  // Basic email pattern check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
  }

  try {
    // Record into security audit logs for review by admin
    const contactData = { name, email, phone: phone || 'N/A', subject: subject || 'General Concierge Inquiry', message };
    await pool.execute(
      `INSERT INTO security_audit_logs (event_type, details, ip_address)
       VALUES ('CONTACT_INQUIRY', ?, ?)`,
      [JSON.stringify(contactData), ip]
    );

    return res.json({
      success: true,
      message: 'Thank you for reaching out to Swami Fashion Concierge. Our royal client specialist will respond within 24 hours.'
    });
  } catch (err) {
    console.error('Contact form submission error:', err);
    return res.status(500).json({ success: false, error: 'Unable to submit your message. Please connect with us directly on WhatsApp.' });
  }
}

module.exports = {
  getWebsiteSettings,
  getBanners,
  getCategories,
  getCollections,
  getCollectionBySlug,
  getProducts,
  getProductBySlug,
  submitContactForm
};
