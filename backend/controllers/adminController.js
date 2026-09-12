const Medicine = require('../models/Medicine');
const MedicineRequest = require('../models/MedicineRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const MediPointsTransaction = require('../models/MediPointsTransaction');

// Platform configuration store (in-memory persistent settings)
let platformSettings = {
  platformName: 'MediCycle',
  demoMode: true,
  minShelfLifeDays: 60,
  expiryAlertThresholdDays: 90,
  autoQuarantineExpired: true,
  allowPrescriptionUpload: true,
  notificationsEnabled: true,
};

// ==========================================
// 1. CLINICAL VERIFICATION (PHARMACIST ACTIONS)
// ==========================================

// @desc    Get all pending medicines for verification
// @route   GET /api/admin/medicines/pending
// @access  Private (Pharmacist / Admin)
exports.getPendingMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ status: 'PENDING' })
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching pending verification queue.',
    });
  }
};

// @desc    Get all medicines across all statuses
// @route   GET /api/admin/medicines/all
// @access  Private (Pharmacist / Admin)
exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find()
      .populate('donorId', 'name email')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching all medicines.',
    });
  }
};

// @desc    Approve a medicine submission (Pharmacist Clinical Authority)
// @route   PUT /api/admin/medicines/:id/approve
// @access  Private (Pharmacist)
exports.approveMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found.',
      });
    }

    let pointsAwarded = 0;
    let donorNewBalance = null;

    // Award +100 MediPoints once per eligible donation
    if (!medicine.pointsAwarded && medicine.donorId) {
      const donorUserId = (medicine.donorId && medicine.donorId._id) ? medicine.donorId._id.toString() : medicine.donorId.toString();
      const donor = await User.findById(donorUserId);
      if (donor) {
        const updatedPoints = (Number(donor.mediPoints) || 0) + 100;
        donor.mediPoints = updatedPoints;
        if (typeof donor.save === 'function') {
          await donor.save();
        } else {
          // If plain object or memory reference, update in memoryStore directly
          const { db } = require('../config/memoryStore');
          const memUser = db.users.find((u) => u._id.toString() === donorUserId);
          if (memUser) {
            memUser.mediPoints = updatedPoints;
          }
        }
        donorNewBalance = updatedPoints;
        pointsAwarded = 100;
        medicine.pointsAwarded = true;

        try {
          await MediPointsTransaction.create({
            userId: donor._id,
            points: 100,
            type: 'DONATION_REWARD',
            description: `Verified donation reward: ${medicine.name} (${medicine.strength})`,
            referenceId: medicine._id.toString(),
            balanceAfter: updatedPoints,
          });
        } catch (txErr) {
          console.error('Error creating MediPointsTransaction:', txErr.message);
        }
      }
    }

    medicine.status = 'APPROVED';
    medicine.verifiedBy = req.user._id;
    medicine.approvedAt = new Date();
    medicine.rejectionReason = null;
    await medicine.save();

    try {
      if (medicine.donorId) {
        const notifMsg = pointsAwarded > 0
          ? `Your donation of ${medicine.name} passed pharmacist inspection and is now available in the community pharmacy. You earned +100 MediPoints! New balance: ${donorNewBalance} MediPoints.`
          : `Your donation of ${medicine.name} passed pharmacist inspection and is now available in the community pharmacy.`;

        await Notification.create({
          userId: medicine.donorId._id || medicine.donorId,
          type: 'VERIFICATION_APPROVED',
          title: pointsAwarded > 0 ? 'Donation Verified! +100 MediPoints Awarded' : 'Medicine Approved by Pharmacist',
          message: notifMsg,
          medicineId: medicine._id,
        });
      }

      await AuditLog.create({
        actor: req.user ? req.user.name : 'Dr. Anita Sharma',
        actorId: req.user ? req.user._id : null,
        actorRole: req.user ? req.user.role : 'pharmacist',
        action: 'APPROVE_MEDICINE',
        entity: 'Medicine',
        entityId: medicine._id.toString(),
        details: pointsAwarded > 0
          ? `Verified & Approved "${medicine.name}". +100 MediPoints awarded to donor.`
          : `Verified & Approved "${medicine.name}" (${medicine.quantity} units, Batch: ${medicine.batchNumber})`,
        result: 'SUCCESS',
      });
    } catch (notifErr) {
      console.error('Approval notification / AuditLog failed:', notifErr.message);
    }

    const updated = await Medicine.findById(medicine._id)
      .populate('donorId', 'name email')
      .populate('verifiedBy', 'name');

    res.status(200).json({
      success: true,
      message: pointsAwarded > 0
        ? `"${medicine.name}" has been successfully verified and approved. +100 MediPoints awarded to donor.`
        : `"${medicine.name}" has been successfully verified and approved for public redistribution.`,
      data: updated,
      pointsAwarded,
      donorNewBalance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error approving medicine.',
    });
  }
};

