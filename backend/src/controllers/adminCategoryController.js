const pool = require('../config/database');
const { logSecurityEvent } = require('../services/auditLogger');

function generateSlug(name) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

/**
 * List all categories for admin
 */
async function listCategories(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.name, c.slug, c.description, c.image_url, c.sort_order, c.is_active,
              COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    return res.json({ success: true, categories: rows });
  } catch (err) {
    console.error('List categories error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve categories.' });
  }
}

/**
 * Create category
 */
async function createCategory(req, res) {
  const { name, description, image_url, sort_order, is_active } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Category name is required.' });
  }

  const slug = generateSlug(name) + '-' + Math.floor(1000 + Math.random() * 9000);

  try {
    const [result] = await pool.execute(
      `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug, description || '', image_url || null, parseInt(sort_order) || 0, is_active !== undefined ? (is_active ? 1 : 0) : 1]
    );

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'CATEGORY_CREATED',
      details: { categoryId: result.insertId, name },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Category created successfully.', categoryId: result.insertId });
  } catch (err) {
    console.error('Create category error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create category.' });
  }
}

/**
 * Update category
 */
async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description, image_url, sort_order, is_active } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Category name is required.' });
  }

  try {
    await pool.execute(
      `UPDATE categories SET
        name = ?, description = ?, image_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [name.trim(), description || '', image_url || null, parseInt(sort_order) || 0, is_active ? 1 : 0, id]
    );

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'CATEGORY_UPDATED',
      details: { categoryId: id, name },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    console.error('Update category error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update category.' });
  }
}

/**
 * Delete category with safety check preventing deletion of categories with attached products
 */
async function deleteCategory(req, res) {
  const { id } = req.params;
  try {
    // Check if any products belong to this category
    const [products] = await pool.execute('SELECT COUNT(*) as cnt FROM products WHERE category_id = ?', [id]);
    const productCount = products[0]?.cnt || 0;

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete this category because it contains ${productCount} active product(s). Please reassign or delete the products first.`
      });
    }

    await pool.execute('DELETE FROM categories WHERE id = ?', [id]);

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'CATEGORY_DELETED',
      details: { categoryId: id },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('Delete category error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete category.' });
  }
}

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
