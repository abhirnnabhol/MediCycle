const express = require('express');
const router = express.Router();
const {
  getMyMediPoints,
  calculateDiscount,
  getAdminMediPointsActivity,
} = require('../controllers/medipointsController');
const { protect, requireAdmin } = require('../middleware/auth');

router.get('/my', protect, getMyMediPoints);
router.get('/calculate', protect, calculateDiscount);
router.get('/calculate-discount', protect, calculateDiscount);
router.get('/admin/activity', protect, requireAdmin, getAdminMediPointsActivity);

module.exports = router;
