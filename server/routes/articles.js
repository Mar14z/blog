const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const { handleValidationErrors } = require('../middleware/validate');

// 正文统一清洗规则（POST / PUT 共用）
const CONTENT_SANITIZE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'title', 'width', 'height'],
    code: ['class'],
    pre: ['class'],
    span: ['class']
  }
};

// 转义用户输入里的正则元字符，避免搜索被当成任意正则
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// slug 只保留小写字母/数字/连字符
const cleanSlug = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

// 清洗后为空（如纯中文标题）时回退为时间戳
const normalizeSlug = (slug, title) => cleanSlug(slug) || cleanSlug(title) || `post-${Date.now()}`;

// 后台允许更新的字段白名单
const UPDATABLE_FIELDS = ['title', 'slug', 'excerpt', 'content', 'category', 'tags', 'coverImage', 'readTime', 'published', 'featured'];

router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
    query('category').optional().isString().trim(),
    query('tag').optional().isString().trim(),
    query('search').optional().isString().trim(),
    query('featured').optional().isBoolean().toBoolean(),
    query('sort').optional().isString().trim(),
    query('order').optional().isIn(['asc', 'desc'])
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const skip = (page - 1) * limit;

      const sortField = req.query.sort || 'createdAt';
      const sortOrder = req.query.order === 'asc' ? 1 : -1;
      const sortObj = { [sortField]: sortOrder };

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
        const keyword = escapeRegex(req.query.search);
        filter.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { excerpt: { $regex: keyword, $options: 'i' } },
          { content: { $regex: keyword, $options: 'i' } }
        ];
      }

      const [articles, total] = await Promise.all([
        Article.find(filter)
          .sort(sortObj)
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

    // 用 $inc 原子自增，避免并发浏览时计数互相覆盖
    await Article.updateOne({ _id: article._id }, { $inc: { viewCount: 1 } });
    article.viewCount = (article.viewCount || 0) + 1;

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

router.get('/:slug/related', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug });
        if (!article) {
            return res.status(404).json({ code: 404, message: '文章未找到' });
        }

        const related = await Article.find({
            _id: { $ne: article._id },
            published: true,
            $or: [
                { category: article.category },
                { tags: { $in: article.tags || [] } }
            ]
        }).select('title slug excerpt category publishedAt createdAt readTime').limit(3).sort({ createdAt: -1 });

        res.json({ code: 200, data: related });
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
      if (req.body.content) {
        req.body.content = sanitizeHtml(req.body.content, CONTENT_SANITIZE_OPTIONS);
      }

      // 前端可能传入中文等非法 slug，这里统一清洗并兜底
      const articleData = {
        ...req.body,
        slug: normalizeSlug(req.body.slug, req.body.title),
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
      if (req.body.content) {
        req.body.content = sanitizeHtml(req.body.content, CONTENT_SANITIZE_OPTIONS);
      }

      const article = await Article.findById(req.params.id);

      if (!article) {
        return res.status(404).json({
          code: 404,
          message: '文章不存在'
        });
      }

      // 白名单更新，避免越权修改 viewCount / obsidianPath 等字段
      UPDATABLE_FIELDS.forEach(field => {
        if (req.body[field] === undefined) return;
        if (field === 'slug') {
          const cleaned = cleanSlug(req.body.slug);
          if (cleaned) article.slug = cleaned;
          return;
        }
        article[field] = req.body[field];
      });

      // 用 save() 触发 pre('save') 钩子维护 publishedAt
      await article.save();

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
      if (req.query.tag) {
        filter.tags = req.query.tag;
      }
      if (req.query.search) {
        const keyword = escapeRegex(req.query.search);
        filter.$or = [
          { title: { $regex: keyword, $options: 'i' } },
          { excerpt: { $regex: keyword, $options: 'i' } }
        ];
      }

      const [articles, total] = await Promise.all([
        Article.find(filter)
          .populate('author', 'username')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Article.countDocuments(filter)
      ]);

      const data = {
        articles,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

      // 仪表盘 / 分类标签页需要全量统计，按需计算避免列表请求额外开销
      if (req.query.stats === '1') {
        const [publishedCount, draftCount, viewAgg, categories, tagAgg] = await Promise.all([
          Article.countDocuments({ published: true }),
          Article.countDocuments({ published: false }),
          Article.aggregate([{ $group: { _id: null, views: { $sum: '$viewCount' } } }]),
          Article.distinct('category'),
          Article.aggregate([
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ])
        ]);
        data.stats = {
          total: publishedCount + draftCount,
          published: publishedCount,
          drafts: draftCount,
          views: viewAgg[0] ? viewAgg[0].views : 0
        };
        data.categories = categories;
        data.tags = tagAgg.map(t => ({ name: t._id, count: t.count }));
        // 让后台下拉使用与模型一致的可选分类，避免提交被枚举校验拒绝
        data.categoryOptions = Article.schema.path('category').enumValues;
      }

      res.json({ code: 200, data });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
