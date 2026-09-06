let galleryData = [];
let currentIndex = 0;
let isAnimating = false;
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

    requestAnimationFrame(() => {
        ready = true;
    });

    loadImage(0);

    requestIdleCallback(() => {
        renderThumbnails();
    }, { timeout: 500 });
}

function renderThumbnails() {
    if (!thumbnailBar) return;
    thumbnailBar.innerHTML = galleryData.map((item, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img data-src="${item.src}" alt="${item.title}" loading="lazy" decoding="async">
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

function renderDNA() {
    if (!dnaLeft || !dnaRight) return;
    dnaLeft.innerHTML = dnaTextsLeft.map((text, i) =>
        `<div class="dna-text" data-index="${i}">${text}</div>`
    ).join('');
    dnaRight.innerHTML = dnaTextsRight.map((text, i) =>
        `<div class="dna-text" data-index="${i}">${text}</div>`
    ).join('');
}

function updateDNA() {
    if (!dnaLeft || !dnaRight) return;
    dnaLeft.querySelectorAll('.dna-text').forEach((text, i) => {
        text.classList.toggle('highlight', (i + currentIndex) % 2 === 0);
    });
    dnaRight.querySelectorAll('.dna-text').forEach((text, i) => {
        text.classList.toggle('highlight', (i + currentIndex) % 3 === 0);
    });
}

function updateInfo(index) {
    const item = galleryData[index];
    if (!item) return;
    if (imageIndex) imageIndex.textContent = `${String(index + 1).padStart(2, '0')} / ${String(totalImages).padStart(2, '0')}`;
    if (infoTitle) infoTitle.textContent = item.title;
    if (infoDesc) infoDesc.textContent = item.date;
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