// @desc    Reject a medicine submission (Pharmacist Clinical Authority)
// @route   PUT /api/admin/medicines/:id/reject
// @access  Private (Pharmacist)
exports.rejectMedicine = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is mandatory (e.g. Expired, Damaged packaging, Missing batch information, Improper storage).',
      });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found.',
      });
    }

    medicine.status = 'REJECTED';
    medicine.rejectionReason = rejectionReason.trim();
    medicine.verifiedBy = req.user._id;
    await medicine.save();

    try {
      if (medicine.donorId) {
        await Notification.create({
          userId: medicine.donorId._id || medicine.donorId,
          type: 'VERIFICATION_REJECTED',
          title: 'Medicine Submission Update',
          message: `Your submission of ${medicine.name} could not be approved. Reason: ${rejectionReason.trim()}`,
          medicineId: medicine._id,
        });
      }

      await AuditLog.create({
        actor: req.user ? req.user.name : 'Dr. Anita Sharma',
        actorId: req.user ? req.user._id : null,
        actorRole: req.user ? req.user.role : 'pharmacist',
        action: 'REJECT_MEDICINE',
        entity: 'Medicine',
        entityId: medicine._id.toString(),
        details: `Rejected "${medicine.name}". Reason: ${rejectionReason.trim()}`,
        result: 'REJECTED',
      });
    } catch (notifErr) {
      console.error('Rejection notification / AuditLog failed:', notifErr.message);
    }

    const updated = await Medicine.findById(medicine._id)
      .populate('donorId', 'name email')
      .populate('verifiedBy', 'name');

    res.status(200).json({
      success: true,
      message: `"${medicine.name}" has been marked as REJECTED with feedback provided.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error rejecting medicine.',
    });
  }
};

// ==========================================
// 2. ADMIN COMMAND CENTER OVERVIEW & HEALTH
// ==========================================

// @desc    Get executive platform overview, KPI metrics, health & activity
// @route   GET /api/admin/overview
// @access  Private (Admin)
exports.getAdminOverview = async (req, res) => {
  try {
    const users = await User.find();
    const medicines = await Medicine.find().populate('donorId', 'name email');
    const requests = await MedicineRequest.find().populate('userId', 'name email').populate('medicineId');
    const auditLogs = await AuditLog.find().sort({ timestamp: -1 });

    const totalUsers = users.filter((u) => u.role === 'user').length;
    const totalPharmacists = users.filter((u) => u.role === 'pharmacist').length;
    const totalAdmins = users.filter((u) => u.role === 'admin').length;

    const totalMedicines = medicines.length;
    const pendingVerification = medicines.filter((m) => m.status === 'PENDING').length;
    const approvedMedicines = medicines.filter((m) => m.status === 'APPROVED').length;
    const rejectedMedicines = medicines.filter((m) => m.status === 'REJECTED').length;
    const soldOrDispensedMedicines = medicines.filter((m) => m.status === 'SOLD' || m.status === 'DISPENSED').length;

    const totalRequests = requests.length;
    const activeRequests = requests.filter((r) => r.status === 'Pending' || r.status === 'Approved').length;
    const completedRequests = requests.filter((r) => r.status === 'Completed' || r.status === 'Dispensed').length;

    // Inventory metrics
    let availableUnits = 0;
    let requestedUnits = 0;
    let dispensedUnits = 0;
    let expiringSoon = 0;
    let quarantined = 0;
    let expired = 0;

    const now = new Date();
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    medicines.forEach((med) => {
      const exp = new Date(med.expiryDate);
      if (exp <= now) {
        expired += Number(med.quantity) || 1;
      } else if (exp <= ninetyDays) {
        expiringSoon += Number(med.quantity) || 1;
      }

      if (med.status === 'REJECTED' || (med.rejectionReason && med.status !== 'APPROVED')) {
        quarantined += Number(med.quantity) || 1;
      }

      if (med.status === 'APPROVED') {
        availableUnits += Number(med.quantity) || 0;
      } else if (med.status === 'REQUESTED') {
        requestedUnits += Number(med.quantity) || 0;
      } else if (med.status === 'DISPENSED' || med.status === 'SOLD') {
        dispensedUnits += Number(med.originalQuantity !== undefined ? med.originalQuantity : med.quantity) || 0;
      }
    });

    // Illustrative Demo Impact
    let estimatedSavings = 0;
    let unitsDiverted = 0;
    const journeysCompleted = completedRequests + soldOrDispensedMedicines;

    medicines.forEach((med) => {
      if (['APPROVED', 'DISPENSED', 'SOLD', 'REQUESTED'].includes(med.status)) {
        const orig = Number(med.originalPrice) || 200;
        const aff = Number(med.affordablePrice) || 45;
        const savingsPerUnit = Math.max(0, orig - aff);
        const qty = Number(med.originalQuantity !== undefined ? med.originalQuantity : med.quantity) || 1;
        estimatedSavings += savingsPerUnit * qty;
        unitsDiverted += qty;
      }
    });

    // Platform Health Indicators
    const health = [
      {
        id: 'verification',
        name: 'Medicine Verification',
        status: pendingVerification > 5 ? 'Warning' : 'Operational',
        color: pendingVerification > 5 ? 'amber' : 'emerald',
        message: pendingVerification > 0 ? `${pendingVerification} batch(es) awaiting pharmacist review` : 'Inspection queue clear',
        icon: 'ShieldCheck',
      },
      {
        id: 'requests',
        name: 'Request Processing',
        status: activeRequests > 10 ? 'Warning' : 'Operational',
        color: activeRequests > 10 ? 'amber' : 'emerald',
        message: activeRequests > 0 ? `${activeRequests} prescription request(s) active` : 'All patient requests dispatched',
        icon: 'FileText',
      },
      {
        id: 'inventory',
        name: 'Inventory Tracking',
        status: 'Operational',
        color: 'emerald',
        message: `${totalMedicines} total medicine records under strict custody`,
        icon: 'Package',
      },
      {
        id: 'notifications',
        name: 'Alerts & Notifications',
        status: 'Operational',
        color: 'emerald',
        message: 'Automated donor/recipient dispatches running normally',
        icon: 'Bell',
      },
      {
        id: 'expiry',
        name: 'Expiry Alerts',
        status: expired > 0 ? 'Critical' : expiringSoon > 0 ? 'Action Required' : 'Operational',
        color: expired > 0 ? 'rose' : expiringSoon > 0 ? 'amber' : 'emerald',
        message: `${expired} expired batch(es), ${expiringSoon} unit(s) expiring within 90 days`,
        icon: 'AlertTriangle',
      },
    ];

    // MediPoints platform metrics
    const allTransactions = await MediPointsTransaction.find();
    let totalMediPointsIssued = 0;
    let totalRewardsRedeemed = 0;
    allTransactions.forEach((tx) => {
      const pts = Math.abs(Number(tx.points) || 0);
      if (tx.type === 'REDEMPTION' || Number(tx.points) < 0) {
        totalRewardsRedeemed += pts;
      } else {
        totalMediPointsIssued += pts;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        platformMetrics: {
          totalUsers,
          totalPharmacists,
          totalAdmins,
          totalMedicines,
          pendingVerification,
          approvedMedicines,
          rejectedMedicines,
          activeRequests,
          completedRequests,
        },
        mediPointsMetrics: {
          totalIssued: totalMediPointsIssued,
          totalRedeemed: totalRewardsRedeemed,
          activeCirculation: Math.max(0, totalMediPointsIssued - totalRewardsRedeemed),
        },
        inventoryMetrics: {
          availableUnits,
          requestedUnits,
          dispensedUnits,
          expiringSoon,
          quarantined,
          expired,
        },
        impactMetrics: {
          medicinesRedistributed: unitsDiverted,
          estimatedPatientSavings: estimatedSavings,
          unitsDivertedFromDisposal: unitsDiverted,
          completedJourneys: journeysCompleted,
        },
        platformHealth: health,
        recentActivity: auditLogs.slice(0, 10),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin overview.',
    });
  }
};

// ==========================================
// 3. USER MANAGEMENT
// ==========================================

// @desc    Get all users with activity counts and search/filter
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsersList = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let users = await User.find().select('-password');
    const medicines = await Medicine.find();
    const requests = await MedicineRequest.find();

    // Map donation and request counts
    const donationCountMap = {};
    medicines.forEach((m) => {
      const dId = (m.donorId?._id || m.donorId || '').toString();
      if (dId) donationCountMap[dId] = (donationCountMap[dId] || 0) + 1;
    });

    const requestCountMap = {};
    requests.forEach((r) => {
      const uId = (r.userId?._id || r.userId || '').toString();
      if (uId) requestCountMap[uId] = (requestCountMap[uId] || 0) + 1;
    });

    let enriched = users.map((u) => {
      const doc = u.toObject ? u.toObject() : { ...u };
      const idStr = doc._id.toString();
      return {
        ...doc,
        donationsCount: donationCountMap[idStr] || 0,
        requestsCount: requestCountMap[idStr] || 0,
        isActive: doc.isActive !== false,
        lastActiveAt: doc.lastActiveAt || doc.createdAt,
      };
    });

    // Apply role filter
    if (role && role !== 'all') {
      enriched = enriched.filter((u) => u.role === role);
    }

    // Apply status filter
    if (status && status !== 'all') {
      if (status === 'active') enriched = enriched.filter((u) => u.isActive);
      if (status === 'suspended') enriched = enriched.filter((u) => !u.isActive);
    }

    // Apply search filter
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      enriched = enriched.filter(
        (u) => (u.name && u.name.toLowerCase().includes(q)) || (u.email && u.email.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users list.',
    });
  }
};

// @desc    Toggle user account active / suspended status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Prevent suspending self or super admin
    if (user.email === 'admin@medicycle.demo' || (req.user && req.user._id.toString() === user._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'Action prohibited: Cannot suspend your own account or the primary platform administrator.',
      });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    try {
      await AuditLog.create({
        actor: req.user ? req.user.name : 'MediCycle Admin',
        actorId: req.user ? req.user._id : null,
        actorRole: 'admin',
        action: 'TOGGLE_USER_STATUS',
        entity: 'User',
        entityId: user._id.toString(),
        details: `${user.isActive ? 'Activated' : 'Suspended'} user account: "${user.name}" (${user.email})`,
        result: 'SUCCESS',
      });
    } catch (auditErr) {
      console.error('AuditLog toggle user status error:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Suspended'}.`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user status.',
    });
  }
};

