const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  src: {
    type: String,
    required: [true, '图片地址不能为空']
  },
  title: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, '标题最长 100 字符']
  },
  date: {
    type: String,
    default: '',
    trim: true,
    maxlength: [20, '日期最长 20 字符']
  },
  desc: {
    type: String,
    default: '',
    trim: true,
    maxlength: [500, '描述最长 500 字符']
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

gallerySchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
