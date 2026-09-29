/* ============================================================
 * MaxiMarket Admin — JavaScript
 * Versiya: 2.0
 * Yangilik: Oqim ID (100k.uz integratsiya)
 * ============================================================ */

var API_URL = "https://maximarketbot-production.up.railway.app";
var TOKEN_KEY = "maximarket_admin_token";

// ⭐ Konstantalar
var MAX_CATEGORIES = 2;
var MAX_SIZES = 4;
var MAX_COLORS = 10;
var MAX_IMAGES = 4;
var PER_PAGE = 10;
var USERS_PER_PAGE = 12;
var ORDERS_PER_PAGE = 10;
var LOW_STOCK_PER_PAGE = 10;
var SALES_PER_PAGE = 10;

// ⭐ Global state
var captchaAnswer = 0;
var adminToken = "";
var selectedFiles = [null, null, null, null];
var selectedCategories = [];
var selectedSizes = [];
var selectedColors = [];
var editingProductId = null;
var allProducts = [];
var filteredProducts = [];
var currentPage = 1;
var totalPages = 1;
var searchQuery = "";
var activeFilterCategory = "all";
var activeOqimFilter = "all"; // ⭐ all / has / no

var selectedUsers = [];
var currentUsersPage = 1;
var usersTotalPages = 1;
var userSearchDebounce = null;
var visibleUsers = [];
var usersListOpen = true;

var currentOrdersPeriod = "today";
var currentOrdersSource = "all";
var currentOrdersPage = 1;
var ordersTotalPages = 1;
var ordersSearch = "";
var ordersCustomDate = "";
var ordersSearchDebounce = null;

var currentLowStockPage = 1;
var lowStockTotalPages = 1;

var salesListPeriod = "today";
var salesListPage = 1;
var salesListTotalPages = 1;

var currentModalProductId = null;

// ⭐ Ma'lumotlar
var CATEGORIES = [
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

var SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "Universal"];

var COLORS = [
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


// ==================== XSS HIMOYASI ====================
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ==================== CAPTCHA ====================
function generateCaptcha() {
  var ops = ['+', '-', '×'];
  var op = ops[Math.floor(Math.random() * ops.length)];
  var a, b, ans;
  if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; ans = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * 20) + 5; b = Math.floor(Math.random() * (a - 1)) + 1; ans = a - b; }
  else { a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2; ans = a * b; }
  captchaAnswer = ans;
  document.getElementById('captcha-question').innerText = a + ' ' + op + ' ' + b + ' = ?';
  document.getElementById('captcha-input').value = '';
}


// ==================== COLLAPSIBLE / FILTER ====================
function toggleCollapsible(name) {
  var h = document.querySelector('[onclick="toggleCollapsible(\'' + name + '\')"]');
  var b = document.getElementById(name + '-body');
  if (b) b.classList.toggle('open');
  if (h) h.classList.toggle('open');
}
function toggleFilter() {
  document.getElementById('filter-header').classList.toggle('active');
  document.getElementById('filter-body').classList.toggle('open');
}
function toggleUsersList() {
  usersListOpen = !usersListOpen;
  var c = document.getElementById('users-list-container');
  var btn = document.getElementById('toggle-users-btn');
  if (usersListOpen) { c.style.display = 'block'; btn.innerText = '🔼 Ro\'yxatni yopish'; }
  else { c.style.display = 'none'; btn.innerText = '🔽 Ro\'yxatni ochish'; }
}


// ==================== TOKEN ====================
function saveToken(t) { adminToken = t; localStorage.setItem(TOKEN_KEY, t); }
function loadToken() { var s = localStorage.getItem(TOKEN_KEY); if (s) { adminToken = s; return true; } return false; }
function clearToken() { adminToken = ""; localStorage.removeItem(TOKEN_KEY); }
function handleAuthError() { clearToken(); alert("⚠️ Sessiya muddati tugagan."); showLogin(); }


// ==================== SAHIFALAR ====================
function showLogin() {
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('panel-section').classList.add('hidden');
  document.getElementById('bottom-nav').classList.add('hidden');
  generateCaptcha();
}
function showPanel() {
  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('panel-section').classList.remove('hidden');
  document.getElementById('bottom-nav').classList.remove('hidden');
  renderCategories(); renderSizes(); renderColors(); renderFilterChips();
  loadProducts();
}
function switchPage(page) {
  document.querySelectorAll('.page').forEach(function (el) { el.classList.add('hidden'); });
  document.getElementById('page-' + page).classList.remove('hidden');
  document.querySelectorAll('#bottom-nav button').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-page') === page);
  });
  if (page === 'stats') { loadStats(); loadOrders(); loadUsers(); }
  if (page === 'list') { loadProducts(); loadLowStock(); }
}


// ==================== OQIM FILTER ====================
function switchOqimFilter(filter) {
  activeOqimFilter = filter;
  currentPage = 1;
  document.querySelectorAll('.orders-tab[data-oqim]').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-oqim') === filter);
  });
  applyFilters();
}


