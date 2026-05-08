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
        this.initFloatingLetters();
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
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.searchQuery = e.target.value.toLowerCase();
                    this.applyFilters();
                }, 300);
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

    animateCardsIn() {
        const grid = document.getElementById('articlesGrid');
        if (!grid) return;
        const cards = grid.querySelectorAll('.article-card');
        cards.forEach((card, index) => {
            card.classList.remove('visible');
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
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
                    this.showToast('请填写完整信息', 'error');
                    return;
                }
                
                this.showToast('消息已发送，感谢您的留言！', 'success');
                form.reset();
            });
        }
    }

    initFloatingLetters() {
        const container = document.getElementById('floatingLetters');
        if (!container) return;

        const letters = ['记', '录', '思', '考', '沉', '淀', 'J', 'I', 'N', 'G', 'M', 'O'];
        
        letters.forEach((letter, i) => {
            const span = document.createElement('span');
            span.className = 'floating-letter';
            span.textContent = letter;
            span.style.left = `${10 + Math.random() * 80}%`;
            span.style.top = `${10 + Math.random() * 80}%`;
            span.style.fontSize = `${14 + Math.random() * 10}px`;
            span.style.animationDelay = `${i * 0.5}s`;
            container.appendChild(span);
        });
    }

    async loadArticles() {
        try {
            const response = await fetch(`${API_BASE}/articles?limit=50&t=${Date.now()}`);
            const data = await response.json();
            
            if (data.code === 200) {
                this.articles = data.data.articles || data.data;
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

        grid.innerHTML = this.filteredArticles.map((article, index) => {
            const coverImage = article.coverImage || '';
            
            return `
            <article class="article-card" data-index="${index}" onclick="window.location.href='/article?slug=${article.slug}'">
                <div class="article-card-cover">
                    ${coverImage 
                        ? `<img src="${coverImage}" alt="${article.title}" loading="lazy">`
                        : `<div class="article-card-cover-placeholder">${String(index + 1).padStart(2, '0')}</div>`
                    }
                </div>
                <div class="article-card-content">
                    <div class="card-meta">
                        <span class="card-date">${this.formatDate(article.publishedAt || article.createdAt)}</span>
                        <span class="card-tag">${article.category}</span>
                    </div>
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-excerpt">${article.excerpt || ''}</p>
                    <div class="card-footer">
                        <span class="read-time">${article.readTime || 5} 分钟阅读</span>
                        <div class="card-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </article>
        `}).join('');

        this.animateCardsIn();
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
        if (!dateStr) return '';
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
