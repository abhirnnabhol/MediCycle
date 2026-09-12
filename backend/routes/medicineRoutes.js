const express = require('express');
const router = express.Router();
const {
  getApprovedMedicines,
  getMedicineById,
  submitMedicine,
  getMySubmissions,
  getMedicineJourney,
  checkEligibility,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');

router.get('/', getApprovedMedicines);
router.post('/check-eligibility', checkEligibility);
router.get('/my', protect, getMySubmissions);
router.get('/:id/journey', getMedicineJourney);
router.get('/:id', getMedicineById);
router.post('/', protect, submitMedicine);

module.exports = router;