// ==================== KATEGORIYA / SIZE / COLOR ====================
function renderCategories() {
  var g = document.getElementById('categories-grid'), h = '';
  CATEGORIES.forEach(function (c) {
    var s = selectedCategories.indexOf(c.id) > -1;
    h += '<label class="chip' + (s ? ' selected' : '') + '" data-cat="' + c.id + '"><input type="checkbox"' + (s ? ' checked' : '') + '><span>' + c.emoji + ' ' + c.name + '</span></label>';
  });
  g.innerHTML = h;
  bindChips(g, '.chip[data-cat]', 'data-cat', selectedCategories, MAX_CATEGORIES, renderCategories);
}
function renderSizes() {
  var g = document.getElementById('sizes-grid'), h = '';
  SIZES.forEach(function (sz) {
    var s = selectedSizes.indexOf(sz) > -1;
    h += '<label class="chip' + (s ? ' selected' : '') + '" data-size="' + sz + '"><input type="checkbox"' + (s ? ' checked' : '') + '><span>' + sz + '</span></label>';
  });
  g.innerHTML = h;
  bindChips(g, '.chip[data-size]', 'data-size', selectedSizes, MAX_SIZES, renderSizes);
}
function renderColors() {
  var g = document.getElementById('colors-grid'), h = '';
  COLORS.forEach(function (c) {
    var s = selectedColors.indexOf(c.id) > -1;
    h += '<div class="color-chip' + (s ? ' selected' : '') + '" data-color="' + c.id + '"><div class="color-circle" style="background:' + c.hex + '"></div><div class="color-name">' + c.name + '</div></div>';
  });
  g.innerHTML = h;
  g.querySelectorAll('.color-chip').forEach(function (el) {
    el.addEventListener('click', function () {
      var v = this.getAttribute('data-color'), i = selectedColors.indexOf(v);
      if (i > -1) selectedColors.splice(i, 1);
      else { if (selectedColors.length >= MAX_COLORS) { alert("Faqat " + MAX_COLORS + " ta rang!"); return; } selectedColors.push(v); }
      renderColors();
    });
  });
}
function bindChips(grid, sel, attr, arr, max, rnd) {
  grid.querySelectorAll(sel).forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var v = this.getAttribute(attr), i = arr.indexOf(v);
      if (i > -1) arr.splice(i, 1);
      else { if (arr.length >= max) { alert("Faqat " + max + " ta!"); return; } arr.push(v); }
      rnd();
    });
  });
}


// ==================== FILTER CHIPS ====================
function renderFilterChips() {
  var c = document.getElementById('filter-chips');
  var h = '<div class="filter-chip' + (activeFilterCategory === 'all' ? ' active' : '') + '" data-filter="all">🌐 Barchasi</div>';
  CATEGORIES.forEach(function (cat) {
    h += '<div class="filter-chip' + (activeFilterCategory === cat.id ? ' active' : '') + '" data-filter="' + cat.id + '">' + cat.emoji + ' ' + cat.name + '</div>';
  });
  c.innerHTML = h;
  c.querySelectorAll('.filter-chip').forEach(function (el) {
    el.addEventListener('click', function () {
      activeFilterCategory = this.getAttribute('data-filter');
      renderFilterChips(); applyFilters();
    });
  });
}


// ==================== RASM SIQISH ====================
function compressImage(file, cb) {
  var r = new FileReader();
  r.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      var cv = document.createElement('canvas'), w = img.width, ht = img.height, MAX = 800;
      if (w > MAX || ht > MAX) {
        if (w > ht) { ht = Math.round(ht * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / ht); ht = MAX; }
      }
      cv.width = w; cv.height = ht;
      cv.getContext('2d').drawImage(img, 0, 0, w, ht);
      cv.toBlob(function (blob) {
        var nf = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
        var cr = new FileReader();
        cr.onload = function (ev) { cb({ file: nf, preview: ev.target.result, compressed: true, newSize: nf.size }); };
        cr.readAsDataURL(nf);
      }, 'image/jpeg', 0.6);
    };
    img.src = e.target.result;
  };
  r.readAsDataURL(file);
}


// ==================== RASM SLOT ====================
function renderImageSlots() {
  var c = document.getElementById('image-preview');
  c.innerHTML = '';
  for (var i = 0; i < MAX_IMAGES; i++) {
    var slot = document.createElement('div');
    slot.className = 'image-slot' + (i === 0 ? ' main-slot' : '');
    slot.setAttribute('data-slot', i);
    var lbl = document.createElement('div');
    lbl.className = 'slot-label';
    lbl.innerText = i === 0 ? '⭐ Asosiy' : (i + 1);
    slot.appendChild(lbl);
    if (selectedFiles[i]) {
      var im = document.createElement('img');
      im.src = selectedFiles[i].preview;
      slot.appendChild(im);
      var rm = document.createElement('button');
      rm.type = 'button'; rm.className = 'remove-btn'; rm.innerText = '✕';
      rm.setAttribute('data-remove', i);
      rm.addEventListener('click', function (e) {
        e.stopPropagation();
        var si = parseInt(this.getAttribute('data-remove'));
        selectedFiles[si] = null;
        renderImageSlots();
      });
      slot.appendChild(rm);
    } else {
      var em = document.createElement('div');
      em.className = 'empty-icon'; em.innerText = '📷';
      slot.appendChild(em);
    }
    slot.addEventListener('click', function (e) {
      if (e.target.classList.contains('remove-btn')) return;
      var si = parseInt(this.getAttribute('data-slot'));
      openFilePicker(si);
    });
    c.appendChild(slot);
  }
}

function openFilePicker(slotIdx) {
  var i = document.createElement('input');
  i.type = 'file'; i.accept = 'image/*';
  i.onchange = function (e) {
    var f = e.target.files[0];
    if (!f) return;
    if (f.size > 15 * 1024 * 1024) { alert("Rasm 15 MB dan oshmasin!"); return; }
    var s = document.getElementById('add-status');
    s.innerText = "⏳ Siqilmoqda..."; s.className = "status ok";
    compressImage(f, function (r) {
      selectedFiles[slotIdx] = r;
      renderImageSlots();
      s.innerText = "✅ Qo'shildi (" + Math.round(r.newSize / 1024) + " KB)";
      s.className = "status ok";
      setTimeout(function () { if (s.innerText.indexOf('✅') === 0) { s.innerText = ''; s.className = ''; } }, 3000);
    });
  };
  i.click();
}


// ==================== IMGBB YUKLASH ====================
async function uploadImageWithRetry(file, maxAttempts) {
  var lastError = "";
  try { await fetch(API_URL + '/api/products', { method: 'GET' }); } catch (e) {}
  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      var fd = new FormData();
      fd.append('image', file);
      fd.append('token', adminToken);
      var controller = new AbortController();
      var tid = setTimeout(function () { controller.abort(); }, 120000);
      var resp = await fetch(API_URL + '/api/upload_image', { method: 'POST', body: fd, signal: controller.signal });
      clearTimeout(tid);
      var data;
      try { data = await resp.json(); } catch (jsonErr) {
        lastError = "Server JSON qaytarmadi";
        if (attempt < maxAttempts) await new Promise(function (r) { setTimeout(r, 3000); });
        continue;
      }
      if (data.success && data.url) { window.lastUploadError = ""; return data.url; }
      lastError = data.error || ("HTTP " + resp.status);
      if (resp.status === 401) { handleAuthError(); window.lastUploadError = "Sessiya tugagan"; return null; }
    } catch (e) { lastError = e.name === 'AbortError' ? "Timeout" : e.message; }
    if (attempt < maxAttempts) await new Promise(function (r) { setTimeout(r, 3000); });
  }
  window.lastUploadError = lastError || "Noma'lum xato";
  return null;
}


