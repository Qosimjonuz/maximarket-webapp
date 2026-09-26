const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = "https://maximarketbot-production.up.railway.app";

const PLACEHOLDER_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const isTelegram = !!(tg.initDataUnsafe && tg.initDataUnsafe.user);

const CATEGORIES = [
    { id: "elektronika", name: "Elektronika", emoji: "📱" },
    { id: "kiyim", name: "Kiyim", emoji: "👕" },
    { id: "poyabzallar", name: "Poyabzallar", emoji: "👟" },
    { id: "aksessuarlar", name: "Aksessuarlar", emoji: "👜" },
    { id: "parfyumeriya", name: "Parfyumeriya", emoji: "🌸" },
    { id: "gozallik", name: "Go'zallik", emoji: "💄" },
    { id: "maishiy", name: "Maishiy texnika", emoji: "🏠" },
    { id: "salomatlik", name: "Salomatlik", emoji: "❤️" },
    { id: "bolalar", name: "Bolalar", emoji: "🧸" },
    { id: "sport", name: "Sport", emoji: "⚽" },
    { id: "kitoblar", name: "Kitoblar", emoji: "📚" },
    { id: "avto", name: "Avto", emoji: "🚗" },
    { id: "uy", name: "Uy uchun", emoji: "🏡" },
    { id: "sovga", name: "Sovg'alar", emoji: "🎁" },
    { id: "boshqa", name: "Boshqa", emoji: "📦" }
];

const COLORS = [
    { id: "qora", name: "Qora", hex: "#000000" },
    { id: "oq", name: "Oq", hex: "#ffffff" },
    { id: "qizil", name: "Qizil", hex: "#e53935" },
    { id: "kok", name: "Ko'k", hex: "#1565c0" },
    { id: "yashil", name: "Yashil", hex: "#2e7d32" },
    { id: "sariq", name: "Sariq", hex: "#fbc02d" },
    { id: "pushti", name: "Pushti", hex: "#ec407a" },
    { id: "binafsha", name: "Binafsha", hex: "#8e24aa" },
    { id: "kulrang", name: "Kulrang", hex: "#757575" },
    { id: "jigarrang", name: "Jigarrang", hex: "#6d4c41" },
    { id: "toq-sariq", name: "To'q sariq", hex: "#f57c00" },
    { id: "oltin", name: "Oltin", hex: "#ffd700" },
    { id: "kumush", name: "Kumush", hex: "#c0c0c0" },
    { id: "moviy", name: "Moviy", hex: "#29b6f6" },
    { id: "yashil-och", name: "Och yashil", hex: "#66bb6a" },
    { id: "chegirma-1", name: "Marjon", hex: "#ff7043" }
];

const banners = [
    { image: "https://i.ibb.co/SCt3rvf/file-00000000bccc821081db3f3c75491931.png" },
    { image: "https://i.ibb.co/KpmBYqtQ/file-000000002af88210b08be720dc738edd.png" },
    { image: "https://i.ibb.co/QVPj1Pn/file-0000000009a0820da87ac5c4a57dbabb.png" },
    { image: "https://i.ibb.co/5NgCbCt/file-00000000a72081f79b62cc44f1e32790.png" },
    { image: "https://i.ibb.co/TD1HzzkN/file-00000000f36481fabf1dac154c72871d.png" },
    { image: "https://i.ibb.co/HTZSXLGS/file-00000000d9a882469c4566009ff02551.png" },
    { image: "https://i.ibb.co/Dg1VsRWw/file-0000000040c481f4bef55e37debd0805.png" },
    { image: "https://i.ibb.co/v4RV71wR/file-0000000030208246b19018466ca29709.png" }
];

let currentBannerIndex = 0;
let bannerInterval = null;
const BANNER_DELAY = 4000;

let products = [];
let filteredProducts = [];
let currentProduct = null;
let currentImageIndex = 0;
let countdownInterval = null;
let activeCategory = "all";
let shuffleTimer = null;

// ⭐ PAGINATION SOZLAMALARI
const FIRST_HORIZONTAL = 10;       // Yashil hoshiyada 10 ta
const INITIAL_GRID_ROWS = 10;      // Boshlang'ich: 10 qator (20 ta)
const LOAD_MORE_ROWS = 5;          // Har yana ko'rishda: 5 qator (10 ta)
const GRID_COLS = 2;               // 2 ustun

let gridRowsShown = INITIAL_GRID_ROWS;

// Yashil hoshiya
let featuredProducts = [];
const FEATURED_COUNT = 10;

// ⭐ Katta kartochkalar uchun hisoblagichlar
let bigCardsShown = 0;             // Nechta katta kartochka ko'rsatildi

