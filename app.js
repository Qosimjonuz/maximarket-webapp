const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Hozircha statik mahsulotlar (keyinchalik backend API ga ulanadi)
const products = [
    {
        id: 1,
        name: "Oversayz yengil kurtka",
        price: 250000,
        image: "https://via.placeholder.com/200x200?text=Kurtka"
    },
    {
        id: 2,
        name: "Uzun yengli erkaklar ko'ylagi",
        price: 160000,
        image: "https://via.placeholder.com/200x200?text=Ko'ylak"
    },
    {
        id: 3,
        name: "Yupqa sport kurtka",
        price: 220000,
        image: "https://via.placeholder.com/200x200?text=Sport+kurtka"
    },
    {
        id: 4,
        name: "Klassik shim",
        price: 180000,
        image: "https://via.placeholder.com/200x200?text=Shim"
    }
];

function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '<div class="product-grid">' + 
        products.map(p => `
            <div class="product-card">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>${p.price.toLocaleString()} so'm</p>
                <button onclick="buyProduct(${p.id})">Sotib olish</button>
            </div>
        `).join('') + 
    '</div>';
}

function buyProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    // Telegramga ma'lumot yuborish (botga)
    tg.sendData(JSON.stringify({
        action: 'buy',
        product_id: product.id,
        product_name: product.name,
        price: product.price
    }));
    
    // Yoki shunchaki ogohlantirish
    tg.showAlert(`Siz "${product.name}" ni tanladingiz. Buyurtma berish uchun botga qayting.`);
}

renderProducts();