// ==================== MAHSULOT SAQLASH ====================
async function saveProduct() {
  var oqim_id = document.getElementById('p-oqim').value.trim();
  var title = document.getElementById('p-title').value.trim();
  var desc = document.getElementById('p-description').value.trim();
  var price = parseInt(document.getElementById('p-price').value) || 0;
  var discount = parseInt(document.getElementById('p-discount').value) || 0;
  var stock = parseInt(document.getElementById('p-stock').value) || 0;
  var s = document.getElementById('add-status');
  var b = document.getElementById('add-btn');

  // ⭐ Validation
  if (!oqim_id) { s.innerText = "❗ Oqim ID majburiy!"; s.className = "status err"; return; }
  if (!title) { s.innerText = "❗ Mahsulot nomi kerak!"; s.className = "status err"; return; }
  if (!price || !discount) { s.innerText = "❗ Narx va chegirma kerak!"; s.className = "status err"; return; }

  var hasImg = false;
  for (var k = 0; k < MAX_IMAGES; k++) {
    if (selectedFiles[k] && selectedFiles[k].file) { hasImg = true; break; }
  }
  if (!hasImg && !editingProductId) { s.innerText = "❗ Kamida 1 ta rasm!"; s.className = "status err"; return; }

  b.disabled = true; b.innerText = 'Yuklanmoqda...'; s.innerText = ''; s.className = '';

  try {
    var urls = [], okCount = 0, failed = [];
    for (var i = 0; i < MAX_IMAGES; i++) {
      var it = selectedFiles[i];
      if (!it) continue;
      if (it.existing && !it.file) { urls.push(it.preview); okCount++; continue; }
      if (it.file) {
        s.innerText = '⏳ ' + (i + 1) + '-rasm yuklanmoqda...';
        s.className = "status ok";
        var u = await uploadImageWithRetry(it.file, 4);
        if (u) { urls.push(u); okCount++; }
        else { failed.push(i + 1); }
      }
    }
    if (okCount === 0) {
      s.innerText = "❌ Rasm yuklanmadi: " + (window.lastUploadError || "Noma'lum");
      s.className = "status err";
      b.disabled = false; b.innerText = '💾 Saqlash';
      return;
    }
    if (failed.length > 0) {
      if (!confirm(failed.length + " ta rasm yuklanmadi. Davom etilsinmi?")) {
        b.disabled = false; b.innerText = '💾 Saqlash';
        s.innerText = ''; s.className = '';
        return;
      }
    }

    s.innerText = "⏳ Saqlanmoqda..."; s.className = "status ok";

    var body = {
      token: adminToken,
      oqim_id: oqim_id,
      title: title,
      description: desc,
      price: price,
      discount_price: discount,
      stock: stock,
      categories: selectedCategories,
      sizes: selectedSizes,
      colors: selectedColors,
      images: urls
    };

    var r, d;
    if (editingProductId) {
      r = await fetch(API_URL + '/api/products/' + editingProductId, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } else {
      r = await fetch(API_URL + '/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    }
    if (r.status === 401) { handleAuthError(); return; }
    d = await r.json();
    if (d.success) {
      s.innerText = (editingProductId ? "✅ Yangilandi!" : "✅ Qo'shildi!");
      s.className = "status ok";
      resetForm();
      loadProducts();
      loadLowStock();
    } else {
      s.innerText = "❌ " + (d.error || "Xatolik");
      s.className = "status err";
    }
  } catch (e) {
    s.innerText = "❌ " + e.message;
    s.className = "status err";
  } finally {
    b.disabled = false;
    b.innerText = '💾 Saqlash';
  }
}

function resetForm() {
  ['p-oqim', 'p-title', 'p-description', 'p-price', 'p-discount', 'p-stock', 'p-images'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  selectedFiles = [null, null, null, null];
  selectedCategories = [];
  selectedSizes = [];
  selectedColors = [];
  editingProductId = null;
  renderImageSlots(); renderCategories(); renderSizes(); renderColors();
  document.getElementById('form-title').innerText = "➕ Yangi mahsulot qo'shish";
  document.getElementById('cancel-btn').classList.add('hidden');
}

function cancelEdit() {
  resetForm();
  document.getElementById('add-status').innerText = "Tahrirlash bekor qilindi";
  document.getElementById('add-status').className = "status ok";
}

function editProduct(id) {
  var p = null;
  for (var i = 0; i < allProducts.length; i++) {
    if (String(allProducts[i].id) === String(id)) { p = allProducts[i]; break; }
  }
  if (!p) return;
  editingProductId = id;
  document.getElementById('p-oqim').value = p.oqim_id || '';
  document.getElementById('p-title').value = p.title || '';
  document.getElementById('p-description').value = p.description || '';
  document.getElementById('p-price').value = p.price || '';
  document.getElementById('p-discount').value = p.discount_price || '';
  document.getElementById('p-stock').value = p.stock || 0;
  selectedCategories = p.categories || [];
  selectedSizes = p.sizes || [];
  selectedColors = p.colors || [];
  selectedFiles = [null, null, null, null];
  var imgs = p.images || [];
  for (var j = 0; j < imgs.length && j < MAX_IMAGES; j++) {
    selectedFiles[j] = { file: null, preview: imgs[j], existing: true };
  }
  renderCategories(); renderSizes(); renderColors(); renderImageSlots();
  document.getElementById('form-title').innerText = "✏️ Tahrirlash";
  document.getElementById('cancel-btn').classList.remove('hidden');
  closeProductModal();
  switchPage('add');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ==================== MAHSULOTLAR RO'YXATI ====================
function searchProducts() {
  searchQuery = document.getElementById('products-search-input').value.trim().toLowerCase();
  document.getElementById('products-search-clear').style.display = searchQuery ? 'flex' : 'none';
  applyFilters();
}
function clearProductsSearch() {
  document.getElementById('products-search-input').value = '';
  searchQuery = '';
  document.getElementById('products-search-clear').style.display = 'none';
  applyFilters();
}

function applyFilters() {
  filteredProducts = allProducts.filter(function (p) {
    // Matn qidiruv
    var ms = !searchQuery ||
      (p.title || '').toLowerCase().includes(searchQuery) ||
      (p.description || '').toLowerCase().includes(searchQuery);
    // Kategoriya
    var mc = activeFilterCategory === 'all' ||
      (p.categories && p.categories.indexOf(activeFilterCategory) > -1);
    // ⭐ Oqim filter
    var mo = true;
    if (activeOqimFilter === 'has') mo = !!p.oqim_id;
    else if (activeOqimFilter === 'no') mo = !p.oqim_id;
    return ms && mc && mo;
  });
  totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;
  document.getElementById('filtered-count').innerText = filteredProducts.length;
  document.getElementById('total-count').innerText = allProducts.length;
  renderProductsPage();
}


// ==================== PAGINATION RENDER ====================
function renderPagination(containerId, current, total, callbackName) {
  var c = document.getElementById(containerId);
  if (!c) return;
  if (total <= 1) { c.innerHTML = ''; return; }
  var h = '';
  if (current > 1) h += '<button onclick="' + callbackName + '(' + (current - 1) + ')">‹</button>';
  var start = Math.max(1, current - 2);
  var end = Math.min(total, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  for (var i = start; i <= end; i++) {
    h += '<button class="' + (i === current ? 'active' : '') + '" onclick="' + callbackName + '(' + i + ')">' + i + '</button>';
  }
  if (current < total) h += '<button onclick="' + callbackName + '(' + (current + 1) + ')">›</button>';
  c.innerHTML = h;
}


// ==================== MAHSULOTLAR SAHIFASI ====================
function renderProductsPage() {
  var l = document.getElementById('products-list');
  if (filteredProducts.length === 0) {
    l.innerHTML = '<div class="empty-result">🔍 Mahsulot topilmadi</div>';
    renderPagination('products-pagination', 1, 1, 'goToProductPage');
    return;
  }
  var s = (currentPage - 1) * PER_PAGE;
  var e = Math.min(s + PER_PAGE, filteredProducts.length);
  var pp = filteredProducts.slice(s, e);
  var h = '';

  pp.forEach(function (p, idx) {
    var globalNum = s + idx + 1;
    var sz = (p.sizes || []).join(', ');
    var ch = '';
    if (p.colors && p.colors.length > 0) {
      ch = '<div class="product-colors">';
      p.colors.forEach(function (cid) {
        var c = COLORS.find(function (x) { return x.id === cid; });
        if (c) ch += '<span style="background:' + c.hex + '" title="' + c.name + '"></span>';
      });
      ch += '</div>';
    }
    var stockColor = p.stock <= 10 ? '#e53935' : '#2e7d32';

    // ⭐ Oqim status fishka
    var oqimBadge = p.oqim_id
      ? '<div class="oqim-badge has">✅ Oqim: ' + escapeHtml(p.oqim_id) + '</div>'
      : '<div class="oqim-badge no">❌ Oqim yo\'q</div>';

    var itemClass = p.oqim_id ? 'has-oqim' : 'no-oqim';

    h += '<div class="product-item ' + itemClass + '" onclick="openProductModal(\'' + p.id + '\')">';
    h += '<div class="product-item-info">';
    h += '<b>' + (globalNum) + '. ' + escapeHtml(p.title || '') + '</b>';
    h += '<small>💰 ' + (p.discount_price || 0).toLocaleString() + " so'm | <span style='color:" + stockColor + ";font-weight:700'>📦 " + (p.stock || 0) + '</span> | 👁 ' + (p.views || 0) + ' | ✅ ' + (p.sold || 0) + '</small>';
    if (sz) h += '<small>📏 ' + escapeHtml(sz) + '</small>';
    h += ch;
    h += oqimBadge;
    h += '</div>';
    h += '<div class="btn-row" onclick="event.stopPropagation()">';
    h += '<button class="success small" data-edit="' + p.id + '">✏️</button>';
    h += '<button class="danger small" data-del="' + p.id + '">🗑</button>';
    h += '</div></div>';
  });
  l.innerHTML = h;

  l.querySelectorAll('[data-edit]').forEach(function (b) {
    b.addEventListener('click', function () { editProduct(this.getAttribute('data-edit')); });
  });
  l.querySelectorAll('[data-del]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (confirm("O'chirishni tasdiqlaysizmi?")) deleteProduct(this.getAttribute('data-del'));
    });
  });

  renderPagination('products-pagination', currentPage, totalPages, 'goToProductPage');
}

function goToProductPage(p) {
  currentPage = p;
  renderProductsPage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadProducts() {
  var l = document.getElementById('products-list');
  l.innerHTML = '⏳ Yuklanmoqda...';
  fetch(API_URL + '/api/products').then(function (r) { return r.json(); }).then(function (d) {
    allProducts = d.products || [];
    filteredProducts = allProducts.slice();
    totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
    currentPage = 1;
    document.getElementById('total-count').innerText = allProducts.length;
    document.getElementById('filtered-count').innerText = filteredProducts.length;
    renderProductsPage();
  }).catch(function (e) {
    l.innerHTML = '<p style="color:#c62828">Xatolik: ' + e.message + '</p>';
  });
}

function deleteProduct(id) {
  if (!confirm("Mahsulotni o'chirishni tasdiqlaysizmi?")) return;
  fetch(API_URL + '/api/products/' + id, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: adminToken })
  })
    .then(function (r) { if (r.status === 401) { handleAuthError(); return; } return r.json(); })
    .then(function (d) {
      if (d && d.success) { loadProducts(); loadLowStock(); }
      else if (d) alert("Xatolik: " + (d.error || ""));
    })
    .catch(function (e) { alert("Xatolik: " + e.message); });
}


// ==================== KAM QOLGAN ====================
async function loadLowStock() {
  var section = document.getElementById('low-stock-section');
  var list = document.getElementById('low-stock-list');
  try {
    var r = await fetch(API_URL + '/api/products/low-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken, page: currentLowStockPage, per_page: LOW_STOCK_PER_PAGE })
    });
    if (r.status === 401) { handleAuthError(); return; }
    var d = await r.json();
    if (!d.success || d.total === 0) { section.style.display = 'none'; return; }
    section.style.display = 'block';
    lowStockTotalPages = d.total_pages || 1;
    var s = (currentLowStockPage - 1) * LOW_STOCK_PER_PAGE;
    var h = '';
    d.products.forEach(function (p, idx) {
      var num = s + idx + 1;
      h += '<div class="low-stock-item" onclick="openProductModal(\'' + p.id + '\')">';
      h += '<div class="low-stock-item-info">';
      h += '<div class="low-stock-item-title">' + num + '. ' + escapeHtml(p.title || '') + '</div>';
      h += '<div class="low-stock-item-stock">📦 ' + p.stock + ' dona</div>';
      h += '</div></div>';
    });
    list.innerHTML = h;
    renderPagination('low-stock-pagination', currentLowStockPage, lowStockTotalPages, 'goToLowStockPage');
  } catch (e) {
    section.style.display = 'none';
  }
}
function goToLowStockPage(p) {
  currentLowStockPage = p;
  loadLowStock();
  window.scrollTo({ top: document.getElementById('low-stock-section').offsetTop - 20, behavior: 'smooth' });
}


