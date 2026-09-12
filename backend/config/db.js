const mongoose = require('mongoose');

let isMemoryMode = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicycle';

  try {
    // Attempt standard connection with 1.5-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[MongoDB] Successfully connected to live MongoDB instance at: ${uri}`);
    isMemoryMode = false;
  } catch (err) {
    console.log(`[MongoDB] Notice: Standalone MongoDB not detected (${err.message}).`);
    console.log(`[MongoDB] Running in High-Speed In-Memory Database Mode for Hackathon Prototype (Zero Friction, Instant Start).`);
    isMemoryMode = true;
  }
};

const disconnectDB = async () => {
  try {
    if (!isMemoryMode) {
      await mongoose.disconnect();
    }
  } catch (error) {
    console.error('[MongoDB] Disconnect error:', error);
  }
};

const getIsMemoryMode = () => isMemoryMode;

module.exports = { connectDB, disconnectDB, getIsMemoryMode };
