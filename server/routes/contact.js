const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body, param, query } = require('express-validator');
const Contact = require('../models/Contact');
const { protect, adminOnly } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validate');

// 公开写入接口单独限流，避免被脚本灌库
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { code: 429, message: '留言太频繁，请稍后再试' }
});

router.post('/',
  submitLimiter,
  [
    body('name').notEmpty().trim().withMessage('请填写名字'),
    body('email').notEmpty().trim().isEmail().withMessage('请填写有效的邮箱'),
    body('message').notEmpty().trim().isLength({ max: 2000 }).withMessage('留言内容不能为空且最多2000字')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      await Contact.create({
        name: req.body.name,
        email: req.body.email,
        message: req.body.message
      });

      res.status(201).json({
        code: 201,
        message: '留言已提交'
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/',
  protect,
  adminOnly,
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('filter').optional().isIn(['all', 'unread'])
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const skip = (page - 1) * limit;
      const filter = req.query.filter === 'unread' ? { read: false } : {};

      const [messages, total, unread] = await Promise.all([
        Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Contact.countDocuments(filter),
        Contact.countDocuments({ read: false })
      ]);

      res.json({
        code: 200,
        data: {
          messages,
          unread,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + messages.length < total
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id/read',
  protect,
  adminOnly,
  [
    param('id').isMongoId().withMessage('无效的留言ID'),
    body('read').isBoolean().withMessage('已读状态必须是布尔值')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const message = await Contact.findByIdAndUpdate(
        req.params.id,
        { read: req.body.read },
        { new: true }
      );

      if (!message) {
        return res.status(404).json({ code: 404, message: '留言不存在' });
      }

      res.json({ code: 200, message: '已更新', data: { message } });
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  protect,
  adminOnly,
  [param('id').isMongoId().withMessage('无效的留言ID')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const message = await Contact.findByIdAndDelete(req.params.id);

      if (!message) {
        return res.status(404).json({ code: 404, message: '留言不存在' });
      }

      res.json({ code: 200, message: '已删除' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
