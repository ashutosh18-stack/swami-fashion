const pool = require('../config/database');
const { logSecurityEvent } = require('../services/auditLogger');

function generateSlug(name) {
  return name.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

/**
 * List all collections
 */
async function listCollections(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.name, c.slug, c.tagline, c.description, c.image_url, c.sort_order, c.is_active,
              COUNT(cp.product_id) as product_count
       FROM collections c
       LEFT JOIN collection_products cp ON cp.collection_id = c.id
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    return res.json({ success: true, collections: rows });
  } catch (err) {
    console.error('List collections error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve collections.' });
  }
}

/**
 * Create collection
 */
async function createCollection(req, res) {
  const { name, tagline, description, image_url, sort_order, is_active } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Collection name is required.' });
  }

  const slug = generateSlug(name) + '-' + Math.floor(1000 + Math.random() * 9000);

  try {
    const [result] = await pool.execute(
      `INSERT INTO collections (name, slug, tagline, description, image_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug, tagline || '', description || '', image_url || null, parseInt(sort_order) || 0, is_active ? 1 : 0]
    );

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'COLLECTION_CREATED',
      details: { collectionId: result.insertId, name },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Collection created successfully.', collectionId: result.insertId });
  } catch (err) {
    console.error('Create collection error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create collection.' });
  }
}

/**
 * Update collection
 */
async function updateCollection(req, res) {
  const { id } = req.params;
  const { name, tagline, description, image_url, sort_order, is_active } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Collection name is required.' });
  }

  try {
    await pool.execute(
      `UPDATE collections SET
        name = ?, tagline = ?, description = ?, image_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [name.trim(), tagline || '', description || '', image_url || null, parseInt(sort_order) || 0, is_active ? 1 : 0, id]
    );

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'COLLECTION_UPDATED',
      details: { collectionId: id, name },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Collection updated successfully.' });
  } catch (err) {
    console.error('Update collection error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update collection.' });
  }
}

/**
 * Delete collection
 */
async function deleteCollection(req, res) {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM collections WHERE id = ?', [id]);

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'COLLECTION_DELETED',
      details: { collectionId: id },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Collection deleted successfully.' });
  } catch (err) {
    console.error('Delete collection error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete collection.' });
  }
}

module.exports = {
  listCollections,
  createCollection,
  updateCollection,
  deleteCollection
};
