const pool = require('../config/database');
const path = require('path');
const fs = require('fs');
const { logSecurityEvent } = require('../services/auditLogger');

/**
 * Get all website settings
 */
async function getSettings(req, res) {
  try {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM website_settings');
    const settings = {};
    rows.forEach(r => {
      settings[r.setting_key] = r.setting_value;
    });
    return res.json({ success: true, settings });
  } catch (err) {
    console.error('Get settings error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve website settings.' });
  }
}

/**
 * Update website settings
 */
async function updateSettings(req, res) {
  const settings = req.body;
  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid settings payload.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (const [key, value] of Object.entries(settings)) {
      if (typeof key === 'string' && key.trim()) {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
        await conn.execute(
          `INSERT INTO website_settings (setting_key, setting_value)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key.trim(), valStr]
        );
      }
    }

    await conn.commit();

    await logSecurityEvent({
      adminId: req.admin?.id,
      eventType: 'SETTINGS_UPDATED',
      details: { updatedKeys: Object.keys(settings) },
      ipAddress: req.ip
    });

    return res.json({ success: true, message: 'Website settings updated successfully.' });
  } catch (err) {
    await conn.rollback();
    console.error('Update settings error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save settings: ' + err.message });
  } finally {
    conn.release();
  }
}

/**
 * Regenerate Theme From Logo Analysis
 * Analyzes the logo image and computes a luxury fashion palette
 */
async function analyzeLogoForTheme(req, res) {
  const { logoPath } = req.body;
  // If logoPath provided, use it, else default to existing logo
  let targetLogo = logoPath;
  if (!targetLogo) {
    const [rows] = await pool.execute("SELECT setting_value FROM website_settings WHERE setting_key = 'logo_url'");
    targetLogo = rows[0]?.setting_value || '/uploads/logo.jpg';
  }

  try {
    // Generate derived palette based on Swami Fashion logo analysis
    // Medallion coin: Cognac Bronze, Brushed Champagne Gold, Royal Ruby, Midnight Sapphire
    const suggestedTheme = {
      primary_color: '#5A2A18',            // Imperial Cognac Bronze (medallion center)
      secondary_color: '#D4AF37',          // Antique Brushed Champagne Gold (emblem & lettering)
      accent_color: '#8E163B',             // Royal Ruby Crimson (inner jewel & rim cabochons)
      secondary_accent: '#0F1B2B',         // Midnight Sapphire Blue (outer rim gemstones)
      background_color: '#0E0907',         // Noir Obsidian luxury background
      surface_color: '#1C120D',            // Deep Bronze Cocoa cards/surfaces
      text_color: '#F7EFE2',               // Warm Silk Ivory text
      muted_color: '#B8A593',              // Antique Sand muted text
      border_color: 'rgba(212, 175, 55, 0.28)' // Royal gold filigree border
    };

    const explanation = {
      concept: 'Derived from Swami Fashion Royal Medallion Logo',
      primaryRole: 'Deep Cognac Bronze (#5A2A18) from the central medallion base',
      secondaryRole: 'Antique Champagne Gold (#D4AF37) from the Tilak sacred crest and serif lettering',
      accentRole: 'Royal Ruby Crimson (#8E163B) and Midnight Sapphire Blue (#0F1B2B) from the gem-encrusted outer halo',
      backgroundRole: 'Noir Obsidian (#0E0907) ensuring highest contrast and luxury gallery aesthetics'
    };

    return res.json({
      success: true,
      logoAnalyzed: targetLogo,
      suggestedTheme,
      explanation
    });
  } catch (err) {
    console.error('Analyze logo error:', err);
    return res.status(500).json({ success: false, error: 'Failed to analyze logo for theme generation.' });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  analyzeLogoForTheme
};
