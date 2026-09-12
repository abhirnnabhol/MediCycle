const MedicineRequest = require('../models/MedicineRequest');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const MediPointsTransaction = require('../models/MediPointsTransaction');
const { calculateTierDiscount } = require('./medipointsController');

// @desc    Create a new medicine request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const { medicineId, quantity, deliveryAddress, contactPhone, prescriptionVerificationConfirmed, reasonNotes } = req.body;

    if (!medicineId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Medicine ID and quantity are required.',
      });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found.',
      });
    }

    if (medicine.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'This medicine is not currently approved for redistribution.',
      });
    }

    // Safety rule: Expired medicine must never be requestable
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (medicine.expiryDate && new Date(medicine.expiryDate) <= today) {
      return res.status(400).json({
        success: false,
        message: 'Clinical Safety Quarantine: This medicine batch has reached its expiration date and cannot be redistributed.',
      });
    }

    // Integrity check: A donor cannot request their own donated medicine
    const donorOwnerId = medicine.donorId?._id ? medicine.donorId._id.toString() : medicine.donorId?.toString();
    if (donorOwnerId && donorOwnerId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Redistribution Policy: You cannot request medicine that you donated yourself.',
      });
    }

    // Duplicate-request guard: Prevent multiple concurrent/active requests for the same medicine by the same user
    const existingActiveRequest = await MedicineRequest.findOne({
      userId: req.user._id,
      medicineId: medicine._id,
      status: { $in: ['Pending', 'Approved', 'Ready'] },
    });
    if (existingActiveRequest) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate Request: You already have an active request in progress for this medicine. Please check Track Activity.',
      });
    }

    const reqQty = parseInt(quantity, 10);
    if (isNaN(reqQty) || reqQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request quantity.',
      });
    }

    if (reqQty > medicine.quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${reqQty}) exceeds available inventory (${medicine.quantity}).`,
      });
    }

    if (medicine.prescriptionRequired && !prescriptionVerificationConfirmed) {
      return res.status(400).json({
        success: false,
        message: 'Prescription verification required. You must acknowledge and provide a valid registered medical prescription.',
      });
    }

    // --- Access Fee & MediPoints Redemption Calculation ---
    const unitAccessFee = Number(medicine.affordablePrice) > 0 ? Number(medicine.affordablePrice) : 45;
    const totalAccessFee = reqQty * unitAccessFee;

    let pointsUsed = 0;
    let pointsDiscount = 0;
    const usePointsRequested = Boolean(req.body.usePoints);

    // Fetch fresh user profile to verify current points balance
    const freshUser = await User.findById(req.user._id);
    const currentPoints = freshUser ? (freshUser.mediPoints || 0) : 0;

    if (usePointsRequested && currentPoints >= 1000) {
      const discountCalc = calculateTierDiscount(currentPoints, totalAccessFee);
      pointsUsed = discountCalc.pointsToConsume;
      pointsDiscount = discountCalc.eligibleDiscount;
    }

    const finalAccessFee = Math.max(0, totalAccessFee - pointsDiscount);

    // Atomically deduct points if points were used
    let pointsDeducted = false;
    if (pointsUsed > 0 && freshUser) {
      if (freshUser.mediPoints < pointsUsed) {
        return res.status(400).json({
          success: false,
          message: `Insufficient MediPoints. You currently have ${freshUser.mediPoints || 0} points, but ${pointsUsed} are needed.`,
        });
      }
      freshUser.mediPoints -= pointsUsed;
      if (typeof freshUser.save === 'function') {
        await freshUser.save();
      } else {
        const { db } = require('../config/memoryStore');
        const memUser = db.users.find((u) => u._id.toString() === req.user._id.toString());
        if (memUser) {
          memUser.mediPoints = freshUser.mediPoints;
        }
      }
      pointsDeducted = true;
    }

    let request;
    try {
      request = await MedicineRequest.create({
        userId: req.user._id,
        donorId: medicine.donorId,
        medicineId: medicine._id,
        quantity: reqQty,
        status: 'Pending',
        prescriptionVerificationConfirmed: Boolean(prescriptionVerificationConfirmed),
        deliveryAddress: deliveryAddress || 'Local Partner Clinic / Direct Pickup Center',
        contactPhone: contactPhone || '+91 98765 43210',
        reasonNotes: reasonNotes || '',
        unitAccessFee,
        totalAccessFee,
        pointsUsed,
        pointsDiscount,
        finalAccessFee,
        paymentStatus: 'PAID',
        paymentMode: 'PROTOTYPE_SIMULATED',
      });

      medicine.status = 'REQUESTED';
      medicine.activeRequestId = request._id;
      await medicine.save();

      // Record MediPoints redemption transaction
      if (pointsUsed > 0) {
        await MediPointsTransaction.create({
          userId: req.user._id,
          type: 'REDEMPTION',
          points: pointsUsed,
          reason: `Redeemed ${pointsUsed} MediPoints for ₹${pointsDiscount} discount on access fee for "${medicine.name}"`,
          requestId: request._id,
          medicineId: medicine._id,
          balanceAfter: freshUser.mediPoints,
        });
      }
    } catch (saveError) {
      // Rollback points deduction if request creation fails
      if (pointsDeducted && freshUser) {
        freshUser.mediPoints += pointsUsed;
        if (typeof freshUser.save === 'function') {
          await freshUser.save();
        } else {
          const { db } = require('../config/memoryStore');
          const memUser = db.users.find((u) => u._id.toString() === req.user._id.toString());
          if (memUser) {
            memUser.mediPoints = freshUser.mediPoints;
          }
        }
      }
      throw saveError;
    }

    // Create notifications for donor and recipient
    try {
      await Notification.create({
        userId: req.user._id,
        type: 'REQUEST_SUBMITTED',
        title: 'Medicine Request Submitted',
        message: `Your request for ${medicine.name} (${reqQty} units) has been received and queued for pharmacist review.`,
        medicineId: medicine._id,
        requestId: request._id,
      });

      if (medicine.donorId) {
        await Notification.create({
          userId: medicine.donorId._id || medicine.donorId,
          type: 'MEDICINE_REQUESTED',
          title: 'Your Donated Medicine Has Been Requested!',
          message: `A verified recipient has requested your donated ${medicine.name} (${reqQty} units). Pharmacist verification is underway.`,
          medicineId: medicine._id,
          requestId: request._id,
        });
      }

      await AuditLog.create({
        actor: req.user.name,
        actorId: req.user._id,
        actorRole: req.user.role || 'user',
        action: 'CREATE_REQUEST',
        entity: 'MedicineRequest',
        entityId: request._id.toString(),
        details: `Requested ${reqQty} units of "${medicine.name}" (Prescription verified: ${Boolean(prescriptionVerificationConfirmed)})`,
        result: 'SUCCESS',
      });
    } catch (notifErr) {
      console.error('Notification / AuditLog dispatch failed:', notifErr.message);
    }

    const populatedRequest = await MedicineRequest.findById(request._id)
      .populate('medicineId')
      .populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Medicine request submitted successfully.',
      data: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating request.',
    });
  }
};

// @desc    Get requests by logged-in user
// @route   GET /api/requests/my
// @access  Private
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await MedicineRequest.find({ userId: req.user._id })
      .populate('medicineId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user requests.',
    });
  }
};

// @desc    Get all requests (Admin)
// @route   GET /api/admin/requests
// @access  Private (Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await MedicineRequest.find()
      .populate('medicineId')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching all requests.',
    });
  }
};

// @desc    Update request status (Admin)
// @route   PUT /api/admin/requests/:id
// @access  Private (Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Dispensed', 'Completed', 'Rejected', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const request = await MedicineRequest.findById(req.params.id)
      .populate('medicineId');
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Medicine request not found.',
      });
    }

    const prevStatus = request.status;
    request.status = status;
    if (adminNotes !== undefined) {
      request.adminNotes = adminNotes;
    }

    const medicine = await Medicine.findById(request.medicineId?._id || request.medicineId);

    if (status === 'Approved') {
      request.approvedAt = new Date();
      if (medicine && prevStatus === 'Pending') {
        // Decrement remaining quantity
        medicine.quantity = Math.max(0, medicine.quantity - request.quantity);
        // If remaining quantity is 0, mark as DISPENSED/RESERVED, otherwise keep available as APPROVED
        if (medicine.quantity === 0) {
          medicine.status = 'DISPENSED';
        } else {
          medicine.status = 'APPROVED';
        }
        await medicine.save();
      }
    } else if (status === 'Dispensed' || status === 'Completed') {
      request.dispensedAt = new Date();
      if (medicine) {
        medicine.dispensedAt = new Date();
        if (medicine.quantity === 0) {
          medicine.status = 'DISPENSED';
        }
        await medicine.save();
      }
    } else if (status === 'Rejected' || status === 'Cancelled') {
      if (medicine) {
        // If request is rejected, restore status to APPROVED if quantity > 0
        medicine.status = medicine.quantity > 0 ? 'APPROVED' : 'DISPENSED';
        medicine.activeRequestId = null;
        await medicine.save();
      }
    }

    await request.save();

    // Create notifications for status updates
    try {
      const recipientId = request.userId?._id || request.userId;
      const donorId = medicine?.donorId?._id || medicine?.donorId;
      const medName = medicine?.name || 'Medicine';

      if (status === 'Approved') {
        await Notification.create({
          userId: recipientId,
          type: 'REQUEST_APPROVED',
          title: 'Request Approved by Pharmacist',
          message: `Your request for ${medName} has been approved by Dr. Anita Roy. Ready for dispatch or collection.`,
          medicineId: medicine?._id,
          requestId: request._id,
        });
        if (donorId) {
          await Notification.create({
            userId: donorId,
            type: 'MEDICINE_REQUEST_APPROVED',
            title: 'Donation Matched and Approved',
            message: `A pharmacist verified the clinical need for your donated ${medName}. Dispense scheduled!`,
            medicineId: medicine?._id,
            requestId: request._id,
          });
        }
      } else if (status === 'Dispensed' || status === 'Completed') {
        await Notification.create({
          userId: recipientId,
          type: 'REQUEST_DISPENSED',
          title: 'Medicine Dispensed / Completed',
          message: `Your requested ${medName} has been dispensed by the partner clinic pharmacy.`,
          medicineId: medicine?._id,
          requestId: request._id,
        });
        if (donorId) {
          await Notification.create({
            userId: donorId,
            type: 'MEDICINE_DISPENSED',
            title: 'Journey Complete: Medicine Delivered!',
            message: `Your donated ${medName} was successfully handed over to a verified patient. Thank you for your impact!`,
            medicineId: medicine?._id,
            requestId: request._id,
          });
        }
      } else if (status === 'Rejected') {
        await Notification.create({
          userId: recipientId,
          type: 'REQUEST_REJECTED',
          title: 'Request Not Approved',
          message: `Your request for ${medName} could not be approved. Reason: ${adminNotes || 'Verification criteria not met.'}`,
          medicineId: medicine?._id,
          requestId: request._id,
        });
      }

      let auditAction = 'UPDATE_REQUEST';
      if (status === 'Approved') auditAction = 'APPROVE_REQUEST';
      else if (status === 'Dispensed') auditAction = 'DISPENSE_MEDICINE';
      else if (status === 'Completed') auditAction = 'COMPLETE_MEDICINE';
      else if (status === 'Rejected') auditAction = 'REJECT_REQUEST';

      await AuditLog.create({
        actor: req.user ? req.user.name : 'Clinical Pharmacist',
        actorId: req.user ? req.user._id : null,
        actorRole: req.user ? req.user.role : 'pharmacist',
        action: auditAction,
        entity: 'MedicineRequest',
        entityId: request._id.toString(),
        details: `Request status transitioned to "${status}" for "${medName}" (Qty: ${request.quantity})`,
        result: status === 'Rejected' ? 'REJECTED' : 'SUCCESS',
      });
    } catch (notifErr) {
      console.error('Status change notification / AuditLog failed:', notifErr.message);
    }

    const updated = await MedicineRequest.findById(request._id)
      .populate('medicineId')
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      message: `Request status updated to ${status}.`,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating request status.',
    });
  }
};
