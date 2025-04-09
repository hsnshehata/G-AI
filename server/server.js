const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');

const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bots');
const userRoutes = require('./routes/users');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/login', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('🚀 G-AI Server is running...');
});

app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
