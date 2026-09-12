const mongoose = require('mongoose');
const { RequestStore } = require('../config/memoryStore');

const medicineRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    quantity: {
      type: Number,
      required: [true, 'Request quantity is required'],
      min: [1, 'Quantity must be at least 1 unit'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Dispensed', 'Completed', 'Rejected', 'Cancelled'],
      default: 'Pending',
    },
    prescriptionVerificationConfirmed: {
      type: Boolean,
      default: false,
    },
    deliveryAddress: {
      type: String,
      default: 'Demo Delivery Clinic / Healthcare Center',
    },
    contactPhone: {
      type: String,
      default: '+91 98765 43210',
    },
    unitAccessFee: {
      type: Number,
      default: 0,
    },
    totalAccessFee: {
      type: Number,
      default: 0,
    },
    pointsUsed: {
      type: Number,
      default: 0,
    },
    pointsDiscount: {
      type: Number,
      default: 0,
    },
    finalAccessFee: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING_PAYMENT', 'DEMO_PAID', 'WAIVED'],
      default: 'DEMO_PAID',
    },
    paymentMode: {
      type: String,
      default: 'DEMO_ACCESS_FEE',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reasonNotes: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    dispensedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseMedicineRequest = mongoose.model('MedicineRequest', medicineRequestSchema);

const RequestProxy = new Proxy(MongooseMedicineRequest, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1 && RequestStore[prop]) {
      return RequestStore[prop];
    }
    return target[prop];
  },
});

module.exports = RequestProxy;
