class BlogApp {
    constructor() {
        this.articles = [];
        this.total = 0;
        this.scrollObserver = null;
        this.timelineObserver = null;
        this.init();
    }

    init() {
        this.initScrollProgress();
        this.initContactForm();
        this.loadArticles();
    }

    initScrollProgress() {
        const updateProgress = throttle(() => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            const progressBar = document.getElementById('navProgress');
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }, 16);
        window.addEventListener('scroll', updateProgress);
    }

    initIntersectionObserver() {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }
        this.scrollObserver = createScrollObserver((target) => {
            target.classList.add('visible');
        }, { threshold: 0.1 });
        document.querySelectorAll('.article-card').forEach(card => {
            this.scrollObserver.observe(card);
        });
    }

    initTimelineObserver() {
        if (this.timelineObserver) {
            this.timelineObserver.disconnect();
        }
        this.timelineObserver = createScrollObserver((target) => {
            target.classList.add('visible');
        }, { threshold: 0.2 });
        document.querySelectorAll('.timeline-item').forEach(item => {
            this.timelineObserver.observe(item);
        });
    }

    initContactForm() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('contactName')?.value;
                const email = document.getElementById('contactEmail')?.value;
                const message = document.getElementById('contactMessage')?.value;
                if (!name || !email || !message) {
                    showToast('请填写完整信息', 'error');
                    return;
                }
                showToast('消息已发送，感谢您的留言！', 'success');
                form.reset();
            });
        }
    }

    async loadArticles() {
        try {
            const response = await fetch(`${API_BASE}/articles?limit=7&t=${Date.now()}`);
            const data = await response.json();
            if (data.code === 200) {
                this.articles = data.data.articles || data.data;
                // 统计总数用分页总量，而不是本次拉取的条数
                this.total = data.data.pagination?.total ?? this.articles.length;
                this.renderFeatured();
                this.renderArticles();
                this.updateStats();
                this.initTimelineObserver();
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            showToast('加载失败，请刷新重试', 'error');
        }
    }

    renderFeatured() {
        const container = document.getElementById('featuredArticle');
        if (!container || this.articles.length === 0) return;

        const article = this.articles[0];
        container.style.display = 'grid';
        container.onclick = () => window.location.href = `/article?slug=${encodeURIComponent(article.slug)}`;
        container.innerHTML = `
            <div class="featured-visual">
                <span class="featured-number">01</span>
            </div>
            <div class="featured-info">
                <div class="featured-tag">精选</div>
                <h3 class="featured-title">${escapeHtml(article.title)}</h3>
                <p class="featured-excerpt">${escapeHtml(article.excerpt || '')}</p>
                <div class="featured-meta">
                    <span class="featured-date">${formatDate(article.publishedAt || article.createdAt)}</span>
                    <span class="featured-read">${article.readTime || 5} 分钟阅读</span>
                    <span class="featured-arrow">→</span>
                </div>
            </div>
        `;
    }

    renderArticles() {
        const grid = document.getElementById('articlesGrid');
        if (!grid) return;

        if (this.articles.length <= 1) {
            grid.innerHTML = '';
            return;
        }

        const previewArticles = this.articles.slice(1, 7);

        grid.innerHTML = previewArticles.map((article) => `
            <article class="article-card" data-slug="${escapeHtml(article.slug)}">
                <div class="card-header">
                    <span class="card-category">${escapeHtml(article.category)}</span>
                    <span class="card-date">${formatDate(article.publishedAt || article.createdAt)}</span>
                </div>
                <h3 class="card-title">${escapeHtml(article.title)}</h3>
                <p class="card-excerpt">${escapeHtml(article.excerpt || '')}</p>
                <div class="card-footer">
                    <div class="card-meta">
                        <span class="card-tag">${article.readTime || 5} 分钟阅读</span>
                    </div>
                    <div class="card-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </article>
        `).join('');

        grid.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', () => {
                window.location.href = `/article?slug=${encodeURIComponent(card.dataset.slug)}`;
            });
        });

        this.initIntersectionObserver();
    }

    updateStats() {
        const statEl = document.getElementById('statArticles');
        if (statEl) {
            statEl.textContent = this.total;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlogApp();
});