// ==================== MODAL ====================
function openProductModal(id) {
  var p = null;
  for (var i = 0; i < allProducts.length; i++) {
    if (String(allProducts[i].id) === String(id)) { p = allProducts[i]; break; }
  }
  if (!p) { alert("Mahsulot topilmadi"); return; }

  currentModalProductId = id;

  document.getElementById('pm-image').src = (p.images && p.images[0]) || 'https://via.placeholder.com/400x300?text=📦';
  document.getElementById('pm-title').innerText = p.title || '';

  // ⭐ Oqim ID
  var pmOqim = document.getElementById('pm-oqim');
  if (p.oqim_id) {
    pmOqim.innerText = '✅ ' + p.oqim_id;
    pmOqim.className = 'product-modal-info-value has-oqim';
  } else {
    pmOqim.innerText = '❌ Yo\'q';
    pmOqim.className = 'product-modal-info-value no-oqim';
  }

  document.getElementById('pm-price').innerText = (p.discount_price || 0).toLocaleString() + " so'm";
  document.getElementById('pm-stock').innerText = (p.stock || 0) + ' dona';
  document.getElementById('pm-sold').innerText = (p.sold || 0) + ' dona';
  document.getElementById('pm-views').innerText = (p.views || 0) + ' marta';
  document.getElementById('pm-desc').innerText = p.description || "Tavsif yo'q";

  var colH = '';
  if (p.colors && p.colors.length > 0) {
    colH = '<div class="product-modal-info"><span class="product-modal-info-label">🎨 Ranglar:</span></div><div class="product-modal-colors">';
    p.colors.forEach(function (cid) {
      var c = COLORS.find(function (x) { return x.id === cid; });
      if (c) colH += '<span style="background:' + c.hex + '" title="' + c.name + '"></span>';
    });
    colH += '</div>';
  }
  document.getElementById('pm-colors').innerHTML = colH;

  var szH = '';
  if (p.sizes && p.sizes.length > 0) {
    szH = '<div class="product-modal-info"><span class="product-modal-info-label">📏 O\'lchamlar:</span></div><div class="product-modal-sizes">';
    p.sizes.forEach(function (sz) { szH += '<span>' + escapeHtml(sz) + '</span>'; });
    szH += '</div>';
  }
  document.getElementById('pm-sizes').innerHTML = szH;

  document.getElementById('product-modal').classList.add('active');
}
function closeProductModal() {
  document.getElementById('product-modal').classList.remove('active');
  currentModalProductId = null;
}
function editFromModal() {
  if (currentModalProductId) { var id = currentModalProductId; closeProductModal(); editProduct(id); }
}
function deleteFromModal() {
  if (currentModalProductId) { var id = currentModalProductId; closeProductModal(); deleteProduct(id); }
}


