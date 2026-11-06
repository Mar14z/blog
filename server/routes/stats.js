const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

// 首页展示用的公开统计：文章数、写作天数、总阅读量
router.get('/', async (req, res, next) => {
  try {
    const [articles, viewAgg, first] = await Promise.all([
      Article.countDocuments({ published: true }),
      Article.aggregate([
        { $match: { published: true } },
        { $group: { _id: null, views: { $sum: '$viewCount' } } }
      ]),
      Article.findOne({ published: true })
        .sort({ publishedAt: 1, createdAt: 1 })
        .select('publishedAt createdAt')
    ]);

    const views = (viewAgg[0] && viewAgg[0].views) || 0;
    const start = first ? new Date(first.publishedAt || first.createdAt) : null;
    const days = start
      ? Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1)
      : 0;

    res.json({ code: 200, data: { articles, days, views } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
