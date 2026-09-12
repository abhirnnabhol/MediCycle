const mongoose = require('mongoose');
const { NotificationStore } = require('../config/memoryStore');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'donation_submitted',
        'donation_approved',
        'donation_rejected',
        'donation_requested',
        'donation_dispensed',
        'request_submitted',
        'request_approved',
        'request_dispensed',
        'request_rejected',
        'admin_audit_alert',
        'admin_request_alert',
        'general',
      ],
      default: 'general',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineRequest',
      default: null,
    },
    link: {
      type: String,
      default: '/track-activity',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseNotification = mongoose.model('Notification', notificationSchema);

const NotificationProxy = new Proxy(MongooseNotification, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1 && NotificationStore && NotificationStore[prop]) {
      return NotificationStore[prop];
    }
    return target[prop];
  },
});

module.exports = NotificationProxy;
