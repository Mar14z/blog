const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空'
      });
    }

    let user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        code: 423,
        message: '账户已被锁定，请稍后再试'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        return res.status(423).json({
          code: 423,
          message: '密码错误次数过多，账户已被锁定1小时'
        });
      }
      
      await user.save();
      return res.status(401).json({
        code: 401,
        message: `用户名或密码错误，剩余尝试次数: ${5 - user.loginAttempts}`
      });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: user.toJSON()
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 401,
        message: '未授权访问'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.json({
    code: 200,
    message: '退出登录成功'
  });
});

module.exports = router;
