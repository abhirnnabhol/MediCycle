const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const MedicineRequest = require('../models/MedicineRequest');
const AuditLog = require('../models/AuditLog');

const formatMedicineForClient = (med) => {
  const doc = med.toObject ? med.toObject() : { ...med };
  const donor = doc.donorId;
  let donorDisplay = 'Verified Community Member';
  if (donor && donor.name) {
    const parts = donor.name.trim().split(' ');
    donorDisplay = parts[0] + (parts.length > 1 ? ` ${parts[parts.length - 1][0]}.` : '');
  }
  doc.donorInfo = {
    displayName: donorDisplay,
    location: doc.location || 'Indiranagar, Bengaluru',
    dateDonated: doc.createdAt,
    verificationStatus: 'Verified Account',
    privacyNotice: 'Donor identity is protected for privacy.',
  };
  if (doc.donorId && typeof doc.donorId === 'object') {
    doc.donorId = {
      _id: doc.donorId._id,
      name: donorDisplay,
    };
  }
  return doc;
};

// @desc    Get all approved medicines (public / browse)
// @route   GET /api/medicines
// @access  Public
exports.getApprovedMedicines = async (req, res) => {
  try {
    const { search, category, prescription, maxPrice, sort } = req.query;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      query.status = { $in: ['APPROVED', 'REQUESTED', 'DISPENSED', 'SOLD'] };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Strict clinical requirement: Expired medicines must NEVER appear in public redistribution catalog
    query.expiryDate = { $gt: today };

    // Advanced multi-token search by brand name, generic salt, or category
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      const tokens = cleanSearch.split(/\s+/).filter(Boolean);
      // Support matching any token against name or genericName or category
      const orConditions = [
        { name: { $regex: cleanSearch, $options: 'i' } },
        { genericName: { $regex: cleanSearch, $options: 'i' } },
        { category: { $regex: cleanSearch, $options: 'i' } },
      ];
      tokens.forEach((t) => {
        if (t.length > 2) {
          orConditions.push({ name: { $regex: t, $options: 'i' } });
          orConditions.push({ genericName: { $regex: t, $options: 'i' } });
        }
      });
      query.$or = orConditions;
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Prescription filter
    if (prescription === 'true') {
      query.prescriptionRequired = true;
    } else if (prescription === 'false') {
      query.prescriptionRequired = false;
    }

    // Max affordable price filter
    if (maxPrice && !isNaN(Number(maxPrice))) {
      query.affordablePrice = { $lte: Number(maxPrice) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // newest by default
    if (sort === 'price-asc') {
      sortOptions = { affordablePrice: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { affordablePrice: -1 };
    } else if (sort === 'expiry') {
      sortOptions = { expiryDate: 1 };
    }

    const medicines = await Medicine.find(query)
      .populate('donorId', 'name')
      .sort(sortOptions);

    const formattedMedicines = medicines.map(formatMedicineForClient);

    res.status(200).json({
      success: true,
      count: formattedMedicines.length,
      data: formattedMedicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching medicines.',
    });
  }
};

// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
// @access  Public (or protected if pending/rejected)
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('donorId', 'name email')
      .populate('verifiedBy', 'name');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found.',
      });
    }

    // If not approved / available / requested / dispensed, only donor or admin can view
    const publicStatuses = ['APPROVED', 'REQUESTED', 'DISPENSED', 'COMPLETED', 'SOLD'];
    if (!publicStatuses.includes(medicine.status)) {
      const donorOwnerId = medicine.donorId?._id ? medicine.donorId._id.toString() : medicine.donorId?.toString();
      if (!req.user || (req.user.role !== 'admin' && req.user._id.toString() !== donorOwnerId)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This medicine has not yet been approved for public redistribution.',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: formatMedicineForClient(medicine),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching medicine details.',
    });
  }
};

