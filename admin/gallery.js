// 相册后台管理
(function () {
    let items = [];
    let uploading = 0;

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async function fetchHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async function loadList() {
        const listEl = document.getElementById('galleryList');
        if (listEl) listEl.innerHTML = '<p class="empty-hint">加载中...</p>';
        try {
            const res = await fetch(`${API_BASE}/gallery`, { headers: await fetchHeaders() });
            const data = await res.json();
            if (data.code !== 200) {
                if (listEl) listEl.innerHTML = `<p class="empty-hint">加载失败：${escapeHtml(data.message || '')}</p>`;
                return;
            }
            items = (data.data && data.data.items) || [];
            render();
            updateCount();
        } catch (err) {
            if (listEl) listEl.innerHTML = '<p class="empty-hint">加载失败，请重试</p>';
        }
    }

    function updateCount() {
        const el = document.getElementById('galleryCount');
        if (el) el.textContent = items.length;
    }

    function render() {
        const listEl = document.getElementById('galleryList');
        if (!listEl) return;
        if (items.length === 0) {
            listEl.innerHTML = '<p class="empty-hint">暂无图片，点击上方上传按钮添加</p>';
            return;
        }
        listEl.innerHTML = items.map((it, idx) => `
            <div class="gallery-item" data-id="${it._id}">
                <div class="gallery-item-thumb">
                    <img src="${escapeHtml(it.src)}" alt="${escapeHtml(it.title)}" loading="lazy">
                </div>
                <div class="gallery-item-info">
                    <div class="gallery-item-title">${escapeHtml(it.title || '未命名')}</div>
                    <div class="gallery-item-meta">
                        <span>${escapeHtml(it.date || '—')}</span>
                        <span class="gallery-item-order">顺序 #${it.order ?? idx}</span>
                    </div>
                    ${it.desc ? `<div class="gallery-item-desc">${escapeHtml(it.desc)}</div>` : ''}
                </div>
                <div class="gallery-item-actions">
                    <button type="button" class="btn-icon" title="编辑" data-action="edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button type="button" class="btn-icon danger" title="删除" data-action="delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </div>
        `).join('');

        listEl.querySelectorAll('.gallery-item').forEach(el => {
            const id = el.dataset.id;
            el.querySelector('[data-action="edit"]').addEventListener('click', () => openEditModal(id));
            el.querySelector('[data-action="delete"]').addEventListener('click', () => deleteItem(id));
        });
    }

    function openCreateModal() {
        document.getElementById('galleryModalTitle').textContent = '上传图片';
        document.getElementById('galleryItemId').value = '';
        document.getElementById('galleryItemSrc').value = '';
        document.getElementById('galleryItemTitle').value = '';
        document.getElementById('galleryItemDate').value = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
        document.getElementById('galleryItemDesc').value = '';
        document.getElementById('galleryItemOrder').value = items.length;
        document.getElementById('galleryItemPreview').innerHTML = '';
        document.getElementById('galleryItemSrcGroup').style.display = 'block';
        document.getElementById('galleryModal').classList.add('active');
    }

    function openEditModal(id) {
        const it = items.find(x => x._id === id);
        if (!it) return;
        document.getElementById('galleryModalTitle').textContent = '编辑图片';
        document.getElementById('galleryItemId').value = it._id;
        document.getElementById('galleryItemSrc').value = it.src || '';
        document.getElementById('galleryItemTitle').value = it.title || '';
        document.getElementById('galleryItemDate').value = it.date || '';
        document.getElementById('galleryItemDesc').value = it.desc || '';
        document.getElementById('galleryItemOrder').value = it.order ?? 0;
        document.getElementById('galleryItemPreview').innerHTML = it.src
            ? `<img src="${escapeHtml(it.src)}" alt="预览">`
            : '';
        document.getElementById('galleryItemSrcGroup').style.display = 'none';
        document.getElementById('galleryModal').classList.add('active');
    }

    function closeModal() {
        document.getElementById('galleryModal').classList.remove('active');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('galleryItemId').value;
        const title = document.getElementById('galleryItemTitle').value.trim();
        const date = document.getElementById('galleryItemDate').value.trim();
        const desc = document.getElementById('galleryItemDesc').value.trim();
        const order = parseInt(document.getElementById('galleryItemOrder').value, 10) || 0;

        const btn = document.getElementById('gallerySaveBtn');
        btn.disabled = true;
        btn.textContent = '保存中...';

        try {
            if (id) {
                // 编辑
                const res = await fetch(`${API_BASE}/gallery/${id}`, {
                    method: 'PUT',
                    headers: await fetchHeaders(),
                    body: JSON.stringify({ title, date, desc, order })
                });
                const data = await res.json();
                if (data.code !== 200) {
                    showToast(data.message || '保存失败', 'error');
                    return;
                }
                showToast('已更新', 'success');
            } else {
                // 新增（必须先有 src）
                const src = document.getElementById('galleryItemSrc').value.trim();
                if (!src) {
                    showToast('请先上传图片', 'error');
                    return;
                }
                const res = await fetch(`${API_BASE}/gallery`, {
                    method: 'POST',
                    headers: await fetchHeaders(),
                    body: JSON.stringify({ src, title, date, desc, order })
                });
                const data = await res.json();
                if (data.code !== 201 && data.code !== 200) {
                    showToast(data.message || '添加失败', 'error');
                    return;
                }
                showToast('已添加', 'success');
            }
            closeModal();
            await loadList();
        } catch (err) {
            showToast('保存失败，请重试', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '保存';
        }
    }

    async function deleteItem(id) {
        const it = items.find(x => x._id === id);
        if (!it) return;
        if (!confirm(`确定删除「${it.title || '未命名'}」吗？`)) return;
        try {
            const res = await fetch(`${API_BASE}/gallery/${id}`, {
                method: 'DELETE',
                headers: await fetchHeaders()
            });
            const data = await res.json();
            if (data.code !== 200) {
                showToast(data.message || '删除失败', 'error');
                return;
            }
            showToast('已删除', 'success');
            await loadList();
        } catch (err) {
            showToast('删除失败，请重试', 'error');
        }
    }

    async function uploadFile(file) {
        const fd = new FormData();
        fd.append('image', file);
        uploading++;
        const statusEl = document.getElementById('galleryUploadStatus');
        const updateStatus = () => {
            if (statusEl) statusEl.textContent = uploading > 0 ? `正在上传 (${uploading})...` : '';
        };
        updateStatus();
        try {
            const res = await fetch(`${API_BASE}/upload/image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (data.code !== 200) {
                showToast(data.message || '上传失败', 'error');
                return null;
            }
            showToast('上传成功', 'success');
            return data.data.url;
        } catch (err) {
            showToast('上传失败', 'error');
            return null;
        } finally {
            uploading--;
            updateStatus();
        }
    }

    async function handleFilePick(e) {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
        let baseOrder = items.length;
        for (let i = 0; i < files.length; i++) {
            const url = await uploadFile(files[i]);
            if (!url) continue;
            try {
                await fetch(`${API_BASE}/gallery`, {
                    method: 'POST',
                    headers: await fetchHeaders(),
                    body: JSON.stringify({
                        src: url,
                        title: files[i].name.replace(/\.[^.]+$/, '').slice(0, 50),
                        date: today,
                        desc: '',
                        order: baseOrder + i
                    })
                });
            } catch (err) {
                showToast('添加失败', 'error');
            }
        }
        e.target.value = '';
        await loadList();
    }

    function bindEvents() {
        const map = [
            ['galleryNewBtn', 'click', openCreateModal],
            ['galleryCloseModal', 'click', closeModal],
            ['galleryCancelBtn', 'click', closeModal],
            ['galleryForm', 'submit', handleSubmit],
            ['galleryFileInput', 'change', handleFilePick],
            ['galleryReloadBtn', 'click', loadList]
        ];
        map.forEach(([id, ev, fn]) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener(ev, fn);
        });
        // 模态框 overlay 点击关闭
        const overlay = document.querySelector('#galleryModal .modal-overlay');
        if (overlay) overlay.addEventListener('click', closeModal);
    }

    document.addEventListener('DOMContentLoaded', bindEvents);

    window.galleryAdmin = {
        load: loadList
    };
})();