// ==========================================
// 4. PHARMACIST MANAGEMENT
// ==========================================

// @desc    Get pharmacists list with clinical verification activity
// @route   GET /api/admin/pharmacists
// @access  Private (Admin)
exports.getPharmacistsList = async (req, res) => {
  try {
    const pharmacists = await User.find({ role: 'pharmacist' }).select('-password');
    const medicines = await Medicine.find();
    const pendingCount = medicines.filter((m) => m.status === 'PENDING').length;

    const list = pharmacists.map((ph) => {
      const doc = ph.toObject ? ph.toObject() : { ...ph };
      const idStr = doc._id.toString();

      const approvedCount = medicines.filter(
        (m) => m.status === 'APPROVED' && (m.verifiedBy?._id || m.verifiedBy || '').toString() === idStr
      ).length;

      const rejectedCount = medicines.filter(
        (m) => m.status === 'REJECTED' && (m.verifiedBy?._id || m.verifiedBy || '').toString() === idStr
      ).length;

      return {
        ...doc,
        verificationActivity: approvedCount + rejectedCount,
        approvals: approvedCount,
        rejections: rejectedCount,
        pendingWorkload: pendingCount,
        isActive: doc.isActive !== false,
        isPersona: doc.email.includes('medicycle') || doc.name.includes('Anita'),
        personaLabel: 'Prototype Pharmacist Persona',
        licenseStatus: 'Verified Licensed Pharmacist',
      };
    });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching pharmacist list.',
    });
  }
};

