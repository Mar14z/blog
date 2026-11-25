const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请填写名字'],
    trim: true,
    maxlength: [50, '名字最多50个字符']
  },
  email: {
    type: String,
    required: [true, '请填写邮箱'],
    trim: true,
    lowercase: true,
    maxlength: [120, '邮箱最多120个字符'],
    match: [/^\S+@\S+\.\S+$/, '请提供有效的邮箱地址']
  },
  message: {
    type: String,
    required: [true, '留言内容不能为空'],
    trim: true,
    maxlength: [2000, '留言最多2000个字符']
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

contactSchema.index({ read: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
