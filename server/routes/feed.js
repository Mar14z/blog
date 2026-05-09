const express = require('express');
const router = express.Router();
const Article = require('../models/Article');

router.get('/feed.xml', async (req, res) => {
    try {
        const articles = await Article.find({ published: true }).sort({ createdAt: -1 }).limit(20);

        const { Feed } = await import('feed');

        const feed = new Feed({
            title: '静墨博客',
            description: '静墨的个人博客，记录技术思考、产品感悟与生活点滴',
            id: 'https://jingmo.dev/',
            link: 'https://jingmo.dev/',
            language: 'zh-CN',
            author: {
                name: '静墨',
                link: 'https://jingmo.dev'
            }
        });

        articles.forEach(article => {
            feed.addItem({
                title: article.title,
                id: `https://jingmo.dev/article?slug=${article.slug}`,
                link: `https://jingmo.dev/article?slug=${article.slug}`,
                description: article.excerpt || '',
                content: article.content || '',
                date: article.publishedAt || article.createdAt
            });
        });

        res.header('Content-Type', 'application/xml');
        res.send(feed.rss2());
    } catch (error) {
        res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Internal Server Error</error>');
    }
});

module.exports = router;
