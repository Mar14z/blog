const mongoose = require('mongoose');
const Article = require('../models/Article');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB连接成功: ${conn.connection.host}`);
    
    await initializeDefaultData();
  } catch (error) {
    console.error(`❌ MongoDB连接失败: ${error.message}`);
    process.exit(1);
  }
};

const initializeDefaultData = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      
      await User.create({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin',
        email: 'admin@example.com'
      });
      console.log('✅ 默认管理员账户已创建');
    }

    const articleCount = await Article.countDocuments();
    if (articleCount === 0) {
      await Article.insertMany([
        {
          title: '极简主义的艺术：少即是多',
          slug: 'minimalist-art-less-is-more',
          excerpt: '探索极简设计背后的哲学，如何通过减法创造永恒的美学价值。',
          content: '在这个信息爆炸的时代，我们每天都被大量的视觉和听觉刺激所包围...',
          coverImage: '',
          category: '设计',
          tags: ['极简', '设计', '美学'],
          readTime: 5,
          published: true,
          featured: true
        },
        {
          title: 'CSS动画的极致追求',
          slug: 'css-animation-excellence',
          excerpt: '深入探索CSS动画性能优化，创造流畅的用户体验。',
          content: '动画是用户体验中不可或缺的组成部分，良好的动画可以引导用户注意力...',
          coverImage: '',
          category: '技术',
          tags: ['CSS', '动画', '前端'],
          readTime: 8,
          published: true,
          featured: true
        },
        {
          title: '数字时代的慢生活',
          slug: 'slow-living-digital-age',
          excerpt: '在信息爆炸的时代，如何保持内心的宁静与专注。',
          content: '智能手机、社交媒体、即时通讯...这些数字工具在给我们带来便利的同时...',
          coverImage: '',
          category: '生活',
          tags: ['生活', '数字极简', '专注'],
          readTime: 6,
          published: true,
          featured: false
        },
        {
          title: '留白的美学',
          slug: 'art-of-white-space',
          excerpt: '空白不是空洞，而是呼吸的空间，是设计中最有力的元素。',
          content: '留白，又称负空间，是设计中常被忽视却至关重要的元素...',
          coverImage: '',
          category: '设计',
          tags: ['设计', '美学', '留白'],
          readTime: 4,
          published: true,
          featured: false
        }
      ]);
      console.log('✅ 示例文章数据已初始化');
    }
  } catch (error) {
    console.error('初始化数据失败:', error.message);
  }
};

module.exports = connectDB;
