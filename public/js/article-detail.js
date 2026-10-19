class ArticleDetail {
    constructor() {
        this.slug = this.getArticleSlug();
        this.cursorObserver = null;
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

    initToC() {
        const content = document.querySelector('.article-content');
        const tocList = document.getElementById('tocList');
        if (!content || !tocList) return;

        const headings = content.querySelectorAll('h2, h3');
        if (headings.length === 0) {
            document.getElementById('articleToc')?.remove();
            return;
        }

        headings.forEach((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;

            const li = document.createElement('li');
            li.className = `toc-item ${heading.tagName === 'H3' ? 'toc-item-h3' : ''}`;

            const a = document.createElement('a');
            a.href = `#${id}`;
            a.className = 'toc-link';
            a.textContent = heading.textContent;

            a.addEventListener('click', (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            li.appendChild(a);
            tocList.appendChild(li);
        });

        this.observeToC(headings);
    }

    observeToC(headings) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const link = document.querySelector(`.toc-link[href="#${id}"]`);
                if (link) {
                    if (entry.isIntersecting) {
                        document.querySelectorAll('.toc-link.active').forEach(l => l.classList.remove('active'));
                        link.classList.add('active');
                    }
                }
            });
        }, { rootMargin: '-80px 0px -70% 0px' });

        headings.forEach(heading => observer.observe(heading));
    }

    initReadingProgress() {
        const progressBar = document.getElementById('readingProgress');
        if (!progressBar) return;

        const updateProgress = throttle(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight > 0) {
                progressBar.style.width = ((scrollTop / docHeight) * 100) + '%';
            }
        }, 16);

        window.addEventListener('scroll', updateProgress);
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
                this.article = data.data.article;
                this.renderArticle(this.article);
                this.renderNavigation(data.data.prevArticle, data.data.nextArticle);
                document.title = `${this.article.title} - 静墨`;

                const jsonld = document.getElementById('article-jsonld');
                if (jsonld && this.article) {
                    const ldData = JSON.parse(jsonld.textContent);
                    ldData.headline = this.article.title;
                    ldData.description = this.article.excerpt || '';
                    ldData.datePublished = this.article.publishedAt || this.article.createdAt;
                    ldData.dateModified = this.article.updatedAt || this.article.createdAt;
                    ldData.url = `https://mar14z.xyz/article?slug=${this.article.slug}`;
                    jsonld.textContent = JSON.stringify(ldData);
                }

                document.querySelector('meta[property="og:title"]')?.setAttribute('content', this.article.title);
                document.querySelector('meta[property="og:description"]')?.setAttribute('content', this.article.excerpt || '');
                document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', this.article.title);

                this.loadRelatedArticles();
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
        document.getElementById('articleDate').textContent = formatDateFull(article.publishedAt || article.createdAt);
        document.getElementById('articleReadTime').textContent = `${article.readTime || 5} 分钟`;
        document.getElementById('articleViews').textContent = `${article.viewCount || 0} 次`;

        const cleanContent = this.cleanExportedContent(article.content);
        document.getElementById('articleContent').innerHTML = this.formatContent(cleanContent);

        if (article.coverImage) {
            document.getElementById('articleCover').innerHTML = `<img src="${escapeHtml(article.coverImage)}" alt="${escapeHtml(article.title)}">`;
        } else {
            document.getElementById('articleCover').style.display = 'none';
        }

        const tagsContainer = document.getElementById('articleTags');
        if (article.tags && article.tags.length > 0) {
            tagsContainer.innerHTML = article.tags.map(tag =>
                `<a href="/articles?tag=${encodeURIComponent(tag)}" class="article-tag">#${escapeHtml(tag)}</a>`
            ).join('');
        } else {
            tagsContainer.style.display = 'none';
        }

        this.initToC();
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
            prevEl.href = `/article?slug=${encodeURIComponent(prev.slug)}`;
            prevTitle.textContent = prev.title;
        } else {
            prevEl.style.display = 'none';
        }

        if (next) {
            nextEl.href = `/article?slug=${encodeURIComponent(next.slug)}`;
            nextTitle.textContent = next.title;
        } else {
            nextEl.style.display = 'none';
        }
    }

    formatContent(content) {
        // 先把代码块摘出来，避免其中的空行被误当作分段
        const codeBlocks = [];
        const source = String(content || '').replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
            const cls = lang ? ` class="language-${escapeHtml(lang)}"` : '';
            codeBlocks.push(`<pre><code${cls}>${escapeHtml(code.replace(/\r?\n$/, ''))}</code></pre>`);
            return `@@CODE${codeBlocks.length - 1}@@`;
        });

        return source
            .split(/\n{2,}/)
            .map(block => {
                const para = block.trim();
                if (!para) return '';

                const placeholder = para.match(/^@@CODE(\d+)@@$/);
                if (placeholder) return codeBlocks[Number(placeholder[1])];

                if (para.startsWith('### ')) return `<h3>${this.inline(para.slice(4))}</h3>`;
                if (para.startsWith('## ')) return `<h2>${this.inline(para.slice(3))}</h2>`;
                if (para.startsWith('# ')) return `<h1>${this.inline(para.slice(2))}</h1>`;

                if (para.startsWith('> ')) {
                    const quoted = para.split('\n').map(l => l.replace(/^>\s?/, '')).join('\n');
                    return `<blockquote>${this.inline(quoted)}</blockquote>`;
                }
                if (/^[-*] /.test(para)) {
                    const items = para.split('\n').map(l => `<li>${this.inline(l.replace(/^[-*]\s+/, ''))}</li>`).join('');
                    return `<ul>${items}</ul>`;
                }
                if (/^\d+\. /.test(para)) {
                    const items = para.split('\n').map(l => `<li>${this.inline(l.replace(/^\d+\.\s+/, ''))}</li>`).join('');
                    return `<ol>${items}</ol>`;
                }
                if (this.isTable(para)) return this.table(para);

                return `<p>${this.inline(para)}</p>`;
            })
            .join('');
    }

    isTable(block) {
        const lines = block.split('\n');
        return lines.length >= 2
            && lines[0].trim().startsWith('|')
            && lines[1].trim().includes('-')
            && /^[\s|:-]+$/.test(lines[1].trim());
    }

    // 表格列数以表头为准，多余单元格丢弃、缺失补空，避免列错位撑宽
    table(block) {
        const splitRow = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        const lines = block.split('\n');
        const head = splitRow(lines[0]);
        const rows = lines.slice(2).map(splitRow);
        const headHtml = `<thead><tr>${head.map(c => `<th>${this.inline(c)}</th>`).join('')}</tr></thead>`;
        const bodyHtml = `<tbody>${rows.map(r => `<tr>${head.map((_, i) => `<td>${this.inline(r[i] || '')}</td>`).join('')}</tr>`).join('')}</tbody>`;
        return `<div class="table-scroll"><table>${headHtml}${bodyHtml}</table></div>`;
    }

    // 行内 Markdown：先转义 HTML，再套用行内样式
    inline(text) {
        return escapeHtml(text)
            .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
            .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showError(message) {
        document.getElementById('articleTitle').textContent = '出错了';
        document.getElementById('articleContent').innerHTML = `
            <div style="text-align: center; padding: 4rem 0;">
                <p style="font-size: 1.25rem; color: var(--color-text-light); margin-bottom: 2rem;">${escapeHtml(message)}</p>
                <a href="/" style="color: var(--color-accent); text-decoration: none; font-family: var(--font-mono);">
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

        const updateCursor = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        };

        document.addEventListener('mousemove', updateCursor);

        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            this.cursorFrameId = requestAnimationFrame(animateFollower);
        };
        animateFollower();

        const hoverElements = document.querySelectorAll('a, button');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }

    async loadRelatedArticles() {
        try {
            const response = await fetch(`${API_BASE}/articles/${this.article.slug}/related`);
            const data = await response.json();
            if (data.code === 200 && data.data.length > 0) {
                this.renderRelated(data.data);
            }
        } catch (error) {
            console.error('加载相关文章失败:', error);
        }
    }

    renderRelated(articles) {
        const container = document.createElement('section');
        container.className = 'related-articles';
        container.innerHTML = `
            <h3 class="related-title">相关文章</h3>
            <div class="related-grid">
                ${articles.map(a => `
                    <a href="/article?slug=${encodeURIComponent(a.slug)}" class="related-card">
                        <span class="related-category">${escapeHtml(a.category)}</span>
                        <h4 class="related-card-title">${escapeHtml(a.title)}</h4>
                        <span class="related-date">${formatDate(a.publishedAt || a.createdAt)}</span>
                    </a>
                `).join('')}
            </div>
        `;

        const articleContent = document.querySelector('.article-content');
        if (articleContent) {
            articleContent.after(container);
        }
    }

    destroy() {
        if (this.cursorFrameId) {
            cancelAnimationFrame(this.cursorFrameId);
        }
        if (this.cursorObserver) {
            this.cursorObserver.disconnect();
        }
    }
}

function shareToWeibo() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    window.open(`http://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('链接已复制到剪贴板', 'success');
    }).catch(() => {
        showToast('复制失败，请手动复制', 'error');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    new ArticleDetail();
});