// ==========================================
// 5. AUDIT LOG & ACTIVITY
// ==========================================

// @desc    Get platform audit logs with pagination & filtering
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  try {
    const { role, action, search } = req.query;
    let logs = await AuditLog.find().sort({ timestamp: -1 });

    if (role && role !== 'all') {
      logs = logs.filter((l) => l.actorRole === role);
    }

    if (action && action !== 'all') {
      logs = logs.filter((l) => l.action === action);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      logs = logs.filter(
        (l) =>
          (l.actor && l.actor.toLowerCase().includes(q)) ||
          (l.details && l.details.toLowerCase().includes(q)) ||
          (l.action && l.action.toLowerCase().includes(q)) ||
          (l.entity && l.entity.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching audit logs.',
    });
  }
};

// @desc    Get real chronological platform activity feed
// @route   GET /api/admin/activity
// @access  Private (Admin)
exports.getPlatformActivity = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(30);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching platform activity.',
    });
  }
};

// ==========================================
// 6. ANALYTICS
// ==========================================

// @desc    Get platform analytics for funnel, categories, and performance
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const requests = await MedicineRequest.find();

    // 1. Medicine Flow Funnel
    const submitted = medicines.length;
    const verified = medicines.filter((m) => m.status !== 'PENDING').length;
    const approved = medicines.filter((m) => ['APPROVED', 'REQUESTED', 'DISPENSED', 'SOLD'].includes(m.status)).length;
    const requested = requests.length;
    const dispensed = requests.filter((r) => ['Dispensed', 'Completed'].includes(r.status)).length;
    const completed = medicines.filter((m) => m.status === 'SOLD' || m.status === 'DISPENSED').length;

    const flow = [
      { step: 'Submitted', count: submitted, percentage: 100 },
      { step: 'Verified', count: verified, percentage: submitted ? Math.round((verified / submitted) * 100) : 0 },
      { step: 'Approved', count: approved, percentage: submitted ? Math.round((approved / submitted) * 100) : 0 },
      { step: 'Requested', count: requested, percentage: approved ? Math.round((requested / approved) * 100) : 0 },
      { step: 'Dispensed', count: dispensed, percentage: requested ? Math.round((dispensed / requested) * 100) : 0 },
      { step: 'Completed', count: completed, percentage: submitted ? Math.round((completed / submitted) * 100) : 0 },
    ];

    // 2. Category Distribution
    const categoryMap = {};
    medicines.forEach((m) => {
      const cat = m.category || 'General Health';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // 3. Verification Performance
    const pendingCount = medicines.filter((m) => m.status === 'PENDING').length;
    const approvedCount = medicines.filter((m) => m.status === 'APPROVED').length;
    const rejectedCount = medicines.filter((m) => m.status === 'REJECTED').length;

    const verificationPerformance = [
      { name: 'Approved', count: approvedCount, color: '#10b981' },
      { name: 'Pending Review', count: pendingCount, color: '#f59e0b' },
      { name: 'Rejected / Ineligible', count: rejectedCount, color: '#ef4444' },
    ];

    // 4. Inventory Status Distribution
    const statusMap = {
      Available: medicines.filter((m) => m.status === 'APPROVED').length,
      Requested: medicines.filter((m) => m.status === 'REQUESTED').length,
      Dispensed: medicines.filter((m) => m.status === 'DISPENSED' || m.status === 'SOLD').length,
      Quarantined: medicines.filter((m) => m.status === 'REJECTED').length,
      Pending: pendingCount,
    };
    const inventoryDistribution = Object.entries(statusMap).map(([name, count]) => ({ name, count }));

    res.status(200).json({
      success: true,
      data: {
        flow,
        categoryDistribution,
        verificationPerformance,
        inventoryDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating platform analytics.',
    });
  }
};

// ==========================================
// 7. ALERTS & SETTINGS
// ==========================================

// @desc    Get actionable platform alerts
// @route   GET /api/admin/alerts
// @access  Private (Admin)
exports.getPlatformAlerts = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const requests = await MedicineRequest.find();
    const now = new Date();
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    const alerts = [];

    // Expired medicines
    const expiredMeds = medicines.filter((m) => new Date(m.expiryDate) <= now);
    if (expiredMeds.length > 0) {
      alerts.push({
        id: 'alert-expired',
        level: 'CRITICAL',
        badge: 'Expired Inventory',
        title: `${expiredMeds.length} medicine batch(es) past expiry date`,
        description: 'Expired medicines have been quarantined and blocked from redistribution.',
        count: expiredMeds.length,
        link: '/admin/inventory?filter=expired',
        createdAt: now,
      });
    }

    // Expiring soon (<90 days)
    const expiringMeds = medicines.filter((m) => {
      const d = new Date(m.expiryDate);
      return d > now && d <= ninetyDays;
    });
    if (expiringMeds.length > 0) {
      alerts.push({
        id: 'alert-expiring-soon',
        level: 'WARNING',
        badge: 'Expiring Soon',
        title: `${expiringMeds.length} batch(es) expiring within 90 days`,
        description: 'Priority matching recommended to avoid unnecessary medical waste.',
        count: expiringMeds.length,
        link: '/admin/inventory?filter=expiring',
        createdAt: now,
      });
    }

    // Pending verification backlog
    const pendingMeds = medicines.filter((m) => m.status === 'PENDING');
    if (pendingMeds.length > 0) {
      alerts.push({
        id: 'alert-verification-backlog',
        level: pendingMeds.length > 3 ? 'WARNING' : 'INFO',
        badge: 'Verification Backlog',
        title: `${pendingMeds.length} submission(s) awaiting pharmacist inspection`,
        description: 'Community members are awaiting clinical review for their donations.',
        count: pendingMeds.length,
        link: '/admin/medicines?filter=pending',
        createdAt: now,
      });
    }

    // Pending prescription requests
    const pendingReqs = requests.filter((r) => r.status === 'Pending');
    if (pendingReqs.length > 0) {
      alerts.push({
        id: 'alert-pending-requests',
        level: 'WARNING',
        badge: 'Prescription Queue',
        title: `${pendingReqs.length} patient request(s) awaiting pharmacist review`,
        description: 'Prescription matching and clinical verification required for fulfillment.',
        count: pendingReqs.length,
        link: '/admin/requests?filter=pending',
        createdAt: now,
      });
    }

    // Quarantined items
    const quarantinedMeds = medicines.filter((m) => m.status === 'REJECTED');
    if (quarantinedMeds.length > 0) {
      alerts.push({
        id: 'alert-quarantined',
        level: 'INFO',
        badge: 'Quarantine Chamber',
        title: `${quarantinedMeds.length} batch(es) in bio-safe quarantine`,
        description: 'Safely isolated per pharmaceutical disposal guidelines.',
        count: quarantinedMeds.length,
        link: '/admin/inventory?filter=quarantined',
        createdAt: now,
      });
    }

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching platform alerts.',
    });
  }
};

