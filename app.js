const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = "https://maximarketbot-production.up.railway.app";

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
    { emoji: "🔥", title: "CHEGIRMALAR", subtitle: "70% gacha arzonlashuv", bg: "linear-gradient(135deg, #e53935, #ff6f00)" },
    { emoji: "🚚", title: "Bepul yetkazish", subtitle: "O'zbekiston bo'ylab", bg: "linear-gradient(135deg, #2e7d32, #66bb6a)" },
    { emoji: "💎", title: "Premium sifat", subtitle: "Eng yaxshi brendlar", bg: "linear-gradient(135deg, #6a1b9a, #ab47bc)" },
    { emoji: "⚡", title: "Tezkor xizmat", subtitle: "24/7 ishlaymiz", bg: "linear-gradient(135deg, #f57c00, #ffb74d)" },
    { emoji: "🎯", title: "Kafolatlangan", subtitle: "Sifat kafolati", bg: "linear-gradient(135deg, #0d47a1, #1976d2)" },
    { emoji: "🏆", title: "Eng yaxshi narxlar", subtitle: "Bozordagi eng arzon", bg: "linear-gradient(135deg, #c62828, #e53935)" }
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

let selectedSize = null;
let selectedColor = null;

let currentUser = null;
let profilePhotoUrl = "";

// BANNER
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
            slide.style.background = `url("${banner.image}") center/cover no-repeat`;
            slide.innerHTML = '';
        } else {
            slide.style.background = banner.bg;
            slide.innerHTML = `
                <div class="banner-emoji">${banner.emoji}</div>
                <div class="banner-title">${banner.title}</div>
                <div class="banner-subtitle">${banner.subtitle}</div>
            `;
        }
        slide.style.opacity = '1';
    }, 200);
    document.querySelectorAll('#banner-dots span').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentBannerIndex);
    });
}

// KATEGORIYALAR
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
    renderCategories();
    filterProducts();
}

// QIDIRUV
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

// SHUFFLE
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
            renderProducts();
        }
    }, 60 * 1000);
}

// MAHSULOTLAR
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

