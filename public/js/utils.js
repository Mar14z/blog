const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001/api`;

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function throttle(func, wait) {
    let lastTime = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastTime >= wait) {
            lastTime = now;
            func.apply(this, args);
        }
    };
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('.toast-message').textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatDate(dateStr, options = {}) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const defaultOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    return date.toLocaleDateString('zh-CN', { ...defaultOptions, ...options })
        .replace(/\//g, '.');
}

function formatDateFull(dateStr) {
    return formatDate(dateStr, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function toSlug(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function createScrollObserver(callback, options = {}) {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    return new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    callback(entry.target, index);
                }, index * 80);
            }
        });
    }, { ...defaultOptions, ...options });
}

function observeElements(elements, callback, options = {}) {
    const observer = createScrollObserver(callback, options);
    elements.forEach(el => observer.observe(el));
    return observer;
}

async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const response = await fetch(`${API_BASE}${endpoint}`, { ...defaultOptions, ...options });
    return response.json();
}

function $(selector, context = document) {
    return context.querySelector(selector);
}

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}
