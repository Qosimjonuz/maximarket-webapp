* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: url("https://i.ibb.co/KpwYv3qV/Screenshot-20260917-104619.jpg") center/cover no-repeat fixed;
    color: #1a1a1a;
    margin: 0;
    padding: 0 0 20px 0;
    min-height: 100vh;
}

body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: rgba(227, 242, 253, 0.55);
    z-index: -1;
}

/* HEADER */
.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px 6px;
    gap: 8px;
}
.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}
.logo-img {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    background: #fff;
}
.brand-text {
    font-size: 19px;
    font-weight: 900;
    letter-spacing: 0.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.brand-maxi {
    color: #e53935;
    -webkit-text-stroke: 0.7px #ffffff;
    text-shadow: 
        1.5px 1.5px 0 #fff,
        -1.5px -1.5px 0 #fff,
        1.5px -1.5px 0 #fff,
        -1.5px 1.5px 0 #fff,
        0 3px 6px rgba(0,0,0,0.35);
}
.brand-market {
    color: #1565c0;
    -webkit-text-stroke: 0.7px #ffffff;
    text-shadow: 
        1.5px 1.5px 0 #fff,
        -1.5px -1.5px 0 #fff,
        1.5px -1.5px 0 #fff,
        -1.5px 1.5px 0 #fff,
        0 3px 6px rgba(0,0,0,0.35);
}
.profile-btn {
    background: #fff;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

/* BANNER */
.banner-carousel {
    position: relative;
    width: calc(100% - 24px);
    margin: 4px 12px 10px;
    height: 130px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 3px 12px rgba(0,0,0,0.2);
    background: #1565c0;
}
.banner-slide {
    width: 100%; height: 100%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: #fff; transition: opacity 0.3s;
    padding: 8px; text-align: center;
    background-size: cover;
    background-position: center;
}
.banner-emoji { font-size: 28px; margin-bottom: 4px; }
.banner-title { font-size: 16px; font-weight: 800; margin-bottom: 2px; text-shadow: 0 2px 6px rgba(0,0,0,0.4); }
.banner-subtitle { font-size: 11px; opacity: 0.95; text-shadow: 0 1px 3px rgba(0,0,0,0.4); }
.banner-nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(255,255,255,0.9); border: none;
    width: 28px; height: 28px; border-radius: 50%;
    font-size: 16px; cursor: pointer; color: #1565c0;
    font-weight: 700; z-index: 3; display: flex;
    align-items: center; justify-content: center;
}
.banner-nav.prev { left: 6px; }
.banner-nav.next { right: 6px; }
.banner-dots { position: absolute; bottom: 6px; left: 0; right: 0; text-align: center; z-index: 3; }
.banner-dots span {
    display: inline-block; width: 6px; height: 6px;
    background: rgba(255,255,255,0.5); border-radius: 50%;
    margin: 0 2px; cursor: pointer;
}
.banner-dots span.active { background: #fff; transform: scale(1.3); }

/* QIDIRUV */
.search-box {
    display: flex; align-items: center;
    background: #fff; border-radius: 10px;
    padding: 3px 12px; margin: 0 12px 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.search-icon { font-size: 14px; margin-right: 7px; color: #888; }
.search-box input {
    flex: 1; border: none; outline: none;
    padding: 8px 0; font-size: 13px; background: transparent;
}
.search-clear {
    background: #e0e0e0; border: none;
    width: 20px; height: 20px; border-radius: 50%;
    cursor: pointer; font-size: 10px;
    display: flex; align-items: center; justify-content: center;
}

/* KATEGORIYALAR */
.categories-scroll {
    display: flex; gap: 8px;
    overflow-x: auto; padding: 0 12px 10px;
    scrollbar-width: none;
}
.categories-scroll::-webkit-scrollbar { display: none; }
.category-btn {
    flex-shrink: 0; background: #fff;
    border: 2px solid transparent; border-radius: 12px;
    padding: 8px 12px; display: flex;
    flex-direction: column; align-items: center;
    gap: 4px; cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    min-width: 70px; transition: all 0.15s;
}
.category-btn.active { border-color: #1565c0; background: #e3f2fd; }
.cat-emoji { font-size: 20px; }
.cat-name { font-size: 10px; font-weight: 600; color: #333; white-space: nowrap; }

/* MAHSULOTLAR */
#products-container { padding: 0 12px; }
.products-horizontal {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 172px;
    grid-template-rows: repeat(3, auto);
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 10px;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.products-horizontal::-webkit-scrollbar { display: none; }

.product-card-h {
    background: #fff; border-radius: 12px;
    padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    cursor: pointer; display: flex;
    flex-direction: column; gap: 6px;
    transition: transform 0.15s;
}
.product-card-h:active { transform: scale(0.97); }
.product-image-h {
    position: relative; width: 100%;
    height: 163px; border-radius: 8px;
    overflow: hidden; background: #f5f5f5;
}
.product-image-h img { width: 100%; height: 100%; object-fit: cover; display: block; }
.discount-badge-h {
    position: absolute; top: 6px; left: 6px;
    background: linear-gradient(135deg, #ff6f00, #e53935);
    color: #fff; font-size: 10px; font-weight: 700;
    padding: 3px 6px; border-radius: 5px;
}
.product-title-h {
    font-size: 12px; font-weight: 600; color: #222;
    line-height: 1.3; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
    overflow: hidden; min-height: 32px;
}
.product-price-h { display: flex; flex-direction: column; gap: 1px; }
.old-price-h { font-size: 10px; color: #999; text-decoration: line-through; }
.new-price-h { font-size: 13px; font-weight: 700; color: #e53935; }

.buy-btn-h {
    width: 100%;
    background: linear-gradient(135deg, #2e7d32, #43a047);
    color: #fff;
    border: none;
    padding: 9px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    margin-top: auto;
    transition: all 0.15s;
    box-shadow: 0 2px 6px rgba(46,125,50,0.3);
}
.buy-btn-h:active {
    background: linear-gradient(135deg, #1b5e20, #2e7d32);
    transform: scale(0.97);
}

.loading {
    text-align: center; padding: 40px 20px;
    color: #333; font-size: 14px;
    font-weight: 600;
}

/* MODAL */
.modal-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.75); z-index: 999;
    justify-content: center; align-items: flex-start;
    overflow-y: auto; padding: 12px;
}
.modal-overlay.active { display: flex; }
.modal-content {
    background: #fff; border-radius: 16px;
    padding: 16px; max-width: 480px;
    width: 100%; position: relative; margin: auto;
}
.modal-close {
    position: absolute; top: 10px; right: 10px;
    background: rgba(0,0,0,0.6); color: #fff;
    border: none; border-radius: 50%;
    width: 34px; height: 34px; font-size: 18px;
    cursor: pointer; z-index: 10;
}
.slider { position: relative; margin-bottom: 14px; }
.slider img {
    width: 100%; height: 300px;
    object-fit: cover; border-radius: 12px; background: #f5f5f5;
}
.slider-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(255,255,255,0.95); border: none;
    width: 40px; height: 40px; border-radius: 50%;
    font-size: 22px; cursor: pointer; color: #1565c0; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
}
.slider-btn.prev { left: 10px; }
.slider-btn.next { right: 10px; }
.slider-dots { text-align: center; margin-top: 8px; }
.slider-dots span {
    display: inline-block; width: 8px; height: 8px;
    background: #ccc; border-radius: 50%; margin: 0 3px;
}
.slider-dots span.active { background: #1565c0; }

#modal-title {
    font-size: 17px; text-align: center;
    margin: 12px 0 6px; color: #1565c0; font-weight: 700;
}
.stock-badge {
    text-align: center; font-size: 12px; font-weight: 600;
    color: #f57c00; background: #fff3e0;
    padding: 6px 10px; border-radius: 8px;
    margin: 0 auto 10px; width: fit-content;
}
.modal-description {
    background: #f8f9fa; border-left: 4px solid #1565c0;
    border-radius: 8px; padding: 12px 14px; margin: 12px 0;
    font-size: 13px; line-height: 1.7; color: #444;
    max-height: 200px; overflow-y: auto;
}
.modal-description p { margin: 0 0 8px; }
.modal-description p:last-child { margin-bottom: 0; }

.aksiya-badge { text-align: center; color: #e53935; font-weight: 700; font-size: 14px; margin: 6px 0; }
.modal-price { text-align: center; font-size: 26px; font-weight: 700; color: #2e7d32; margin: 10px 0; }
.countdown-label { text-align: center; font-size: 13px; margin: 10px 0 6px; color: #555; }
.countdown { display: flex; justify-content: center; gap: 16px; margin-bottom: 16px; }
.countdown div { text-align: center; }
.countdown span { font-size: 28px; font-weight: 700; color: #1565c0; display: block; }
.countdown small { font-size: 10px; color: #888; letter-spacing: 1px; }
.info-label { text-align: center; font-size: 13px; margin: 14px 0 6px; color: #333; }

#order-form label { font-size: 12px; font-weight: 700; display: block; margin: 10px 0 5px; color: #333; }
#order-form input {
    width: 100%; padding: 13px 14px;
    border: 1.5px solid #ddd; border-radius: 10px;
    font-size: 15px; background: #fafafa;
}
.order-btn {
    width: 100%; background: #1565c0; color: #fff;
    border: none; padding: 15px; border-radius: 10px;
    font-size: 16px; font-weight: 700;
    margin-top: 16px; cursor: pointer;
}
.delivery-info {
    text-align: center; font-size: 11px;
    color: #666; margin-top: 14px; padding: 10px;
    background: #f5f5f5; border-radius: 8px; line-height: 1.5;
}

/* PROFIL */
.profile-content { padding-top: 30px; }
.profile-header-icon { text-align: center; margin-bottom: 8px; }
.profile-avatar {
    width: 90px; height: 90px;
    background: linear-gradient(135deg, #1565c0, #42a5f5);
    color: #fff; border-radius: 50%;
    font-size: 45px; display: flex;
    align-items: center; justify-content: center;
    margin: 0 auto;
    box-shadow: 0 4px 14px rgba(21,101,192,0.35);
    overflow: hidden;
}
.profile-number {
    text-align: center; font-size: 16px;
    font-weight: 800; color: #1565c0;
    margin: 8px 0 16px; letter-spacing: 1px;
}
.profile-form { text-align: left; }
.profile-form label {
    display: block; font-size: 12px;
    font-weight: 700; margin: 12px 0 5px; color: #333;
}
.profile-form input {
    width: 100%; padding: 12px 14px;
    border: 1.5px solid #ddd; border-radius: 10px;
    font-size: 15px; background: #fafafa;
    font-family: inherit;
}
.profile-form input[readonly] { background: #f0f0f0; color: #666; cursor: not-allowed; }
.profile-form input[type="file"] { padding: 8px; background: #fff; cursor: pointer; }
.save-btn {
    width: 100%; background: #2e7d32; color: #fff;
    border: none; padding: 14px; border-radius: 10px;
    font-size: 15px; font-weight: 700;
    margin-top: 16px; cursor: pointer;
}
.save-btn:active { background: #1b5e20; }

.status {
    text-align: center; padding: 10px;
    font-size: 13px; margin-top: 10px;
    border-radius: 8px; font-weight: 500;
    display: none;
}
.status.ok, .status.err { display: block; }
.status.ok { background: #e8f5e9; color: #2e7d32; }
.status.err { background: #ffebee; color: #c62828; }

@media (max-width: 360px) {
    .products-horizontal { grid-auto-columns: 155px; }
    .product-image-h { height: 145px; }
    .buy-btn-h { font-size: 12px; padding: 8px; }
    .slider img { height: 240px; }
    .banner-carousel { height: 115px; }
    .brand-text { font-size: 17px; }
}
