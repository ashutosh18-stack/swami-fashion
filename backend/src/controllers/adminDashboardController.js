const pool = require('../config/database');

/**
 * Get accurate operational dashboard statistics
 */
async function getDashboardStats(req, res) {
  try {
    // Total Products
    const [totalProductsRows] = await pool.execute('SELECT COUNT(*) as cnt FROM products');
    const totalProducts = totalProductsRows[0]?.cnt || 0;

    // Active Products
    const [activeProductsRows] = await pool.execute('SELECT COUNT(*) as cnt FROM products WHERE is_active = 1');
    const activeProducts = activeProductsRows[0]?.cnt || 0;

    // Out of Stock Products
    const [outOfStockRows] = await pool.execute('SELECT COUNT(*) as cnt FROM products WHERE stock_quantity <= 0');
    const outOfStockProducts = outOfStockRows[0]?.cnt || 0;

    // Total Categories
    const [categoriesRows] = await pool.execute('SELECT COUNT(*) as cnt FROM categories');
    const totalCategories = categoriesRows[0]?.cnt || 0;

    // Total Collections
    const [collectionsRows] = await pool.execute('SELECT COUNT(*) as cnt FROM collections');
    const totalCollections = collectionsRows[0]?.cnt || 0;

    // Featured Products
    const [featuredRows] = await pool.execute('SELECT COUNT(*) as cnt FROM products WHERE is_featured = 1');
    const featuredProducts = featuredRows[0]?.cnt || 0;

    // Recently Added Products
    const [recentProducts] = await pool.execute(
      `SELECT p.id, p.name, p.sku, p.selling_price, p.stock_quantity, p.is_active, p.created_at,
              c.name as category_name,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.id DESC
       LIMIT 6`
    );

    // Recent Security & Operational Logs
    const [recentLogs] = await pool.execute(
      `SELECT id, event_type, details, ip_address, created_at
       FROM security_audit_logs
       ORDER BY id DESC
       LIMIT 8`
    );

    return res.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalCategories,
        totalCollections,
        featuredProducts
      },
      recentProducts,
      recentLogs
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve dashboard metrics.' });
  }
}

/**
 * Get all security audit logs
 */
async function getAuditLogs(req, res) {
  try {
    const [logs] = await pool.execute(
      `SELECT id, admin_id, event_type, details, ip_address, created_at
       FROM security_audit_logs
       ORDER BY id DESC
       LIMIT 50`
    );
    return res.json({ success: true, logs });
  } catch (err) {
    console.error('Audit logs error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve audit logs.' });
  }
}

module.exports = {
  getDashboardStats,
  getAuditLogs
};
