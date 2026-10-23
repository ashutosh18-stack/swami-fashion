const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkAuthLockout } = require('../middleware/authRateLimiter');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// Public authentication steps (protected by strict 3-attempt 15-min lockout)
router.post('/verify-password', checkAuthLockout, authController.verifyPassword);
router.post('/verify-pin', checkAuthLockout, authController.verifyPin);

// Protected session & credential endpoints
router.get('/session-status', requireAdminAuth, authController.getSessionStatus);
router.post('/logout', requireAdminAuth, authController.logout);
router.post('/change-password', requireAdminAuth, authController.changePassword);
router.post('/change-pin', requireAdminAuth, authController.changePin);

module.exports = router;
