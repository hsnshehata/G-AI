const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Create default admin if not exists
    const User = require('./models/User');
    const admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      const newAdmin = new User({
        username: 'admin',
        password: '123456',
        role: 'superadmin',
      });
      await newAdmin.save();
      console.log('Default admin created');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
