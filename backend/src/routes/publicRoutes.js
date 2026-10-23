const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public Storefront Endpoints
router.get('/settings', publicController.getWebsiteSettings);
router.get('/banners', publicController.getBanners);
router.get('/categories', publicController.getCategories);
router.get('/collections', publicController.getCollections);
router.get('/collections/:slug', publicController.getCollectionBySlug);
router.get('/products', publicController.getProducts);
router.get('/products/:slug', publicController.getProductBySlug);
router.post('/contact', publicController.submitContactForm);

module.exports = router;
