const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const { protect, adminOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

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

// 公开：读取当前 Profile（单例）
router.get('/', async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json({ code: 200, data: profile });
  } catch (error) {
    next(error);
  }
});

// 后台：更新整份 Profile
router.put('/',
  protect,
  adminOnly,
  [
    body('intro.name').optional().isString().isLength({ max: 50 }).withMessage('姓名最长 50 字符'),
    body('intro.greeting').optional().isString().isLength({ max: 20 }).withMessage('问候语最长 20 字符'),
    body('intro.bio').optional().isString().isLength({ max: 500 }).withMessage('简介最长 500 字符'),
    body('education').optional().isArray(),
    body('experiences').optional().isArray(),
    body('contacts').optional().isArray()
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const body = req.body || {};
      const update = {
        intro: body.intro || {},
        education: Array.isArray(body.education) ? body.education : [],
        experiences: Array.isArray(body.experiences) ? body.experiences : [],
        skills: body.skills || { technical: [], soft: [] },
        contacts: Array.isArray(body.contacts) ? body.contacts : []
      };

      const profile = await Profile.findOneAndUpdate({}, update, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      });

      res.json({ code: 200, message: '个人信息已保存', data: profile });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
