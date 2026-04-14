const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth, adminOnly } = require('../middleware/auth');
const slugify = require('slugify');
const { sendPushNotification } = require('../utils/pushNotifications');

// GET /api/posts - Get all published posts (public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, status } = req.query;
    const query = {};

    // If not admin request, only show published
    if (status && status === 'all') {
      // Admin sees all
    } else {
      query.status = 'published';
    }

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'displayName photoURL')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/posts/:slug - Get single post
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'displayName photoURL')
      .populate('category', 'name slug');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/posts - Create post (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, status } = req.body;

    let slug = slugify(title, { lower: true, strict: true });
    // Ensure unique slug
    const existing = await Post.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || content.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      coverImage,
      category,
      tags: tags || [],
      author: req.user._id,
      status: status || 'draft',
    });

    await post.populate('author', 'displayName photoURL');
    await post.populate('category', 'name slug');

    if (post.status === 'published') {
      // Send notification in the background
      sendPushNotification('New Blog Post!', post.title, { slug: post.slug });
    }

    res.status(201).json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/posts/:id - Update post (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { title, content, excerpt, coverImage, category, tags, status } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (title && title !== post.title) {
      post.title = title;
      post.slug = slugify(title, { lower: true, strict: true });
    }
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (status) post.status = status;

    await post.save();
    await post.populate('author', 'displayName photoURL');
    await post.populate('category', 'name slug');

    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/posts/:id - Delete post (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/posts/:id/like - Like/unlike post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user._id);
    if (index === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: index === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
