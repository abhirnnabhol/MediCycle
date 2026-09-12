const mongoose = require('mongoose');
const { MediPointsTransactionStore } = require('../config/memoryStore');

const mediPointsTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    points: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['DONATION_REWARD', 'REDEMPTION', 'ADJUSTMENT'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    referenceId: {
      type: String,
      default: null,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MongooseMediPointsTransaction = mongoose.model('MediPointsTransaction', mediPointsTransactionSchema);

const MediPointsTransactionProxy = new Proxy(MongooseMediPointsTransaction, {
  get(target, prop) {
    if (mongoose.connection.readyState !== 1 && MediPointsTransactionStore && MediPointsTransactionStore[prop]) {
      return MediPointsTransactionStore[prop];
    }
    return target[prop];
  },
});

module.exports = MediPointsTransactionProxy;
