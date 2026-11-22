const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

const SITE_URL = 'https://mar14z.xyz';

// sitemap 是 XML，URL 中的 &、< 等字符必须转义
const escapeXml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const lastmod = (date) => {
    const value = new Date(date);
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
};

router.get('/sitemap.xml', async (req, res) => {
    try {
        const articles = await Article.find({ published: true })
            .select('slug publishedAt updatedAt createdAt')
            .sort({ publishedAt: -1, createdAt: -1 })
            .lean();

        // 首页和文章列表的更新时间跟随最新文章，避免时间戳长期不动
        const newest = articles[0]
            ? lastmod(articles[0].updatedAt || articles[0].publishedAt || articles[0].createdAt)
            : '';

        const pages = [
            { url: '/', changefreq: 'daily', priority: '1.0', lastmod: newest },
            { url: '/articles', changefreq: 'daily', priority: '0.9', lastmod: newest },
            { url: '/about', changefreq: 'monthly', priority: '0.6' },
            { url: '/portfolio', changefreq: 'monthly', priority: '0.7' },
            { url: '/gallery', changefreq: 'monthly', priority: '0.5' },
            { url: '/links', changefreq: 'monthly', priority: '0.4' }
        ];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        pages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${escapeXml(SITE_URL + page.url)}</loc>\n`;
            if (page.lastmod) xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        articles.forEach(article => {
            const loc = `${SITE_URL}/article?slug=${encodeURIComponent(article.slug)}`;
            const modified = lastmod(article.updatedAt || article.publishedAt || article.createdAt);

            xml += '  <url>\n';
            xml += `    <loc>${escapeXml(loc)}</loc>\n`;
            if (modified) xml += `    <lastmod>${modified}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml; charset=utf-8');
        res.header('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (error) {
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Internal Server Error</error>');
    }
});

module.exports = router;