let selectedSize = null;
let selectedColor = null;
let currentUser = null;
let profilePhotoUrl = "";
let activeModal = null;
let imageObserver = null;

// Swipe
let swipeStartX = 0;
let swipeStartY = 0;
let swipeActive = false;

// Auto-scroll
let autoScrollInterval = null;
let autoScrollPaused = false;
let autoLoadObserver = null;


// ==================== SCREENSHOT HIMOYASI ====================
document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; });
document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; });
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && ['s','S','p','P','u','U'].indexOf(e.key) !== -1) {
        e.preventDefault(); return false;
    }
    if (e.key === 'PrintScreen') {
        e.preventDefault();
        try { navigator.clipboard.writeText(''); } catch (err) {}
        return false;
    }
});
document.addEventListener('visibilitychange', function() {
    if (document.hidden) document.body.classList.add('privacy-blur');
    else setTimeout(() => document.body.classList.remove('privacy-blur'), 250);
});


// ==================== SWIPE ====================
function initModalSwipe() {
    const wrap = document.getElementById('modal-img-wrap');
    if (!wrap) return;

    wrap.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
        swipeActive = true;
    }, { passive: true });

    wrap.addEventListener('touchmove', function(e) {
        if (!swipeActive || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - swipeStartX;
        const dy = e.touches[0].clientY - swipeStartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
            const img = document.getElementById('modal-image');
            if (img) { img.style.transform = `translateX(${dx * 0.4}px)`; img.style.transition = 'none'; }
        }
    }, { passive: true });

    wrap.addEventListener('touchend', function(e) {
        if (!swipeActive) return;
        swipeActive = false;
        const img = document.getElementById('modal-image');
        if (img) { img.style.transform = ''; img.style.transition = 'opacity 0.3s, transform 0.3s'; }
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const dx = swipeStartX - endX;
        const dy = swipeStartY - endY;
        if (Math.abs(dx) > 50 && Math.abs(dy) < 80) {
            if (dx > 0) slideImage(1); else slideImage(-1);
        }
    }, { passive: true });
}


// ==================== YASHIL HOSHIYA ====================
function pickFeaturedProducts() {
    if (products.length === 0) {
        featuredProducts = [];
        return;
    }
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    featuredProducts = shuffled.slice(0, Math.min(FEATURED_COUNT, shuffled.length));
}


// ==================== AUTO-SCROLL ====================
function startAutoScroll() {
    const container = document.querySelector('.featured-section .products-horizontal');
    if (!container || container.children.length < 3) return;

    if (autoScrollInterval) clearInterval(autoScrollInterval);

    container.addEventListener('touchstart', () => { autoScrollPaused = true; }, { passive: true });
    container.addEventListener('touchend', () => { setTimeout(() => { autoScrollPaused = false; }, 3000); }, { passive: true });
    container.addEventListener('scroll', () => { autoScrollPaused = true; setTimeout(() => { autoScrollPaused = false; }, 3000); }, { passive: true });

    autoScrollInterval = setInterval(() => {
        if (autoScrollPaused || !container) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;
        const currentScroll = container.scrollLeft;
        const step = container.clientWidth * 0.6;
        if (currentScroll >= maxScroll - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollTo({ left: currentScroll + step, behavior: 'smooth' });
        }
    }, 3500);
}


// ==================== AUTO-LOAD ====================
function setupAutoLoadMore() {
    if (autoLoadObserver) autoLoadObserver.disconnect();
    if (!('IntersectionObserver' in window)) return;

    const checkAndObserve = () => {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            autoLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadMoreProducts();
                    }
                });
            }, {
                rootMargin: '200px 0px',
                threshold: 0.01
            });
            autoLoadObserver.observe(loadMoreBtn);
        }
    };
    setTimeout(checkAndObserve, 500);
}


// ==================== IMAGE OBSERVER ====================
function initImageObserver() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        });
        return;
    }

    if (imageObserver) imageObserver.disconnect();

    imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const realSrc = img.getAttribute('data-src');
                if (realSrc) {
                    const loader = new Image();
                    loader.onload = () => {
                        img.src = realSrc;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    };
                    loader.onerror = () => {
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    };
                    loader.src = realSrc;
                }
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '300px 0px',
        threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}


// ==================== BACK BUTTON ====================
function enableTelegramBackButton(handler) {
    if (tg.BackButton && typeof tg.BackButton.show === 'function') {
        try { tg.BackButton.show(); tg.BackButton.onClick(handler); } catch (e) {}
    }
}
function disableTelegramBackButton() {
    if (tg.BackButton && typeof tg.BackButton.hide === 'function') {
        try { tg.BackButton.offClick(); tg.BackButton.hide(); } catch (e) {}
    }
}


