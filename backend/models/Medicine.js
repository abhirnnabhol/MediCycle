const mongoose = require('mongoose');
const { MedicineStore } = require('../config/memoryStore');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    genericName: {
      type: String,
      required: [true, 'Generic chemical/drug name is required'],
      trim: true,
    },
    strength: {
      type: String,
      required: [true, 'Strength/dosage is required (e.g. 500mg, 10mg)'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Antibiotics',
        'Chronic Care',
        'Pain Relief',
        'Cardiology',
        'Diabetes Care',
        'Respiratory',
        'Gastrointestinal',
        'Vitamins & Supplements',
        'General Health',
        'Oncology',
        'Critical Care',
      ],
      default: 'General Health',
    },
    quantity: {
      type: Number,
      required: [true, 'Available quantity (units/tablets) is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    originalQuantity: {
      type: Number,
      default: function () {
        return this.quantity;
      },
    },
    batchNumber: {
      type: String,
      required: [true, 'Manufacturer batch number is required'],
      trim: true,
      uppercase: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    storageCondition: {
      type: String,
      required: [true, 'Storage conditions must be specified'],
      default: 'Room Temperature (15-25°C)',
    },
    packageCondition: {
      type: String,
      required: [true, 'Package condition must be verified'],
      default: 'Intact Blister Foil Strip (Unbroken)',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original MRP / retail price is required'],
      min: 0,
    },
    affordablePrice: {
      type: Number,
      required: [true, 'Subsidized / affordable demo price is required'],
      min: 0,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'REQUESTED', 'DISPENSED', 'COMPLETED', 'SOLD'],
      default: 'PENDING',
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    activeRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineRequest',
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
    pointsAwarded: {
      type: Boolean,
      default: false,
    },
    additionalNotes: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: 'Indiranagar, Bengaluru',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseMedicine = mongoose.model('Medicine', medicineSchema);

const MedicineProxy = new Proxy(MongooseMedicine, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1 && MedicineStore[prop]) {
      return MedicineStore[prop];
    }
    return target[prop];
  },
});

module.exports = MedicineProxy;
