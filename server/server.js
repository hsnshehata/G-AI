const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/bots', require('./routes/bots'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rules', require('./routes/rules'));
app.use('/api/bot', require('./routes/bot')); // تأكد إن المسار هنا صحيح

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
