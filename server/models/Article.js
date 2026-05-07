const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '文章标题不能为空'],
    trim: true,
    maxlength: [200, '标题最多200个字符']
  },
  slug: {
    type: String,
    required: [true, 'URL别名不能为空'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'URL别名只能包含小写字母、数字和连字符']
  },
  excerpt: {
    type: String,
    required: [true, '文章摘要不能为空'],
    maxlength: [500, '摘要最多500个字符']
  },
  content: {
    type: String,
    required: [true, '文章内容不能为空']
  },
  coverImage: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, '文章分类不能为空'],
    enum: {
      values: ['设计', '技术', '生活', '随笔', '编程', '产品', '读书', '其他'],
      message: '分类 "{VALUE}" 不在可选范围内'
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTime: {
    type: Number,
    default: 5,
    min: [1, '阅读时间至少1分钟']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  published: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date
  },
  fromObsidian: {
    type: Boolean,
    default: false
  },
  obsidianPath: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
articleSchema.index({ published: 1, createdAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });

articleSchema.virtual('isPublished').get(function() {
  return this.published;
});

articleSchema.pre('save', function(next) {
  if (this.isModified('published') && this.published) {
    this.publishedAt = new Date();
  }
  next();
});

articleSchema.set('toJSON', { virtuals: true });
articleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Article', articleSchema);
