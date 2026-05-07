class Cursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.cursorFollower = document.querySelector('.cursor-follower');
        this.mouseX = 0;
        this.mouseY = 0;
        this.followerX = 0;
        this.followerY = 0;
        this.isHovering = false;
        
        this.init();
    }

    init() {
        if (!this.cursor || !this.cursorFollower) return;
        
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseenter', () => this.showCursor());
        document.addEventListener('mouseleave', () => this.hideCursor());
        
        const hoverElements = document.querySelectorAll('a, button, [data-hover]');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.enterHover());
            el.addEventListener('mouseleave', () => this.leaveHover());
        });
        
        this.animateFollower();
    }

    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        this.cursor.style.left = this.mouseX + 'px';
        this.cursor.style.top = this.mouseY + 'px';
    }

    animateFollower() {
        const animate = () => {
            this.followerX += (this.mouseX - this.followerX) * 0.15;
            this.followerY += (this.mouseY - this.followerY) * 0.15;
            
            this.cursorFollower.style.left = this.followerX + 'px';
            this.cursorFollower.style.top = this.followerY + 'px';
            
            requestAnimationFrame(animate);
        };
        animate();
    }

    enterHover() {
        this.isHovering = true;
        document.body.classList.add('hovering');
    }

    leaveHover() {
        this.isHovering = false;
        document.body.classList.remove('hovering');
    }

    showCursor() {
        this.cursor.style.opacity = '1';
        this.cursorFollower.style.opacity = '1';
    }

    hideCursor() {
        this.cursor.style.opacity = '0';
        this.cursorFollower.style.opacity = '0';
    }
}

class Loader {
    constructor() {
        this.loader = document.querySelector('.loader');
        this.init();
    }

    init() {
        if (!this.loader) return;
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hideLoader();
            }, 1500);
        });
    }

    hideLoader() {
        this.loader.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

class ScrollAnimator {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.elements = document.querySelectorAll('[data-scroll]');
        
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        } else {
            this.elements.forEach(el => el.classList.add('visible'));
        }
    }

    setupObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay * 100);
                }
            });
        }, options);

        this.elements.forEach(el => observer.observe(el));
    }
}

class CardAnimator {
    constructor() {
        this.cards = [];
        this.init();
    }

    init() {
        this.cards = document.querySelectorAll('.article-card');
        
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        }
    }

    setupObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                }
            });
        }, options);

        this.cards.forEach(card => observer.observe(card));
    }
}

class NavScroll {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.init();
    }

    init() {
        if (!this.nav) return;
        
        window.addEventListener('scroll', () => this.handleScroll());
        this.handleScroll();
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
    }
}

class Counter {
    constructor() {
        this.counters = [];
        this.init();
    }

    init() {
        this.counters = document.querySelectorAll('[data-count]');
        
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        } else {
            this.counters.forEach(counter => {
                counter.textContent = counter.dataset.count;
            });
        }
    }

    setupObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const start = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };
        
        requestAnimationFrame(animate);
    }
}

class FormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const button = this.form.querySelector('.btn-submit');
        const originalText = button.querySelector('.btn-text').textContent;
        
        button.querySelector('.btn-text').textContent = '发送中...';
        button.disabled = true;
        
        setTimeout(() => {
            button.querySelector('.btn-text').textContent = '已发送 ✓';
            button.style.backgroundColor = 'var(--color-accent)';
            
            setTimeout(() => {
                this.form.reset();
                button.querySelector('.btn-text').textContent = originalText;
                button.style.backgroundColor = '';
                button.disabled = false;
            }, 2000);
        }, 1500);
    }
}

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
}

class ParallaxEffect {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.elements = document.querySelectorAll('.floating-shape');
        
        if (this.elements.length === 0) return;
        
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        const scrollY = window.scrollY;
        
        this.elements.forEach((el, index) => {
            const speed = 0.05 * (index + 1);
            const yPos = scrollY * speed;
            el.style.transform = `translateY(${yPos}px)`;
        });
    }
}

class ArticleHover3D {
    constructor() {
        this.cards = [];
        this.init();
    }

    init() {
        this.cards = document.querySelectorAll('.article-card');
        
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
            card.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, card));
        });
    }

    handleMouseMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    }

    handleMouseLeave(e, card) {
        card.style.transform = '';
    }
}

class ArticleLoader {
    constructor() {
        this.apiBase = 'http://localhost:3001/api';
        this.currentCategory = '';
        this.currentSearch = '';
        this.debounceTimer = null;
        this.init();
    }

    async init() {
        await this.loadArticles();
        await this.loadStats();
        this.initFilters();
    }

    initFilters() {
        const searchInput = document.getElementById('searchInput');
        const filterButtons = document.querySelectorAll('.filter-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = setTimeout(() => {
                    this.currentSearch = e.target.value.trim();
                    this.loadArticles();
                }, 300);
            });
        }

        if (filterButtons) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentCategory = btn.dataset.category;
                    this.loadArticles();
                });
            });
        }
    }

    async loadArticles() {
        try {
            let url = `${this.apiBase}/articles?limit=20&t=${Date.now()}`;
            
            if (this.currentCategory) {
                url += `&category=${encodeURIComponent(this.currentCategory)}`;
            }
            
            if (this.currentSearch) {
                url += `&search=${encodeURIComponent(this.currentSearch)}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === 200) {
                this.renderArticles(data.data.articles);
                new CardAnimator();
            }
        } catch (error) {
            console.log('API暂不可用，使用静态数据');
        }
    }

    renderArticles(articles) {
        const grid = document.querySelector('.articles-grid');
        if (!grid) return;

        if (articles.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0;">
                    <p style="font-size: 1.25rem; color: var(--color-text-muted);">
                        ${this.currentSearch ? '未找到相关文章' : '暂无文章'}
                    </p>
                </div>
            `;
            return;
        }

        grid.innerHTML = articles.map((article, index) => `
            <article class="article-card" data-hover data-scroll onclick="window.location.href='article.html?slug=${article.slug}'" style="cursor: pointer;">
                <div class="card-image">
                    ${article.coverImage 
                        ? `<img src="${article.coverImage}" alt="${article.title}">`
                        : `<div class="image-placeholder" style="--hue: ${(index * 40 + 200) % 360}"></div>`
                    }
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="card-date">${new Date(article.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}</span>
                        <span class="card-tag">${article.category}</span>
                    </div>
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-excerpt">${article.excerpt}</p>
                    <div class="card-footer">
                        <span class="read-time">${article.readTime} 分钟阅读</span>
                        <div class="card-arrow">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');

        setTimeout(() => {
            new CardAnimator();
            new ArticleHover3D();
        }, 100);
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiBase}/articles`);
            const data = await response.json();
            
            if (data.code === 200) {
                const counters = document.querySelectorAll('.stat-number');
                if (counters[0]) counters[0].dataset.count = data.data.pagination.total;
                if (counters[1]) counters[1].dataset.count = Math.floor(data.data.pagination.total * 0.8);
                if (counters[2]) counters[2].dataset.count = Math.floor(data.data.pagination.total * 5);
                
                new Counter();
            }
        } catch (error) {
            console.log('统计API暂不可用');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Cursor();
    new Loader();
    new NavScroll();
    new ScrollAnimator();
    new CardAnimator();
    new Counter();
    new FormHandler();
    new SmoothScroll();
    new ParallaxEffect();
    new ArticleHover3D();
    new ArticleLoader();
});