// ==================== BANNER ====================
function initBanner() {
    updateBanner();
    const dotsEl = document.getElementById('banner-dots');
    dotsEl.innerHTML = banners.map((_, i) =>
        `<span class="${i === 0 ? 'active' : ''}" onclick="goToBanner(${i})"></span>`
    ).join('');
    startBannerAutoSlide();
}
function startBannerAutoSlide() {
    if (bannerInterval) clearInterval(bannerInterval);
    bannerInterval = setInterval(() => slideBanner(1), BANNER_DELAY);
}
function slideBanner(dir) {
    currentBannerIndex = (currentBannerIndex + dir + banners.length) % banners.length;
    updateBanner();
    startBannerAutoSlide();
}
function goToBanner(index) {
    currentBannerIndex = index;
    updateBanner();
    startBannerAutoSlide();
}
function updateBanner() {
    const banner = banners[currentBannerIndex];
    const slide = document.getElementById('banner-slide');
    slide.style.opacity = '0';
    setTimeout(() => {
        if (banner.image) {
            const img = new Image();
            img.onload = () => {
                slide.style.background = `url("${banner.image}") center/cover no-repeat`;
                slide.innerHTML = '';
                slide.style.opacity = '1';
            };
            img.onerror = () => {
                slide.style.background = 'linear-gradient(135deg, #1565c0, #42a5f5)';
                slide.innerHTML = '';
                slide.style.opacity = '1';
            };
            img.src = banner.image;
        } else {
            slide.style.background = banner.bg;
            slide.innerHTML = `
                <div class="banner-emoji">${banner.emoji}</div>
                <div class="banner-title">${banner.title}</div>
                <div class="banner-subtitle">${banner.subtitle}</div>
            `;
            slide.style.opacity = '1';
        }
    }, 200);
    document.querySelectorAll('#banner-dots span').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentBannerIndex);
    });
}


// ==================== KATEGORIYALAR ====================
function renderCategories() {
    const scroll = document.getElementById('categories-scroll');
    let html = `<button class="category-btn ${activeCategory === 'all' ? 'active' : ''}" onclick="setCategory('all')">
        <span class="cat-emoji">🌐</span><span class="cat-name">Barchasi</span>
    </button>`;
    CATEGORIES.forEach(cat => {
        html += `<button class="category-btn ${activeCategory === cat.id ? 'active' : ''}" onclick="setCategory('${cat.id}')">
            <span class="cat-emoji">${cat.emoji}</span><span class="cat-name">${cat.name}</span>
        </button>`;
    });
    scroll.innerHTML = html;
}
function setCategory(catId) {
    activeCategory = catId;
    resetLoadMore();
    renderCategories();
    filterProducts();
}


// ==================== QIDIRUV ====================
function filterProducts() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    const clearBtn = document.getElementById('search-clear');
    filteredProducts = products.filter(p => {
        const matchesSearch = !query ||
            (p.title || '').toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query);
        const matchesCategory = activeCategory === 'all' ||
            (p.categories && p.categories.includes(activeCategory));
        return matchesSearch && matchesCategory;
    });
    clearBtn.style.display = query ? 'flex' : 'none';
    resetLoadMore();
    shuffleProducts();
    renderProducts();
}
function clearSearch() {
    document.getElementById('search-input').value = '';
    filterProducts();
}


// ==================== SHUFFLE ====================
const SHUFFLE_INTERVAL = 25 * 60 * 1000;
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function shuffleProducts() {
    const lastShuffle = localStorage.getItem('lastShuffle');
    const now = Date.now();
    if (!lastShuffle || now - parseInt(lastShuffle) > SHUFFLE_INTERVAL) {
        shuffleArray(filteredProducts);
        localStorage.setItem('lastShuffle', now.toString());
    }
}
function startAutoShuffle() {
    if (shuffleTimer) clearInterval(shuffleTimer);
    shuffleTimer = setInterval(() => {
        const lastShuffle = localStorage.getItem('lastShuffle');
        const now = Date.now();
        if (!lastShuffle || now - parseInt(lastShuffle) > SHUFFLE_INTERVAL) {
            shuffleArray(products);
            filteredProducts = [...products];
            shuffleArray(filteredProducts);
            localStorage.setItem('lastShuffle', now.toString());
            pickFeaturedProducts();
            resetLoadMore();
            renderProducts();
        }
    }, 60 * 1000);
}


