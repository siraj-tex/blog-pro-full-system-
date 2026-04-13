const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// POST /api/auth/register - Sync Firebase user to MongoDB
router.post('/register', auth, async (req, res) => {
  try {
    const user = req.user;
    // Update with latest info from request body
    if (req.body.displayName) user.displayName = req.body.displayName;
    if (req.body.photoURL) user.photoURL = req.body.photoURL;
    await user.save();

    // Check if this is the first user - make them admin
    const userCount = await User.countDocuments();
    if (userCount === 1) {
      user.isAdmin = true;
      await user.save();
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/profile - Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, bio, photoURL } = req.body;
    const user = req.user;

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;
    if (photoURL) user.photoURL = photoURL;

    await user.save();
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
