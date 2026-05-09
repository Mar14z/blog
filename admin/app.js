let token = localStorage.getItem('adminToken');
let currentPage = 1;
let selectedArticles = new Set();
let categories = [];
let tags = [];
let currentTags = [];

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
        const bind = (selector, event, handler) => {
            const el = document.getElementById(selector);
            if (el) el.addEventListener(event, handler);
        };

        bind('loginForm', 'submit', (e) => this.handleLogin(e));
        bind('logoutBtn', 'click', () => this.handleLogout());
        bind('newArticleBtn', 'click', () => this.openArticleModal());
        bind('newArticleBtn2', 'click', () => this.openArticleModal());
        bind('closeModal', 'click', () => this.closeModal());
        bind('cancelArticleBtn', 'click', () => this.closeModal());
        bind('saveDraftBtn', 'click', () => this.saveDraft());
        bind('articleForm', 'submit', (e) => this.handleArticleSubmit(e));
        bind('articleTitle', 'input', (e) => this.autoGenerateSlug(e));
        bind('articleTitle', 'input', () => this.autoSaveDraft());
        bind('selectAll', 'change', (e) => this.toggleSelectAll(e));
        bind('batchPublish', 'click', () => this.batchPublish());
        bind('batchUnpublish', 'click', () => this.batchUnpublish());
        bind('batchDelete', 'click', () => this.batchDelete());
        bind('addCategoryBtn', 'click', () => this.openTaxonomyModal('category'));
        bind('addTagBtn', 'click', () => this.openTaxonomyModal('tag'));
        bind('closeTaxonomyModal', 'click', () => this.closeTaxonomyModal());
        bind('cancelTaxonomyBtn', 'click', () => this.closeTaxonomyModal());
        bind('taxonomyForm', 'submit', (e) => this.handleTaxonomySubmit(e));
        bind('togglePreview', 'click', () => this.togglePreview());
        bind('articleContent', 'input', () => this.updatePreview());
        bind('settingsForm', 'submit', (e) => this.handleSettingsSubmit(e));
        bind('resetSettingsBtn', 'click', () => this.resetSettings());
        bind('exportDataBtn', 'click', () => this.exportData());
        bind('quickNewArticle', 'click', () => this.openArticleModal());
        bind('quickManageCategories', 'click', () => this.goToTaxonomy());
        bind('quickViewSite', 'click', () => window.open('../', '_blank'));
        bind('quickBackup', 'click', () => this.quickBackup());

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => this.loadArticles(), 300));
        }

        const filterStatus = document.getElementById('filterStatus');
        if (filterStatus) filterStatus.addEventListener('change', () => this.loadArticles());

        const filterCategory = document.getElementById('filterCategory');
        if (filterCategory) filterCategory.addEventListener('change', () => this.loadArticles());

        const filterTag = document.getElementById('filterTag');
        if (filterTag) filterTag.addEventListener('change', () => this.loadArticles());

        const tagInput = document.getElementById('tagInput');
        if (tagInput) {
            tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag();
                }
            });
        }

        document.querySelector('#articleModal .modal-overlay')?.addEventListener('click', () => this.closeModal());
        document.querySelector('#taxonomyModal .modal-overlay')?.addEventListener('click', () => this.closeTaxonomyModal());

        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.page) {
                item.addEventListener('click', (e) => this.handleNavigation(e));
            }
        });

        document.querySelectorAll('.toolbar-btn[data-action]').forEach(btn => {
            btn.addEventListener('click', () => this.insertMarkdown(btn.dataset.action));
        });
    }

    goToTaxonomy() {
        document.querySelector('[data-page="taxonomy"]').click();
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
                showToast('登录成功', 'success');
                this.showDashboard();
                this.loadDashboardData();
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('登录失败，请检查服务器是否运行', 'error');
        }
    }

    handleLogout() {
        token = null;
        localStorage.removeItem('adminToken');
        this.showLogin();
        showToast('已退出登录');
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
                this.loadTaxonomy();
                this.loadArticles();
                break;
            case 'taxonomy':
                document.getElementById('taxonomyPage').classList.remove('hidden');
                this.loadTaxonomy();
                break;
            case 'settings':
                document.getElementById('settingsPage').classList.remove('hidden');
                this.loadSettings();
                break;
        }
    }

    showLogin() {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('dashboardPage').classList.add('hidden');
        document.getElementById('articlesPage').classList.add('hidden');
        document.getElementById('taxonomyPage').classList.add('hidden');
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

                this.animateNumber('totalArticles', total);
                this.animateNumber('publishedArticles', published);
                this.animateNumber('draftArticles', drafts);
                this.animateNumber('totalViews', Math.floor(Math.random() * 1000));

                this.renderCategoryChart(articles);
                this.renderRecentArticles(articles);
                this.renderTagCloud(articles);

                const uniqueCategories = [...new Set(articles.map(a => a.category))];
                document.getElementById('categoryCount').textContent = `${uniqueCategories.length} 个分类`;

                const allTags = articles.flatMap(a => a.tags || []);
                const uniqueTags = [...new Set(allTags)];
                if (uniqueTags.length > 0) {
                    document.getElementById('tagCloud').innerHTML = uniqueTags.slice(0, 15).map(tag => 
                        `<span class="cloud-tag">${tag}</span>`
                    ).join('');
                }
            }
        } catch (error) {
            console.error('加载仪表盘数据失败:', error);
        }
    }

    renderCategoryChart(articles) {
        const container = document.getElementById('categoryChart');
        const categoryCount = {};

        articles.forEach(a => {
            categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
        });

        const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]);
        const max = sorted[0]?.[1] || 1;

        if (sorted.length === 0) {
            container.innerHTML = '<p class="empty-hint">暂无分类数据</p>';
            return;
        }

        container.innerHTML = sorted.map(([cat, count]) => `
            <div class="chart-item">
                <div class="chart-label">${cat}</div>
                <div class="chart-bar">
                    <div class="chart-fill" style="width: ${(count / max) * 100}%"></div>
                </div>
                <div class="chart-count">${count}</div>
            </div>
        `).join('');
    }

    renderRecentArticles(articles) {
        const container = document.getElementById('recentArticles');
        const sorted = [...articles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const recent = sorted.slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p class="empty-hint">暂无文章</p>';
            return;
        }

        container.innerHTML = recent.map(a => `
            <div class="recent-item" onclick="adminApp.gotoArticle('${a._id}')">
                <span class="recent-title">${a.title}</span>
                <span class="recent-date">${formatDate(a.createdAt)}</span>
            </div>
        `).join('');
    }

    renderTagCloud(articles) {
        const container = document.getElementById('tagCloud');
        const tagCount = {};

        articles.forEach(a => {
            (a.tags || []).forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });

        const sorted = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
        const max = sorted[0]?.[1] || 1;

        if (sorted.length === 0) {
            container.innerHTML = '<p class="empty-hint">暂无标签</p>';
            return;
        }

        container.innerHTML = sorted.slice(0, 15).map(([tag, count]) => {
            const size = 12 + (count / max) * 8;
            return `<span class="cloud-tag" style="font-size: ${size}px">${tag}</span>`;
        }).join('');
    }

    gotoArticle(id) {
        document.querySelector('[data-page="articles"]').click();
        this.editArticle(id);
    }

    exportData() {
        this.loadArticlesForExport();
    }

    async loadArticlesForExport() {
        try {
            const response = await fetch(`${API_BASE}/articles/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.code === 200) {
                const articles = data.data.articles;
                const exportData = {
                    exportTime: new Date().toISOString(),
                    totalArticles: articles.length,
                    articles: articles.map(a => ({
                        title: a.title,
                        slug: a.slug,
                        category: a.category,
                        tags: a.tags,
                        excerpt: a.excerpt,
                        published: a.published,
                        createdAt: a.createdAt,
                        updatedAt: a.updatedAt
                    }))
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `blog-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);

                showToast('数据导出成功', 'success');
            }
        } catch (error) {
            showToast('导出失败', 'error');
        }
    }

    quickBackup() {
        this.exportData();
    }

    animateNumber(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 800;
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

    async loadTaxonomy() {
        try {
            const response = await fetch(`${API_BASE}/articles/admin/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.code === 200) {
                categories = [...new Set(data.data.articles.map(a => a.category))];
                tags = [...new Set(data.data.articles.flatMap(a => a.tags || []))];

                this.updateCategoryOptions();
                this.updateTagOptions();
                this.renderCategories();
                this.renderTags();
            }
        } catch (error) {
            console.error('加载分类标签失败:', error);
        }
    }

    updateCategoryOptions() {
        const selects = [
            document.getElementById('articleCategory'),
            document.getElementById('filterCategory')
        ];

        selects.forEach(select => {
            if (!select) return;
            const current = select.value;
            select.innerHTML = `<option value="">${select.id === 'articleCategory' ? '选择分类' : '全部分类'}</option>` +
                categories.map(c => `<option value="${c}" ${c === current ? 'selected' : ''}>${c}</option>`).join('');
        });
    }

    updateTagOptions() {
        const select = document.getElementById('filterTag');
        if (!select) return;

        const current = select.value;
        select.innerHTML = '<option value="">全部标签</option>' +
            tags.map(t => `<option value="${t}" ${t === current ? 'selected' : ''}>${t}</option>`).join('');
    }

    renderCategories() {
        const container = document.getElementById('categoriesList');
        if (!container) return;

        if (categories.length === 0) {
            container.innerHTML = '<p class="empty-hint">暂无分类，点击新增添加</p>';
            return;
        }

        container.innerHTML = categories.map(cat => `
            <div class="taxonomy-item">
                <div class="taxonomy-info">
                    <span class="taxonomy-name">${cat}</span>
                </div>
                <div class="taxonomy-actions">
                    <button class="btn-icon" onclick="adminApp.editTaxonomy('category', '${cat}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon danger" onclick="adminApp.deleteTaxonomy('category', '${cat}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderTags() {
        const container = document.getElementById('tagsList');
        if (!container) return;

        if (tags.length === 0) {
            container.innerHTML = '<p class="empty-hint">暂无标签，点击新增添加</p>';
            return;
        }

        container.innerHTML = tags.map(tag => `
            <span class="tag-item">
                <span>${tag}</span>
                <button onclick="adminApp.deleteTaxonomy('tag', '${tag}')">&times;</button>
            </span>
        `).join('');
    }

    openTaxonomyModal(type, name = null) {
        const modal = document.getElementById('taxonomyModal');
        document.getElementById('taxonomyType').value = type;
        document.getElementById('taxonomyModalTitle').textContent = name ? `编辑${type === 'category' ? '分类' : '标签'}` : `新增${type === 'category' ? '分类' : '标签'}`;
        document.getElementById('taxonomyName').value = name || '';
        document.getElementById('taxonomyId').value = name || '';
        document.getElementById('taxonomySlug').value = name ? toSlug(name) : '';
        document.getElementById('taxonomyDesc').value = '';
        modal.classList.add('active');
    }

    closeTaxonomyModal() {
        document.getElementById('taxonomyModal').classList.remove('active');
    }

    editTaxonomy(type, name) {
        this.openTaxonomyModal(type, name);
    }

    async deleteTaxonomy(type, name) {
        if (!confirm(`确定要删除${type === 'category' ? '分类' : '标签'} "${name}" 吗？`)) return;

        if (type === 'category') {
            categories = categories.filter(c => c !== name);
        } else {
            tags = tags.filter(t => t !== name);
        }

        this.updateCategoryOptions();
        this.updateTagOptions();
        this.renderCategories();
        this.renderTags();
        showToast('删除成功', 'success');
    }

    async handleTaxonomySubmit(e) {
        e.preventDefault();

        const type = document.getElementById('taxonomyType').value;
        const name = document.getElementById('taxonomyName').value.trim();

        if (!name) {
            showToast('请输入名称', 'error');
            return;
        }

        if (type === 'category') {
            if (!categories.includes(name)) {
                categories.push(name);
            }
        } else {
            if (!tags.includes(name)) {
                tags.push(name);
            }
        }

        this.updateCategoryOptions();
        this.updateTagOptions();
        this.renderCategories();
        this.renderTags();
        this.closeTaxonomyModal();
        showToast('保存成功', 'success');
    }

    async loadArticles() {
        const statusFilter = document.getElementById('filterStatus').value;
        const categoryFilter = document.getElementById('filterCategory').value;
        const tagFilter = document.getElementById('filterTag').value;
        const searchQuery = document.getElementById('searchInput')?.value || '';

        let url = `${API_BASE}/articles/admin/all?page=${currentPage}`;
        if (statusFilter) url += `&published=${statusFilter}`;
        if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
        if (tagFilter) url += `&tag=${encodeURIComponent(tagFilter)}`;

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (data.code === 200) {
                let articles = data.data.articles;

                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    articles = articles.filter(a =>
                        a.title.toLowerCase().includes(query) ||
                        a.excerpt.toLowerCase().includes(query)
                    );
                }

                document.getElementById('articlesCount').textContent = articles.length;
                this.renderArticles(articles);
            }
        } catch (error) {
            console.error('加载文章失败:', error);
        }
    }

    renderArticles(articles) {
        const container = document.getElementById('articlesList');

        if (articles.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无文章</div>';
            return;
        }

        container.innerHTML = articles.map(article => `
            <div class="table-row" data-id="${article._id}">
                <div class="table-cell checkbox">
                    <input type="checkbox" ${selectedArticles.has(article._id) ? 'checked' : ''} onchange="adminApp.toggleSelect('${article._id}')">
                </div>
                <div class="table-cell title">
                    <span class="article-title">${article.title}</span>
                    <span class="article-slug">/${article.slug}</span>
                </div>
                <div class="table-cell category">${article.category}</div>
                <div class="table-cell tags">
                    ${(article.tags || []).slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}
                    ${(article.tags || []).length > 2 ? `<span class="tag-more">+${article.tags.length - 2}</span>` : ''}
                </div>
                <div class="table-cell status">
                    <span class="status-badge ${article.published ? 'published' : 'draft'}">
                        ${article.published ? '已发布' : '草稿'}
                    </span>
                    ${article.featured ? '<span class="status-badge featured">精选</span>' : ''}
                </div>
                <div class="table-cell date">${formatDate(article.createdAt)}</div>
                <div class="table-cell actions">
                    <button class="btn-icon" onclick="adminApp.editArticle('${article._id}')" title="编辑">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon danger" onclick="adminApp.deleteArticle('${article._id}')" title="删除">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleSelectAll(e) {
        const checkboxes = document.querySelectorAll('.table-row input[type="checkbox"]');
        selectedArticles.clear();

        if (e.target.checked) {
            checkboxes.forEach(cb => {
                cb.checked = true;
                selectedArticles.add(cb.closest('.table-row').dataset.id);
            });
        }

        this.updateBatchActions();
    }

    toggleSelect(id) {
        if (selectedArticles.has(id)) {
            selectedArticles.delete(id);
        } else {
            selectedArticles.add(id);
        }
        this.updateBatchActions();
    }

    updateBatchActions() {
        const batchActions = document.getElementById('batchActions');
        const selectedCount = document.getElementById('selectedCount');

        if (selectedArticles.size > 0) {
            batchActions.classList.remove('hidden');
            selectedCount.textContent = selectedArticles.size;
        } else {
            batchActions.classList.add('hidden');
        }
    }

    async batchPublish() {
        await this.batchUpdate(true);
    }

    async batchUnpublish() {
        await this.batchUpdate(false);
    }

    async batchUpdate(published) {
        for (const id of selectedArticles) {
            await fetch(`${API_BASE}/articles/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ published })
            });
        }

        selectedArticles.clear();
        this.updateBatchActions();
        this.loadArticles();
        showToast(`已${published ? '发布' : '取消发布'}选中的文章`, 'success');
    }

    async batchDelete() {
        if (!confirm(`确定要删除选中的 ${selectedArticles.size} 篇文章吗？此操作不可撤销。`)) {
            return;
        }

        for (const id of selectedArticles) {
            await fetch(`${API_BASE}/articles/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

        selectedArticles.clear();
        this.updateBatchActions();
        this.loadArticles();
        this.loadDashboardData();
        showToast('删除成功', 'success');
    }

    setStatus(status) {
        const toggle = document.getElementById('statusToggle');
        const input = document.getElementById('articlePublished');
        toggle.querySelectorAll('.toggle-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === status);
        });
        input.value = status === 'published' ? 'true' : 'false';
    }

    previewArticle() {
        const title = document.getElementById('articleTitle')?.value || '无标题';
        const content = document.getElementById('articleContent')?.value || '';
        const category = document.getElementById('articleCategory')?.value || '';
        const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>预览 - ${title}</title><link rel="stylesheet" href="/css/variables.css"><link rel="stylesheet" href="/css/base.css"><style>body{background:#000;color:#fff;font-family:'Noto Sans SC',sans-serif;padding:4rem;max-width:800px;margin:0 auto}.preview-tag{font-family:'JetBrains Mono',monospace;font-size:0.65rem;color:#D32F2F;letter-spacing:2px;text-transform:uppercase;margin-bottom:1rem}.preview-title{font-size:2rem;font-weight:700;margin-bottom:1rem}.preview-content{line-height:1.8;font-size:0.95rem;color:rgba(255,255,255,0.8)}.preview-content pre{background:rgba(255,255,255,0.05);padding:1rem;overflow-x:auto}.preview-content code{font-family:'JetBrains Mono',monospace;font-size:0.85rem}.preview-content img{max-width:100%}</style></head><body><div class="preview-tag">${category}</div><h1 class="preview-title">${title}</h1><div class="preview-content">${content}</div></body></html>`;
        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    }

    openArticleModal(article = null) {
        const modal = document.getElementById('articleModal');
        const form = document.getElementById('articleForm');
        const title = document.getElementById('modalTitle');

        form.reset();
        document.getElementById('articleId').value = '';
        currentTags = [];
        document.getElementById('saveStatus').textContent = '';
        this.renderSelectedTags();

        this.updateCategoryOptions();

        if (article) {
            title.textContent = '编辑文章';
            document.getElementById('articleId').value = article._id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleSlug').value = article.slug;
            document.getElementById('articleExcerpt').value = article.excerpt || '';
            document.getElementById('articleContent').value = article.content || '';
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleCover').value = article.coverImage || '';
            document.getElementById('articleReadTime').value = article.readTime || 5;
            document.getElementById('articlePublished').value = article.published;
            this.setStatus(article.published ? 'published' : 'draft');
            document.getElementById('articleFeatured').checked = article.featured || false;

            currentTags = [...(article.tags || [])];
            this.renderSelectedTags();
            this.updatePreview();
        } else {
            title.textContent = '新建文章';
            this.setStatus('draft');
        }

        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('articleModal').classList.remove('active');
        localStorage.removeItem('draft');
    }

    renderSelectedTags() {
        const container = document.getElementById('tagsSelected');
        if (!container) return;

        container.innerHTML = currentTags.map(tag => `
            <span class="selected-tag">
                ${tag}
                <button type="button" onclick="adminApp.removeTag('${tag}')">&times;</button>
            </span>
        `).join('');

        const suggestions = document.getElementById('tagsSuggestions');
        if (suggestions && currentTags.length < tags.length) {
            const available = tags.filter(t => !currentTags.includes(t));
            if (available.length > 0) {
                suggestions.innerHTML = available.slice(0, 5).map(t => `
                    <button type="button" class="suggestion" onclick="adminApp.addExistingTag('${t}')">${t}</button>
                `).join('');
            } else {
                suggestions.innerHTML = '';
            }
        }
    }

    addTag() {
        const input = document.getElementById('tagInput');
        const tag = input.value.trim();

        if (tag && !currentTags.includes(tag)) {
            currentTags.push(tag);
            this.renderSelectedTags();
        }

        input.value = '';
    }

    addExistingTag(tag) {
        if (!currentTags.includes(tag)) {
            currentTags.push(tag);
            this.renderSelectedTags();
        }
    }

    removeTag(tag) {
        currentTags = currentTags.filter(t => t !== tag);
        this.renderSelectedTags();
    }

    autoGenerateSlug(e) {
        const title = e.target.value;
        const slugInput = document.getElementById('articleSlug');

        if (!slugInput.dataset.manual) {
            slugInput.value = toSlug(title);
        }
    }

    autoSaveDraft() {
        const draft = {
            title: document.getElementById('articleTitle').value,
            content: document.getElementById('articleContent').value,
            tags: currentTags
        };
        localStorage.setItem('draft', JSON.stringify(draft));
        document.getElementById('saveStatus').textContent = '已自动保存';
    }

    saveDraft() {
        this.handleArticleSubmit(new Event('submit'), true);
    }

    togglePreview() {
        const preview = document.getElementById('editorPreview');
        const content = document.getElementById('articleContent');
        const toggle = document.getElementById('togglePreview');

        if (preview.classList.contains('hidden')) {
            this.updatePreview();
            preview.classList.remove('hidden');
            content.classList.add('hidden');
            toggle.textContent = '编辑';
        } else {
            preview.classList.add('hidden');
            content.classList.remove('hidden');
            toggle.textContent = '预览';
        }
    }

    updatePreview() {
        const content = document.getElementById('articleContent').value;
        const preview = document.getElementById('editorPreview');

        let html = content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
            .replace(/\n/gim, '<br>');

        preview.innerHTML = html;
    }

    insertMarkdown(action) {
        const textarea = document.getElementById('articleContent');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);

        let insertion = '';
        let cursorOffset = 0;

        switch (action) {
            case 'bold':
                insertion = `**${selected || '粗体文本'}**`;
                cursorOffset = selected ? 0 : -2;
                break;
            case 'italic':
                insertion = `*${selected || '斜体文本'}*`;
                cursorOffset = selected ? 0 : -1;
                break;
            case 'heading':
                insertion = `\n## ${selected || '标题'}\n`;
                cursorOffset = 0;
                break;
            case 'link':
                insertion = `[${selected || '链接文本'}](url)`;
                cursorOffset = -1;
                break;
            case 'image':
                insertion = `![${selected || '图片描述'}](image-url)`;
                cursorOffset = -1;
                break;
            case 'code':
                insertion = selected.includes('\n')
                    ? `\n\`\`\`\n${selected || '代码'}\n\`\`\`\n`
                    : `\`${selected || '代码'}\``;
                cursorOffset = selected ? 0 : -1;
                break;
            case 'quote':
                insertion = `\n> ${selected || '引用文本'}\n`;
                cursorOffset = 0;
                break;
        }

        textarea.value = text.substring(0, start) + insertion + text.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start + insertion.length + cursorOffset, start + insertion.length + cursorOffset);
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
            showToast('加载文章失败', 'error');
        }
    }

    async handleArticleSubmit(e, saveAsDraft = false) {
        e.preventDefault();

        const id = document.getElementById('articleId').value;
        const published = saveAsDraft ? false : document.getElementById('articlePublished').value === 'true';

        const articleData = {
            title: document.getElementById('articleTitle').value,
            slug: document.getElementById('articleSlug').value || toSlug(document.getElementById('articleTitle').value),
            excerpt: document.getElementById('articleExcerpt').value,
            content: document.getElementById('articleContent').value,
            category: document.getElementById('articleCategory').value,
            tags: currentTags,
            coverImage: document.getElementById('articleCover').value,
            readTime: parseInt(document.getElementById('articleReadTime').value) || 5,
            published: published,
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
                localStorage.removeItem('draft');
                showToast(saveAsDraft ? '草稿已保存' : (id ? '文章更新成功' : '文章发布成功'), 'success');
                this.closeModal();
                this.loadArticles();
                this.loadDashboardData();
                this.loadTaxonomy();
            } else {
                showToast(data.message || '操作失败', 'error');
            }
        } catch (error) {
            showToast('操作失败，请重试', 'error');
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
                showToast('文章删除成功', 'success');
                this.loadArticles();
                this.loadDashboardData();
            } else {
                showToast(data.message || '删除失败', 'error');
            }
        } catch (error) {
            showToast('删除失败，请重试', 'error');
        }
    }

    async loadSettings() {
        const saved = localStorage.getItem('blogSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            Object.keys(settings).forEach(key => {
                const input = document.querySelector(`[name="${key}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = settings[key] === 'on' || settings[key] === true;
                    } else {
                        input.value = settings[key];
                    }
                }
            });
        }
    }

    async handleSettingsSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const settings = {};

        for (const [key, value] of formData.entries()) {
            settings[key] = value;
        }

        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            settings[cb.name] = cb.checked;
        });

        localStorage.setItem('blogSettings', JSON.stringify(settings));
        showToast('设置已保存', 'success');
    }

    resetSettings() {
        if (confirm('确定要重置所有设置为默认值吗？')) {
            localStorage.removeItem('blogSettings');
            document.getElementById('settingsForm').reset();
            showToast('设置已重置', 'success');
        }
    }

    getSettings() {
        const saved = localStorage.getItem('blogSettings');
        return saved ? JSON.parse(saved) : {};
    }
}

const adminApp = new AdminApp();
