function submitOrder(event) {
    event.preventDefault();
    const name = document.getElementById('order-name').value.trim();
    const phone = document.getElementById('order-phone').value.trim();

    if (!name || !phone || phone.length < 10) {
        tg.showAlert("Iltimos, ism va telefon raqamni to'g'ri kiriting!");
        return;
    }

    // Botga yuboriladigan ma'lumotlar
    const orderData = {
        action: 'order',
        product_id: currentProduct.id,
        product_title: currentProduct.title,
        price: currentProduct.discount_price,
        customer_name: name,
        customer_phone: phone
    };

    // Ma'lumotni Telegram botga yuborish
    tg.sendData(JSON.stringify(orderData));

    tg.showAlert("Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanamiz.");
    closeModal();
}
