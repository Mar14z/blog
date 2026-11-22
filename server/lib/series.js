const Article = require('../models/Article');

// 同一系列的已发布文章：按 seriesOrder 升序，序号相同再按发布日期、创建时间升序
async function loadSeries(article) {
  if (!article || !article.series) return null;

  const articles = await Article.find({ series: article.series, published: true })
    .select('title slug seriesOrder publishedAt createdAt')
    .sort({ seriesOrder: 1, publishedAt: 1, createdAt: 1 })
    .lean();

  // 只有一篇时不算连载，按普通文章处理
  if (articles.length < 2) return null;

  const index = articles.findIndex(item => String(item._id) === String(article._id));

  return {
    name: article.series,
    index: index < 0 ? 0 : index,
    total: articles.length,
    articles,
    prev: index > 0 ? articles[index - 1] : null,
    next: index >= 0 && index < articles.length - 1 ? articles[index + 1] : null
  };
}

module.exports = { loadSeries };
