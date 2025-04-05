const express = require('express');
const connectDB = require('./config/db');
const botRoutes = require('./routes/bots');
const chatRoutes = require('./routes/chats');
const ratingRoutes = require('./routes/ratings');
const statRoutes = require('./routes/stats');
const whatsappRoutes = require('./routes/whatsapp');
const configRoutes = require('./routes/config');
const Config = require('./models/Config');
const OpenAI = require('openai'); // ✅ تم تعديل الاستدعاء هنا
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

  // ✅ Initialize OpenAI بالإصدار الجديد
  const openai = new OpenAI({
    apiKey: process.env.API_KEY,
  });

  // Routes
  app.use('/bots', authenticateToken, botRoutes);
  app.use('/chats', authenticateToken, chatRoutes);
  app.use('/ratings', authenticateToken, ratingRoutes);
  app.use('/stats', authenticateToken, statRoutes);
  app.use('/whatsapp', authenticateToken, whatsappRoutes);
  app.use('/config', authenticateToken, configRoutes);

  // Login Route
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
      res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Chat Route with OpenAI
  app.post('/chat', async (req, res) => {
    const { message, pageId, userId } = req.body;
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      });
      const reply = response.choices[0].message.content;

      // Save chat to DB
      await Chat.findOneAndUpdate(
        { pageId, userId },
        {
          $push: {
            messages: [
              { role: 'user', content: message, source: 'web', responded: true },
              { role: 'bot', content: reply, source: 'web', responded: true },
            ],
          },
        },
        { upsert: true }
      );

      res.json({ reply });
    } catch (err) {
      res.status(500).json({ error: `Chat error: ${err.message}` });
    }
  });

  // Image Upload Route with OpenAI (Placeholder)
  app.post('/upload-image', async (req, res) => {
    const { image, pageId, userId, comment } = req.body; // Assuming multer or similar for file upload
    try {
      // Placeholder for OpenAI image analysis
      const reply = `تم تحليل الصورة: ${comment || 'بدون تعليق'}`;
      await Chat.findOneAndUpdate(
        { pageId, userId },
        {
          $push: {
            messages: [
              { role: 'user', content: `صورة: ${comment || 'بدون تعليق'}`, source: 'web', responded: true },
              { role: 'bot', content: reply, source: 'web', responded: true },
            ],
          },
        },
        { upsert: true }
      );
      res.json({ reply });
    } catch (err) {
      res.status(500).json({ error: `Image upload error: ${err.message}` });
    }
  });

  // Initialize WhatsApp Clients for all users
  const users = await User.find({ 'permissions.whatsapp': true });
  users.forEach(user => {
    if (user.pageId) initializeWhatsAppClient(user.pageId);
  });

  // Start Server
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
})();
