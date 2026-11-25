// 联系留言后台
(function () {
    let page = 1;
    let filter = 'all';
    let totalPages = 1;
    let loading = false;

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatTime(value) {
        if (!value) return '';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('zh-CN', { hour12: false });
    }

    function renderItem(item) {
        return `
            <article class="message-item${item.read ? '' : ' unread'}" data-id="${escapeHtml(item._id)}" data-read="${item.read ? 'true' : 'false'}">
                <div class="message-head">
                    <div class="message-from">
                        <strong>${escapeHtml(item.name)}</strong>
                        <a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>
                    </div>
                    <div class="message-meta">
                        ${item.read ? '' : '<span class="message-badge">未读</span>'}
                        <span>${escapeHtml(formatTime(item.createdAt))}</span>
                    </div>
                </div>
                <p class="message-body">${escapeHtml(item.message)}</p>
                <div class="message-actions">
                    <button type="button" class="btn-batch" data-action="toggle">${item.read ? '标为未读' : '标为已读'}</button>
                    <button type="button" class="btn-batch danger" data-action="delete">删除</button>
                </div>
            </article>`;
    }

    async function load(reset) {
        if (loading) return;
        loading = true;
        if (reset) page = 1;

        const listEl = document.getElementById('messagesList');
        if (reset && listEl) listEl.innerHTML = '<div class="loading">加载中...</div>';

        try {
            const response = await fetch(`${API_BASE}/contact?page=${page}&limit=20&filter=${filter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.code !== 200) {
                if (reset && listEl) {
                    listEl.innerHTML = `<div class="empty-hint">加载失败：${escapeHtml(data.message || '')}</div>`;
                }
                return;
            }

            const { messages, pagination, unread } = data.data;
            document.getElementById('messagesCount').textContent = pagination.total;
            document.getElementById('messagesUnread').textContent = unread;

            const html = messages.map(renderItem).join('');
            if (reset) {
                listEl.innerHTML = html || '<div class="empty-hint">暂无留言</div>';
            } else {
                listEl.insertAdjacentHTML('beforeend', html);
            }

            totalPages = pagination.totalPages;
            const moreBtn = document.getElementById('messagesMoreBtn');
            if (moreBtn) moreBtn.classList.toggle('hidden', page >= totalPages);
        } catch (error) {
            if (reset && listEl) listEl.innerHTML = '<div class="empty-hint">加载失败，请重试</div>';
        } finally {
            loading = false;
        }
    }

    async function handleAction(event) {
        const button = event.target.closest('[data-action]');
        if (!button) return;

        const item = button.closest('.message-item');
        if (!item) return;
        const id = item.dataset.id;
        const action = button.dataset.action;

        button.disabled = true;
        try {
            if (action === 'toggle') {
                const nextRead = item.dataset.read !== 'true';
                const response = await fetch(`${API_BASE}/contact/${id}/read`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ read: nextRead })
                });
                const data = await response.json();
                if (data.code !== 200) throw new Error(data.message || '操作失败');
            } else if (action === 'delete') {
                if (!window.confirm('确定删除这条留言？')) {
                    button.disabled = false;
                    return;
                }
                const response = await fetch(`${API_BASE}/contact/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.code !== 200) throw new Error(data.message || '删除失败');
            }

            showToast(action === 'delete' ? '已删除' : '已更新', 'success');
            await load(true);
        } catch (error) {
            showToast(error.message || '操作失败', 'error');
            button.disabled = false;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const listEl = document.getElementById('messagesList');
        if (listEl) listEl.addEventListener('click', handleAction);

        document.getElementById('messagesReloadBtn')?.addEventListener('click', () => load(true));

        document.getElementById('messagesFilter')?.addEventListener('change', (event) => {
            filter = event.target.value;
            load(true);
        });

        document.getElementById('messagesMoreBtn')?.addEventListener('click', () => {
            page += 1;
            load(false);
        });
    });

    window.messagesAdmin = { load };
})();
