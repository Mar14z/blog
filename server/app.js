require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/database');
const articleRoutes = require('./routes/articles');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const feed = require('./routes/feed');
const sitemap = require('./routes/sitemap');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, '..', 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true
}));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true
}));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
    etag: true
}));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

app.get('/articles', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'articles.html'));
});

app.get('/article', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'article.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'about.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'gallery.html'));
});

app.get('/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'portfolio.html'));
});

app.get('/links', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'links.html'));
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { code: 429, message: '登录尝试过多，请稍后再试' }
});

app.use('/api/auth/login', authLimiter);

connectDB();

app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use(feed);
app.use(sitemap);

app.get('/api/health', (req, res) => {
  res.json({ code: 200, message: '服务运行正常', timestamp: Date.now() });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📱 手机预览: http://${getLocalIP()}:${PORT}`);
  console.log(`📚 API文档: http://localhost:${PORT}/api/health`);
  console.log(`🔐 管理后台: http://localhost:${PORT}/admin`);
  console.log(`📷 图片上传: POST http://localhost:${PORT}/api/upload/image`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('服务器已关闭');
      process.exit(0);
    });
  });
});

function getLocalIP() {
  const nets = require('os').networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'YOUR_IP';
}