function renderProducts() {
    const container = document.getElementById('products-container');
    if (filteredProducts.length === 0) {
        container.innerHTML = '<p class="loading">🔍 Mahsulot topilmadi</p>';
        return;
    }
    let html = '<div class="products-horizontal">';
    filteredProducts.forEach(p => {
        const discountPercent = p.price > 0 && p.discount_price > 0 
            ? Math.round((1 - p.discount_price / p.price) * 100) : 0;
        const productId = String(p.id);
        const colorsHtml = (p.colors && p.colors.length > 0) 
            ? '<div class="product-colors-mini">' + p.colors.slice(0, 5).map(cid => {
                const c = COLORS.find(x => x.id === cid);
                return c ? `<span style="background:${c.hex};" title="${c.name}"></span>` : '';
            }).join('') + '</div>' 
            : '';
        html += `
        <div class="product-card-h" data-id="${productId}">
            <div class="product-image-h">
                <img src="${getImageUrl(p.images && p.images[0])}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/200x200?text=📦'">
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
    });
    html += '</div>';
    container.innerHTML = html;
    
    document.querySelectorAll('.product-card-h').forEach(card => {
        card.addEventListener('click', () => openModal(card.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.buy-btn-h').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(btn.getAttribute('data-buy'));
        });
    });
}

// TELEFON FORMATLASH
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
        phoneInput.addEventListener('input', function(e) {
            this.value = formatPhone(this.value);
        });
        phoneInput.addEventListener('focus', function() {
            if (!this.value) this.value = '+998';
        });
    }
});

// MODAL
function formatDescription(text) {
    if (!text || !text.trim()) return '';
    return text.split('\n').map(l => l.trim()).filter(l => l).map(l => `<p>${l}</p>`).join('');
}

async function openModal(id) {
    currentProduct = products.find(p => String(p.id) === String(id));
    if (!currentProduct) return;
    
    currentImageIndex = 0;
    selectedSize = null;
    selectedColor = null;
    
    // Title
    document.getElementById('modal-title').innerText = currentProduct.title || '';
    
    // Narx
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
    
    // Stock va Sold
    document.getElementById('modal-stock').innerText = currentProduct.stock || 0;
    document.getElementById('modal-sold').innerText = currentProduct.sold || 0;
    
    // Tavsif
    const descEl = document.getElementById('modal-description');
    const formatted = formatDescription(currentProduct.description);
    descEl.innerHTML = formatted;
    descEl.style.display = formatted ? 'block' : 'none';
    
    // RAZMER
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
    
    // RANG
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
    
    // Sana va vaqt
    updateImage();
    startCountdown();
    document.getElementById('order-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // View increment
    try {
        await fetch(`${API_URL}/api/increment_view`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ product_id: String(currentProduct.id) })
        });
    } catch (e) { console.log("View increment xatolik:", e); }
}

function closeModal() {
    document.getElementById('order-modal').classList.remove('active');
    document.body.style.overflow = '';
    if (countdownInterval) clearInterval(countdownInterval);
    // Formani tozalash
    document.getElementById('order-form').reset();
    document.getElementById('order-status').innerText = '';
    document.getElementById('order-status').className = 'status';
}

function updateImage() {
    const img = document.getElementById('modal-image');
    img.src = (currentProduct.images && currentProduct.images.length > 0)
        ? getImageUrl(currentProduct.images[currentImageIndex])
        : "https://via.placeholder.com/400x400?text=No+Image";
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
    
    // Har 24 soatda reset qilish (localStorage orqali)
    const RESET_KEY = 'countdown_reset_' + currentProduct.id;
    const DAY = 24 * 60 * 60 * 1000;
    const THREE_DAYS = 72 * 60 * 60 * 1000;
    const now = Date.now();
    
    let resetTime = parseInt(localStorage.getItem(RESET_KEY) || '0');
    
    // Agar 24 soat o'tgan bo'lsa yoki birinchi marta bo'lsa — reset
    if (!resetTime || (now - resetTime) >= DAY) {
        resetTime = now;
        localStorage.setItem(RESET_KEY, resetTime.toString());
    }
    
    // Countdown tugash vaqti = reset vaqti + 3 kun
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

function submitOrder(event) {
    event.preventDefault();
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();
    const statusEl = document.getElementById('order-status');
    
    // Ism validatsiyasi — kamida 4 harf
    if (!name || name.length < 4) {
        statusEl.innerText = "❌ Ism kamida 4 harfdan iborat bo'lishi kerak!";
        statusEl.className = "status err";
        return;
    }
    
    // Telefon validatsiyasi
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
        statusEl.innerText = "❌ Telefon raqamni to'liq kiriting!";
        statusEl.className = "status err";
        return;
    }
    
    // Razmer tanlash (agar mavjud bo'lsa)
    if (currentProduct.sizes && currentProduct.sizes.length > 0 && !selectedSize) {
        statusEl.innerText = "❌ Iltimos, o'lchamni tanlang!";
        statusEl.className = "status err";
        return;
    }
    
    // Rang tanlash (agar mavjud bo'lsa)
    if (currentProduct.colors && currentProduct.colors.length > 0 && !selectedColor) {
        statusEl.innerText = "❌ Iltimos, rangni tanlang!";
        statusEl.className = "status err";
        return;
    }
    
    // Rang nomini olish
    let colorName = "";
    if (selectedColor) {
        const c = COLORS.find(x => x.id === selectedColor);
        if (c) colorName = c.name;
    }
    
    tg.sendData(JSON.stringify({
        action: 'order',
        product_id: String(currentProduct.id),
        product_title: currentProduct.title,
        price: currentProduct.discount_price,
        customer_name: name,
        customer_phone: phone,
        size: selectedSize || "",
        color: colorName
    }));
    
    statusEl.innerText = "✅ Buyurtmangiz qabul qilindi!";
    statusEl.className = "status ok";
    
    setTimeout(() => {
        tg.showAlert("Buyurtmangiz qabul qilindi!");
        closeModal();
    }, 500);
}

// PROFIL
async function openProfile() {
    document.getElementById('profile-modal').classList.add('active');
    const user = tg.initDataUnsafe?.user;
    if (!user) return;
    
    try {
        const res = await fetch(`${API_URL}/api/register_user`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
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
                document.getElementById('profile-avatar').innerHTML = `<img src="${data.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            }
        }
    } catch (err) { console.log("Profil xatolik:", err); }
}

function closeProfile() {
    document.getElementById('profile-modal').classList.remove('active');
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
            headers: {'Content-Type': 'application/json'},
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

// START
initBanner();
renderCategories();
loadProducts();
startAutoShuffle();
