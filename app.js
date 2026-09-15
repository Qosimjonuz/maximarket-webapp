const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const API_URL = "https://maximarketbot-production.up.railway.app";

let products = [];
let currentProduct = null;
let currentImageIndex = 0;
let countdownInterval = null;

async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) {
        console.error("products-container topilmadi!");
        return;
    }
    container.innerHTML = '<p style="text-align:center;padding:20px;">⏳ Yuklanmoqda...</p>';
    
    try {
        console.log("API so'rov yuborilmoqda...");
        const response = await fetch(`${API_URL}/api/products`);
        console.log("API javob:", response.status);
        const data = await response.json();
        console.log("Ma'lumotlar:", data);
        products = data.products || [];
        
        if (products.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:20px;">Hozircha mahsulotlar yo\'q</p>';
            return;
        }
        
        renderProducts();
    } catch (error) {
        console.error("Xatolik:", error);
        container.innerHTML = '<p style="text-align:center;padding:20px;color:red;">❌ Yuklashda xatolik: ' + error.message + '</p>';
    }
}

function getImageUrl(url) {
    if (!url) return "https://via.placeholder.com/400x400?text=No+Image";
    // Telegram post URL bo'lsa, to'g'ridan-to'g'ri ishlatib bo'lmaydi
    // Lekin URL http bilan boshlansa, o'sha holicha qaytaramiz
    if (url.startsWith('http')) return url;
    return `${API_URL}/api/image/${url}`;
}

function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = '<div class="product-grid">' + products.map(p => {
        const discountPercent = p.price > 0 && p.discount_price > 0 
            ? Math.round((1 - p.discount_price / p.price) * 100) 
            : 0;
        return `
        <div class="product-card-wrapper">
            <div class="product-card" onclick="openModal(${p.id})">
                ${discountPercent > 0 ? `<div class="discount-badge">-${discountPercent}%</div>` : ''}
                <img src="${getImageUrl(p.images && p.images[0])}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x400?text=Rasm+yoq'">
                <div class="card-body">
                    <h3>${p.title || ''}</h3>
                    ${p.price > p.discount_price ? `<p class="old-price">${p.price.toLocaleString()} UZS</p>` : ''}
                    <p class="new-price">${(p.discount_price || 0).toLocaleString()} UZS</p>
                </div>
            </div>
        </div>
        `;
    }).join('') + '</div>';
}

function openModal(id) {
    currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;
    
    currentImageIndex = 0;
    document.getElementById('modal-title').innerText = currentProduct.title || '';
    document.getElementById('modal-price').innerText = (currentProduct.discount_price || 0).toLocaleString();
    
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

loadProducts();