// ==================== STATS ====================
async function loadStats() {
  try {
    var r = await fetch(API_URL + '/api/stats/sales', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken })
    });
    if (r.status === 401) { handleAuthError(); return; }
    var d = await r.json();
    if (d.success) {
      if (d.stats_start) {
        try {
          var sd = new Date(d.stats_start + 'Z');
          document.getElementById('stats-start-date').innerText = sd.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (e) {}
      }
      document.getElementById('s-today-sum').innerText = (d.today.total || 0).toLocaleString();
      document.getElementById('s-today-count').innerText = (d.today.count || 0) + ' buyurtma';
      document.getElementById('s-week-sum').innerText = (d.week.total || 0).toLocaleString();
      document.getElementById('s-week-count').innerText = (d.week.count || 0) + ' buyurtma';
      document.getElementById('s-month-sum').innerText = (d.month.total || 0).toLocaleString();
      document.getElementById('s-month-count').innerText = (d.month.count || 0) + ' buyurtma';
      document.getElementById('s-year-sum').innerText = (d.year.total || 0).toLocaleString();
      document.getElementById('s-year-count').innerText = (d.year.count || 0) + ' buyurtma';
      document.getElementById('s-all-sum').innerText = (d.all_time.total || 0).toLocaleString();
      document.getElementById('s-all-count').innerText = (d.all_time.count || 0) + ' buyurtma';
    }
  } catch (e) {}

  try {
    var r2 = await fetch(API_URL + '/api/stats/users', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken })
    });
    var d2 = await r2.json();
    if (d2.success) {
      document.getElementById('u-today').innerText = d2.today || 0;
      document.getElementById('u-week').innerText = d2.week || 0;
      document.getElementById('u-month').innerText = d2.month || 0;
      document.getElementById('u-year').innerText = d2.year || 0;
      document.getElementById('u-total').innerText = d2.total || 0;
    }
  } catch (e) {}

  try {
    var r3 = await fetch(API_URL + '/api/stats/visits', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken })
    });
    var d3 = await r3.json();
    if (d3.success) {
      document.getElementById('v-today').innerText = d3.today || 0;
      document.getElementById('v-today-unique').innerText = (d3.today_unique || 0) + ' unikal';
      document.getElementById('v-week').innerText = d3.week || 0;
      document.getElementById('v-month').innerText = d3.month || 0;
      document.getElementById('v-year').innerText = d3.year || 0;
      document.getElementById('v-webapp').innerText = d3.today_webapp || 0;
      document.getElementById('v-browser').innerText = d3.today_browser || 0;
    }
  } catch (e) {}
}


