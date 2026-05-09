const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: errors.array().map(err => err.msg)
    });
  }
  next();
};

router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
    query('category').optional().isString().trim(),
    query('tag').optional().isString().trim(),
    query('search').optional().isString().trim(),
    query('featured').optional().isBoolean().toBoolean()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const skip = (page - 1) * limit;

      const filter = { published: true };

      if (req.query.category) {
        filter.category = req.query.category;
      }

      if (req.query.tag) {
        filter.tags = req.query.tag;
      }

      if (req.query.featured !== undefined) {
        filter.featured = req.query.featured;
      }

      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { excerpt: { $regex: req.query.search, $options: 'i' } },
          { content: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const [articles, total] = await Promise.all([
        Article.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-__v'),
        Article.countDocuments(filter)
      ]);

      res.json({
        code: 200,
        data: {
          articles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + articles.length < total
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Article.distinct('category', { published: true });
    
    res.json({
      code: 200,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/tags', async (req, res, next) => {
  try {
    const tags = await Article.aggregate([
      { $match: { published: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      code: 200,
      data: { tags: tags.map(t => ({ name: t._id, count: t.count })) }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/featured', async (req, res, next) => {
  try {
    const articles = await Article.find({ published: true, featured: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-__v');

    res.json({
      code: 200,
      data: { articles }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const article = await Article.findOne({ 
      slug: req.params.slug,
      published: true 
    });

    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      });
    }

    article.viewCount += 1;
    await article.save();

    const [prevArticle, nextArticle] = await Promise.all([
      Article.findOne({ 
        createdAt: { $lt: article.createdAt },
        published: true 
      })
        .sort({ createdAt: -1 })
        .select('title slug category')
        .lean(),
      Article.findOne({ 
        createdAt: { $gt: article.createdAt },
        published: true 
      })
        .sort({ createdAt: 1 })
        .select('title slug category')
        .lean()
    ]);

    res.json({
      code: 200,
      data: { 
        article,
        prevArticle: prevArticle || null,
        nextArticle: nextArticle || null
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/',
  protect,
  adminOnly,
  [
    body('title').notEmpty().trim().withMessage('标题不能为空'),
    body('slug').optional().isString().trim().withMessage('URL别名格式不正确'),
    body('excerpt').notEmpty().trim().withMessage('摘要不能为空'),
    body('content').notEmpty().withMessage('内容不能为空'),
    body('category').notEmpty().trim().withMessage('分类不能为空'),
    body('tags').optional().isArray().withMessage('标签必须是数组'),
    body('coverImage').optional().isString().trim().withMessage('封面图片格式不正确'),
    body('published').optional().isBoolean().withMessage('发布状态必须是布尔值'),
    body('featured').optional().isBoolean().withMessage('推荐状态必须是布尔值'),
    body('readTime').optional().isInt({ min: 1 }).withMessage('阅读时间必须大于0')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      let slug = req.body.slug;
      if (!slug && req.body.title) {
        slug = req.body.title
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      const articleData = {
        ...req.body,
        slug: slug,
        author: req.user._id
      };

      const article = await Article.create(articleData);

      res.status(201).json({
        code: 201,
        message: '文章创建成功',
        data: { article }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  protect,
  adminOnly,
  [
    param('id').isMongoId().withMessage('无效的文章ID'),
    body('title').optional().notEmpty().trim().withMessage('标题不能为空'),
    body('slug').optional().isString().trim().withMessage('URL别名格式不正确'),
    body('excerpt').optional().notEmpty().trim().withMessage('摘要不能为空'),
    body('content').optional().notEmpty().withMessage('内容不能为空'),
    body('category').optional().isString().trim().withMessage('分类格式不正确')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const article = await Article.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!article) {
        return res.status(404).json({
          code: 404,
          message: '文章不存在'
        });
      }

      res.json({
        code: 200,
        message: '文章更新成功',
        data: { article }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  protect,
  adminOnly,
  [param('id').isMongoId().withMessage('无效的文章ID')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const article = await Article.findByIdAndDelete(req.params.id);

      if (!article) {
        return res.status(404).json({
          code: 404,
          message: '文章不存在'
        });
      }

      res.json({
        code: 200,
        message: '文章删除成功'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/admin/all',
  protect,
  adminOnly,
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.published !== undefined) {
        filter.published = req.query.published === 'true';
      }
      if (req.query.category) {
        filter.category = req.query.category;
      }

      const [articles, total] = await Promise.all([
        Article.find(filter)
          .populate('author', 'username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Article.countDocuments(filter)
      ]);

      res.json({
        code: 200,
        data: {
          articles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
