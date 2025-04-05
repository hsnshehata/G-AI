const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const initWhatsApp = require('./server/utils/whatsapp');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// Global Socket.IO instance
global.io = io;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/auth', require('./server/routes/auth'));
app.use('/rules', require('./server/routes/rules'));
app.use('/ratings', require('./server/routes/ratings'));
app.use('/stats', require('./server/routes/stats'));
app.use('/settings', require('./server/routes/settings'));
app.use('/chats', require('./server/routes/chats'));
app.use('/faqs', require('./server/routes/faqs'));
app.use('/activity', require('./server/routes/activity'));
app.use('/bots', require('./server/routes/bots'));
app.use('/gpt', require('./server/routes/gpt'));
app.use('/whatsapp', require('./server/routes/whatsapp')); // 🔥 NEW!

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard/index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Init WhatsApp
initWhatsApp(io); // 🟢 Start WhatsApp client after server starts
