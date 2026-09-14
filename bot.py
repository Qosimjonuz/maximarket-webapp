import json
from aiogram import F
from aiogram.types import Message

# ... boshqa importlar ...

@dp.message(F.web_app_data)  # Web App'dan kelgan ma'lumotlarni ushlaydi
async def handle_web_app_order(message: Message):
    # 1. Kelgan JSON ma'lumotni o'qish
    try:
        data = json.loads(message.web_app_data.data)
    except json.JSONDecodeError:
        await message.answer("Buyurtma ma'lumotlarida xatolik yuz berdi.")
        return

    # 2. Faqat 'order' actioni uchun ishlash
    if data.get('action') != 'order':
        return

    # 3. Kanalga yuboriladigan xabar matnini tayyorlash
    order_text = (
        f"🛒 <b>YANGI BUYURTMA!</b>\n\n"
        f"📦 <b>Mahsulot:</b> {data['product_title']}\n"
        f"💰 <b>Narx:</b> {data['price']:,} so'm\n\n"
        f"👤 <b>Mijoz:</b> {data['customer_name']}\n"
        f"📞 <b>Telefon:</b> {data['customer_phone']}\n\n"
        f"🆔 <b>Buyurtma ID:</b> {data['product_id']}"
    )

    # 4. Kanalga yuborish
    try:
        await message.bot.send_message(
            chat_id="@MaxiMarket_zakaslari",  # Sizning kanalingiz
            text=order_text,
            parse_mode="HTML"
        )
        await message.answer("✅ Buyurtmangiz qabul qilindi! Tez orada siz bilan bog'lanamiz.")
    except Exception as e:
        print(f"Kanalga yuborishda xatolik: {e}")
        await message.answer("Buyurtmani qabul qilishda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.")
