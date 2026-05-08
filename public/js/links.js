document.addEventListener('DOMContentLoaded', () => {
    initLinkCards();
    initApplyForm();
});

function initLinkCards() {
    const cards = document.querySelectorAll('.link-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 80);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    cards.forEach(card => observer.observe(card));
}

function initApplyForm() {
    const form = document.getElementById('applyForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const siteName = document.getElementById('siteName').value;
        const siteUrl = document.getElementById('siteUrl').value;
        const avatarUrl = document.getElementById('avatarUrl').value;
        const siteDescription = document.getElementById('siteDescription').value;

        if (!siteName || !siteUrl || !siteDescription) {
            showToast('请填写完整信息', 'error');
            return;
        }

        if (!isValidUrl(siteUrl)) {
            showToast('请输入有效的网站地址', 'error');
            return;
        }

        showToast('申请已提交，感谢您的友链申请！', 'success');
        form.reset();
    });
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('.toast-message').textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}