// ==================== MAHSULOTLAR ====================
async function loadProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = buildSkeleton(6);
    try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        products = data.products || [];
        filteredProducts = [...products];

        if (products.length === 0) {
            container.innerHTML = '<p class="loading">📦 Hozircha mahsulotlar yo\'q</p>';
            return;
        }

        pickFeaturedProducts();
        shuffleProducts();
        resetLoadMore();
        renderProducts();
    } catch (error) {
        container.innerHTML = '<p class="loading">❌ Xatolik. Qayta urinib ko\'ring.</p>';
    }
}

function buildSkeleton(count) {
    let html = '<div class="products-grid-skeleton">';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-btn"></div>
            </div>
        `;
    }
    html += '</div>';
    return html;
}

function getImageUrl(url) {
    if (!url) return "";
    if (url.startsWith('http')) return url;
    return `${API_URL}/api/image/${url}`;
}

function buildProductCard(p) {
    const discountPercent = p.price > 0 && p.discount_price > 0
        ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
    const productId = String(p.id);
    const colorsHtml = (p.colors && p.colors.length > 0)
        ? '<div class="product-colors-mini">' + p.colors.slice(0, 5).map(cid => {
            const c = COLORS.find(x => x.id === cid);
            return c ? `<span style="background:${c.hex};" title="${c.name}"></span>` : '';
        }).join('') + '</div>'
        : '';

    const realImg = getImageUrl(p.images && p.images[0]);

    return `
    <div class="product-card-h" data-id="${productId}">
        <div class="product-image-h">
            <div class="img-spinner"></div>
            <img
                src="${PLACEHOLDER_PIXEL}"
                data-src="${realImg || ''}"
                alt="${(p.title || '').substring(0, 30)}"
                decoding="async"
                class="product-img"
            >
            ${discountPercent > 0 ? `<div class="discount-badge-h">-${discountPercent}%</div>` : ''}
        </div>
        <div class="product-title-h">${(p.title || '').substring(0, 40)}</div>
        ${colorsHtml}
        <div class="product-price-h">
            ${p.price > p.discount_price ? `<span class="old-price-h">${p.price.toLocaleString()}</span>` : ''}
            <span class="new-price-h">${(p.discount_price || 0).toLocaleString()} so'm</span>
        </div>
        <button class="buy-btn-h" data-buy="${productId}">🛒 Sotib olish</button>
    </div>`;
}

// ⭐ KATTA KARTOCHKA
function buildBigProductCard(p) {
    const discountPercent = p.price > 0 && p.discount_price > 0
        ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
    const productId = String(p.id);
    const realImg = getImageUrl(p.images && p.images[0]);
    const description = (p.description || '').substring(0, 150);

    return `
    <div class="big-product-card" data-id="${productId}">
        <div class="big-product-image">
            <div class="img-spinner"></div>
            <img
                src="${PLACEHOLDER_PIXEL}"
                data-src="${realImg || ''}"
                alt="${(p.title || '').substring(0, 30)}"
                decoding="async"
                class="product-img"
            >
            ${discountPercent > 0 ? `<div class="discount-badge-h">-${discountPercent}%</div>` : ''}
        </div>
        <div class="big-product-body">
            <div class="big-product-title">${p.title || ''}</div>
            ${description ? `<div class="big-product-desc">${description}${(p.description || '').length > 150 ? '...' : ''}</div>` : ''}
            <div class="big-product-price-block">
                ${p.price > p.discount_price ? `<span class="big-old-price">${p.price.toLocaleString()} so'm</span>` : ''}
                <span class="big-new-price">${(p.discount_price || 0).toLocaleString()} so'm</span>
            </div>
            <button class="big-buy-btn" data-buy="${productId}">🛒 Sotib olish</button>
        </div>
    </div>`;
}


// ==================== ⭐ YANGI RENDER MANTIQI ====================
// Katta kartochkalar grid ichida bo'ladi
function renderProducts() {
    const container = document.getElementById('products-container');
    if (filteredProducts.length === 0) {
        container.innerHTML = '<p class="loading">🔍 Mahsulot topilmadi</p>';
        return;
    }

    let html = '';

    // Yashil hoshiya
    if (featuredProducts.length > 0) {
        html += `
            <div class="featured-section">
                <div class="featured-header">
                    <span class="featured-icon">⭐</span>
                    <span class="featured-title">Siz uchun sotuvga keltirdik</span>
                </div>
                <div class="products-horizontal" id="featured-scroll">
        `;
        featuredProducts.slice(0, FIRST_HORIZONTAL).forEach(p => { html += buildProductCard(p); });
        html += `
                </div>
            </div>
        `;
    }

    // Asosiy grid
    html += '<div class="products-grid" id="main-grid"></div>';

    // Load more tugmasi
    html += '<div class="load-more-container" id="load-more-container"></div>';

    container.innerHTML = html;

    // ⭐ Asosiy grid'ni to'ldirish
    fillMainGrid();

    // Load more tugmasini yangilash
    updateLoadMoreButton();

    // Listenerlar
    attachAllListeners();

    // Image observer + auto-scroll + auto-load
    initImageObserver();
    startAutoScroll();
    setupAutoLoadMore();
}


// ⭐ Grid'ni to'ldirish: har 5 qatordan keyin katta kartochka
function fillMainGrid() {
    const grid = document.getElementById('main-grid');
    if (!grid) return;

    const total = filteredProducts.length;
    const gridShown = Math.min(gridRowsShown * GRID_COLS, total);

    let html = '';
    let regularCount = 0;

    // Har 5 qatordan keyin katta kartochka
    for (let i = 0; i < gridShown; i++) {
        const product = filteredProducts[i];
        if (!product) break;

        // Har 10 ta mahsulotdan keyin (5 qator) — katta kartochka
        if (i > 0 && i % (LOAD_MORE_ROWS * GRID_COLS) === 0 && i < total) {
            // Katta mahsulot uchun keyingi mahsulotni olamiz
            const bigProduct = filteredProducts[i];
            if (bigProduct) {
                html += buildBigProductCard(bigProduct);
                continue; // bu mahsulot katta kartochka sifatida ishlatildi
            }
        }

        html += buildProductCard(product);
        regularCount++;
    }

    grid.innerHTML = html;
}

// ⭐ Qo'shimcha: yana ko'rish (faqat yangi mahsulotlar + katta kartochka)
function loadMoreProducts() {
    const prevGridShown = Math.min(gridRowsShown * GRID_COLS, filteredProducts.length);
    gridRowsShown += LOAD_MORE_ROWS;

    const total = filteredProducts.length;
    const newGridShown = Math.min(gridRowsShown * GRID_COLS, total);

    const grid = document.getElementById('main-grid');
    if (!grid) return;

    // Yangi mahsulotlar
    const newProducts = filteredProducts.slice(prevGridShown, newGridShown);

    let html = '';

    // ⭐ Katta kartochka: agar bu "yana ko'rish" da yangi bosqichga o'tsak
    // Har 5 qatordan keyin bitta katta kartochka
    newProducts.forEach((product, idx) => {
        // Katta kartochka har LOAD_MORE_ROWS*GRID_COLS mahsulotdan keyin
        const absoluteIdx = prevGridShown + idx;
        if (absoluteIdx > 0 && absoluteIdx % (LOAD_MORE_ROWS * GRID_COLS) === 0) {
            html += buildBigProductCard(product);
        } else {
            html += buildProductCard(product);
        }
    });

    grid.insertAdjacentHTML('beforeend', html);

    attachAllListeners();
    initImageObserver();
    updateLoadMoreButton();
    setupAutoLoadMore();
}

// ⭐ Barcha listenerlar
function attachAllListeners() {
    document.querySelectorAll('.product-card-h').forEach(card => {
        if (!card.dataset.listenerAttached) {
            card.dataset.listenerAttached = '1';
            card.addEventListener('click', () => openModal(card.getAttribute('data-id')));
        }
    });
    document.querySelectorAll('.buy-btn-h').forEach(btn => {
        if (!btn.dataset.listenerAttached) {
            btn.dataset.listenerAttached = '1';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(btn.getAttribute('data-buy'));
            });
        }
    });
    document.querySelectorAll('.big-product-card').forEach(card => {
        if (!card.dataset.listenerAttached) {
            card.dataset.listenerAttached = '1';
            card.addEventListener('click', () => openModal(card.getAttribute('data-id')));
        }
    });
    document.querySelectorAll('.big-buy-btn').forEach(btn => {
        if (!btn.dataset.listenerAttached) {
            btn.dataset.listenerAttached = '1';
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(btn.getAttribute('data-buy'));
            });
        }
    });
}

function updateLoadMoreButton() {
    const total = filteredProducts.length;
    const gridShown = Math.min(gridRowsShown * GRID_COLS, total);
    const remaining = total - gridShown;
    const container = document.getElementById('load-more-container');
    if (!container) return;

    if (remaining > 0) {
        container.innerHTML = `
            <button class="load-more-btn" onclick="loadMoreProducts()">
                <span class="load-more-icon">⬇️</span>
                <span>Yana ko'rish (${remaining} ta qoldi)</span>
            </button>
        `;
    } else {
        container.innerHTML = `<p class="all-shown">✅ Barcha mahsulotlar ko'rsatildi</p>`;
    }
}

