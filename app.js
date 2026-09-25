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

// ⭐ 8 TA BANNER — 3-8 ga yangi rasmlar
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

// Yana ko'rish
const FIRST_HORIZONTAL = 10;
const INITIAL_GRID_ROWS = 10;
const LOAD_MORE_ROWS = 10;
const GRID_COLS = 2;
let gridRowsShown = INITIAL_GRID_ROWS;

// ⭐ Yashil hoshiya (featured products)
let featuredProducts = [];
const FEATURED_COUNT = 10;

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

// ⭐ Auto-scroll
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


// ==================== ⭐ YASHIL HOSHIYA (FEATURED) ====================
// Har sahifa yangilanganda — tasodifiy 10 ta mahsulot
function pickFeaturedProducts() {
    if (products.length === 0) {
        featuredProducts = [];
        return;
    }
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    featuredProducts = shuffled.slice(0, Math.min(FEATURED_COUNT, shuffled.length));
}

// Pastdagi grid'da — yashil hoshiyadagilar ham qo'shiladi (pastga qarab 13 qator)
function getFeaturedForGrid() {
    // Featured products pastdagi grid'da ham ko'rinadi
    return featuredProducts;
}


// ==================== ⭐ AUTO-SCROLL (birinchi qator) ====================
function startAutoScroll() {
    const container = document.querySelector('.products-horizontal');
    if (!container || container.children.length < 3) return;

    // Eski intervalni tozalash
    if (autoScrollInterval) clearInterval(autoScrollInterval);

    // Foydalanuvchi scroll qilsa — to'xtatish
    container.addEventListener('touchstart', () => { autoScrollPaused = true; }, { passive: true });
    container.addEventListener('touchend', () => { setTimeout(() => { autoScrollPaused = false; }, 3000); }, { passive: true });
    container.addEventListener('scroll', () => { autoScrollPaused = true; setTimeout(() => { autoScrollPaused = false; }, 3000); }, { passive: true });

    // ⭐ Sahifa ochilganda bir marta + har 3 sekundda
    autoScrollInterval = setInterval(() => {
        if (autoScrollPaused || !container) return;

        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll <= 0) return;

        const currentScroll = container.scrollLeft;
        const step = container.clientWidth * 0.6; // ~60% ekran

        if (currentScroll >= maxScroll - 10) {
            // Boshiga qaytish (silliq)
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollTo({ left: currentScroll + step, behavior: 'smooth' });
        }
    }, 3500);
}


// ==================== ⭐ AUTO-LOAD "YANA KO'RISH" ====================
// 10-qatordan keyin avtomatik "Yana ko'rish" bosiladi
function setupAutoLoadMore() {
    // Eski observer'ni tozalash
    if (autoLoadObserver) autoLoadObserver.disconnect();

    if (!('IntersectionObserver' in window)) return;

    // Load more tugmasini kuzatish
    const checkAndObserve = () => {
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            autoLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // ⭐ Avtomatik bosish
                        loadMoreProducts();
                    }
                });
            }, {
                rootMargin: '200px 0px',  // 200px oldin ishga tushadi
                threshold: 0.01
            });
            autoLoadObserver.observe(loadMoreBtn);
        }
    };

    // DOM yangilangach biroz kutib, keyin kuzatish
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

        // ⭐ Yashil hoshiya uchun tasodifiy 10 ta
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

// ⭐ KATTA KARTOCHKA (13-qatordan keyin)
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


// ==================== RENDER ====================
function renderProducts() {
    const container = document.getElementById('products-container');
    if (filteredProducts.length === 0) {
        container.innerHTML = '<p class="loading">🔍 Mahsulot topilmadi</p>';
        return;
    }

    const { horizontal, grid, hasMore, remaining } = getDisplayedProducts();

    let html = '';

    // ⭐ YASHIL HOSHIYA — birinchi 10 ta (tasodifiy)
    if (horizontal.length > 0) {
        html += `
            <div class="featured-section">
                <div class="featured-header">
                    <span class="featured-icon">⭐</span>
                    <span class="featured-title">Siz uchun sotuvga keltirdik</span>
                </div>
                <div class="products-horizontal" id="featured-scroll">
        `;
        horizontal.forEach(p => { html += buildProductCard(p); });
        html += `
                </div>
            </div>
        `;
    }

    // ⭐ Pastga qarab grid (yashil hoshiyadagi mahsulotlar ham pastda)
    if (grid.length > 0) {
        html += '<div class="products-grid">';
        grid.forEach(p => { html += buildProductCard(p); });
        html += '</div>';
    }

    // ⭐ KATTA KARTOCHKA (13-qatordan keyin — grid ichida)
    if (grid.length >= 26 && filteredProducts.length > 26) {
        // 26 ta kartochka = 13 qator (2 tadan)
        const bigProduct = filteredProducts[26];
        html += buildBigProductCard(bigProduct);
    }

    // Yana ko'rish
    if (hasMore) {
        html += `
            <div class="load-more-container">
                <button class="load-more-btn" onclick="loadMoreProducts()">
                    <span class="load-more-icon">⬇️</span>
                    <span>Yana ko'rish (${remaining} ta qoldi)</span>
                </button>
            </div>
        `;
    } else {
        html += `<div class="load-more-container"><p class="all-shown">✅ Barcha mahsulotlar ko'rsatildi</p></div>`;
    }

    container.innerHTML = html;

    // Event listenerlar
    container.querySelectorAll('.product-card-h').forEach(card => {
        card.addEventListener('click', () => openModal(card.getAttribute('data-id')));
    });
    container.querySelectorAll('.buy-btn-h').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(btn.getAttribute('data-buy'));
        });
    });
    container.querySelectorAll('.big-product-card').forEach(card => {
        card.addEventListener('click', () => openModal(card.getAttribute('data-id')));
    });
    container.querySelectorAll('.big-buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(btn.getAttribute('data-buy'));
        });
    });

    // ⭐ Auto-scroll va auto-load
    initImageObserver();
    startAutoScroll();
    setupAutoLoadMore();
}


