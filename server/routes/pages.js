const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Article = require('../models/Article');
const { loadSeries } = require('../lib/series');
const { escapeHtml, renderMarkdown } = require('../lib/markdown');

const SITE_URL = 'https://mar14z.xyz';
const VIEWS_DIR = path.join(__dirname, '..', '..', 'views');

// 模板只在启动时读一次，避免每个请求都读盘
const articleTemplate = fs.readFileSync(path.join(VIEWS_DIR, 'article.html'), 'utf8');
const articlesTemplate = fs.readFileSync(path.join(VIEWS_DIR, 'articles.html'), 'utf8');
const notFoundPage = fs.readFileSync(path.join(VIEWS_DIR, '404.html'), 'utf8');

const articleUrl = (slug) => `${SITE_URL}/article?slug=${encodeURIComponent(slug)}`;

// 简单占位符替换；用 split/join 避免 replace 把内容里的 $& 当替换模式
function fillTemplate(template, tokens) {
  let html = template;
  for (const [key, value] of Object.entries(tokens)) {
    const token = `{{${key}}}`;
    html = html.split(token).join(value === null || value === undefined ? '' : String(value));
  }
  // 兜底：漏填的占位符直接清空，避免把模板标记暴露给爬虫
  return html.replace(/\{\{[A-Z_]+\}\}/g, '');
}

function formatDateText(date) {
  if (!date) return '';
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(value);
  } catch (error) {
    return value.toISOString().split('T')[0];
  }
}

function isoDate(date) {
  if (!date) return '';
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? '' : value.toISOString();
}

function absoluteUrl(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function buildJsonLd(article, canonical) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt || '',
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    datePublished: isoDate(article.publishedAt || article.createdAt),
    dateModified: isoDate(article.updatedAt || article.createdAt),
    inLanguage: 'zh-CN',
    author: {
      '@type': 'Person',
      name: '静墨',
      url: `${SITE_URL}/about`
    },
    publisher: {
      '@type': 'Person',
      name: '静墨',
      url: SITE_URL
    },
    articleSection: article.category || '',
    keywords: Array.isArray(article.tags) ? article.tags.join(', ') : ''
  };
  if (article.coverImage) {
    data.image = absoluteUrl(article.coverImage);
  }
  if (article.series) {
    data.isPartOf = { '@type': 'CreativeWorkSeries', name: article.series };
  }
  // 转义 < 防止正文里的 </script> 提前闭合脚本块
  return JSON.stringify(data, null, 2).replace(/</g, '\\u003c');
}

// 连载目录卡：正文前的系列导航，当前篇高亮
function renderSeriesBox(series, currentSlug) {
  if (!series) return '';

  const items = series.articles.map((item, index) => {
    const num = String(index + 1).padStart(2, '0');
    const title = escapeHtml(item.title);
    if (item.slug === currentSlug) {
      return `                        <li class="series-item current">
                            <span class="series-num">${num}</span>
                            <span class="series-current">${title}（当前）</span>
                        </li>`;
    }
    return `                        <li class="series-item">
                            <a class="series-link" href="${escapeHtml(articleUrl(item.slug))}">
                                <span class="series-num">${num}</span>
                                <span>${title}</span>
                            </a>
                        </li>`;
  }).join('\n');

  return `        <section class="series-box" aria-label="连载目录">
            <div class="series-head">
                <span class="series-label">连载</span>
                <span class="series-name">${escapeHtml(series.name)}</span>
                <span class="series-progress">第 ${series.index + 1} / ${series.total} 篇</span>
            </div>
            <ol class="series-list">
${items}
            </ol>
        </section>
`;
}