// ==================== QAYTA BOSHLASH ====================
async function resetSalesStats() {
  if (!confirm("Sotuv statistikasi bugundan qayta boshlanadi.\n\nBugun, Hafta, Oy, Yil va Jami — barcha raqamlar 0 dan boshlanadi.\n\nDavom etilsinmi?")) return;
  try {
    var r = await fetch(API_URL + '/api/stats/reset-sales', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken })
    });
    if (r.status === 401) { handleAuthError(); return; }
    var d = await r.json();
    if (d.success) { alert("✅ Sotuv statistikasi bugundan qayta boshlandi!"); loadStats(); }
    else { alert("Xatolik: " + (d.error || "")); }
  } catch (e) { alert("Xatolik: " + e.message); }
}

async function clearOrdersHistory() {
  if (!confirm("⚠️ ZAKASLAR RO'YXATI TOZALANADI!\n\nBarcha zakaslar ro'yxatdan o'chiriladi.\nSotuv statistikasi saqlanadi.\n\nDavom etilsinmi?")) return;
  if (!confirm("Oxirgi tasdiq: Rostdan ham barcha zakaslar ro'yxatini tozalaysizmi?")) return;
  try {
    var r = await fetch(API_URL + '/api/orders/clear', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken })
    });
    if (r.status === 401) { handleAuthError(); return; }
    var d = await r.json();
    if (d.success) { alert("✅ Zakaslar ro'yxati tozalandi!"); loadOrders(); }
    else { alert("Xatolik: " + (d.error || "")); }
  } catch (e) { alert("Xatolik: " + e.message); }
}


// ==================== ZAKASLAR ====================
function switchOrdersPeriod(period) {
  currentOrdersPeriod = period;
  currentOrdersPage = 1;
  document.querySelectorAll('.orders-tab[data-period]').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-period') === period);
  });
  document.getElementById('orders-date-picker').value = '';
  ordersCustomDate = '';
  loadOrders();
}
function switchOrdersSource(source) {
  currentOrdersSource = source;
  currentOrdersPage = 1;
  document.querySelectorAll('.orders-tab[data-source]').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-source') === source);
  });
  loadOrders();
}
function onDatePick() {
  var v = document.getElementById('orders-date-picker').value;
  if (v) {
    ordersCustomDate = v;
    currentOrdersPeriod = 'custom';
    currentOrdersPage = 1;
    document.querySelectorAll('.orders-tab[data-period]').forEach(function (b) { b.classList.remove('active'); });
    loadOrders();
  }
}
function searchOrdersDebounced() {
  var v = document.getElementById('orders-search-input').value;
  document.getElementById('orders-search-clear').style.display = v.trim() ? 'flex' : 'none';
  if (ordersSearchDebounce) clearTimeout(ordersSearchDebounce);
  ordersSearchDebounce = setTimeout(function () {
    ordersSearch = v.trim().toLowerCase();
    currentOrdersPage = 1;
    loadOrders();
  }, 400);
}
function clearOrdersSearch() {
  document.getElementById('orders-search-input').value = '';
  document.getElementById('orders-search-clear').style.display = 'none';
  ordersSearch = '';
  currentOrdersPage = 1;
  loadOrders();
}
async function loadOrders() {
  var l = document.getElementById('orders-list');
  l.innerHTML = '⏳ Yuklanmoqda...';
  try {
    var body = {
      token: adminToken,
      period: currentOrdersPeriod,
      source: currentOrdersSource,
      search: ordersSearch,
      page: currentOrdersPage,
      per_page: ORDERS_PER_PAGE
    };
    if (currentOrdersPeriod === 'custom' && ordersCustomDate) body.date = ordersCustomDate;

    var r = await fetch(API_URL + '/api/orders/list', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (r.status === 401) { handleAuthError(); return; }
    var d = await r.json();
    if (!d.success) { l.innerHTML = '<div class="empty-result">Xatolik</div>'; return; }

    ordersTotalPages = d.total_pages || 1;
    document.getElementById('orders-total-sum').innerText = (d.total_sum || 0).toLocaleString() + " so'm";
    document.getElementById('orders-total-count').innerText = (d.total || 0) + ' ta';

    var orders = d.orders || [];
    if (orders.length === 0) {
      l.innerHTML = '<div class="empty-result">🔍 Zakas topilmadi</div>';
      renderPagination('orders-pagination', 1, 1, 'goToOrdersPage');
      return;
    }
    var h = '';
    orders.forEach(function (o) {
      var source = o.source || 'browser';
      var sourceLabel = source === 'telegram' ? '🤖 Bot' : '🌐 Brauzer';
      var sourceClass = source === 'telegram' ? 'bot' : 'browser';
      var dt = '';
      try {
        var dd = new Date(o.created_at);
        dt = dd.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch (e) { dt = o.created_at || ''; }

      h += '<div class="order-card ' + sourceClass + '">';
      h += '<div class="order-card-head">';
      h += '<div class="order-card-title">' + escapeHtml(o.product_title || '') + '</div>';
      h += '<div class="order-card-source ' + sourceClass + '">' + sourceLabel + '</div>';
      h += '</div>';
      h += '<div class="order-card-row">👤 <b>' + escapeHtml(o.customer_name || '') + '</b></div>';
      h += '<div class="order-card-row">📞 ' + escapeHtml(o.customer_phone || '') + '</div>';
      if (o.size) h += '<div class="order-card-row">📏 ' + escapeHtml(o.size) + '</div>';
      if (o.color) h += '<div class="order-card-row">🎨 ' + escapeHtml(o.color) + '</div>';
      h += '<div class="order-card-row">🕐 ' + dt + '</div>';
      h += '<div class="order-card-price">💰 ' + (o.price || 0).toLocaleString() + ' so\'m</div>';
      h += '</div>';
    });
    l.innerHTML = h;
    renderPagination('orders-pagination', currentOrdersPage, ordersTotalPages, 'goToOrdersPage');
  } catch (e) {
    l.innerHTML = '<div class="empty-result">Xatolik: ' + e.message + '</div>';
  }
}
function goToOrdersPage(p) {
  currentOrdersPage = p;
  loadOrders();
  window.scrollTo({ top: document.getElementById('orders-list').offsetTop - 100, behavior: 'smooth' });
}


// ==================== SOTUV RO'YXATI ====================
function openSalesList(period) {
  salesListPeriod = period;
  salesListPage = 1;
  var titles = { today: 'Bugun', week: 'Bu hafta', month: 'Bu oy', year: 'Bu yil' };
  document.getElementById('sm-title').innerText = '📊 ' + (titles[period] || period) + ' sotilgan mahsulotlar';
  document.getElementById('sales-list-modal').classList.add('active');
  loadSalesList();
}
function closeSalesModal() {
  document.getElementById('sales-list-modal').classList.remove('active');
}
async function loadSalesList() {
  var l = document.getElementById('sm-list');
  l.innerHTML = '⏳ Yuklanmoqda...';
  try {
    var r = await fetch(API_URL + '/api/stats/sales-list', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken, period: salesListPeriod, page: salesListPage, per_page: SALES_PER_PAGE })
    });
    if (r.status === 401) { handleAuthError(); return; }
    var d = await r.json();
    if (!d.success) { l.innerHTML = '<div class="empty-result">Xatolik</div>'; return; }
    salesListTotalPages = d.total_pages || 1;
    var products = d.products || [];
    if (products.length === 0) {
      l.innerHTML = '<div class="empty-result">📭 Bu davrda sotuv yo\'q</div>';
      renderPagination('sm-pagination', 1, 1, 'goToSalesPage');
      return;
    }
    var s = (salesListPage - 1) * SALES_PER_PAGE;
    var h = '';
    products.forEach(function (p, idx) {
      var num = s + idx + 1;
      h += '<div class="sales-list-item">';
      h += '<div class="sales-list-num">' + num + '</div>';
      h += '<div class="sales-list-body">';
      h += '<div class="sales-list-title">' + escapeHtml(p.title || '') + '</div>';
      h += '<div class="sales-list-detail">📦 <b>' + p.count + '</b> ta sotilgan · o\'rtacha <b>' + (p.avg_price || 0).toLocaleString() + '</b> so\'mdan</div>';
      h += '</div>';
      h += '<div class="sales-list-total">' + (p.total_price || 0).toLocaleString() + '<br><small style="font-size:10px;color:#666">so\'m</small></div>';
      h += '</div>';
    });
    l.innerHTML = h;
    renderPagination('sm-pagination', salesListPage, salesListTotalPages, 'goToSalesPage');
  } catch (e) {
    l.innerHTML = '<div class="empty-result">Xatolik: ' + e.message + '</div>';
  }
}
function goToSalesPage(p) {
  salesListPage = p;
  loadSalesList();
}


