let galleryData = [];
let currentIndex = 0;
let isAnimating = false;
let animationTimer = null;
let ready = false;
let totalImages = 0;

const galleryImage = document.getElementById('galleryImage');
const imageIndex = document.getElementById('imageIndex');
const infoTitle = document.getElementById('infoTitle');
const infoDesc = document.getElementById('infoDesc');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const thumbnailBar = document.getElementById('thumbnailBar');
const dnaLeft = document.getElementById('dnaLeft');
const dnaRight = document.getElementById('dnaRight');
const imageSkeleton = document.getElementById('imageSkeleton');

const dnaTextsLeft = ['影像', '记忆', '光影', '瞬间', '时光', '风景', '故事', '印记'];
const dnaTextsRight = ['2024', '03', '15', '自然', '风光', '人文', '建筑', '静物'];

async function fetchGallery() {
    try {
        const res = await fetch('/api/gallery');
        const json = await res.json();
        if (json.code === 200 && Array.isArray(json.data && json.data.items)) {
            galleryData = json.data.items.map(it => ({
                id: it._id,
                src: it.src,
                title: it.title || '',
                date: it.date || '',
                desc: it.desc || ''
            }));
            totalImages = galleryData.length;
        } else {
            galleryData = [];
            totalImages = 0;
        }
    } catch (err) {
        console.error('加载相册失败', err);
        galleryData = [];
        totalImages = 0;
    }
}

function showEmpty() {
    if (imageSkeleton) imageSkeleton.classList.add('hidden');
    if (galleryImage) {
        galleryImage.removeAttribute('src');
        galleryImage.alt = '暂无图片';
    }
    if (imageIndex) imageIndex.textContent = '00 / 00';
    if (infoTitle) infoTitle.textContent = '相册暂无内容';
    if (infoDesc) infoDesc.textContent = '请到管理后台添加图片';
    if (thumbnailBar) thumbnailBar.innerHTML = '';
}

function initGallery() {
    if (totalImages === 0) {
        showEmpty();
        renderDNA();
        ready = true;
        return;
    }
    renderDNA();
    updateInfo(0);
    updateDNA();

    // 同步置为就绪：rAF 在后台标签页会被节流，会导致导航一直失效
    ready = true;

    loadImage(0);

    requestIdleCallback(() => {
        renderThumbnails();
    }, { timeout: 500 });
}

function renderThumbnails() {
    if (!thumbnailBar) return;
    thumbnailBar.innerHTML = galleryData.map((item, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img data-src="${escapeHtml(item.src)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">
        </div>
    `).join('');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    delete img.dataset.src;
                }
                observer.unobserve(img);
            }
        });
    }, { root: thumbnailBar, threshold: 0 });

    thumbnailBar.querySelectorAll('.thumbnail img').forEach(img => {
        observer.observe(img);
    });

    thumbnailBar.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => {
            navigateTo(parseInt(thumb.dataset.index));
        });
    });
}

// 拨动环：每列文字重复三份，通过 translateY 滚动，始终把当前项转进视窗中央。
// DNA_STEP 必须等于 .dna-text 的高度(24) + gap(20)；DNA_WINDOW 必须等于 .dna-container 高度。
const DNA_STEP = 44;
const DNA_WINDOW = 220;
const DNA_ITEM_HEIGHT = 24;
const DNA_CENTER_SLOT = 2;
const DNA_COPIES = 3;

function renderStrand(el, texts) {
    if (!el || texts.length === 0) return;
    const items = [];
    for (let copy = 0; copy < DNA_COPIES; copy++) {
        for (let i = 0; i < texts.length; i++) {
            items.push(`<div class="dna-text" data-pos="${copy * texts.length + i}">${texts[i]}</div>`);
        }
    }
    el.innerHTML = items.join('');
    // 首帧不要动画，否则会从初始位置滑进来
    el.style.transition = 'none';
    setTimeout(() => { el.style.transition = ''; }, 50);
}

function updateStrand(el, count, index) {
    if (!el || count === 0) return;
    const target = count + index + DNA_CENTER_SLOT;
    const shift = target * DNA_STEP - (DNA_WINDOW - DNA_ITEM_HEIGHT) / 2;
    el.style.transform = `translateY(${-shift}px)`;
    el.querySelectorAll('.dna-text').forEach(text => {
        text.classList.toggle('highlight', Number(text.dataset.pos) === target);
    });
}

function renderDNA() {
    renderStrand(dnaLeft, dnaTextsLeft);
    renderStrand(dnaRight, dnaTextsRight);
}

function updateDNA() {
    updateStrand(dnaLeft, dnaTextsLeft.length, currentIndex);
    updateStrand(dnaRight, dnaTextsRight.length, currentIndex);
}

function updateInfo(index) {
    const item = galleryData[index];
    if (!item) return;
    if (imageIndex) imageIndex.textContent = `${String(index + 1).padStart(2, '0')} / ${String(totalImages).padStart(2, '0')}`;
    if (infoTitle) infoTitle.textContent = item.title;
    if (infoDesc) infoDesc.textContent = item.desc || item.date;
}

function loadImage(index, direction = null) {
    const item = galleryData[index];
    if (!item) return;

    if (direction) {
        galleryImage.classList.remove('visible');
        galleryImage.classList.add(direction === 'up' ? 'slide-out-down' : 'slide-out-up');

        setTimeout(() => {
            galleryImage.src = item.src;
            galleryImage.onload = () => {
                galleryImage.classList.remove('slide-out-up', 'slide-out-down');
                galleryImage.classList.add('visible');
                isAnimating = false;
            };
            galleryImage.onerror = () => {
                galleryImage.classList.remove('slide-out-up', 'slide-out-down');
                isAnimating = false;
            };
        }, 250);
    } else {
        galleryImage.src = item.src;
        galleryImage.onload = () => {
            if (imageSkeleton) imageSkeleton.classList.add('hidden');
            galleryImage.classList.add('visible');
        };
    }

    updateInfo(index);
    updateDNA();
    updateThumbnails(index);

    if (index + 1 < totalImages) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = galleryData[index + 1].src;
        document.head.appendChild(link);
    }
}

function updateThumbnails(index) {
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    const activeThumb = document.querySelector('.thumbnail.active');
    if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
}

function navigateTo(index) {
    if (index === currentIndex || isAnimating || !ready) return;
    isAnimating = true;
    // 图片加载慢或失败时也要解锁，否则导航会永久卡住
    clearTimeout(animationTimer);
    animationTimer = setTimeout(() => { isAnimating = false; }, 1200);
    const direction = index > currentIndex ? 'up' : 'down';
    currentIndex = index;
    loadImage(index, direction);
}

function prevImage() {
    if (currentIndex > 0) navigateTo(currentIndex - 1);
}

function nextImage() {
    if (currentIndex < totalImages - 1) navigateTo(currentIndex + 1);
}

if (prevBtn) prevBtn.addEventListener('click', prevImage);
if (nextBtn) nextBtn.addEventListener('click', nextImage);

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') prevImage();
    else if (e.key === 'ArrowDown') nextImage();
});

let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    const diff = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
        diff > 0 ? nextImage() : prevImage();
    }
});

if (galleryImage) {
    galleryImage.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.deltaY < 0 ? prevImage() : nextImage();
    }, { passive: false });
}

(async () => {
    await fetchGallery();
    initGallery();
})();
