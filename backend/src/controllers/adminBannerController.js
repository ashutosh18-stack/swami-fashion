const pool = require('../config/database');
const { logSecurityEvent } = require('../services/auditLogger');

/**
 * List all banners / hero slides
 */
async function listBanners(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM banners ORDER BY sort_order ASC, id ASC');
    return res.json({ success: true, banners: rows });
  } catch (err) {
    console.error('List banners error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve banners.' });
  }
}

/**
 * Create hero slide / banner
 */
async function createBanner(req, res) {
  const { title, subtitle, tag, media_type, media_url, button_text, button_url, sort_order, is_active } = req.body;

  if (!title || !media_url) {
    return res.status(400).json({ success: false, error: 'Banner title and media URL are required.' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO banners (title, subtitle, tag, media_type, media_url, button_text, button_url, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        subtitle || '',
        tag || '',
        media_type || 'image',
        media_url,
        button_text || 'Explore Collection',
        button_url || '/collections',
        parseInt(sort_order) || 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1
      ]
    );

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'BANNER_CREATED',
      details: { bannerId: result.insertId, title },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Hero slide created successfully.', bannerId: result.insertId });
  } catch (err) {
    console.error('Create banner error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create banner.' });
  }
}

/**
 * Update banner
 */
async function updateBanner(req, res) {
  const { id } = req.params;
  const { title, subtitle, tag, media_type, media_url, button_text, button_url, sort_order, is_active } = req.body;

  if (!title || !media_url) {
    return res.status(400).json({ success: false, error: 'Banner title and media URL are required.' });
  }

  try {
    await pool.execute(
      `UPDATE banners SET
        title = ?, subtitle = ?, tag = ?, media_type = ?, media_url = ?,
        button_text = ?, button_url = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [
        title.trim(),
        subtitle || '',
        tag || '',
        media_type || 'image',
        media_url,
        button_text || 'Explore Collection',
        button_url || '/collections',
        parseInt(sort_order) || 0,
        is_active ? 1 : 0,
        id
      ]
    );

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'BANNER_UPDATED',
      details: { bannerId: id, title },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Hero slide updated successfully.' });
  } catch (err) {
    console.error('Update banner error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update banner.' });
  }
}

/**
 * Delete banner
 */
async function deleteBanner(req, res) {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM banners WHERE id = ?', [id]);

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'BANNER_DELETED',
      details: { bannerId: id },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Banner slide deleted successfully.' });
  } catch (err) {
    console.error('Delete banner error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete banner.' });
  }
}

module.exports = {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner
};