// @desc    Get platform settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
exports.getPlatformSettings = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: platformSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching platform settings.',
    });
  }
};

// @desc    Update platform settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
exports.updatePlatformSettings = async (req, res) => {
  try {
    const {
      platformName,
      minShelfLifeDays,
      expiryAlertThresholdDays,
      autoQuarantineExpired,
      allowPrescriptionUpload,
      notificationsEnabled,
    } = req.body;

    if (platformName) platformSettings.platformName = platformName;
    if (minShelfLifeDays !== undefined) platformSettings.minShelfLifeDays = Number(minShelfLifeDays);
    if (expiryAlertThresholdDays !== undefined) platformSettings.expiryAlertThresholdDays = Number(expiryAlertThresholdDays);
    if (autoQuarantineExpired !== undefined) platformSettings.autoQuarantineExpired = Boolean(autoQuarantineExpired);
    if (allowPrescriptionUpload !== undefined) platformSettings.allowPrescriptionUpload = Boolean(allowPrescriptionUpload);
    if (notificationsEnabled !== undefined) platformSettings.notificationsEnabled = Boolean(notificationsEnabled);

    try {
      await AuditLog.create({
        actor: req.user ? req.user.name : 'MediCycle Admin',
        actorId: req.user ? req.user._id : null,
        actorRole: 'admin',
        action: 'UPDATE_SETTINGS',
        entity: 'Settings',
        entityId: 'platform_config',
        details: 'Updated platform configuration parameters',
        result: 'SUCCESS',
      });
    } catch (auditErr) {
      console.error('AuditLog update settings error:', auditErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Platform settings updated successfully.',
      data: platformSettings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating settings.',
    });
  }
};

