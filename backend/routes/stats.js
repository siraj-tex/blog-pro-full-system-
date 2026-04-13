const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/stats - Get dashboard stats (admin)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: 'published' });
    const draftPosts = await Post.countDocuments({ status: 'draft' });
    const totalComments = await Comment.countDocuments();
    const totalUsers = await User.countDocuments();

    // Total views
    const viewsAgg = await Post.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Total likes
    const likesAgg = await Post.aggregate([
      { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
    ]);
    const totalLikes = likesAgg[0]?.totalLikes || 0;

    // Recent posts
    const recentPosts = await Post.find()
      .populate('author', 'displayName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug status views createdAt');

    // Posts per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const postsPerMonth = await Post.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalComments,
      totalUsers,
      totalViews,
      totalLikes,
      recentPosts,
      postsPerMonth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
