const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { auth, adminOnly } = require('../middleware/auth');
const slugify = require('slugify');

// GET /api/categories - Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories - Create category (admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const category = await Category.create({ name, slug, description, image });
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/categories/:id - Update category (admin)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const update = {};
    if (name) {
      update.name = name;
      update.slug = slugify(name, { lower: true, strict: true });
    }
    if (description !== undefined) update.description = description;
    if (image !== undefined) update.image = image;

    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/categories/:id - Delete category (admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
