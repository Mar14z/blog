document.addEventListener('DOMContentLoaded', () => {
    initSkillBars();
    loadProfile();
});

function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.dataset.progress;
                entry.target.style.setProperty('--progress', `${progress}%`);
                entry.target.classList.add('animate');
            }
        });
    }, {
        threshold: 0.5
    });

    skillBars.forEach(bar => observer.observe(bar));
}

function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item, .work-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    timelineItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.15}s`;
        observer.observe(item);
    });
}

async function loadProfile() {
    try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        if (data.code !== 200) {
            console.error('加载个人信息失败');
            return;
        }
        renderProfile(data.data);
    } catch (error) {
        console.error('加载个人信息失败:', error);
    }
}

function renderProfile(profile) {
    if (!profile) return;

    // intro
    const intro = profile.intro || {};
    if (intro.name) {
        const nameEl = document.getElementById('profile-name');
        if (nameEl) nameEl.textContent = intro.name;
        const avatar = document.getElementById('profile-avatar');
        if (avatar && !avatar.textContent.trim()) {
            avatar.textContent = intro.name.charAt(0);
        }
    }
    const greetingEl = document.getElementById('profile-greeting');
    if (greetingEl) greetingEl.textContent = intro.greeting || '你好';
    const bioEl = document.getElementById('profile-bio');
    if (bioEl) bioEl.textContent = intro.bio || '';

    // education
    const education = Array.isArray(profile.education) ? profile.education : [];
    const eduContainer = document.getElementById('profile-education');
    if (eduContainer) {
        if (education.length === 0) {
            eduContainer.innerHTML = '<p class="empty-hint">暂无教育背景</p>';
        } else {
            eduContainer.innerHTML = education
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(item => `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-header">
                            <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
                            <span class="timeline-date">${escapeHtml(item.period)}</span>
                        </div>
                        <div class="timeline-company">${escapeHtml(item.school)}</div>
                        <p class="timeline-desc">${escapeHtml(item.desc)}</p>
                    </div>
                `).join('');
        }
    }

    // skills - technical
    const skills = profile.skills || { technical: [], soft: [] };
    renderSkillTags('profile-technical', skills.technical);
    renderSkillTags('profile-soft', skills.soft);

    // experiences
    const experiences = Array.isArray(profile.experiences) ? profile.experiences : [];
    const expContainer = document.getElementById('profile-experiences');
    if (expContainer) {
        if (experiences.length === 0) {
            expContainer.innerHTML = '<p class="empty-hint">暂无工作经历</p>';
        } else {
            expContainer.innerHTML = experiences
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map(item => `
                    <div class="work-item">
                        <div class="work-header">
                            <h3 class="work-title">${escapeHtml(item.title)}</h3>
                            <span class="work-date">${escapeHtml(item.period)}</span>
                        </div>
                        <div class="work-company">${escapeHtml(item.company)}</div>
                        <p class="work-desc">${escapeHtml(item.desc)}</p>
                    </div>
                `).join('');
        }
    }

    // contacts
    const contacts = Array.isArray(profile.contacts) ? profile.contacts : [];
    const contactContainer = document.getElementById('profile-contacts');
    if (contactContainer) {
        if (contacts.length === 0) {
            contactContainer.innerHTML = '<p class="empty-hint">暂无联系方式</p>';
        } else {
            contactContainer.innerHTML = contacts.map(c => {
                const href = c.url || (c.type === 'email' ? `mailto:${c.value}` : (c.type === 'phone' ? `tel:${c.value}` : (c.value && /^https?:\/\//.test(c.value) ? c.value : '#')));
                const target = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
                return `
                    <a class="contact-item" href="${escapeAttr(href)}"${target}>
                        <span class="contact-icon">${contactIcon(c.type)}</span>
                        <span class="contact-label">${escapeHtml(c.label || c.type)}</span>
                        <span class="contact-value">${escapeHtml(c.value || '')}</span>
                    </a>
                `;
            }).join('');
        }
    }

    // 重新初始化动画观察器
    initTimeline();
}

function renderSkillTags(containerId, list) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = '<p class="empty-hint">暂无</p>';
        return;
    }
    container.innerHTML = list.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');
}

function contactIcon(type) {
    const icons = {
        phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
        email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
        github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
        wechat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
        twitter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>',
        weibo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
        link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
    };
    return icons[type] || icons.link;
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/"/g, '&quot;').replace(/&/g, '&amp;');
}