function resetLoadMore() {
    gridRowsShown = INITIAL_GRID_ROWS;
    bigCardsShown = 0;
}


// ==================== TELEFON FORMATLASH ====================
function formatPhone(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('998')) digits = digits.slice(3);
    digits = digits.slice(0, 9);
    let result = '+998';
    if (digits.length > 0) result += '(' + digits.slice(0, 2);
    if (digits.length >= 2) result += ')';
    if (digits.length > 2) result += '-' + digits.slice(2, 5);
    if (digits.length > 5) result += '-' + digits.slice(5, 7);
    if (digits.length > 7) result += '-' + digits.slice(7, 9);
    return result;
}
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('order-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() { this.value = formatPhone(this.value); });
        phoneInput.addEventListener('focus', function() { if (!this.value) this.value = '+998'; });
    }
    initModalSwipe();
});


// ==================== MODAL ====================
function formatDescription(text) {
    if (!text || !text.trim()) return '';
    return text.split('\n').map(l => l.trim()).filter(l => l).map(l => `<p>${l}</p>`).join('');
}

async function openModal(id) {
    currentProduct = products.find(p => String(p.id) === String(id));
    if (!currentProduct) return;

    activeModal = 'order';
    enableTelegramBackButton(function() { closeModal(true); });
    try { history.pushState({ modal: 'order' }, '', '#order'); } catch (e) {}

    currentImageIndex = 0;
    selectedSize = null;
    selectedColor = null;

    document.getElementById('modal-title').innerText = currentProduct.title || '';

    const oldPriceEl = document.getElementById('modal-old-price');
    const discountBadgeEl = document.getElementById('modal-discount-badge');
    if (currentProduct.price > currentProduct.discount_price) {
        oldPriceEl.innerText = currentProduct.price.toLocaleString() + " so'm";
        oldPriceEl.style.display = 'inline';
        const percent = Math.round((1 - currentProduct.discount_price / currentProduct.price) * 100);
        discountBadgeEl.innerText = '-' + percent + '%';
        discountBadgeEl.style.display = 'inline-block';
    } else {
        oldPriceEl.style.display = 'none';
        discountBadgeEl.style.display = 'none';
    }
    document.getElementById('modal-price').innerText = (currentProduct.discount_price || 0).toLocaleString();
    document.getElementById('modal-stock').innerText = currentProduct.stock || 0;
    document.getElementById('modal-sold').innerText = currentProduct.sold || 0;

    const descEl = document.getElementById('modal-description');
    const formatted = formatDescription(currentProduct.description);
    descEl.innerHTML = formatted;
    descEl.style.display = formatted ? 'block' : 'none';

    const sizeSection = document.getElementById('size-section');
    const sizesList = document.getElementById('modal-sizes');
    if (currentProduct.sizes && currentProduct.sizes.length > 0) {
        sizeSection.style.display = 'block';
        sizesList.innerHTML = currentProduct.sizes.map(sz =>
            `<button type="button" class="option-btn size-btn" data-size="${sz}">${sz}</button>`
        ).join('');
        sizesList.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                sizesList.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedSize = this.getAttribute('data-size');
            });
        });
    } else {
        sizeSection.style.display = 'none';
    }

    const colorSection = document.getElementById('color-section');
    const colorsList = document.getElementById('modal-colors');
    if (currentProduct.colors && currentProduct.colors.length > 0) {
        colorSection.style.display = 'block';
        colorsList.innerHTML = currentProduct.colors.map(cid => {
            const c = COLORS.find(x => x.id === cid);
            if (!c) return '';
            return `<button type="button" class="option-btn color-opt-btn" data-color="${c.id}">
                <div class="option-color-circle" style="background:${c.hex};"></div>
                <span>${c.name}</span>
            </button>`;
        }).join('');
        colorsList.querySelectorAll('.color-opt-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                colorsList.querySelectorAll('.color-opt-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                selectedColor = this.getAttribute('data-color');
            });
        });
    } else {
        colorSection.style.display = 'none';
    }

    updateImage();
    startCountdown();
    document.getElementById('order-modal').classList.add('active');
    document.body.style.overflow = 'hidden';

    try {
        await fetch(`${API_URL}/api/increment_view`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ product_id: String(currentProduct.id) })
        });
    } catch (e) {}
}

