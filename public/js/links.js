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

        // 没有后端收件箱，直接唤起邮件客户端，避免"提交成功但没人收到"
        const subject = encodeURIComponent(`友链申请：${siteName}`);
        const body = encodeURIComponent(
            `网站名称：${siteName}\n网站地址：${siteUrl}\n网站图标：${avatarUrl || '（未填）'}\n网站描述：${siteDescription}`
        );
        window.location.href = `mailto:w1661331096@2925.com?subject=${subject}&body=${body}`;
        showToast('已打开邮件客户端，发送后即完成申请', 'success');
        form.reset();
    });
}
