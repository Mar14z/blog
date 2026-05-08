const API_BASE = 'http://localhost:3001/api';

class ArticleDetail {
    constructor() {
        this.slug = this.getArticleSlug();
        this.init();
    }

    async init() {
        if (!this.slug) {
            this.showError('文章不存在');
            return;
        }

        await this.loadArticle();
        this.initReadingProgress();
        this.initCursor();
    }

    initReadingProgress() {
        const progressBar = document.getElementById('readingProgress');
        if (!progressBar) return;

        const articleContent = document.getElementById('articleContent');
        if (!articleContent) return;

        window.addEventListener('scroll', () => {
            const articleTop = articleContent.offsetTop;
            const articleHeight = articleContent.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollY = window.scrollY;

            const start = articleTop - windowHeight;
            const end = articleTop + articleHeight - windowHeight;
            const progress = Math.max(0, Math.min(100, ((scrollY - start) / (end - start)) * 100));

            progressBar.style.width = `${progress}%`;
        });
    }

    getArticleSlug() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug') || window.location.pathname.split('/').pop().replace('.html', '');
    }

    async loadArticle() {
        try {
            const response = await fetch(`${API_BASE}/articles/${this.slug}?t=${Date.now()}`);
            const data = await response.json();

            if (data.code === 200) {
                this.renderArticle(data.data.article);
                this.renderNavigation(data.data.prevArticle, data.data.nextArticle);
                document.title = `${data.data.article.title} - 静墨`;
            } else {
                this.showError('文章不存在或已被删除');
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            this.showError('加载失败，请稍后重试');
        }
    }

    renderArticle(article) {
        document.getElementById('articleCategory').textContent = article.category;
        document.getElementById('articleTitle').textContent = article.title;
        document.getElementById('articleDate').textContent = new Date(article.publishedAt || article.createdAt).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('articleReadTime').textContent = `${article.readTime || 5} 分钟`;
        document.getElementById('articleViews').textContent = `${article.viewCount || 0} 次`;

        const cleanContent = this.cleanExportedContent(article.content);
        document.getElementById('articleContent').innerHTML = this.formatContent(cleanContent);

        if (article.coverImage) {
            document.getElementById('articleCover').innerHTML = `<img src="${article.coverImage}" alt="${article.title}">`;
        } else {
            document.getElementById('articleCover').style.display = 'none';
        }

        const tagsContainer = document.getElementById('articleTags');
        if (article.tags && article.tags.length > 0) {
            tagsContainer.innerHTML = article.tags.map(tag =>
                `<a href="index.html?tag=${encodeURIComponent(tag)}" class="article-tag">#${tag}</a>`
            ).join('');
        } else {
            tagsContainer.style.display = 'none';
        }
    }

    cleanExportedContent(content) {
        return content
            .replace(/^## 基本信息\n\n[\s\S]*?---\n\n/, '')
            .replace(/^## 文章内容\n\n/, '')
            .replace(/^## 相关链接\n\n[\s\S]*$/, '')
            .replace(/\*\*分类\*\*:.*?\n/, '')
            .replace(/\*\*标签\*\*:.*?\n/, '')
            .replace(/\*\*阅读时间\*\*:.*?\n/, '')
            .replace(/\*\*阅读量\*\*:.*?\n/, '')
            .replace(/\*\*发布日期\*\*:.*?\n/, '')
            .replace(/^- #.*$/gm, '')
            .replace(/^\*本文由博客系统自动导出.*?\*$/m, '')
            .trim();
    }

    renderNavigation(prev, next) {
        const prevEl = document.getElementById('prevArticle');
        const nextEl = document.getElementById('nextArticle');
        const prevTitle = document.getElementById('prevTitle');
        const nextTitle = document.getElementById('nextTitle');

        if (prev) {
            prevEl.href = `article.html?slug=${prev.slug}`;
            prevTitle.textContent = prev.title;
        } else {
            prevEl.style.display = 'none';
        }

        if (next) {
            nextEl.href = `article.html?slug=${next.slug}`;
            nextTitle.textContent = next.title;
        } else {
            nextEl.style.display = 'none';
        }
    }

    formatContent(content) {
        return content
            .split('\n\n')
            .map(para => {
                para = para.trim();
                if (!para) return '';

                if (para.startsWith('## ')) {
                    return `<h2>${para.substring(3)}</h2>`;
                } else if (para.startsWith('### ')) {
                    return `<h3>${para.substring(4)}</h3>`;
                } else if (para.startsWith('> ')) {
                    return `<blockquote>${para.substring(2)}</blockquote>`;
                } else if (para.startsWith('- ')) {
                    const items = para.split('\n').map(item => `<li>${item.substring(2)}</li>`).join('');
                    return `<ul>${items}</ul>`;
                } else if (para.match(/^\d+\. /)) {
                    const items = para.split('\n').map(item => `<li>${item.replace(/^\d+\. /, '')}</li>`).join('');
                    return `<ol>${items}</ol>`;
                } else {
                    return `<p>${para.replace(/\n/g, '<br>')}</p>`;
                }
            })
            .join('');
    }

    showError(message) {
        document.getElementById('articleTitle').textContent = '出错了';
        document.getElementById('articleContent').innerHTML = `
            <div style="text-align: center; padding: 4rem 0;">
                <p style="font-size: 1.25rem; color: var(--color-text-light); margin-bottom: 2rem;">${message}</p>
                <a href="index.html" style="color: var(--color-accent); text-decoration: none; font-family: var(--font-mono);">
                    ← 返回首页
                </a>
            </div>
        `;
    }

    initCursor() {
        const cursor = document.querySelector('.cursor');
        const cursorFollower = document.querySelector('.cursor-follower');
        if (!cursor || !cursorFollower) return;

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        const hoverElements = document.querySelectorAll('a, button');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }

    showToast(message, type = '') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.querySelector('.toast-message').textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

function shareToWeibo() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`http://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const articleDetail = new ArticleDetail();
        articleDetail.showToast('链接已复制到剪贴板', 'success');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    new ArticleDetail();
});
