const express = require('express');
const router = express.Router();
const {
  getPendingMedicines,
  getAllMedicines,
  approveMedicine,
  rejectMedicine,
  getAdminStats,
  getExpiryAlerts,
  resetDemoScenario,
  getAdminOverview,
  getUsersList,
  toggleUserStatus,
  getPharmacistsList,
  getAuditLogs,
  getPlatformActivity,
  getAnalytics,
  getPlatformAlerts,
  getPlatformSettings,
  updatePlatformSettings,
} = require('../controllers/adminController');
const { getAllRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect, requireAdmin, requirePharmacist, requirePharmacistOrAdmin } = require('../middleware/auth');

// Public demo reset endpoint for hackathon presenters & judges
router.post('/reset-demo', resetDemoScenario);

// All other routes require active authentication
router.use(protect);

// ============================================================
// CLINICAL VERIFICATION & INVENTORY QUEUE
// Inspection / view queues accessible by Pharmacist and Admin
// Clinical decisions (approve, reject, dispense) RESTRICTED EXCLUSIVELY to Pharmacist
// ============================================================
router.get('/medicines/pending', requirePharmacistOrAdmin, getPendingMedicines);
router.get('/medicines/all', requirePharmacistOrAdmin, getAllMedicines);
router.put('/medicines/:id/approve', requirePharmacist, approveMedicine);
router.put('/medicines/:id/reject', requirePharmacist, rejectMedicine);
router.get('/expiry-alerts', requirePharmacistOrAdmin, getExpiryAlerts);
router.get('/requests', requirePharmacistOrAdmin, getAllRequests);
router.put('/requests/:id', requirePharmacist, updateRequestStatus);
router.get('/stats', requirePharmacistOrAdmin, getAdminStats);

// ============================================================
// EXECUTIVE ADMIN COMMAND CENTER (Admin Only)
// ============================================================
router.get('/overview', requireAdmin, getAdminOverview);
router.get('/users', requireAdmin, getUsersList);
router.put('/users/:id/toggle-status', requireAdmin, toggleUserStatus);
router.get('/pharmacists', requireAdmin, getPharmacistsList);
router.get('/audit-logs', requireAdmin, getAuditLogs);
router.get('/activity', requirePharmacistOrAdmin, getPlatformActivity);
router.get('/analytics', requireAdmin, getAnalytics);
router.get('/alerts', requireAdmin, getPlatformAlerts);
router.get('/settings', requireAdmin, getPlatformSettings);
router.put('/settings', requireAdmin, updatePlatformSettings);

module.exports = router;