// ==========================================
// 8. BACKWARD COMPATIBILITY / LEGACY STATS
// ==========================================

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubmissions = await Medicine.countDocuments();
    const pendingVerification = await Medicine.countDocuments({ status: 'PENDING' });
    const approvedMedicines = await Medicine.countDocuments({ status: 'APPROVED' });
    const rejectedMedicines = await Medicine.countDocuments({ status: 'REJECTED' });
    const totalRequests = await MedicineRequest.countDocuments();
    const pendingRequests = await MedicineRequest.countDocuments({ status: 'Pending' });
    const completedRequests = await MedicineRequest.countDocuments({ status: 'Completed' });

    const approvedList = await Medicine.find({ status: 'APPROVED' });
    let totalPotentialSavings = 0;
    let totalUnitsSaved = 0;

    approvedList.forEach((med) => {
      const savingsPerUnit = Math.max(0, med.originalPrice - med.affordablePrice);
      totalPotentialSavings += savingsPerUnit * med.quantity;
      totalUnitsSaved += med.quantity;
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalSubmissions,
        pendingVerification,
        approvedMedicines,
        rejectedMedicines,
        totalRequests,
        pendingRequests,
        completedRequests,
        totalUnitsSaved,
        totalPotentialSavings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching admin stats.',
    });
  }
};

