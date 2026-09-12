const User = require('../models/User');
const MediPointsTransaction = require('../models/MediPointsTransaction');

// Helper to calculate eligible MediPoints discount and points consumption
const calculateTierDiscount = (availablePoints, fee) => {
  const numericFee = Math.max(0, Number(fee) || 0);
  const numericPoints = Math.max(0, Number(availablePoints) || 0);

  let pointsToUse = 0;
  let rawDiscount = 0;

  if (numericPoints >= 5000) {
    pointsToUse = 5000;
    rawDiscount = 25;
  } else if (numericPoints >= 2000) {
    pointsToUse = 2000;
    rawDiscount = 10;
  } else if (numericPoints >= 1000) {
    pointsToUse = 1000;
    rawDiscount = 5;
  }

  // Maximum discount cannot exceed ₹25 and cannot exceed the fee itself
  const discount = Math.min(25, Math.min(rawDiscount, numericFee));
  const finalFee = Math.max(0, numericFee - discount);

  return {
    originalFee: numericFee,
    availablePoints: numericPoints,
    eligibleDiscount: discount,
    pointsToConsume: discount > 0 ? pointsToUse : 0,
    finalFee,
    remainingPoints: discount > 0 ? numericPoints - pointsToUse : numericPoints,
  };
};

// @desc    Get current user's MediPoints balance and transaction history
// @route   GET /api/medipoints/my
// @access  Private (Authenticated User)
exports.getMyMediPoints = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const transactions = await MediPointsTransaction.find({ userId: user._id })
      .sort({ createdAt: -1 });

    const balance = Number(user.mediPoints) || 0;
    let lifetimeEarned = 0;
    let totalRedeemedPoints = 0;
    let totalDiscountsRedeemed = 0;

    transactions.forEach((tx) => {
      const p = Number(tx.points) || 0;
      if (p > 0) {
        lifetimeEarned += p;
      } else if (p < 0) {
        totalRedeemedPoints += Math.abs(p);
        if (Math.abs(p) === 5000) totalDiscountsRedeemed += 25;
        else if (Math.abs(p) === 2000) totalDiscountsRedeemed += 10;
        else if (Math.abs(p) === 1000) totalDiscountsRedeemed += 5;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        mediPoints: balance,
        balance,
        lifetimeEarned,
        totalRedeemedPoints,
        totalDiscountsRedeemed,
        transactions,
      },
      mediPoints: balance,
      balance,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching MediPoints balance.',
    });
  }
};

// @desc    Calculate discount server-side for given fee
// @route   GET /api/medipoints/calculate
// @access  Private
exports.calculateDiscount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const fee = Number(req.query.accessFee !== undefined ? req.query.accessFee : req.query.fee) || 0;
    const calc = calculateTierDiscount(user?.mediPoints || 0, fee);

    res.status(200).json({
      success: true,
      data: {
        ...calc,
        discountAmount: calc.eligibleDiscount,
        pointsUsed: calc.pointsToConsume,
        finalAccessFee: calc.finalFee,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error calculating MediPoints discount.',
    });
  }
};

// @desc    Get all platform MediPoints activity (Admin Oversight)
// @route   GET /api/medipoints/admin/activity
// @access  Private (Admin)
exports.getAdminMediPointsActivity = async (req, res) => {
  try {
    const transactions = await MediPointsTransaction.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    let totalIssued = 0;
    let totalRedeemed = 0;

    transactions.forEach((tx) => {
      const pts = Math.abs(Number(tx.points) || 0);
      if (tx.type === 'REDEMPTION' || Number(tx.points) < 0) {
        totalRedeemed += pts;
      } else {
        totalIssued += pts;
      }
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalIssued,
        totalRedeemed,
        activeCirculation: Math.max(0, totalIssued - totalRedeemed),
        transactionCount: transactions.length,
      },
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching MediPoints activity for Admin.',
    });
  }
};

exports.calculateTierDiscount = calculateTierDiscount;
