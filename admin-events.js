// Admin panel hodisalari: inline onclick/oninput/onchange o'rniga (qat'iy CSP: script-src 'self').
// HTML'da data-click / data-input / data-change = funksiya nomi, data-arg = ixtiyoriy bitta argument.
// Faqat quyidagi ro'yxatdagi nomlar chaqiriladi (HTML'ga begona matn kirib qolsa ham boshqa funksiya ishlamaydi).
(function () {
  'use strict';
  var ALLOWED = {
    clearOrdersHistory: 1, clearOrdersSearch: 1, clearProductsSearch: 1, clearUserSearch: 1,
    closeProductModal: 1, closeSalesModal: 1, deleteFromModal: 1, deselectAllUsers: 1, editFromModal: 1,
    loadUsers: 1, onDatePick: 1, openSalesList: 1, resetSalesStats: 1, searchOrdersDebounced: 1,
    searchProducts: 1, searchUsersDebounced: 1, selectAllVisibleUsers: 1, sendMessage: 1,
    switchOqimFilter: 1, switchOrdersPeriod: 1, switchOrdersSource: 1, switchPage: 1,
    toggleCollapsible: 1, toggleFilter: 1, toggleUsersList: 1, updateUsersCountInfo: 1,
    openProductModal: 1, goToProductPage: 1, goToLowStockPage: 1, goToOrdersPage: 1,
    goToSalesPage: 1, goToUsersPage: 1, loadConnections: 1, connectPlatform: 1, saveTargets: 1, saveInbox: 1, addTeamMember: 1, removeTeamMember: 1,
    showPartner: 1, updatePartnerDots: 1, showAttr: 1
  };
  var NUMERIC = /^-?\d+$/;

  function run(el, attr) {
    var name = el.getAttribute(attr);
    if (!name || !Object.prototype.hasOwnProperty.call(ALLOWED, name)) return;
    var fn = window[name];
    if (typeof fn !== 'function') return;
    if (el.hasAttribute('data-arg')) {
      var arg = el.getAttribute('data-arg');
      fn(NUMERIC.test(arg) ? parseInt(arg, 10) : arg);
    } else {
      fn();
    }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-click]');
    if (!el) return;
    // data-stop: ichidagi tugmalar bosilganda tashqi elementning bosilishi ishlamasin
    var stop = e.target.closest('[data-stop]');
    if (stop && stop !== el && el.contains(stop)) return;
    run(el, 'data-click');
  });
  document.addEventListener('input', function (e) {
    var el = e.target.closest('[data-input]');
    if (el) run(el, 'data-input');
  });
  document.addEventListener('change', function (e) {
    var el = e.target.closest('[data-change]');
    if (el) run(el, 'data-change');
  });
})();
