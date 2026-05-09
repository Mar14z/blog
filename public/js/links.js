document.addEventListener('DOMContentLoaded', () => {
    initLinkCards();
    initApplyForm();
});

function initLinkCards() {
    const cards = document.querySelectorAll('.link-card');
    
    observeElements(cards, (target) => {
        target.classList.add('visible');
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
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