// ==================== USERS ====================
function searchUsersDebounced() {
  var v = document.getElementById('user-search-input').value;
  document.getElementById('user-search-clear').style.display = v.trim() ? 'flex' : 'none';
  if (userSearchDebounce) clearTimeout(userSearchDebounce);
  userSearchDebounce = setTimeout(function () { currentUsersPage = 1; loadUsers(); }, 400);
}
function clearUserSearch() {
  document.getElementById('user-search-input').value = '';
  document.getElementById('user-search-clear').style.display = 'none';
  currentUsersPage = 1;
  loadUsers();
}
async function loadUsers() {
  var c = document.getElementById('users-list-container');
  c.innerHTML = '⏳ Yuklanmoqda...';
  c.style.display = usersListOpen ? 'block' : 'none';
  var search = document.getElementById('user-search-input').value.trim();
  try {
    var r = await fetch(API_URL + '/api/users/list', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken, search: search, page: currentUsersPage, per_page: USERS_PER_PAGE })
    });
    if (r.status === 401) { handleAuthError(); return; }
    var d = await r.json();
    if (!d.success) { c.innerHTML = '<div class="empty-result">Xatolik</div>'; return; }
    var users = d.users || [];
    visibleUsers = users;
    usersTotalPages = d.total_pages || 1;
    if (users.length === 0) {
      c.innerHTML = '<div class="empty-result">' + (search ? '🔍 Topilmadi' : 'Obunachilar yo\'q') + '</div>';
      renderPagination('users-pagination', 1, 1, 'goToUsersPage');
      updateUsersCountInfo();
      return;
    }
    var h = '';
    users.forEach(function (u) {
      var nm = escapeHtml(u.full_name || u.username || ('ID: ' + u.user_id));
      var ph = u.phone ? escapeHtml(u.phone) : '';
      var un = u.username ? escapeHtml(u.username) : '';
      var checked = selectedUsers.indexOf(u.user_id) > -1 ? 'checked' : '';
      h += '<div class="user-item"><input type="checkbox" class="user-check" value="' + u.user_id + '" ' + checked + '><div class="user-info"><b>' + nm + '</b><small>' + u.user_id + (ph ? ' • ' + ph : '') + (un ? ' • @' + un : '') + '</small></div></div>';
    });
    c.innerHTML = h;
    c.querySelectorAll('.user-check').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = parseInt(this.value);
        if (this.checked) { if (selectedUsers.indexOf(id) === -1) selectedUsers.push(id); }
        else { selectedUsers = selectedUsers.filter(function (x) { return x !== id; }); }
        updateUsersCountInfo();
      });
    });
    renderPagination('users-pagination', currentUsersPage, usersTotalPages, 'goToUsersPage');
    updateUsersCountInfo();
  } catch (e) { c.innerHTML = '<div class="empty-result">Xatolik: ' + e.message + '</div>'; }
}
function goToUsersPage(p) { currentUsersPage = p; loadUsers(); }
function updateUsersCountInfo() { document.getElementById('users-count-info').innerText = selectedUsers.length + ' ta obunachi tanlangan'; }
function selectAllVisibleUsers() {
  visibleUsers.forEach(function (u) {
    if (selectedUsers.indexOf(u.user_id) === -1) selectedUsers.push(u.user_id);
  });
  document.querySelectorAll('.user-check').forEach(function (cb) { cb.checked = true; });
  updateUsersCountInfo();
  alert("Ko'ringan " + visibleUsers.length + " ta tanlandi. Jami: " + selectedUsers.length);
}
function deselectAllUsers() {
  document.querySelectorAll('.user-check').forEach(function (cb) { cb.checked = false; });
  selectedUsers = [];
  updateUsersCountInfo();
}
async function sendMessage() {
  var msg = document.getElementById('broadcast-message').value.trim();
  var s = document.getElementById('send-status'), b = document.getElementById('send-message-btn');
  if (!msg) { s.innerText = "❌ Xabar matnini kiriting!"; s.className = "status err"; return; }
  if (selectedUsers.length === 0) { s.innerText = "❌ Kamida 1 ta tanlang!"; s.className = "status err"; return; }
  if (!confirm(selectedUsers.length + " ta foydalanuvchiga xabar yuborilsinmi?")) return;
  b.disabled = true; b.innerText = 'Yuborilmoqda...'; s.innerText = ''; s.className = '';
  try {
    var r = await fetch(API_URL + '/api/send_message', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: adminToken, user_ids: selectedUsers, message: msg })
    });
    if (r.status === 401) { handleAuthError(); return; }
    var d = await r.json();
    if (d.success) {
      s.innerText = "✅ Yuborildi: " + d.sent + ", ❌ Xato: " + d.failed;
      s.className = "status ok";
      document.getElementById('broadcast-message').value = '';
    } else {
      s.innerText = "❌ " + (d.error || "Xatolik");
      s.className = "status err";
    }
  } catch (e) {
    s.innerText = "❌ " + e.message;
    s.className = "status err";
  } finally {
    b.disabled = false;
    b.innerText = '📤 Tanlanganlarga yuborish';
  }
}


