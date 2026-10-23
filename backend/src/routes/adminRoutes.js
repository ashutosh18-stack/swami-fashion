const express = require('express');
const router = express.Router();
const { requireAdminAuth, requireMainAdmin } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const adminProductController = require('../controllers/adminProductController');
const adminCategoryController = require('../controllers/adminCategoryController');
const adminCollectionController = require('../controllers/adminCollectionController');
const adminBannerController = require('../controllers/adminBannerController');
const adminSettingsController = require('../controllers/adminSettingsController');
const adminDashboardController = require('../controllers/adminDashboardController');
const { upload, handleUpload } = require('../controllers/uploadController');

// All routes here require active admin session
router.use(requireAdminAuth);

// Sub-Admin Management (Main Admin Only)
router.get('/sub-admins', authController.listSubAdmins);
router.post('/sub-admins', requireMainAdmin, authController.createSubAdmin);
router.patch('/sub-admins/:id/toggle-status', requireMainAdmin, authController.toggleSubAdminStatus);
router.delete('/sub-admins/:id', requireMainAdmin, authController.deleteSubAdmin);

// Dashboard
router.get('/dashboard/stats', adminDashboardController.getDashboardStats);
router.get('/dashboard/audit-logs', adminDashboardController.getAuditLogs);

// Products
router.get('/products', adminProductController.listProducts);
router.get('/products/:id', adminProductController.getProduct);
router.post('/products', adminProductController.createProduct);
router.put('/products/:id', adminProductController.updateProduct);
router.delete('/products/:id', adminProductController.deleteProduct);
router.patch('/products/:id/toggle-status', adminProductController.toggleProductStatus);

// Categories
router.get('/categories', adminCategoryController.listCategories);
router.post('/categories', adminCategoryController.createCategory);
router.put('/categories/:id', adminCategoryController.updateCategory);
router.delete('/categories/:id', adminCategoryController.deleteCategory);

// Collections
router.get('/collections', adminCollectionController.listCollections);
router.post('/collections', adminCollectionController.createCollection);
router.put('/collections/:id', adminCollectionController.updateCollection);
router.delete('/collections/:id', adminCollectionController.deleteCollection);

// Banners / Hero Slides
router.get('/banners', adminBannerController.listBanners);
router.post('/banners', adminBannerController.createBanner);
router.put('/banners/:id', adminBannerController.updateBanner);
router.delete('/banners/:id', adminBannerController.deleteBanner);

// Settings & Theme
router.get('/settings', adminSettingsController.getSettings);
router.put('/settings', adminSettingsController.updateSettings);
router.post('/settings/analyze-theme', adminSettingsController.analyzeLogoForTheme);

// Secure File Uploads
router.post('/upload', upload.array('images', 8), handleUpload);

module.exports = router;