function renderArticlePage(article, prevArticle, nextArticle, series) {
  const canonical = articleUrl(article.slug);
  const description = (article.excerpt || '').slice(0, 300);
  const coverImage = absoluteUrl(article.coverImage);

  const ogImage = coverImage
    ? `    <meta property="og:image" content="${escapeHtml(coverImage)}">\n`
    : '';
  const articleMeta = [
    `    <meta property="article:published_time" content="${isoDate(article.publishedAt || article.createdAt)}">`,
    `    <meta property="article:modified_time" content="${isoDate(article.updatedAt || article.createdAt)}">`,
    `    <meta property="article:section" content="${escapeHtml(article.category || '')}">`,
    ...(Array.isArray(article.tags)
      ? article.tags.map(tag => `    <meta property="article:tag" content="${escapeHtml(tag)}">`)
      : [])
  ].join('\n');

  const tagsHtml = Array.isArray(article.tags) && article.tags.length
    ? article.tags.map(tag => `<a href="/articles?tag=${encodeURIComponent(tag)}" class="article-tag">#${escapeHtml(tag)}</a>`).join('')
    : '';

  const coverHtml = coverImage
    ? `<img src="${escapeHtml(coverImage)}" alt="${escapeHtml(article.title)}">`
    : '';

  return fillTemplate(articleTemplate, {
    TITLE: escapeHtml(article.title),
    DESCRIPTION: escapeHtml(description),
    CANONICAL: escapeHtml(canonical),
    OG_IMAGE: ogImage,
    ARTICLE_META: articleMeta,
    TWITTER_CARD: coverImage ? 'summary_large_image' : 'summary',
    JSON_LD: buildJsonLd(article, canonical),
    CATEGORY: escapeHtml(article.category || ''),
    DATE_TEXT: escapeHtml(formatDateText(article.publishedAt || article.createdAt)),
    READ_TIME: article.readTime || 5,
    VIEWS: article.viewCount || 0,
    SERIES_HTML: renderSeriesBox(series, article.slug),
    COVER_HTML: coverHtml,
    CONTENT_HTML: renderMarkdown(article.content),
    TAGS_HTML: tagsHtml,
    PREV_HREF: prevArticle ? escapeHtml(articleUrl(prevArticle.slug)) : '#',
    PREV_TITLE: prevArticle ? escapeHtml(prevArticle.title) : '',
    PREV_HIDDEN: prevArticle ? '' : ' style="display:none"',
    NEXT_HREF: nextArticle ? escapeHtml(articleUrl(nextArticle.slug)) : '#',
    NEXT_TITLE: nextArticle ? escapeHtml(nextArticle.title) : '',
    NEXT_HIDDEN: nextArticle ? '' : ' style="display:none"'
  });
}

// 文章详情：爬虫不执行 JS，正文、meta 和上下篇链接都在服务端生成
router.get('/article', async (req, res, next) => {
  const slug = typeof req.query.slug === 'string' ? req.query.slug : '';
  if (!slug) {
    return res.status(404).type('html').send(notFoundPage);
  }

  try {
    const article = await Article.findOne({ slug, published: true }).lean();
    if (!article) {
      return res.status(404).type('html').send(notFoundPage);
    }

    // 属于连载时，上下篇优先在系列内跳转
    const series = await loadSeries(article);
    let prevArticle = null;
    let nextArticle = null;

    if (series) {
      prevArticle = series.prev;
      nextArticle = series.next;
    } else {
      [prevArticle, nextArticle] = await Promise.all([
        Article.findOne({ createdAt: { $lt: article.createdAt }, published: true })
          .sort({ createdAt: -1 })
          .select('title slug')
          .lean(),
        Article.findOne({ createdAt: { $gt: article.createdAt }, published: true })
          .sort({ createdAt: 1 })
          .select('title slug')
          .lean()
      ]);
    }

    res.type('html').send(renderArticlePage(article, prevArticle, nextArticle, series));
  } catch (error) {
    next(error);
  }
});

// 文章列表：先给出一份静态列表供爬虫抓取内链，浏览器加载后再由前端重排
router.get('/articles', async (req, res, next) => {
  try {
    // 与前端首屏 15 条保持一致，避免浏览器加载后被重排出现跳动
    const [articles, total] = await Promise.all([
      Article.find({ published: true })
        .sort({ createdAt: -1 })
        .limit(15)
        .select('title slug excerpt category series publishedAt createdAt')
        .lean(),
      Article.countDocuments({ published: true })
    ]);

    const rows = articles.map((article, index) => {
      const date = formatDateText(article.publishedAt || article.createdAt);
      return `
                    <a class="article-row visible" href="${escapeHtml(articleUrl(article.slug))}" style="text-decoration:none;color:inherit;">
                        <span class="row-index">${String(index + 1).padStart(2, '0')}</span>
                        <div class="row-content">
                            ${article.series ? `<div class="row-series">连载 · ${escapeHtml(article.series)}</div>` : ''}
                            <div class="row-title">${escapeHtml(article.title)}</div>
                            <div class="row-excerpt">${escapeHtml(article.excerpt || '')}</div>
                        </div>
                        <span class="row-category">${escapeHtml(article.category || '')}</span>
                        <div class="row-meta">
                            <span class="row-date">${escapeHtml(date)}</span>
                            <span class="row-arrow">→</span>
                        </div>
                    </a>`;
    }).join('');

    res.type('html').send(fillTemplate(articlesTemplate, {
      ARTICLE_ROWS: rows,
      ARTICLE_COUNT: `${articles.length} / ${total} 篇`
    }));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
module.exports.renderArticlePage = renderArticlePage;
