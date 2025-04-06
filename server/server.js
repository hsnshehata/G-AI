const express = require('express');
const connectDB = require('./config/db');
const botRoutes = require('./routes/bots');
const chatRoutes = require('./routes/chats');
const ratingRoutes = require('./routes/ratings');
const statRoutes = require('./routes/stats');
const whatsappRoutes = require('./routes/whatsapp');
const configRoutes = require('./routes/config');
const authRoutes = require('./routes/auth'); // إضافة استيراد مسارات التوثيق
const rulesRoutes = require('./routes/rules'); // إضافة استيراد مسارات القواعد
const Config = require('./models/Config');
const OpenAI = require('openai');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Chat = require('./models/Chat');
const { initializeWhatsAppClient } = require('./services/whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(404).json({ error: 'User not found' });
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Initialize Server
(async () => {
  // Connect to MongoDB
  await connectDB();

  // Load Config into process.env
  const configs = await Config.find();
  configs.forEach(config => {
    process.env[config.key] = config.value;
  });

  // Initialize OpenAI
  const openai = new OpenAI({
    apiKey: process.env.API_KEY,
  });

  // Routes
  app.use('/auth', authRoutes); // إضافة مسار التوثيق
  app.use('/bots', authenticateToken, botRoutes);
  app.use('/chats', authenticateToken, chatRoutes);
  app.use('/ratings', authenticateToken, ratingRoutes);
  app.use('/stats', authenticateToken, statRoutes);
  app.use('/whatsapp', authenticateToken, whatsappRoutes);
  app.use('/config', authenticateToken, configRoutes);
  app.use('/rules', rulesRoutes); // إضافة مسار القواعد

  // Start Server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
