const mongoose = require('mongoose');
const Config = require('../models/Config');

let isConnected = false; // Track connection state

const connectDB = async () => {
  if (isConnected) {
    console.log('ℹ️ MongoDB already connected');
    return;
  }

  try {
    // Fetch MongoDB URI from Config collection
    const mongoConfig = await Config.findOne({ key: 'MONGO_URI' });
    if (!mongoConfig || !mongoConfig.value) {
      throw new Error('MONGO_URI not found in Config collection');
    }

    const mongoURI = mongoConfig.value;

    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    isConnected = false;
    throw err; // Re-throw to allow calling code to handle it
  }
};

// Optional: Handle disconnection gracefully
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('ℹ️ MongoDB disconnected');
});

module.exports = connectDB;