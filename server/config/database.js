const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');
const Article = require('../models/Article');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Gallery = require('../models/Gallery');

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

// 下载网络图片到本地 /uploads，返回 /uploads/xxx 路径
const downloadImage = (url, filename) => new Promise((resolve, reject) => {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  const file = fs.createWriteStream(filePath);
  const request = (u) => https.get(u, (res) => {
    // 跟随重定向（Unsplash 有时返回 302）
    if (res.statusCode === 301 || res.statusCode === 302) {
      res.resume();
      return request(res.headers.location);
    }
    if (res.statusCode !== 200) {
      file.close();
      try { fs.unlinkSync(filePath); } catch (_) {}
      return reject(new Error('下载失败 status=' + res.statusCode));
    }
    res.pipe(file);
    file.on('finish', () => file.close(() => resolve(`/uploads/${filename}`)));
  }).on('error', (err) => {
    try { fs.unlinkSync(filePath); } catch (_) {}
    reject(err);
  });
  request(url);
});

const initializeDefaultData = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
        email: 'admin@example.com'
      });
      console.log('✅ 默认管理员账户已创建');
    }

    const profileExists = await Profile.findOne();
    if (!profileExists) {
      await Profile.create({
        intro: {
          name: '静墨',
          greeting: '你好',
          bio: '全栈开发者 / 设计师 / 终身学习者。热爱技术与设计，追求极简与优雅。'
        },
        education: [
          { title: '计算机科学学士', period: '2017 - 2021', school: '某大学', desc: '主修软件工程，优秀毕业生', order: 0 },
          { title: '前端开发训练营', period: '2020', school: '线上学习', desc: '完成全栈开发课程', order: 1 }
        ],
        experiences: [
          { title: '全栈开发工程师', period: '2023 - 至今', company: '某科技公司', desc: '负责核心产品设计与开发，主导技术架构设计', order: 0 },
          { title: '前端开发工程师', period: '2021 - 2023', company: '某互联网公司', desc: '负责官网及移动端产品开发与维护', order: 1 },
          { title: '自由开发者', period: '2020 - 2021', company: '独立项目', desc: '承接网站设计与开发项目', order: 2 }
        ],
        skills: {
          technical: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'Vue', 'Python', 'MongoDB', 'PostgreSQL', 'Docker', 'Git', 'Figma', 'CSS'],
          soft: ['UI/UX', 'Prototyping', 'Design Thinking', 'Critical Thinking', 'Research', 'Visualizing']
        },
        contacts: [
          { type: 'phone', label: 'Phone', value: '+86 138 0000 0000' },
          { type: 'email', label: '邮箱', value: 'hello@jingmo.dev' },
          { type: 'github', label: 'GitHub', value: '@Mar14z' }
        ]
      });
      console.log('✅ 默认个人资料已初始化');
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

    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      console.log('📥 正在初始化相册（前 7 张示例图）...');
      // 注：删掉了 gallery.js 里原来第 8 张「城市夜景」
      const seedPhotos = [
        { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', title: '日出时分', date: '2024.03.15', desc: '', order: 0 },
        { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80', title: '森林深处', date: '2024.02.28', desc: '', order: 1 },
        { src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&q=80', title: '城市轮廓', date: '2024.02.10', desc: '', order: 2 },
        { src: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=80', title: '瀑布', date: '2024.01.22', desc: '', order: 3 },
        { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80', title: '湖畔', date: '2024.01.08', desc: '', order: 4 },
        { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80', title: '云海', date: '2023.12.20', desc: '', order: 5 },
        { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80', title: '雪山', date: '2023.12.05', desc: '', order: 6 }
      ];
      let ok = 0, fail = 0;
      for (const p of seedPhotos) {
        try {
          const filename = `seed-${Date.now()}-${ok}-${Math.round(Math.random() * 1e6)}.jpg`;
          const localPath = await downloadImage(p.src, filename);
          await Gallery.create({ ...p, src: localPath });
          ok++;
        } catch (err) {
          console.warn(`  下载 ${p.title} 失败: ${err.message}`);
          fail++;
        }
      }
      console.log(`✅ 相册初始化完成: 成功 ${ok} 张，失败 ${fail} 张`);
    }
  } catch (error) {
    console.error('初始化数据失败:', error.message);
  }
};

module.exports = connectDB;