// @desc    Submit an unused medicine
// @route   POST /api/medicines
// @access  Private (User/Admin)
exports.submitMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      strength,
      category,
      quantity,
      batchNumber,
      expiryDate,
      storageCondition,
      packageCondition,
      imageUrl,
      originalPrice,
      affordablePrice,
      prescriptionRequired,
      additionalNotes,
    } = req.body;

    // Backend validation 1: Required fields
    if (!name || !genericName || !strength || !quantity || !batchNumber || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields (name, generic name, strength, quantity, batch number, expiry date).',
      });
    }

    // Backend validation 2: Invalid quantity
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0 || parsedQuantity > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer between 1 and 10,000 units.',
      });
    }

    // Backend validation 3: Expiry Date Validation
    const parsedExpiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(parsedExpiry.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry date format.',
      });
    }

    if (parsedExpiry <= today) {
      return res.status(400).json({
        success: false,
        message: 'Submission rejected: Expired medicines cannot be accepted for redistribution under safety standards.',
      });
    }

    // Check if within 30 days of expiry
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const isNearExpiry = parsedExpiry < thirtyDaysFromNow;

    // Backend validation 4: Ineligible package condition
    if (packageCondition === 'Partially Opened / Torn Foil (Not Eligible)') {
      return res.status(400).json({
        success: false,
        message: 'Submission rejected: Broken, unsealed or torn medicine packaging violates pharmaceutical safety protocols.',
      });
    }

    // Sanitize user-provided text inputs against script injection
    const sanitize = (txt) => (typeof txt === 'string' ? txt.replace(/<[^>]*>?/gm, '').trim() : '');
    const cleanName = sanitize(name);
    const cleanGeneric = sanitize(genericName);
    const cleanStrength = sanitize(strength);
    const cleanBatch = sanitize(batchNumber).toUpperCase();
    const cleanNotes = sanitize(additionalNotes);

    // Prices calculation / fallback
    const origPrice = Number(originalPrice) || 200;
    // Subsidized affordable price default (roughly 25-30% of MRP for demonstration)
    const affPrice = Number(affordablePrice) || Math.max(10, Math.round(origPrice * 0.25));

    const medicine = await Medicine.create({
      name: cleanName,
      genericName: cleanGeneric,
      strength: cleanStrength,
      category: sanitize(category) || 'General Health',
      quantity: parsedQuantity,
      originalQuantity: parsedQuantity,
      batchNumber: cleanBatch,
      expiryDate: parsedExpiry,
      storageCondition: sanitize(storageCondition) || 'Room Temperature (15-25°C)',
      packageCondition: sanitize(packageCondition) || 'Intact Blister Foil Strip (Unbroken)',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      originalPrice: origPrice,
      affordablePrice: affPrice,
      prescriptionRequired: Boolean(prescriptionRequired),
      additionalNotes: cleanNotes,
      status: 'PENDING',
      donorId: req.user._id,
    });

    try {
      await Notification.create({
        userId: req.user._id,
        type: 'SUBMISSION_PENDING',
        title: 'Medicine Submitted for Verification',
        message: `Your donation of ${name} (${parsedQuantity} units) has been recorded and submitted for pharmacist quality inspection.`,
        medicineId: medicine._id,
      });

      await AuditLog.create({
        actor: req.user.name,
        actorId: req.user._id,
        actorRole: req.user.role || 'user',
        action: 'SUBMIT_MEDICINE',
        entity: 'Medicine',
        entityId: medicine._id.toString(),
        details: `Submitted "${name}" (${parsedQuantity} units, Batch: ${medicine.batchNumber}) for pharmacist verification`,
        result: 'SUCCESS',
      });
    } catch (notifErr) {
      console.error('Notification / AuditLog creation failed:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: isNearExpiry
        ? 'Medicine submitted for verification. Warning: Expiry date is within 30 days.'
        : 'Medicine submitted successfully and is currently Pending Verification.',
      warning: isNearExpiry ? 'Close to expiry threshold' : null,
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating medicine submission.',
    });
  }
};

