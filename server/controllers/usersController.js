const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.createUser = async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });

    res.status(201).json({ message: 'User created', user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('bots');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const updateData = { username };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ message: 'User updated', user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
