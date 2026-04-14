const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { sendPushNotification } = require('../utils/pushNotifications');

// POST /api/notifications/send - Send custom push notification (admin only)
router.post('/send', auth, adminOnly, async (req, res) => {
  try {
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    // Send push notification to all users asynchronously
    sendPushNotification(title, body, data);

    res.json({ message: 'Push notification broadcast initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
