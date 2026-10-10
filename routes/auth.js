const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  console.log('Registration request received:', req.body);
  const { full_name, email, phone, password } = req.body;

  try {
    console.log('Checking if user exists');
    // Check if user exists
    const existingUser = await Profile.findOne({ email });
    if (existingUser) {
      console.log('User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Hashing password');
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    console.log('Creating user');
    // Create user
    const user = new Profile({
      full_name,
      email,
      phone,
      password_hash,
    });

    console.log('Saving user');
    await user.save();

    console.log('Generating token');
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    console.log('Sending response');
    res.status(201).json({ token, user: { id: user._id, full_name, email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Profile.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    res.json({ token, user: { id: user._id, full_name: user.full_name, email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Protected route example
router.get('/loggedIn', auth, async (req, res) => {
  try {
    const user = await Profile.findById(req.user).select('-password_hash');
    res.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { full_name, email, phone, avatar_url } = req.body;
    const user = await Profile.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existingUser = await Profile.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email;
    }

    // Update other fields if provided
    if (full_name) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;

    await user.save();

    const updatedUser = await Profile.findById(req.user).select('-password_hash');
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
module.exports.auth = auth;