function closeModal(skipHistory = false) {
    document.getElementById('order-modal').classList.remove('active');
    document.body.style.overflow = '';
    if (countdownInterval) clearInterval(countdownInterval);
    document.getElementById('order-form').reset();
    document.getElementById('order-status').innerText = '';
    document.getElementById('order-status').className = 'status';
    disableTelegramBackButton();
    if (!skipHistory && activeModal === 'order') {
        activeModal = null;
        try { if (history.state && history.state.modal === 'order') history.back(); } catch (e) {}
    } else {
        activeModal = null;
    }
}

function preloadModalImages() {
    if (!currentProduct || !currentProduct.images) return;
    currentProduct.images.forEach((imgUrl, idx) => {
        if (idx === currentImageIndex) return;
        const url = getImageUrl(imgUrl);
        if (url && !url.startsWith('data:')) {
            const preloader = new Image();
            preloader.src = url;
        }
    });
}

function updateImage() {
    const img = document.getElementById('modal-image');
    const spinner = document.querySelector('.modal-img-spinner');
    if (!img) return;
    if (spinner) spinner.style.display = 'block';
    img.classList.remove('loaded');
    img.style.transform = '';
    const imgUrl = (currentProduct.images && currentProduct.images.length > 0)
        ? getImageUrl(currentProduct.images[currentImageIndex])
        : "";
    if (!imgUrl) {
        img.src = PLACEHOLDER_PIXEL;
        img.classList.add('loaded');
        if (spinner) spinner.style.display = 'none';
    } else {
        img.onload = function() {
            img.classList.add('loaded');
            if (spinner) spinner.style.display = 'none';
            preloadModalImages();
        };
        img.onerror = function() {
            img.src = PLACEHOLDER_PIXEL;
            img.classList.add('loaded');
            if (spinner) spinner.style.display = 'none';
        };
        img.src = imgUrl;
    }
    const dots = (currentProduct.images || []).map((_, i) =>
        `<span class="${i === currentImageIndex ? 'active' : ''}"></span>`).join('');
    document.getElementById('slider-dots').innerHTML = dots;
}

