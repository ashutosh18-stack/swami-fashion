const pool = require('../config/database');
const { logSecurityEvent } = require('../services/auditLogger');

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * List all products for admin with filters & pagination
 */
async function listProducts(req, res) {
  try {
    const { category_id, search, is_active } = req.query;
    let query = `
      SELECT p.id, p.name, p.slug, p.sku, p.category_id, p.selling_price, p.original_price,
             p.stock_quantity, p.is_featured, p.is_new_arrival, p.is_active, p.created_at,
             c.name as category_name,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
    `;
    const where = [];
    const params = [];

    if (category_id) {
      where.push('p.category_id = ?');
      params.push(category_id);
    }
    if (is_active !== undefined && is_active !== '') {
      where.push('p.is_active = ?');
      params.push(is_active === '1' || is_active === 'true' ? 1 : 0);
    }
    if (search && search.trim()) {
      where.push('(p.name LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }

    query += ' ORDER BY p.id DESC';

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, products: rows });
  } catch (err) {
    console.error('Admin list products error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load products.' });
  }
}

/**
 * Get product details for editing
 */
async function getProduct(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
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

    const [images] = await pool.execute(
      'SELECT id, image_url, is_primary, sort_order FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC',
      [id]
    );
    product.images = images;

    // Get assigned collections
    const [collections] = await pool.execute(
      'SELECT collection_id FROM collection_products WHERE product_id = ?',
      [id]
    );
    product.collection_ids = collections.map(c => c.collection_id);

    return res.json({ success: true, product });
  } catch (err) {
    console.error('Admin get product error:', err);
    return res.status(500).json({ success: false, error: 'Failed to get product.' });
  }
}

/**
 * Create new product
 */
async function createProduct(req, res) {
  const {
    name, sku, category_id, description, fabric, care_instructions,
    selling_price, original_price, available_sizes, available_colors,
    stock_quantity, is_featured, is_new_arrival, images, collection_ids
  } = req.body;

  if (!name || !sku || !category_id || selling_price === undefined) {
    return res.status(400).json({ success: false, error: 'Name, SKU, category, and selling price are required.' });
  }

  const baseSlug = generateSlug(name);
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [skuCheck] = await conn.execute('SELECT id FROM products WHERE sku = ?', [sku.trim()]);
    if (skuCheck.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: `A product with SKU "${sku}" already exists.` });
    }

    const sizesJson = JSON.stringify(Array.isArray(available_sizes) ? available_sizes : []);
    const colorsJson = JSON.stringify(Array.isArray(available_colors) ? available_colors : []);

    const [result] = await conn.execute(
      `INSERT INTO products (
        name, slug, sku, category_id, description, fabric, care_instructions,
        selling_price, original_price, available_sizes, available_colors,
        stock_quantity, is_featured, is_new_arrival, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        name.trim(),
        slug,
        sku.trim(),
        category_id,
        description || '',
        fabric || '',
        care_instructions || '',
        parseFloat(selling_price),
        original_price ? parseFloat(original_price) : null,
        sizesJson,
        colorsJson,
        parseInt(stock_quantity) || 0,
        is_featured ? 1 : 0,
        is_new_arrival ? 1 : 0
      ]
    );

    const productId = result.insertId;

    // Insert images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].image_url;
        if (imgUrl) {
          await conn.execute(
            `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
             VALUES (?, ?, ?, ?)`,
            [productId, imgUrl, i === 0 ? 1 : 0, i]
          );
        }
      }
    }

    // Link collections
    if (Array.isArray(collection_ids)) {
      for (const collId of collection_ids) {
        await conn.execute(
          `INSERT IGNORE INTO collection_products (collection_id, product_id)
           VALUES (?, ?)`,
          [collId, productId]
        );
      }
    }

    await conn.commit();

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'PRODUCT_CREATED',
      details: { productId, name, sku },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Product created successfully.', productId, slug });
  } catch (err) {
    await conn.rollback();
    console.error('Admin create product error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create product: ' + err.message });
  } finally {
    conn.release();
  }
}

/**
 * Update existing product
 */
async function updateProduct(req, res) {
  const { id } = req.params;
  const {
    name, sku, category_id, description, fabric, care_instructions,
    selling_price, original_price, available_sizes, available_colors,
    stock_quantity, is_featured, is_new_arrival, is_active, images, collection_ids
  } = req.body;

  if (!name || !sku || !category_id || selling_price === undefined) {
    return res.status(400).json({ success: false, error: 'Name, SKU, category, and selling price are required.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.execute('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    // Check unique SKU
    const [skuCheck] = await conn.execute('SELECT id FROM products WHERE sku = ? AND id != ?', [sku.trim(), id]);
    if (skuCheck.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, error: `SKU "${sku}" is already assigned to another product.` });
    }

    const sizesJson = JSON.stringify(Array.isArray(available_sizes) ? available_sizes : []);
    const colorsJson = JSON.stringify(Array.isArray(available_colors) ? available_colors : []);

    await conn.execute(
      `UPDATE products SET
        name = ?, sku = ?, category_id = ?, description = ?, fabric = ?, care_instructions = ?,
        selling_price = ?, original_price = ?, available_sizes = ?, available_colors = ?,
        stock_quantity = ?, is_featured = ?, is_new_arrival = ?, is_active = ?
       WHERE id = ?`,
      [
        name.trim(),
        sku.trim(),
        category_id,
        description || '',
        fabric || '',
        care_instructions || '',
        parseFloat(selling_price),
        original_price ? parseFloat(original_price) : null,
        sizesJson,
        colorsJson,
        parseInt(stock_quantity) || 0,
        is_featured ? 1 : 0,
        is_new_arrival ? 1 : 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        id
      ]
    );

    // Update images
    if (Array.isArray(images)) {
      await conn.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        const imgUrl = typeof images[i] === 'string' ? images[i] : images[i].image_url;
        if (imgUrl) {
          await conn.execute(
            `INSERT INTO product_images (product_id, image_url, is_primary, sort_order)
             VALUES (?, ?, ?, ?)`,
            [id, imgUrl, i === 0 ? 1 : 0, i]
          );
        }
      }
    }

    // Update collections
    if (Array.isArray(collection_ids)) {
      await conn.execute('DELETE FROM collection_products WHERE product_id = ?', [id]);
      for (const collId of collection_ids) {
        await conn.execute(
          `INSERT INTO collection_products (collection_id, product_id)
           VALUES (?, ?)`,
          [collId, id]
        );
      }
    }

    await conn.commit();

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'PRODUCT_UPDATED',
      details: { productId: id, name, sku },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err) {
    await conn.rollback();
    console.error('Admin update product error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update product: ' + err.message });
  } finally {
    conn.release();
  }
}

/**
 * Delete product
 */
async function deleteProduct(req, res) {
  const { id } = req.params;
  try {
    const [pRows] = await pool.execute('SELECT name, sku FROM products WHERE id = ?', [id]);
    if (pRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    await pool.execute('DELETE FROM products WHERE id = ?', [id]);

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'PRODUCT_DELETED',
      details: { productId: id, name: pRows[0].name, sku: pRows[0].sku },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    console.error('Admin delete product error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete product.' });
  }
}

/**
 * Toggle product status (active/inactive)
 */
async function toggleProductStatus(req, res) {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT is_active FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }

    const newStatus = rows[0].is_active === 1 ? 0 : 1;
    await pool.execute('UPDATE products SET is_active = ? WHERE id = ?', [newStatus, id]);

    return res.json({ success: true, is_active: newStatus });
  } catch (err) {
    console.error('Toggle status error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
};