exports.getExpiryAlerts = async (req, res) => {
  try {
    const medicines = await Medicine.find().populate('donorId', 'name email');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const safe = [];
    const expiringSoon = [];
    const expired = [];

    medicines.forEach((med) => {
      const exp = new Date(med.expiryDate);
      const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      const item = {
        _id: med._id,
        name: med.name,
        genericName: med.genericName,
        strength: med.strength,
        batchNumber: med.batchNumber,
        category: med.category,
        quantity: med.quantity,
        status: med.status,
        expiryDate: med.expiryDate,
        remainingDays: diffDays,
      };

      if (diffDays <= 0) {
        item.alertLevel = 'Expired';
        expired.push(item);
      } else if (diffDays <= 90) {
        item.alertLevel = 'Expiring Soon';
        expiringSoon.push(item);
      } else {
        item.alertLevel = 'Safe';
        safe.push(item);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: medicines.length,
          safeCount: safe.length,
          expiringSoonCount: expiringSoon.length,
          expiredCount: expired.length,
        },
        expiringSoon,
        expired,
        safe,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching expiry alerts.',
    });
  }
};

exports.resetDemoScenario = async (req, res) => {
  try {
    const seedData = require('../utils/seedData');
    await seedData();
    res.status(200).json({
      success: true,
      message: 'Demo scenario reset successfully to clean benchmark state (Admin, Pharmacist, User, and audit log initialized).',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error resetting demo scenario.',
    });
  }
};
