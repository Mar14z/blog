const { validationResult } = require('express-validator');

// 统一处理 express-validator 的校验结果
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

module.exports = { handleValidationErrors };