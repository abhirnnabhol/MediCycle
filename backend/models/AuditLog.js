const mongoose = require('mongoose');
const { AuditLogStore } = require('../config/memoryStore');

const auditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
    },
    actor: {
      type: String,
      required: true,
      trim: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorRole: {
      type: String,
      enum: ['user', 'pharmacist', 'admin', 'system'],
      default: 'system',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entity: {
      type: String,
      enum: ['User', 'Medicine', 'MedicineRequest', 'System', 'Settings'],
      required: true,
    },
    entityId: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    result: {
      type: String,
      enum: ['SUCCESS', 'REJECTED', 'FLAGGED', 'INFO'],
      default: 'SUCCESS',
    },
  },
  {
    timestamps: true,
  }
);

const MongooseAuditLog = mongoose.model('AuditLog', auditLogSchema);

const AuditLogProxy = new Proxy(MongooseAuditLog, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1 && AuditLogStore && AuditLogStore[prop]) {
      return AuditLogStore[prop];
    }
    return target[prop];
  },
});

module.exports = AuditLogProxy;
