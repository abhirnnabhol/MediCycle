const Medicine = require('../models/Medicine');
const MedicineRequest = require('../models/MedicineRequest');

// @desc    Get public impact metrics (dynamic from DB + illustrative benchmark)
// @route   GET /api/stats/public
// @access  Public
exports.getPublicStats = async (req, res) => {
  try {
    const approvedCount = await Medicine.countDocuments({ status: { $in: ['APPROVED', 'SOLD'] } });
    const completedRequestsCount = await MedicineRequest.countDocuments({ status: 'Completed' });
    const pendingCount = await Medicine.countDocuments({ status: 'PENDING' });

    const activeOrSoldList = await Medicine.find({ status: { $in: ['APPROVED', 'SOLD'] } });
    let dbCalculatedSavings = 0;
    let dbUnitsSaved = 0;

    activeOrSoldList.forEach((med) => {
      const diff = Math.max(0, med.originalPrice - med.affordablePrice);
      dbCalculatedSavings += diff * med.quantity;
      dbUnitsSaved += med.quantity;
    });

    // Illustrative baseline numbers + dynamic DB counts
    const baselineWastagePrevented = 1250;
    const baselineSavings = 85000;
    const baselineListings = 780;
    const baselinePeopleReached = 650;

    res.status(200).json({
      success: true,
      data: {
        isPrototypeNotice: 'Illustrative prototype metrics combined with dynamic live database aggregates',
        dynamic: {
          approvedMedicines: approvedCount,
          pendingVerification: pendingCount,
          completedRedistributions: completedRequestsCount,
          liveUnitsSaved: dbUnitsSaved,
          liveSavingsINR: dbCalculatedSavings,
        },
        impactDashboard: {
          medicinesSaved: baselineWastagePrevented + dbUnitsSaved,
          potentialSavings: baselineSavings + dbCalculatedSavings,
          verifiedListings: baselineListings + approvedCount,
          peopleReached: baselinePeopleReached + completedRequestsCount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching public stats.',
    });
  }
};
