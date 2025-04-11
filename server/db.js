const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Create default admin if not exists
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'superadmin',
      });
      console.log('Default admin created');
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
