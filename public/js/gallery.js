const galleryData = [
    { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=75', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&q=50', title: '日出时分', date: '2024.03.15' },
    { id: 2, src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=75', thumb: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=150&q=50', title: '森林深处', date: '2024.02.28' },
    { id: 3, src: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=75', thumb: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=150&q=50', title: '城市轮廓', date: '2024.02.10' },
    { id: 4, src: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=75', thumb: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=150&q=50', title: '瀑布', date: '2024.01.22' },
    { id: 5, src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=75', thumb: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=150&q=50', title: '湖畔', date: '2024.01.08' },
    { id: 6, src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=75', thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=150&q=50', title: '云海', date: '2023.12.20' },
    { id: 7, src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=75', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150&q=50', title: '雪山', date: '2023.12.05' },
    { id: 8, src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=75', thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=50', title: '城市夜景', date: '2023.11.18' }
];

let currentIndex = 0;
let isAnimating = false;
let ready = false;
const totalImages = galleryData.length;

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

function initGallery() {
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
    thumbnailBar.innerHTML = galleryData.map((item, index) => `
        <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img data-src="${item.thumb}" alt="${item.title}" loading="lazy" decoding="async">
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
    dnaLeft.innerHTML = dnaTextsLeft.map((text, i) =>
        `<div class="dna-text" data-index="${i}">${text}</div>`
    ).join('');
    dnaRight.innerHTML = dnaTextsRight.map((text, i) =>
        `<div class="dna-text" data-index="${i}">${text}</div>`
    ).join('');
}

function updateDNA() {
    dnaLeft.querySelectorAll('.dna-text').forEach((text, i) => {
        text.classList.toggle('highlight', (i + currentIndex) % 2 === 0);
    });
    dnaRight.querySelectorAll('.dna-text').forEach((text, i) => {
        text.classList.toggle('highlight', (i + currentIndex) % 3 === 0);
    });
}

function updateInfo(index) {
    const item = galleryData[index];
    imageIndex.textContent = `${String(index + 1).padStart(2, '0')} / ${String(totalImages).padStart(2, '0')}`;
    infoTitle.textContent = item.title;
    infoDesc.textContent = item.date;
}

function loadImage(index, direction = null) {
    const item = galleryData[index];

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
            imageSkeleton.classList.add('hidden');
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

prevBtn.addEventListener('click', prevImage);
nextBtn.addEventListener('click', nextImage);

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

galleryImage.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.deltaY < 0 ? prevImage() : nextImage();
}, { passive: false });

initGallery();
