const errorHandler = (err, req, res, next) => {
  console.error('❌ 错误详情:', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      errors: messages
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      code: 400,
      message: `${field}已存在`
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      code: 400,
      message: '无效的ID格式'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '无效的令牌'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: '令牌已过期，请重新登录'
    });
  }

  res.status(err.status || 500).json({
    code: err.status || 500,
    message: err.message || '服务器内部错误'
  });
};

module.exports = errorHandler;
