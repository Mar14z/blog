const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const { protect, adminOnly } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

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

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 公开：列表（按 order 升序，再按 createdAt 升序）
router.get('/', async (req, res, next) => {
  try {
    const items = await Gallery.find().sort({ order: 1, createdAt: 1 }).select('-__v');
    res.json({ code: 200, data: { items } });
  } catch (error) {
    next(error);
  }
});

// 后台：新增
router.post('/',
  protect,
  adminOnly,
  [
    body('src').notEmpty().withMessage('图片地址不能为空'),
    body('title').optional().isString().isLength({ max: 100 }).withMessage('标题最长 100 字符'),
    body('date').optional().isString().isLength({ max: 20 }).withMessage('日期最长 20 字符'),
    body('desc').optional().isString().isLength({ max: 500 }).withMessage('描述最长 500 字符'),
    body('order').optional().isInt().withMessage('order 必须是整数')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const item = await Gallery.create({
        src: req.body.src,
        title: req.body.title || '',
        date: req.body.date || '',
        desc: req.body.desc || '',
        order: typeof req.body.order === 'number' ? req.body.order : 0
      });
      res.status(201).json({ code: 201, message: '已添加', data: { item } });
    } catch (error) {
      next(error);
    }
  }
);

// 后台：更新
router.put('/:id',
  protect,
  adminOnly,
  [
    param('id').isMongoId().withMessage('无效的 ID'),
    body('title').optional().isString().isLength({ max: 100 }),
    body('date').optional().isString().isLength({ max: 20 }),
    body('desc').optional().isString().isLength({ max: 500 }),
    body('order').optional().isInt()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const update = {};
      ['title', 'date', 'desc', 'order'].forEach(k => {
        if (req.body[k] !== undefined) update[k] = req.body[k];
      });
      const item = await Gallery.findByIdAndUpdate(req.params.id, update, {
        new: true,
        runValidators: true
      });
      if (!item) {
        return res.status(404).json({ code: 404, message: '记录不存在' });
      }
      res.json({ code: 200, message: '已更新', data: { item } });
    } catch (error) {
      next(error);
    }
  }
);

// 后台：删除（同时尝试删本地文件，但仅删 /uploads/ 下的本地图片，外链跳过）
router.delete('/:id',
  protect,
  adminOnly,
  [param('id').isMongoId().withMessage('无效的 ID')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const item = await Gallery.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ code: 404, message: '记录不存在' });
      }
      // 仅清理 /uploads/ 下的本地文件
      if (item.src && item.src.startsWith('/uploads/')) {
        const filename = item.src.replace('/uploads/', '');
        const filePath = path.join(uploadDir, filename);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (_) {}
        }
      }
      res.json({ code: 200, message: '已删除' });
    } catch (error) {
      next(error);
    }
  }
);

// 后台：批量更新顺序
router.put('/order/batch',
  protect,
  adminOnly,
  [body('orders').isArray().withMessage('orders 必须是数组')],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const orders = req.body.orders; // [{ id, order }]
      await Promise.all(orders.map(o =>
        Gallery.findByIdAndUpdate(o.id, { order: o.order })
      ));
      res.json({ code: 200, message: '顺序已更新' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
