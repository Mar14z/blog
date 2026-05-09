const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

router.get('/sitemap.xml', async (req, res) => {
    try {
        const articles = await Article.find({ published: true }).select('slug updatedAt').sort({ createdAt: -1 });
        const pages = [
            { url: '', changefreq: 'weekly', priority: '1.0' },
            { url: '/articles', changefreq: 'daily', priority: '0.9' },
            { url: '/about', changefreq: 'monthly', priority: '0.7' },
            { url: '/gallery', changefreq: 'monthly', priority: '0.7' },
            { url: '/portfolio', changefreq: 'monthly', priority: '0.7' },
            { url: '/links', changefreq: 'monthly', priority: '0.5' }
        ];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        pages.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>https://jingmo.dev${page.url}</loc>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        articles.forEach(article => {
            xml += '  <url>\n';
            xml += `    <loc>https://jingmo.dev/article?slug=${article.slug}</loc>\n`;
            xml += `    <lastmod>${article.updatedAt ? article.updatedAt.toISOString().split('T')[0] : ''}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Internal Server Error</error>');
    }
});

module.exports = router;