// ==================== START ====================
window.addEventListener('DOMContentLoaded', function () {
  // Login
  document.getElementById('eye-btn').addEventListener('click', function () {
    var i = document.getElementById('password-input');
    if (i.type === 'password') { i.type = 'text'; this.innerText = '🙈'; }
    else { i.type = 'password'; this.innerText = '👁'; }
  });

  document.getElementById('login-btn').addEventListener('click', async function () {
    var pwd = document.getElementById('password-input').value.trim();
    var cap = document.getElementById('captcha-input').value.trim();
    var s = document.getElementById('login-status'), b = this;
    if (!pwd) { s.innerText = "❌ Parolni kiriting!"; s.className = "status err"; return; }
    if (!cap) { s.innerText = "❌ Captcha javobini kiriting!"; s.className = "status err"; return; }
    if (parseInt(cap) !== captchaAnswer) { s.innerText = "❌ Captcha xato!"; s.className = "status err"; generateCaptcha(); return; }
    b.disabled = true; b.innerText = 'Tekshirilmoqda...'; s.innerText = ''; s.className = '';
    try {
      var r = await fetch(API_URL + '/api/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
      });
      var d = await r.json();
      if (d.success && d.token) {
        saveToken(d.token);
        document.getElementById('password-input').value = '';
        document.getElementById('password-input').type = 'password';
        document.getElementById('eye-btn').innerText = '👁';
        s.innerText = ''; s.className = '';
        showPanel();
      } else {
        s.innerText = "❌ " + (d.error || "Xatolik");
        s.className = "status err";
        generateCaptcha();
      }
    } catch (e) {
      s.innerText = "❌ " + e.message;
      s.className = "status err";
      generateCaptcha();
    } finally {
      b.disabled = false;
      b.innerText = 'Kirish';
    }
  });

  document.getElementById('logout-btn').addEventListener('click', async function () {
    try {
      await fetch(API_URL + '/api/logout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: adminToken })
      });
    } catch (e) {}
    clearToken();
    selectedFiles = [null, null, null, null];
    selectedCategories = [];
    selectedSizes = [];
    selectedColors = [];
    editingProductId = null;
    document.getElementById('password-input').value = '';
    showLogin();
  });

  // Add product
  document.getElementById('add-btn').addEventListener('click', saveProduct);
  document.getElementById('cancel-btn').addEventListener('click', cancelEdit);
  document.getElementById('refresh-btn').addEventListener('click', function () { loadProducts(); loadLowStock(); });

  // File input
  document.getElementById('p-images').addEventListener('change', function (e) {
    var files = Array.from(e.target.files).slice(0, MAX_IMAGES);
    var s = document.getElementById('add-status'), p = 0, t = files.length;
    if (t === 0) return;
    s.innerText = "⏳ " + t + " rasm siqilmoqda..."; s.className = "status ok";
    files.forEach(function (f) {
      if (f.size > 15 * 1024 * 1024) { p++; check(); return; }
      compressImage(f, function (r) {
        for (var j = 0; j < MAX_IMAGES; j++) {
          if (!selectedFiles[j]) { selectedFiles[j] = r; break; }
        }
        renderImageSlots();
        p++; check();
      });
    });
    function check() {
      if (p === t) {
        s.innerText = "✅ " + t + " rasm qo'shildi";
        s.className = "status ok";
        setTimeout(function () { if (s.innerText.indexOf('✅') === 0) { s.innerText = ''; s.className = ''; } }, 3000);
      }
    }
    this.value = '';
  });

  // Init
  renderImageSlots();
  generateCaptcha();
  if (loadToken()) showPanel();
});
