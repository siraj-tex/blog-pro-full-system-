const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { auth, adminOnly } = require('../middleware/auth');

// POST /api/upload - Upload image to Cloudinary
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      url: req.file.path,
      public_id: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
