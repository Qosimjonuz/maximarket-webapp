const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Mahsulotlar ro'yxati (Hozircha statik, keyinchalik API ga ulanadi)
const products = [
    {
        id: 1,
        title: "🤩 BEL VA TANADAGI CHARCHOQLARGA YECHIM! 🔥",
        price: 250000,
        discount_price: 199000,
        discount_end: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // 10 soatdan keyin tugaydi
        images: [
            "https://via.placeholder.com/400x400?text=Rasm+1",
            "https://via.placeholder.com/400x400?text=Rasm+2",
            "https://via.placeholder.com/400x400?text=Rasm+3",
            "https://via.placeholder.com/400x400?text=Rasm+4"
        ]
    },
    {
        id: 2,
        title: "👕 Oversayz yengil kurtka",
        price: 290000,
        discount_price: 250000,
        discount_end: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        images: [
            "https://via.placeholder.com/400x400?text=Kurtka+1",
            "https://via.placeholder.com/400x400?text=Kurtka+2",
            "https://via.placeholder.com/400x400?text=Kurtka+3",
            "https://via.placeholder.com/400x400?text=Kurtka+4"
        ]
    }
];

let currentProduct = null;
let currentImageIndex = 0;
let countdownInterval = null;

// Mahsulotlarni ekranga chiqarish
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '<div class="product-grid">' + products.map(p => `
        <div class="product-card" onclick="openModal(${p.id})">
            <img src="${p.images[0]}" alt="${p.title}">
            <h3>${p.title.substring(0, 30)}...</h3>
            <p class="old-price">${p.price.toLocaleString()} UZS</p>
            <p class="new-price">${p.discount_price.toLocaleString()} UZS</p>
        </div>
    `).join('') + '</div>';
}

// Buyurtma oynasini ochish
function openModal(id) {
    currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;
    
    currentImageIndex = 0;
    document.getElementById('modal-title').innerText = currentProduct.title;
    document.getElementById('modal-price').innerText = currentProduct.discount_price.toLocaleString();
    
    updateImage();
    startCountdown();
    
    document.getElementById('order-modal').classList.add('active');
}

// Oynani yopish
function closeModal() {
    document.getElementById('order-modal').classList.remove('active');
    if (countdownInterval) clearInterval(countdownInterval);
}

// Rasm slayderini yangilash
function updateImage() {
    document.getElementById('modal-image').src = currentProduct.images[currentImageIndex];
    const dots = currentProduct.images.map((_, i) => 
        `<span class="${i === currentImageIndex ? 'active' : ''}"></span>`
    ).join('');
    document.getElementById('slider-dots').innerHTML = dots;
}

// Keyingi/oldingi rasmga o'tish
function slideImage(dir) {
    currentImageIndex = (currentImageIndex + dir + currentProduct.images.length) % currentProduct.images.length;
    updateImage();
}

// Chegirma taymerini ishga tushirish
function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    function tick() {
        const end = new Date(currentProduct.discount_end).getTime();
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

// Buyurtmani yuborish
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

    // Botga yuborish
    tg.sendData(JSON.stringify(orderData));

    tg.showAlert("Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanamiz.");
    closeModal();
}

// Sahifa yuklanganda ishga tushadi
renderProducts();