// ==================== YANA KO'RISH ====================
function getDisplayedProducts() {
    const total = filteredProducts.length;
    if (total === 0) return { horizontal: [], grid: [], hasMore: false, remaining: 0 };

    // ⭐ Yashil hoshiya — tasodifiy 10 ta mahsulot
    const horizontal = featuredProducts.slice(0, FIRST_HORIZONTAL);

    // ⭐ Pastdagi grid — yashil hoshiyadagi mahsulotlardan keyingi barcha
    const gridAvailable = total;
    const gridShown = Math.min(gridRowsShown * GRID_COLS, gridAvailable);
    const grid = filteredProducts.slice(0, gridShown);
    const hasMore = gridShown < total;
    const remaining = total - gridShown;

    return { horizontal, grid, hasMore, remaining };
}

function loadMoreProducts() {
    const prevRows = gridRowsShown;
    gridRowsShown += LOAD_MORE_ROWS;

    // Faqat yangi qatorlarni qo'shish (o'chirmasdan)
    const { grid } = getDisplayedProducts();
    const container = document.querySelector('.products-grid');
    if (container) {
        const newItems = grid.slice(prevRows * GRID_COLS);
        let html = '';
        newItems.forEach(p => { html += buildProductCard(p); });
        container.insertAdjacentHTML('beforeend', html);

        // Event listenerlarni yangi elementlarga ulash
        const cards = container.querySelectorAll('.product-card-h');
        const lastCards = Array.from(cards).slice(-newItems.length);
        lastCards.forEach(card => {
            card.addEventListener('click', () => openModal(card.getAttribute('data-id')));
        });
        const buyBtns = container.querySelectorAll('.buy-btn-h');
        const lastBtns = Array.from(buyBtns).slice(-newItems.length);
        lastBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(btn.getAttribute('data-buy'));
            });
        });

        initImageObserver();
    } else {
        renderProducts();
    }

    // ⭐ Load more tugmasini yangilash
    updateLoadMoreButton();
    setupAutoLoadMore();
}

function updateLoadMoreButton() {
    const { hasMore, remaining } = getDisplayedProducts();
    const container = document.querySelector('.load-more-container');
    if (!container) return;

    if (hasMore) {
        container.innerHTML = `
            <button class="load-more-btn" onclick="loadMoreProducts()">
                <span class="load-more-icon">⬇️</span>
                <span>Yana ko'rish (${remaining} ta qoldi)</span>
            </button>
        `;
    } else {
        container.innerHTML = `<p class="all-shown">✅ Barcha mahsulotlar ko'rsatildi</p>`;
    }

    // ⭐ Katta kartochka qo'shish
    const grid = document.querySelector('.products-grid');
    if (grid && !document.querySelector('.big-product-card')) {
        const totalCards = grid.querySelectorAll('.product-card-h').length;
        if (totalCards >= 26 && filteredProducts.length > 26) {
            const bigProduct = filteredProducts[26];
            grid.insertAdjacentHTML('afterend', buildBigProductCard(bigProduct));
            const bigCard = document.querySelector('.big-product-card');
            if (bigCard) {
                bigCard.addEventListener('click', () => openModal(bigCard.getAttribute('data-id')));
                const bigBtn = bigCard.querySelector('.big-buy-btn');
                if (bigBtn) {
                    bigBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openModal(bigBtn.getAttribute('data-buy'));
                    });
                }
            }
        }
    }
}

function resetLoadMore() {
    gridRowsShown = INITIAL_GRID_ROWS;
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

    // RAZM
