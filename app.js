const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = "https://maximarketbot-production.up.railway.app";

// ==================== BANNERLAR ====================
// Har bir banner: emoji, sarlavha, subtitle va fon rangi
// Xohlagancha qo'shishingiz mumkin (15 ta tayyor)
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

// ==================== QIDIRUV ====================
function filterProducts() {
    const query = document.getElementById('search-input').value.trim().toLowerCase();
    const clearBtn = document.getElementById('search-clear');
    
    if (query) {
        clearBtn.style.display = 'flex';
        filteredProducts = products.filter(p => 
            (p.title || '').toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query)
        );
    } else {
        clearBtn.style.display = 'none';
        filteredProducts = [...products];
    }
    
    renderProducts();
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    filteredProducts = [...products];
    document.getElementById('search-clear').style.display = 'none';
    renderProducts();
}

// ==================== MAHSULOTLAR ====================
async function loadProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '<p class="loading">⏳ Yuklanmoqda...</p>';
    
    try {
        console.log("API so'rov:", `${API_URL}/api/products`);
        const response = await fetch(`${API_URL}/api/products`);
        console.log("API javob statusi:", response.status);
        
        const data = await response.json();
        console.log("API ma'lumotlar:", data);
        
        products = data.products || [];
        filteredProducts = [...products];
        
        console.log("Mahsulotlar soni:", products.length);
        
        if (products.length === 0) {
            container.innerHTML = '<p class="loading">📦 Hozircha mahsulotlar yo\'q</p>';
            return;
        }
        
        renderProducts();
    } catch (error) {
        console.error("Yuklash xatosi:", error);
        container.innerHTML = '<p class="loading">❌ Xatolik: ' + error.message + '</p>';
    }
}

function getImageUrl(url) {
    if (!url) return "https://via.placeholder.com/400x400?text=No+Image";
    if (url.startsWith('http')) return url;
    return `${API_URL}/api/image/${url}`;
}

function renderProducts() {
    const container = document.getElementById('products-container');
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<p class="loading">🔍 Mahsulot topilmadi</p>';
        return;
    }
    
    container.innerHTML = '<div class="products-list">' + filteredProducts.map(p => {
        const discountPercent = p.price > 0 && p.discount_price > 0 
            ? Math.round((1 - p.discount_price / p.price) * 100) 
            : 0;
        const shortDesc = (p.description || '').split('\n')[0].substring(0, 60);
        
        return `
        <div class="product-card" onclick="openModal('${p.id}')">
            <div class="product-image-wrap">
                <img src="${getImageUrl(p.images && p.images[0])}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/200x200?text=📦'">
                ${discountPercent > 0 ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${p.title || ''}</h3>
                ${shortDesc ? `<p class="product-desc">${shortDesc}...</p>` : ''}
                <div class="price-row">
                    ${p.price > p.discount_price ? `<span class="old-price">${p.price.toLocaleString()}</span>` : ''}
                    <span class="new-price">${(p.discount_price || 0).toLocaleString()} UZS</span>
                </div>
            </div>
        </div>
        `;
    }).join('') + '</div>';
}

// ==================== MODAL ====================
function formatDescription(text) {
    if (!text || !text.trim()) return '';
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('');
}

function openModal(id) {
    currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;
    
    currentImageIndex = 0;
    document.getElementById('modal-title').innerText = currentProduct.title || '';
    document.getElementById('modal-price').innerText = (currentProduct.discount_price || 0).toLocaleString();
    
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
        const now = Date.now();
        const diff = Math.max(0, end - now);
        
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        document.getElementById('cd-hours').innerText = String(h).padStart(2, '0');
        document.getElementById('cd-minutes').innerText = String(m).padStart(2, '0');
        document.getElementById('cd-seconds').innerText = String(s).padStart(2, '0');
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

// ==================== START ====================
initBanner();
loadProducts();
