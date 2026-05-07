const API_BASE = 'http://localhost:3000/api';

let token = localStorage.getItem('adminToken');
let currentPage = 1;

class AdminApp {
    constructor() {
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
    }

    checkAuth() {
        if (token) {
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showLogin();
        }
    }

    bindEvents() {
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        document.getElementById('newArticleBtn').addEventListener('click', () => this.openArticleModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('articleForm').addEventListener('submit', (e) => this.handleArticleSubmit(e));

        document.getElementById('filterStatus').addEventListener('change', () => this.loadArticles());
        document.getElementById('filterCategory').addEventListener('change', () => this.loadArticles());

        document.getElementById('articleTitle').addEventListener('input', (e) => {
            const slug = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            document.getElementById('articleSlug').value = slug;
        });

        document.getElementById('settingsForm').addEventListener('submit', (e) => this.handleSettingsSubmit(e));
        document.getElementById('exportObsidianBtn').addEventListener('click', () => this.exportToObsidian());
        document.getElementById('importObsidianBtn').addEventListener('click', () => this.importFromObsidian());
        document.getElementById('watchObsidianBtn').addEventListener('click', () => this.watchObsidian());
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.code === 200) {
                token = data.data.token;
                localStorage.setItem('adminToken', token);
                this.showToast('登录成功', 'success');
                this.showDashboard();
                this.loadDashboardData();
            } else {
                this.showToast(data.message, 'error');
            }
        } catch (error) {
            this.showToast('登录失败，请检查服务器是否运行', 'error');
        }
    }

    handleLogout() {
        token = null;
        localStorage.removeItem('adminToken');
        this.showLogin();
        this.showToast('已退出登录');
    }

    handleNavigation(e) {
        e.preventDefault();
        const page = e.currentTarget.dataset.page;

        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');

        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

        switch (page) {
            case 'dashboard':
                document.getElementById('dashboardPage').classList.remove('hidden');
                this.loadDashboardData();
                break;
            case 'articles':
                document.getElementById('articlesPage').classList.remove('hidden');
                this.loadArticles();
                break;
            case 'settings':
                document.getElementById('settingsPage').classList.remove('hidden');
                break;
        }
    }

    showLogin() {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('dashboardPage').classList.add('hidden');
        document.getElementById('articlesPage').classList.add('hidden');
        document.getElementById('settingsPage').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboardPage').classList.remove('hidden');
    }

    async loadDashboardData() {
        try {
            const response = await fetch(`${API_BASE}/articles/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.code === 200) {
                const articles = data.data.articles;
                const total = articles.length;
                const published = articles.filter(a => a.published).length;
                const drafts = articles.filter(a => !a.published).length;
                const featured = articles.filter(a => a.featured).length;

                this.animateNumber('totalArticles', total);
                this.animateNumber('publishedArticles', published);
                this.animateNumber('draftArticles', drafts);
                this.animateNumber('featuredArticles', featured);
            }
        } catch (error) {
            console.error('加载仪表盘数据失败:', error);
        }
    }

    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        const duration = 1000;
        const start = 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    async loadArticles() {
        const statusFilter = document.getElementById('filterStatus').value;
        const categoryFilter = document.getElementById('filterCategory').value;

        let url = `${API_BASE}/articles/admin/all?page=${currentPage}`;
        if (statusFilter) url += `&published=${statusFilter}`;
        if (categoryFilter) url += `&category=${categoryFilter}`;

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.code === 200) {
                this.renderArticles(data.data.articles);
                this.renderPagination(data.data.pagination);
            }
        } catch (error) {
            console.error('加载文章失败:', error);
        }
    }

    renderArticles(articles) {
        const container = document.getElementById('articlesList');

        if (articles.length === 0) {
            container.innerHTML = '<div class="loading">暂无文章</div>';
            return;
        }

        container.innerHTML = articles.map(article => `
            <div class="article-item" data-id="${article._id}">
                <div class="article-info">
                    <h4>${article.title}</h4>
                    <p>${article.category} · ${article.tags.join(', ')}</p>
                </div>
                <div class="article-status ${article.published ? 'published' : 'draft'}">
                    ${article.published ? '已发布' : '草稿'}
                </div>
                <div class="article-date">
                    ${new Date(article.createdAt).toLocaleDateString('zh-CN')}
                </div>
                <div class="article-actions">
                    <button class="action-btn edit" onclick="adminApp.editArticle('${article._id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="adminApp.deleteArticle('${article._id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPagination(pagination) {
        const container = document.getElementById('pagination');
        if (pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button ${pagination.page === 1 ? 'disabled' : ''} onclick="adminApp.goToPage(${pagination.page - 1})">
                上一页
            </button>
        `;

        for (let i = 1; i <= pagination.totalPages; i++) {
            html += `
                <button class="${i === pagination.page ? 'active' : ''}" onclick="adminApp.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        html += `
            <button ${pagination.page === pagination.totalPages ? 'disabled' : ''} onclick="adminApp.goToPage(${pagination.page + 1})">
                下一页
            </button>
        `;

        container.innerHTML = html;
    }

    goToPage(page) {
        currentPage = page;
        this.loadArticles();
    }

    openArticleModal(article = null) {
        const modal = document.getElementById('articleModal');
        const form = document.getElementById('articleForm');
        const title = document.getElementById('modalTitle');

        form.reset();
        document.getElementById('articleId').value = '';

        if (article) {
            title.textContent = '编辑文章';
            document.getElementById('articleId').value = article._id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleSlug').value = article.slug;
            document.getElementById('articleExcerpt').value = article.excerpt;
            document.getElementById('articleContent').value = article.content;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleTags').value = article.tags.join(', ');
            document.getElementById('articleCover').value = article.coverImage || '';
            document.getElementById('articleReadTime').value = article.readTime;
            document.getElementById('articlePublished').checked = article.published;
            document.getElementById('articleFeatured').checked = article.featured;
        } else {
            title.textContent = '新建文章';
        }

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('articleModal').classList.remove('active');
    }

    async editArticle(id) {
        try {
            const response = await fetch(`${API_BASE}/articles/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            const article = data.data.articles.find(a => a._id === id);

            if (article) {
                this.openArticleModal(article);
            }
        } catch (error) {
            this.showToast('加载文章失败', 'error');
        }
    }

    async handleArticleSubmit(e) {
        e.preventDefault();

        const id = document.getElementById('articleId').value;
        const articleData = {
            title: document.getElementById('articleTitle').value,
            slug: document.getElementById('articleSlug').value,
            excerpt: document.getElementById('articleExcerpt').value,
            content: document.getElementById('articleContent').value,
            category: document.getElementById('articleCategory').value,
            tags: document.getElementById('articleTags').value.split(',').map(t => t.trim()).filter(t => t),
            coverImage: document.getElementById('articleCover').value,
            readTime: parseInt(document.getElementById('articleReadTime').value),
            published: document.getElementById('articlePublished').checked,
            featured: document.getElementById('articleFeatured').checked
        };

        const url = id ? `${API_BASE}/articles/${id}` : `${API_BASE}/articles`;
        const method = id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(articleData)
            });

            const data = await response.json();

            if (data.code === 200 || data.code === 201) {
                this.showToast(id ? '文章更新成功' : '文章创建成功', 'success');
                this.closeModal();
                this.loadArticles();
            } else {
                this.showToast(data.message || '操作失败', 'error');
            }
        } catch (error) {
            this.showToast('操作失败，请重试', 'error');
        }
    }

    async deleteArticle(id) {
        if (!confirm('确定要删除这篇文章吗？此操作不可撤销。')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/articles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.code === 200) {
                this.showToast('文章删除成功', 'success');
                this.loadArticles();
            } else {
                this.showToast(data.message || '删除失败', 'error');
            }
        } catch (error) {
            this.showToast('删除失败，请重试', 'error');
        }
    }

    async handleSettingsSubmit(e) {
        e.preventDefault();
        this.showToast('设置已保存', 'success');
    }

    showToast(message, type = '') {
        const toast = document.getElementById('toast');
        toast.querySelector('.toast-message').textContent = message;
        toast.className = 'toast show ' + type;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    exportToObsidian() {
        if (!confirm('确定要导出所有文章到Obsidian知识库吗？\n\n导出位置: f:\\TraeCode\\blog\\obsidian-vault')) {
            return;
        }

        const btn = document.getElementById('exportObsidianBtn');
        btn.disabled = true;
        btn.innerHTML = '导出中...';

        this.showToast('正在导出文章到Obsidian，请稍候...', '');

        fetch('http://localhost:3000/scripts/export-to-obsidian.js')
            .then(() => {
                this.showToast('导出完成！请在Obsidian中打开 obsidian-vault 文件夹', 'success');
                btn.disabled = false;
                btn.innerHTML = '导出';

                setTimeout(() => {
                    if (confirm('导出成功！\n\n是否打开Obsidian知识库文件夹？')) {
                        window.open('file:///F:/TraeCode/blog/obsidian-vault');
                    }
                }, 1000);
            })
            .catch(() => {
                this.showToast('导出失败，请手动运行 scripts/export-to-obsidian.js', 'error');
                btn.disabled = false;
                btn.innerHTML = '导出';
            });
    }

    importFromObsidian() {
        if (!confirm('确定要从Obsidian导入笔记到博客吗？\n\n将从 obsidian-vault/01 - Blog Articles/ 导入')) {
            return;
        }

        const btn = document.getElementById('importObsidianBtn');
        btn.disabled = true;
        btn.innerHTML = '导入中...';

        this.showToast('正在从Obsidian导入笔记，请稍候...', '');

        fetch('http://localhost:3001/scripts/import-from-obsidian.js')
            .then(() => {
                this.showToast('导入完成！刷新页面查看更新', 'success');
                btn.disabled = false;
                btn.innerHTML = '导入';
                this.loadArticles();
                this.loadDashboardData();
            })
            .catch(() => {
                this.showToast('导入失败，请手动运行 scripts/import-from-obsidian.js', 'error');
                btn.disabled = false;
                btn.innerHTML = '导入';
            });
    }

    watchObsidian() {
        if (!confirm('确定要启动Obsidian自动同步监控吗？\n\n这将在后台运行，监控文件变化并自动同步')) {
            return;
        }

        const btn = document.getElementById('watchObsidianBtn');
        btn.disabled = true;
        btn.innerHTML = '监控中...';

        this.showToast('正在启动文件监控服务...', '');

        fetch('http://localhost:3001/scripts/watch-and-sync.js')
            .then(() => {
                this.showToast('监控服务已启动！文件变化将自动同步', 'success');
                btn.innerHTML = '监控中';

                setTimeout(() => {
                    alert('自动同步监控已启动！\n\n注意：此窗口需要保持打开状态\n\n要停止监控，请关闭此窗口或按 Ctrl+C');
                }, 1000);
            })
            .catch(() => {
                this.showToast('启动失败，请手动运行 start-sync.bat', 'error');
                btn.disabled = false;
                btn.innerHTML = '启动监控';
            });
    }
}

const adminApp = new AdminApp();
