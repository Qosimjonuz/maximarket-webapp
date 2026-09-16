const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = "https://maximarketbot-production.up.railway.app";

const CATEGORIES = [
    { id: "elektronika", name: "Elektronika", emoji: "📱" },
    { id: "kiyim", name: "Kiyim", emoji: "👕" },
    { id: "maishiy", name: "Maishiy texnika", emoji: "🏠" },
    { id: "gozallik", name: "Go'zallik", emoji: "💄" },
    { id: "salomatlik", name: "Salomatlik", emoji: "❤️" },
    { id: "bolalar", name: "Bolalar", emoji: "🧸" },
    { id: "sport", name: "Sport", emoji: "⚽" },
    { id: "kitoblar", name: "Kitoblar", emoji: "📚" },
    { id: "avto", name: "Avto", emoji: "🚗" },
    { id: "uy", name: "Uy uchun", emoji: "🏡" },
    { id: "sovga", name: "Sovg'alar", emoji: "🎁" },
    { id: "boshqa", name: "Boshqa", emoji: "📦" }
];

const banners = [
    { emoji: "🎁", title: "MaxiMarket", subtitle: "Yangi mahsulotlar", bg: "linear-gradient(135deg, #1565c0, #42a5f5)" },
    { emoji: "🔥", title: "CHEGIRMALAR", subtitle: "70% gacha arzonlashuv", bg: "linear-gradient(135deg, #e53935, #ff6f00)" },
    { emoji: "🚚", title: "Bepul yetkazib berish", subtitle: "O'zbekiston bo'ylab", bg: "linear-gradient(135deg, #2e7d32, #66bb6a)" },
    { emoji: "💎", title: "Premium sifat", subtitle: "Eng yaxshi brendlar", bg: "linear-gradient(135deg, #6a1b9a, #ab47bc)" },
    { emoji: "⚡", title: "Tezkor xizmat", subtitle: "24/7 ishlaymiz", bg: "linear-gradient(135deg, #f57c00, #ffb74d)" },
    { emoji: "🎯", title: "Kafolatlangan", subtitle: "Sifat kafolati", bg: "linear-gradient(135deg, #0d47a1, #1976d2)" },
    { emoji: "🏆", title: "Eng yaxshi narxlar", subtitle: "Bozordagi eng arzon", bg: "linear-gradient(135deg, #c62828, #e53935)" },
    { emoji: "💝", title: "Sovg'alar", subtitle: "Yaqinlaringizga", bg: "linear-gradient(135deg, #ad1457, #ec407a)" },
    { emoji: "📱", title: "Elektronika", subtitle: "Zamonaviy texnika", bg: "linear-gradient(135deg, #0277bd, #29b6f6)" },
    { emoji: "👗", title: "Kiyimlar", subtitle: "Yangi kolleksiya", bg: "linear-gradient(135deg, #6a1b9a, #8e24aa)" },
    { emoji: "🏠", title: "Uy uchun", subtitle: "Qulaylik yaratuvchi", bg: "linear-gradient(135deg, #ef6c00, #fb8c00)" },
    { emoji: "🎮", title: "O'yinchoqlar", subtitle: "Bolalar uchun", bg: "linear-gradient(135deg, #283593, #3f51b5)" },
    { emoji: "💄", title: "Go'zallik", subtitle: "Kosmetika mahsulotlari", bg: "linear-gradient(135deg, #c2185b, #f06292)" },
    { emoji: "🍔", title: "Oziq-ovqat", subtitle: "Mazali mahsulotlar", bg: "linear-gradient(135deg, #d84315, #ff7043)" },
    { emoji: "⭐", title: "Sizning tanlovingiz", subtitle: "Eng ko'p sotilgan", bg: "linear-gradient(135deg, #1565c0, #1e88e5)" }
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
        slide.style.background = banner.bg;
        document.getElementById('banner-emoji').innerText = banner.emoji;
        document.getElementById('banner-title').innerText = banner.title;
        document.getElementById('banner-subtitle').innerText = banner.subtitle;
        slide.style.opacity = '1';
    }, 200);
    document.querySelectorAll('#banner-dots span').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentBannerIndex);
    });
}