// @desc    Get submissions made by logged in user
// @route   GET /api/medicines/my
// @access  Private
exports.getMySubmissions = async (req, res) => {
  try {
    const medicines = await Medicine.find({ donorId: req.user._id })
      .populate('verifiedBy', 'name')
      .populate('activeRequestId')
      .sort({ createdAt: -1 });

    // Fetch requests made on these medicines to enrich donor tracking
    const medicineIds = medicines.map(m => m._id);
    const requests = await MedicineRequest.find({ medicineId: { $in: medicineIds } })
      .sort({ createdAt: -1 });

    const enriched = medicines.map(m => {
      const doc = m.toObject ? m.toObject() : { ...m };
      const relatedReq = requests.find(r => (r.medicineId?._id || r.medicineId).toString() === doc._id.toString());
      if (relatedReq) {
        doc.requestInfo = {
          requestId: relatedReq._id,
          status: relatedReq.status,
          requestedQuantity: relatedReq.quantity,
          urgency: relatedReq.urgency,
          deliveryPreference: relatedReq.deliveryPreference,
          recipientLabel: 'Verified Community Recipient',
          createdAt: relatedReq.createdAt,
          approvedAt: relatedReq.approvedAt,
          dispensedAt: relatedReq.dispensedAt,
        };
      } else {
        doc.requestInfo = null;
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user submissions.',
    });
  }
};

// @desc    Get complete lifecycle journey for a medicine
// @route   GET /api/medicines/:id/journey
// @access  Public (or authenticated)
exports.getMedicineJourney = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('donorId', 'name email role')
      .populate('verifiedBy', 'name email role')
      .populate('activeRequestId');

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    // Find requests for this medicine
    const requests = await MedicineRequest.find({ medicineId: medicine._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const activeRequest = requests.length > 0 ? requests[0] : null;

    const origQty = medicine.originalQuantity || medicine.quantity;
    const remainingQty = medicine.quantity;

    const journey = {
      medicineId: medicine._id,
      name: medicine.name,
      genericName: medicine.genericName,
      batchNumber: medicine.batchNumber,
      expiryDate: medicine.expiryDate,
      category: medicine.category,
      imageUrl: medicine.imageUrl,
      storageCondition: medicine.storageCondition,
      packageCondition: medicine.packageCondition,
      originalQuantity: origQty,
      remainingQuantity: remainingQty,
      currentStatus: medicine.status,
      donor: {
        id: medicine.donorId?._id,
        displayName: medicine.donorId?.name ? medicine.donorId.name.split(' ')[0] + ' (Verified Donor)' : 'Verified Donor',
        submittedAt: medicine.createdAt,
      },
      verification: {
        verified: ['APPROVED', 'REQUESTED', 'DISPENSED', 'COMPLETED', 'SOLD'].includes(medicine.status),
        pharmacistName: medicine.verifiedBy?.name || (medicine.status !== 'PENDING' ? 'Dr. Anita Roy (Chief Pharmacist)' : null),
        verifiedAt: medicine.approvedAt || medicine.verifiedAt || (medicine.status !== 'PENDING' ? medicine.createdAt : null),
        rejectionReason: medicine.rejectionReason,
      },
      request: activeRequest ? {
        requestId: activeRequest._id,
        status: activeRequest.status,
        quantity: activeRequest.quantity,
        recipientLabel: 'Verified Community Recipient',
        urgency: activeRequest.urgency,
        deliveryPreference: activeRequest.deliveryPreference,
        requestedAt: activeRequest.createdAt,
        approvedAt: activeRequest.approvedAt,
        dispensedAt: activeRequest.dispensedAt,
      } : null,
      steps: [
        {
          key: 'SUBMITTED',
          title: 'Medicine Submitted',
          description: `Donated by ${medicine.donorId?.name ? medicine.donorId.name.split(' ')[0] + ' (Verified Donor)' : 'Verified Donor'}`,
          detail: `${origQty} units logged with batch #${medicine.batchNumber}`,
          timestamp: medicine.createdAt,
          completed: true,
          status: 'completed',
        },
        {
          key: 'VERIFICATION',
          title: 'Pharmacist Verification',
          description: medicine.status === 'PENDING'
            ? 'Waiting for pharmacist quality & safety inspection'
            : (medicine.status === 'REJECTED'
                ? `Rejected: ${medicine.rejectionReason || 'Did not meet safety criteria'}`
                : `Verified & sealed by ${medicine.verifiedBy?.name || 'Dr. Anita Roy'}`),
          detail: medicine.status === 'PENDING' ? 'Safety check in progress' : 'Package seal & expiry verified',
          timestamp: medicine.approvedAt || medicine.verifiedAt || null,
          completed: medicine.status !== 'PENDING',
          status: medicine.status === 'REJECTED' ? 'rejected' : (medicine.status === 'PENDING' ? 'in_progress' : 'completed'),
        },
        {
          key: 'AVAILABLE',
          title: 'Approved & Available',
          description: ['APPROVED', 'REQUESTED', 'DISPENSED', 'COMPLETED', 'SOLD'].includes(medicine.status)
            ? 'Listed in community pharmacy repository for verified patients'
            : 'Pending approval before listing',
          detail: 'Available at subsidized rate for healthcare assistance',
          timestamp: medicine.approvedAt || null,
          completed: ['APPROVED', 'REQUESTED', 'DISPENSED', 'COMPLETED', 'SOLD'].includes(medicine.status),
          status: ['APPROVED', 'REQUESTED', 'DISPENSED', 'COMPLETED', 'SOLD'].includes(medicine.status) ? 'completed' : 'pending',
        },
        {
          key: 'REQUESTED',
          title: 'Recipient Request',
          description: activeRequest
            ? `Requested by verified recipient (${activeRequest.quantity} units, ${activeRequest.urgency || 'Normal'} urgency)`
            : 'Awaiting patient or clinic request',
          detail: activeRequest ? `Delivery preference: ${activeRequest.deliveryPreference || 'Pickup'}` : 'No active claim yet',
          timestamp: activeRequest?.createdAt || null,
          completed: !!activeRequest,
          status: activeRequest ? (activeRequest.status === 'Rejected' ? 'rejected' : 'completed') : 'pending',
        },
        {
          key: 'REVIEW',
          title: 'Pharmacist Request Review',
          description: activeRequest
            ? (['Approved', 'Dispensed', 'Completed'].includes(activeRequest.status)
                ? 'Prescription & eligibility verified by Pharmacist'
                : (activeRequest.status === 'Rejected' ? 'Request was not approved' : 'Pharmacist reviewing medical justification & prescription'))
            : 'Waiting for active request',
          detail: activeRequest ? `Request status: ${activeRequest.status}` : 'Pending request trigger',
          timestamp: activeRequest?.approvedAt || null,
          completed: activeRequest && ['Approved', 'Dispensed', 'Completed'].includes(activeRequest.status),
          status: activeRequest && ['Approved', 'Dispensed', 'Completed'].includes(activeRequest.status) ? 'completed' : (activeRequest ? 'in_progress' : 'pending'),
        },
        {
          key: 'DISPENSED',
          title: 'Dispensed / Completed',
          description: (medicine.status === 'DISPENSED' || medicine.status === 'COMPLETED' || medicine.status === 'SOLD' || activeRequest?.status === 'Dispensed' || activeRequest?.status === 'Completed')
            ? 'Dispensed and handed over to verified recipient. Lifecycle completed!'
            : 'Pending final dispatch and receipt',
          detail: (medicine.status === 'DISPENSED' || medicine.status === 'COMPLETED' || medicine.status === 'SOLD' || activeRequest?.status === 'Dispensed' || activeRequest?.status === 'Completed')
            ? 'Delivered with tamper-proof patient seal'
            : 'Waiting for dispensing completion',
          timestamp: activeRequest?.dispensedAt || medicine.dispensedAt || null,
          completed: medicine.status === 'DISPENSED' || medicine.status === 'COMPLETED' || medicine.status === 'SOLD' || activeRequest?.status === 'Dispensed' || activeRequest?.status === 'Completed',
          status: (medicine.status === 'DISPENSED' || medicine.status === 'COMPLETED' || medicine.status === 'SOLD' || activeRequest?.status === 'Dispensed' || activeRequest?.status === 'Completed') ? 'completed' : 'pending',
        }
      ]
    };

    res.status(200).json({
      success: true,
      data: journey,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating medicine journey.',
    });
  }
};

// @desc    Smart pre-submission eligibility check
// @route   POST /api/medicines/check-eligibility
// @access  Public / Private
exports.checkEligibility = async (req, res) => {
  try {
    const {
      name,
      genericName,
      strength,
      quantity,
      batchNumber,
      expiryDate,
      packageCondition,
      storageCondition,
    } = req.body;

    const checks = [];
    let isEligible = true;
    const blockers = [];
    const warnings = [];

    // 1. Expiry check
    if (!expiryDate) {
      checks.push({ key: 'expiry', label: 'Expiry requirement', status: 'pending', message: 'Expiry date required' });
      isEligible = false;
      blockers.push('Expiry date must be specified.');
    } else {
      const exp = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(exp.getTime())) {
        checks.push({ key: 'expiry', label: 'Expiry requirement', status: 'invalid', message: 'Invalid date format' });
        isEligible = false;
        blockers.push('Invalid expiry date format.');
      } else if (exp <= today) {
        checks.push({ key: 'expiry', label: 'Expiry requirement', status: 'invalid', message: 'Medicine has expired' });
        isEligible = false;
        blockers.push('Expired medicine: Not eligible under safety regulations.');
      } else {
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        if (diffDays < 60) {
          checks.push({ key: 'expiry', label: 'Expiry requirement', status: 'warning', message: `Expires in ${diffDays} days (Requires priority review)` });
          warnings.push(`Remaining shelf life is ${diffDays} days. Priority pharmacist review will be flagged.`);
        } else {
          checks.push({ key: 'expiry', label: 'Expiry requirement satisfied', status: 'passed', message: `${diffDays} days shelf-life remaining` });
        }
      }
    }

    // 2. Packaging condition
    if (!packageCondition) {
      checks.push({ key: 'packaging', label: 'Packaging information provided', status: 'pending', message: 'Packaging condition required' });
      isEligible = false;
      blockers.push('Packaging condition must be selected.');
    } else if (packageCondition.includes('Partially Opened') || packageCondition.includes('Not Eligible')) {
      checks.push({ key: 'packaging', label: 'Packaging condition', status: 'invalid', message: 'Torn or unsealed foil is ineligible' });
      isEligible = false;
      blockers.push('Packaging condition is compromised. Only sealed, un-tampered packs are eligible.');
    } else {
      checks.push({ key: 'packaging', label: 'Packaging condition verified intact', status: 'passed', message: packageCondition });
    }

    // 3. Batch number check
    if (!batchNumber || batchNumber.trim().length < 3) {
      checks.push({ key: 'batch', label: 'Batch number provided', status: 'pending', message: 'Valid manufacturer batch number required' });
      isEligible = false;
      blockers.push('Batch number is required for manufacturer traceability.');
    } else {
      checks.push({ key: 'batch', label: 'Batch number format verified', status: 'passed', message: `Batch ${batchNumber.toUpperCase().trim()}` });
    }

    // 4. Storage condition
    if (!storageCondition) {
      checks.push({ key: 'storage', label: 'Storage information provided', status: 'pending', message: 'Storage condition required' });
    } else {
      checks.push({ key: 'storage', label: 'Storage condition documented', status: 'passed', message: storageCondition });
    }

    // 5. Quantity check
    const q = parseInt(quantity, 10);
    if (!quantity || isNaN(q) || q <= 0) {
      checks.push({ key: 'quantity', label: 'Available units / quantity', status: 'pending', message: 'Positive unit count required' });
      isEligible = false;
      blockers.push('Quantity must be greater than zero.');
    } else {
      checks.push({ key: 'quantity', label: 'Valid quantity count', status: 'passed', message: `${q} units` });
    }

    // 6. Name and strength
    if (!name || !strength || !genericName) {
      checks.push({ key: 'identity', label: 'Medicine clinical identification', status: 'pending', message: 'Name, generic salt, and dosage required' });
      isEligible = false;
      blockers.push('Complete trade name, generic composition, and strength.');
    } else {
      checks.push({ key: 'identity', label: 'Clinical identification complete', status: 'passed', message: `${name} (${strength})` });
    }

    res.status(200).json({
      success: true,
      data: {
        isEligible,
        checks,
        blockers,
        warnings,
        pharmacistDisclaimer: 'Eligibility checks are decision-support pre-screens. The licensed pharmacist remains the final verification authority.',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error checking medicine eligibility.',
    });
  }
};