function slideImage(dir) {
    if (!currentProduct.images || currentProduct.images.length === 0) return;
    currentImageIndex = (currentImageIndex + dir + currentProduct.images.length) % currentProduct.images.length;
    updateImage();
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    const RESET_KEY = 'countdown_reset_' + currentProduct.id;
    const DAY = 24 * 60 * 60 * 1000;
    const THREE_DAYS = 72 * 60 * 60 * 1000;
    const now = Date.now();
    let resetTime = parseInt(localStorage.getItem(RESET_KEY) || '0');
    if (!resetTime || (now - resetTime) >= DAY) {
        resetTime = now;
        localStorage.setItem(RESET_KEY, resetTime.toString());
    }
    const endTime = resetTime + THREE_DAYS;
    function tick() {
        const diff = Math.max(0, endTime - Date.now());
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((diff % (60 * 1000)) / 1000);
        document.getElementById('cd-days').innerText = String(days).padStart(2, '0');
        document.getElementById('cd-hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('cd-minutes').innerText = String(minutes).padStart(2, '0');
        document.getElementById('cd-seconds').innerText = String(seconds).padStart(2, '0');
    }
    tick();
    countdownInterval = setInterval(tick, 1000);
}

async function submitOrder(event) {
    event.preventDefault();
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const statusEl = document.getElementById('order-status');
    const submitBtn = document.querySelector('.order-submit-btn');

    if (!name || name.length < 4) { statusEl.innerText = "❌ Ism kamida 4 harf!"; statusEl.className = "status err"; return; }
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) { statusEl.innerText = "❌ Telefon to'liq emas!"; statusEl.className = "status err"; return; }
    if (currentProduct.sizes && currentProduct.sizes.length > 0 && !selectedSize) { statusEl.innerText = "❌ O'lchamni tanlang!"; statusEl.className = "status err"; return; }
    if (currentProduct.colors && currentProduct.colors.length > 0 && !selectedColor) { statusEl.innerText = "❌ Rangni tanlang!"; statusEl.className = "status err"; return; }

    let colorName = "";
    if (selectedColor) {
        const c = COLORS.find(x => x.id === selectedColor);
        if (c) colorName = c.name;
    }

    const orderData = {
        product_id: String(currentProduct.id),
        product_title: currentProduct.title,
        price: currentProduct.discount_price,
        customer_name: name,
        customer_phone: phone,
        size: selectedSize || "",
        color: colorName
    };

    if (isTelegram) {
        tg.sendData(JSON.stringify({ action: 'order', ...orderData }));
        statusEl.innerText = "✅ Buyurtmangiz qabul qilindi!";
        statusEl.className = "status ok";
        setTimeout(() => {
            try { tg.showAlert("Buyurtmangiz qabul qilindi!"); } catch(e) {}
            closeModal();
        }, 500);
    } else {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Yuborilmoqda...'; }
        try {
            const res = await fetch(`${API_URL}/api/public_order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': tg.initData || '' },
                body: JSON.stringify(orderData)
            });
            const data = await res.json();
            if (data.success) {
                statusEl.innerText = "✅ Buyurtmangiz qabul qilindi!";
                statusEl.className = "status ok";
                setTimeout(() => {
                    alert("Buyurtmangiz qabul qilindi!\n\nTez orada operatorlarimiz siz bilan bog'lanadi.");
                    closeModal();
                }, 500);
            } else {
                statusEl.innerText = "❌ " + (data.error || "Xatolik");
                statusEl.className = "status err";
            }
        } catch (e) {
            statusEl.innerText = "❌ Tarmoq xatosi";
            statusEl.className = "status err";
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'Tasdiqlash'; }
        }
    }
}


// ==================== PROFIL ====================
async function openProfile() {
    if (!isTelegram) {
        alert("Profil faqat Telegram orqali ishlaydi.\n\nIltimos, do'konni @MaxiMarketUzbot orqali oching.");
        return;
    }
    activeModal = 'profile';
    enableTelegramBackButton(function() { closeProfile(true); });
    try { history.pushState({ modal: 'profile' }, '', '#profile'); } catch (e) {}

    document.getElementById('profile-modal').classList.add('active');
    const user = tg.initDataUnsafe?.user;
    if (!user) return;

    try {
        const res = await fetch(`${API_URL}/api/register_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                username: user.username || "",
                tg_name: user.first_name + (user.last_name ? ' ' + user.last_name : '')
            })
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data;
            document.getElementById('profile-number').innerText = '#' + data.user_number;
            document.getElementById('profile-fullname').value = data.full_name || (user.first_name + (user.last_name ? ' ' + user.last_name : ''));
            document.getElementById('profile-phone').value = data.phone || '';
            document.getElementById('profile-date').value = data.registered_at ?
                new Date(data.registered_at).toLocaleString('uz-UZ', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '';
            if (data.photo) {
                profilePhotoUrl = data.photo;
                document.getElementById('profile-avatar').innerHTML = `<img src="${data.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" loading="lazy">`;
            }
        }
    } catch (err) {}
}

