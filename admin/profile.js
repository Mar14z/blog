// 个人信息编辑页逻辑
(function () {
    const CONTACT_TYPES = [
        { value: 'phone', label: '电话' },
        { value: 'email', label: '邮箱' },
        { value: 'github', label: 'GitHub' },
        { value: 'wechat', label: '微信' },
        { value: 'twitter', label: 'Twitter/X' },
        { value: 'weibo', label: '微博' },
        { value: 'link', label: '其他链接' }
    ];

    let profileData = null;

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function bindEvents() {
        const map = [
            ['saveProfileBtn', 'click', saveProfile],
            ['reloadProfileBtn', 'click', loadProfile],
            ['addEducationBtn', 'click', () => addEducationRow({})],
            ['addExperienceBtn', 'click', () => addExperienceRow({})],
            ['addContactBtn', 'click', () => addContactRow({})]
        ];
        map.forEach(([id, ev, fn]) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(ev, fn);
        });

        const fileInput = document.getElementById('profileAvatarFile');
        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const url = await uploadAvatar(file);
                if (url) {
                    document.getElementById('profileAvatar').value = url;
                    renderAvatarPreview(url);
                }
                e.target.value = '';
            });
        }
    }

    async function loadProfile() {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.code !== 200) {
                showToast(data.message || '加载失败', 'error');
                return;
            }
            profileData = data.data || {};
            fillForm(profileData);
            showToast('已加载最新个人信息', 'success');
        } catch (error) {
            showToast('加载失败，请重试', 'error');
            console.error(error);
        }
    }

    function fillForm(profile) {
        const intro = profile.intro || {};
        document.getElementById('profileName').value = intro.name || '';
        document.getElementById('profileGreeting').value = intro.greeting || '';
        document.getElementById('profileBio').value = intro.bio || '';
        document.getElementById('profileAvatar').value = intro.avatar || '';
        renderAvatarPreview(intro.avatar || '');

        const skills = profile.skills || {};
        document.getElementById('profileTechnical').value = (skills.technical || []).join('\n');
        document.getElementById('profileSoft').value = (skills.soft || []).join('\n');

        renderEducation(profile.education || []);
        renderExperiences(profile.experiences || []);
        renderContacts(profile.contacts || []);
    }

    function renderAvatarPreview(url) {
        const wrap = document.getElementById('profileAvatarPreview');
        if (!wrap) return;
        if (url) {
            wrap.innerHTML = `<img src="${escapeHtml(url)}" alt="头像预览" style="max-width:120px;max-height:120px;border-radius:50%;display:block">`;
        } else {
            wrap.innerHTML = '<span style="color:var(--text-secondary);font-size:0.85rem">暂无头像</span>';
        }
    }

    async function uploadAvatar(file) {
        const fd = new FormData();
        fd.append('image', file);
        const statusEl = document.getElementById('profileAvatarStatus');
        if (statusEl) statusEl.textContent = '上传中...';
        try {
            const res = await fetch(`${API_BASE}/upload/image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (data.code !== 200) {
                if (statusEl) statusEl.textContent = '上传失败：' + (data.message || '');
                showToast(data.message || '上传失败', 'error');
                return null;
            }
            if (statusEl) statusEl.textContent = '上传成功';
            showToast('头像已上传', 'success');
            return data.data.url;
        } catch (err) {
            if (statusEl) statusEl.textContent = '上传失败';
            showToast('上传失败', 'error');
            return null;
        }
    }

    function renderEducation(list) {
        const container = document.getElementById('educationList');
        container.innerHTML = '';
        list.forEach((item, idx) => addEducationRow(item, idx));
    }

    function renderExperiences(list) {
        const container = document.getElementById('experiencesList');
        container.innerHTML = '';
        list.forEach((item, idx) => addExperienceRow(item, idx));
    }

    function renderContacts(list) {
        const container = document.getElementById('contactsList');
        container.innerHTML = '';
        list.forEach((item, idx) => addContactRow(item, idx));
    }

    function addEducationRow(item, idx) {
        const container = document.getElementById('educationList');
        const index = idx !== undefined ? idx : container.children.length;
        const row = document.createElement('div');
        row.className = 'profile-row';
        row.dataset.kind = 'education';
        row.innerHTML = `
            <div class="profile-row-head">
                <span class="profile-row-title">教育经历 #${index + 1}</span>
                <button type="button" class="btn-icon danger" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>标题</label>
                    <input type="text" data-field="title" value="${escapeHtml(item.title || '')}" placeholder="例如：计算机科学学士">
                </div>
                <div class="form-group">
                    <label>时间</label>
                    <input type="text" data-field="period" value="${escapeHtml(item.period || '')}" placeholder="例如：2017 - 2021">
                </div>
                <div class="form-group">
                    <label>排序</label>
                    <input type="number" data-field="order" value="${item.order ?? index}" step="1">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>学校 / 机构</label>
                    <input type="text" data-field="school" value="${escapeHtml(item.school || '')}" placeholder="例如：某大学">
                </div>
            </div>
            <div class="form-group">
                <label>描述</label>
                <textarea data-field="desc" rows="2" placeholder="简单描述">${escapeHtml(item.desc || '')}</textarea>
            </div>
        `;
        row.querySelector('.btn-icon.danger').addEventListener('click', () => row.remove());
        container.appendChild(row);
    }

    function addExperienceRow(item, idx) {
        const container = document.getElementById('experiencesList');
        const index = idx !== undefined ? idx : container.children.length;
        const row = document.createElement('div');
        row.className = 'profile-row';
        row.dataset.kind = 'experience';
        row.innerHTML = `
            <div class="profile-row-head">
                <span class="profile-row-title">工作经历 #${index + 1}</span>
                <button type="button" class="btn-icon danger" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>职位</label>
                    <input type="text" data-field="title" value="${escapeHtml(item.title || '')}" placeholder="例如：全栈开发工程师">
                </div>
                <div class="form-group">
                    <label>时间</label>
                    <input type="text" data-field="period" value="${escapeHtml(item.period || '')}" placeholder="例如：2023 - 至今">
                </div>
                <div class="form-group">
                    <label>排序</label>
                    <input type="number" data-field="order" value="${item.order ?? index}" step="1">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>公司 / 单位</label>
                    <input type="text" data-field="company" value="${escapeHtml(item.company || '')}" placeholder="例如：某科技公司">
                </div>
            </div>
            <div class="form-group">
                <label>描述</label>
                <textarea data-field="desc" rows="2" placeholder="工作内容简介">${escapeHtml(item.desc || '')}</textarea>
            </div>
        `;
        row.querySelector('.btn-icon.danger').addEventListener('click', () => row.remove());
        container.appendChild(row);
    }

    function addContactRow(item, idx) {
        const container = document.getElementById('contactsList');
        const index = idx !== undefined ? idx : container.children.length;
        const row = document.createElement('div');
        row.className = 'profile-row';
        row.dataset.kind = 'contact';
        const typeOptions = CONTACT_TYPES.map(t =>
            `<option value="${t.value}" ${item.type === t.value ? 'selected' : ''}>${t.label}</option>`
        ).join('');
        row.innerHTML = `
            <div class="profile-row-head">
                <span class="profile-row-title">联系方式 #${index + 1}</span>
                <button type="button" class="btn-icon danger" title="删除">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>类型</label>
                    <select data-field="type">${typeOptions}</select>
                </div>
                <div class="form-group">
                    <label>显示标签</label>
                    <input type="text" data-field="label" value="${escapeHtml(item.label || '')}" placeholder="例如：邮箱 / Email">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>显示值</label>
                    <input type="text" data-field="value" value="${escapeHtml(item.value || '')}" placeholder="例如：hello@example.com">
                </div>
                <div class="form-group">
                    <label>链接 URL（可选，留空则自动推断）</label>
                    <input type="text" data-field="url" value="${escapeHtml(item.url || '')}" placeholder="https://...">
                </div>
            </div>
        `;
        row.querySelector('.btn-icon.danger').addEventListener('click', () => row.remove());
        container.appendChild(row);
    }

    function readList(containerId, fields) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        const rows = container.querySelectorAll('.profile-row');
        const list = [];
        rows.forEach(row => {
            const item = {};
            fields.forEach(f => {
                const input = row.querySelector(`[data-field="${f}"]`);
                if (!input) return;
                if (input.tagName === 'TEXTAREA') {
                    item[f] = input.value.trim();
                } else if (input.type === 'number') {
                    const n = parseInt(input.value, 10);
                    item[f] = isNaN(n) ? 0 : n;
                } else {
                    item[f] = input.value.trim();
                }
            });
            list.push(item);
        });
        return list;
    }

    function parseSkillList(text) {
        if (!text) return [];
        return text
            .split(/[\n,，]+/)
            .map(s => s.trim())
            .filter(Boolean);
    }

    function collectPayload() {
        return {
            intro: {
                name: document.getElementById('profileName').value.trim(),
                greeting: document.getElementById('profileGreeting').value.trim(),
                bio: document.getElementById('profileBio').value.trim(),
                avatar: document.getElementById('profileAvatar').value.trim()
            },
            education: readList('educationList', ['title', 'period', 'school', 'desc', 'order']),
            experiences: readList('experiencesList', ['title', 'period', 'company', 'desc', 'order']),
            skills: {
                technical: parseSkillList(document.getElementById('profileTechnical').value),
                soft: parseSkillList(document.getElementById('profileSoft').value)
            },
            contacts: readList('contactsList', ['type', 'label', 'value', 'url'])
        };
    }

    async function saveProfile() {
        if (!token) {
            showToast('请先登录', 'error');
            return;
        }
        const payload = collectPayload();
        const btn = document.getElementById('saveProfileBtn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '保存中...';

        try {
            const response = await fetch(`${API_BASE}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.code === 200) {
                showToast('个人信息已保存', 'success');
                profileData = data.data;
            } else {
                showToast(data.message || '保存失败', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('保存失败，请重试', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
    });

    // 暴露给 app.js 在切换到 profile 页面时调用
    window.profileEditor = {
        load: loadProfile
    };
})();
