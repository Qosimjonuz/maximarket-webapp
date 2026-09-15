    const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = "https://maximarketbot-production.up.railway.app";

// ==================== BANNER RASMLARI ====================
// Bu yerga 15 ta yoki ko'proq rasm URL manzillarini qo'ying
const bannerImages = [
    "https://via.placeholder.com/800x400/1565c0/ffffff?text=Banner+1",
    "https://via.placeholder.com/800x400/42a5f5/ffffff?text=Banner+2",
    "https://via.placeholder.com/800x400/1976d2/ffffff?text=Banner+3",
    "https://via.placeholder.com/800x400/0d47a1/ffffff?text=Banner+4",
    "https://via.placeholder.com/800x400/2196f3/ffffff?text=Banner+5",
    "https://via.placeholder.com/800x400/1565c0/ffffff?text=Banner+6",
    "https://via.placeholder.com/800x400/42a5f5/ffffff?text=Banner+7",
    "https://via.placeholder.com/800x400/1976d2/ffffff?text=Banner+8",
    "https://via.placeholder.com/800x400/0d47a1/ffffff?text=Banner+9",
    "https://via.placeholder.com/800x400/2196f3/ffffff?text=Banner+10",
    "https://via.placeholder.com/800x400/1565c0/ffffff?text=Banner+11",
    "https://via.placeholder.com/800x400/42a5f5/ffffff?text=Banner+12",
    "https://via.placeholder.com/800x400/1976d2/ffffff?text=Banner+13",
    "https://via.placeholder.com/800x400/0d47a1/ffffff?text=Banner+14",
    "https://via.placeholder.com/800x400/2196f3/ffffff?text=Banner+15"
];

let currentBannerIndex = 0;
let bannerInterval = null;
const BANNER_DELAY = 4000; // 4 sekund

let products = [];
let filteredProducts = [];
let currentProduct = null;
let currentImageIndex = 0;
let countdownInterval = null;

// ==================== BANNER ====================
function initBanner() {
    if (bannerImages.length === 0) return;
    
    const img = document.getElementById('banner-img');
    img.src = bannerImages[0];
    
    // Dots
    const dotsEl = document.getElementById('banner-dots');
    dotsEl.innerHTML = bannerImages.map((_, i) => 
        `<span class="${i === 0 ? 'active' : ''}" onclick="goToBanner(${i})"></span>`
    ).join('');
    
    // Auto-slide
    startBannerAutoSlide();
}

function startBannerAutoSlide() {
    if (bannerInterval) clearInterval(bannerInterval);
    bannerInterval = setInterval(() => slideBanner(1), BANNER_DELAY);
}

function slideBanner(dir) {
    if (bannerImages.length === 0) return;
    currentBannerIndex = (currentBannerIndex + dir + bannerImages.length) % bannerImages.length;
    updateBanner();
    startBannerAutoSlide(); // Reset timer
}

function goToBanner(index) {
    currentBannerIndex = index;
    updateBanner();
    startBannerAutoSlide();
}

function updateBanner() {
    const img = document.getElementById('banner-img');
    img.style.opacity = '0';
    setTimeout(() => {
        img.src = bannerImages[currentBannerIndex];
        img.style.opacity = '1';
    }, 150);
    
    const dots = document.querySelectorAll('#banner-dots span');
    dots.forEach((dot, i) => {
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
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        products = data.products || [];
        filteredProducts = [...products];
        
        if (products.length === 0) {
            container.innerHTML = '<p class="loading">Hozircha mahsulotlar yo\'q</p>';
            return;
        }
        
        renderProducts();
    } catch (error) {
        container.innerHTML = '<p class="loading">❌ Yuklashda xatolik</p>';
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
        <div class="product-card" onclick="openModal(${p.id})">
            <div class="product-image-wrap">
                <img src="${getImageUrl(p.images && p.images[0])}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x400?text=Rasm+yoq'">
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