function closeProfile(skipHistory = false) {
    document.getElementById('profile-modal').classList.remove('active');
    disableTelegramBackButton();
    if (!skipHistory && activeModal === 'profile') {
        activeModal = null;
        try { if (history.state && history.state.modal === 'profile') history.back(); } catch (e) {}
    } else {
        activeModal = null;
    }
}

function previewProfilePhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('profile-avatar').innerHTML =
            `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    };
    reader.readAsDataURL(file);
}

function uploadImageToServer(file) {
    return new Promise(function(resolve) {
        var formData = new FormData();
        formData.append('image', file);
        fetch(API_URL + '/api/upload_image', { method: 'POST', body: formData })
            .then(function(r) { return r.json(); })
            .then(function(d) { resolve(d.success ? d.url : null); })
            .catch(function() { resolve(null); });
    });
}

async function saveProfile() {
    if (!currentUser) return;
    const fullname = document.getElementById('profile-fullname').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const statusEl = document.getElementById('profile-status');
    const fileInput = document.getElementById('profile-photo');

    statusEl.innerText = "⏳ Saqlanmoqda...";
    statusEl.className = "status ok";

    try {
        let photoUrl = profilePhotoUrl;
        if (fileInput.files[0]) {
            photoUrl = await uploadImageToServer(fileInput.files[0]);
            if (!photoUrl) photoUrl = profilePhotoUrl;
        }
        const res = await fetch(`${API_URL}/api/update_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: tg.initDataUnsafe.user.id,
                full_name: fullname,
                phone: phone,
                photo: photoUrl
            })
        });
        const data = await res.json();
        if (data.success) {
            statusEl.innerText = "✅ Profil saqlandi!";
            statusEl.className = "status ok";
            profilePhotoUrl = photoUrl;
        } else {
            statusEl.innerText = "❌ " + (data.error || "Xatolik");
            statusEl.className = "status err";
        }
    } catch (err) {
        statusEl.innerText = "❌ " + err.message;
        statusEl.className = "status err";
    }
}


// ==================== TASHRIF ====================
async function trackVisit() {
    try {
        await fetch(`${API_URL}/api/visit`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ page: 'main' })
        });
    } catch (e) {}
}


// ==================== ZAXIRA ====================
window.addEventListener('popstate', function(event) {
    if (activeModal === 'order') closeModal(true);
    else if (activeModal === 'profile') closeProfile(true);
});


// ==================== START ====================
initBanner();
renderCategories();
loadProducts();
startAutoShuffle();
trackVisit();