// ==================== KATEGORIYALAR ====================
function renderCategories() {
    const scroll = document.getElementById('categories-scroll');
    let html = `<button class="category-btn ${activeCategory === 'all' ? 'active' : ''}" onclick="setCategory('all')">
        <span class="cat-emoji">🌐</span>
        <span class="cat-name">Barchasi</span>
    </button>`;
    CATEGORIES.forEach(cat => {
        html += `<button class="category-btn ${activeCategory === cat.id ? 'active' : ''}" onclick="setCategory('${cat.id}')">
            <span class="cat-emoji">${cat.emoji}</span>
            <span class="cat-name">${cat.name}</span>
        </button>`;
    });
    scroll.innerHTML = html;
}

function setCategory(catId) {
    activeCategory = catId;
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
    shuffleProducts();
    renderProducts();
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    filterProducts();
}

// ==================== SHUFFLE (20-25 daqiqada) ====================
function shuffleProducts() {
    const lastShuffle = localStorage.getItem('lastShuffle');
    const now = Date.now();
    const SHUFFLE_INTERVAL = 22 * 60 * 1000; // 22 daqiqa
    
    if (!lastShuffle || now - parseInt(lastShuffle) > SHUFFLE_INTERVAL) {
        // Fisher-Yates shuffle
        for (let i = filteredProducts.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filteredProducts[i], filteredProducts[j]] = [filteredProducts[j], filteredProducts[i]];
        }
        localStorage.setItem('lastShuffle', now.toString());
    }
}

// ==================== MAHSULOTLAR ====================
async function loadProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '<p class="loading">⏳ Yuklanmoqda...</p>';
    try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        products = data.products || [];
        filteredProducts = [...products];
        if (products.length === 0) {
            container.innerHTML = '<p class="loading">📦 Hozircha mahsulotlar yo\'q</p>';
            return;
        }
        shuffleProducts();
        renderProducts();
    } catch (error) {
        container.innerHTML = '<p class="loading">❌ Xatolik</p>';
    }
}

function getImageUrl(url) {
    if (!url) return "https://via.placeholder.com/200x200?text=📦";
    if (url.startsWith('http')) return url;
    return `${API_URL}/api/image/${url}`;
}

function getStockText(stock) {
    if (stock === undefined || stock === null || stock === 0) return '';
    if (stock > 0 && stock <= 5) return `⚠️ Faqat ${stock} ta qoldi!`;
    if (stock > 5) return `✅ Mavjud: ${stock} ta`;
    return '';
}

