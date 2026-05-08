const API_BASE = 'http://localhost:3001/api';

class BlogApp {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentCategory = '';
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.initLoader();
        this.initNavigation();
        this.initScrollEffects();
        this.initFilters();
        this.initContactForm();
        this.initHeroAnimation();
        this.loadArticles();
    }

    initLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.classList.add('hidden');
            }, 1000);
        }
    }

    initNavigation() {
        const nav = document.getElementById('nav');
        const main = document.getElementById('main');
        
        if (main) {
            main.addEventListener('scroll', () => {
                if (main.scrollTop > 50) {
                    nav.classList.add('scrolled');
                } else {
                    nav.classList.remove('scrolled');
                }
            });
        }
    }

    initScrollEffects() {
        const progressBar = document.getElementById('navProgress');
        const main = document.getElementById('main');
        
        if (progressBar && main) {
            main.addEventListener('scroll', () => {
                const scrollTop = main.scrollTop;
                const scrollHeight = main.scrollHeight - main.clientHeight;
                const progress = (scrollTop / scrollHeight) * 100;
                progressBar.style.width = `${progress}%`;
            });
        }

        const sections = document.querySelectorAll('.section');
        const observerOptions = {
            root: main,
            threshold: 0.3
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    initFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const searchInput = document.getElementById('searchInput');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        this.filteredArticles = this.articles.filter(article => {
            const matchesCategory = !this.currentCategory || article.category === this.currentCategory;
            const matchesSearch = !this.searchQuery || 
                article.title.toLowerCase().includes(this.searchQuery) ||
                article.excerpt.toLowerCase().includes(this.searchQuery) ||
                (article.tags && article.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)));
            return matchesCategory && matchesSearch;
        });
        this.renderArticles();
    }

    initContactForm() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showToast('消息已发送', 'success');
                form.reset();
            });
        }
    }

    initHeroAnimation() {
        const hero = document.getElementById('hero');
        if (!hero) return;

        const letters = ['记', '录', '思', '考', '沉', '淀', 'J', 'I', 'N', 'G', 'M', 'O'];
        
        letters.forEach((letter, i) => {
            const span = document.createElement('span');
            span.className = 'floating-letter';
            span.textContent = letter;
            span.style.cssText = `
                position: absolute;
                font-family: var(--font-mono);
                font-size: ${14 + Math.random() * 10}px;
                color: rgba(80, 80, 80, ${0.15 + Math.random() * 0.1});
                left: ${10 + Math.random() * 80}%;
                top: ${10 + Math.random() * 80}%;
                animation: float ${8 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${i * 0.5}s;
                pointer-events: none;
            `;
            hero.appendChild(span);
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
                50% { transform: translateY(-20px) rotate(10deg); opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
    }

    async loadArticles() {
        try {
            const response = await fetch(`${API_BASE}/articles?limit=50&t=${Date.now()}`);
            const data = await response.json();
            
            if (data.code === 200) {
                this.articles = data.data;
                this.filteredArticles = this.articles;
                this.renderArticles();
                this.updateStats();
            }
        } catch (error) {
            console.error('加载文章失败:', error);
            this.renderEmptyState();
        }
    }

    renderArticles() {
        const grid = document.getElementById('articlesGrid');
        if (!grid) return;

        if (this.filteredArticles.length === 0) {
            this.renderEmptyState();
            return;
        }

        grid.innerHTML = this.filteredArticles.map(article => `
            <article class="article-card" onclick="window.location.href='article.html?slug=${article.slug}'">
                <div class="card-meta">
                    <span class="card-date">${this.formatDate(article.publishedAt || article.createdAt)}</span>
                    <span class="card-tag">${article.category}</span>
                </div>
                <h3 class="card-title">${article.title}</h3>
                <p class="card-excerpt">${article.excerpt}</p>
                <div class="card-footer">
                    <span class="read-time">${article.readTime || 5} 分钟</span>
                    <div class="card-arrow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderEmptyState() {
        const grid = document.getElementById('articlesGrid');
        if (!grid) return;
        
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">[]</div>
                <p>没有找到相关文章</p>
            </div>
        `;
    }

    updateStats() {
        const statEl = document.getElementById('statArticles');
        if (statEl) {
            statEl.textContent = this.articles.length;
        }
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '.');
    }

    showToast(message, type = '') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.querySelector('.toast-message').textContent = message;
        toast.className = `toast show ${type}`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlogApp();
});