function renderProducts() {
    const container = document.getElementById('products-container');
    if (filteredProducts.length === 0) {
        container.innerHTML = '<p class="loading">🔍 Mahsulot topilmadi</p>';
        return;
    }
    
    // Gorizontal scroll qatorlar - har bir qatorda 10 ta
    let html = '<div class="products-horizontal">';
    filteredProducts.forEach(p => {
        const discountPercent = p.price > 0 && p.discount_price > 0 
            ? Math.round((1 - p.discount_price / p.price) * 100) 
            : 0;
        const stockText = getStockText(p.stock);
        html += `
        <div class="product-card-h" data-id="${String(p.id)}">
            <div class="product-image-h">
                <img src="${getImageUrl(p.images && p.images[0])}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/200x200?text=📦'">
                ${discountPercent > 0 ? `<div class="discount-badge-h">-${discountPercent}%</div>` : ''}
            </div>
            <div class="product-title-h">${(p.title || '').substring(0, 40)}</div>
            <div class="product-price-h">
                ${p.price > p.discount_price ? `<span class="old-price-h">${p.price.toLocaleString()}</span>` : ''}
                <span class="new-price-h">${(p.discount_price || 0).toLocaleString()} so'm</span>
            </div>
            ${stockText ? `<div class="product-stock-h">${stockText}</div>` : ''}
        </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
    
    document.querySelectorAll('.product-card-h').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            openModal(id);
        });
    });
}

// ==================== MODAL ====================
function formatDescription(text) {
    if (!text || !text.trim()) return '';
    return text.split('\n').map(l => l.trim()).filter(l => l).map(l => `<p>${l}</p>`).join('');
}

function openModal(id) {
    currentProduct = products.find(p => String(p.id) === String(id));
    if (!currentProduct) return;
    
    currentImageIndex = 0;
    document.getElementById('modal-title').innerText = currentProduct.title || '';
    document.getElementById('modal-price').innerText = (currentProduct.discount_price || 0).toLocaleString();
    
    const stockEl = document.getElementById('modal-stock');
    const stockText = getStockText(currentProduct.stock);
    if (stockText) {
        stockEl.innerText = stockText;
        stockEl.style.display = 'block';
    } else {
        stockEl.style.display = 'none';
    }
    
    const descEl = document.getElementById('modal-description');
    if (descEl) {
        const formatted = formatDescription(currentProduct.description);
        descEl.innerHTML = formatted;
        descEl.style.display = formatted ? 'block' : 'none';
    }
    
    updateImage();
    startCountdown();
    document.getElementById('order-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('order-modal').classList.remove('active');
    if (countdownInterval) clearInterval(countdownInterval);
}

function updateImage() {
    const img = document.getElementById('modal-image');
    if (currentProduct.images && currentProduct.images.length > 0) {
        img.src = getImageUrl(currentProduct.images[currentImageIndex]);
    } else {
        img.src = "https://via.placeholder.com/400x400?text=No+Image";
    }
    const dots = (currentProduct.images || []).map((_, i) => 
        `<span class="${i === currentImageIndex ? 'active' : ''}"></span>`
    ).join('');
    document.getElementById('slider-dots').innerHTML = dots;
}

function slideImage(dir) {
    if (!currentProduct.images || currentProduct.images.length === 0) return;
    currentImageIndex = (currentImageIndex + dir + currentProduct.images.length) % currentProduct.images.length;
    updateImage();
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    function tick() {
        const end = currentProduct.discount_end ? new Date(currentProduct.discount_end).getTime() : 0;
        const diff = Math.max(0, end - Date.now());
        document.getElementById('cd-hours').innerText = String(Math.floor(diff / 3600000)).padStart(2, '0');
        document.getElementById('cd-minutes').innerText = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        document.getElementById('cd-seconds').innerText = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
    }
    tick();
    countdownInterval = setInterval(tick, 1000);
}

function submitOrder(event) {
    event.preventDefault();
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    if (!name || !phone || phone.length < 10) {
        tg.showAlert("Iltimos, ism va telefon raqamni to'g'ri kiriting!");
        return;
    }
    const orderData = {
        action: 'order',
        product_id: currentProduct.id,
        product_title: currentProduct.title,
        price: currentProduct.discount_price,
        customer_name: name,
        customer_phone: phone
    };
    tg.sendData(JSON.stringify(orderData));
    tg.showAlert("Buyurtmangiz qabul qilindi!");
    closeModal();
}

// ==================== SAHIFALAR ====================
function showPage(page) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.nav-btn')[page === 'home' ? 0 : page === 'catalog' ? 1 : 2].classList.add('active');
    
    const profilePage = document.getElementById('profile-page');
    if (page === 'profile') {
        profilePage.classList.add('active');
        loadProfile();
    } else {
        profilePage.classList.remove('active');
        if (page === 'catalog') {
            setCategory('all');
        }
    }
}

// ==================== PROFIL ====================
function loadProfile() {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('profile-name').innerText = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        document.getElementById('profile-username').innerText = user.username ? '@' + user.username : 'Username yo\'q';
        document.getElementById('profile-fullname').value = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    }
    const savedPhone = localStorage.getItem('userPhone');
    if (savedPhone) document.getElementById('profile-phone').value = savedPhone;
}

function saveProfile() {
    const phone = document.getElementById('profile-phone').value.trim();
    const fullname = document.getElementById('profile-fullname').value.trim();
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userFullName', fullname);
    tg.showAlert("✅ Profil saqlandi!");
}

// ==================== START ====================
initBanner();
renderCategories();
loadProducts();
