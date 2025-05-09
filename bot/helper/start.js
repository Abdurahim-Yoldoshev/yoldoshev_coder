'use strict';
const {bot} = require('../bot');
const User = require('../../module/user');
const {userKeyboard, adminKeyboard} = require('./additional/menuKeyboard');

const start = async (msg) => {
    const chatId = msg.from.id;
    const user = await User.findOne({chatId}).lean();
    if (!user) {
        const newUser = new User({
            fullName: msg.from.first_name,
            chatId,
            admin: false,
            action: 'requestContact',
            status: true,
            createdAt: new Date()
        });
        await newUser.save();
        bot.sendMessage(chatId,`🖐 Salom\n\n   🤖 Botdan foydalanish uchun "📱 Ulashish " tugmasini bosib telfon raqamingizni yuboring ‼`,{
            reply_markup: {
                keyboard: [
                    [{text: '📱 Ulanish', request_contact: true}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })
    } else {
        
    }
}
const request_contact = async (msg) => {
    const chatId = msg.from.id;
    if(msg.contact){
        const user = await User.findOne({chatId}).lean();
        const phone = msg.contact.phone_number;
        user.phone = phone;
        user.owner = phone == '+998904181980';
        user.admin = phone == '+998904181980';
        user.action = 'mainMenu';
        await User.findByIdAndUpdate(user._id, user, {new: true});
        await bot.sendMessage(chatId,`📱 Telefon raqamingiz qabul qilindi\n\n  ✅ Botdan foydanishingiz mumkin !`);
        bot.sendMessage(chatId,` 💠 Asosiy menu:

        🗄 Kerakli tugmani tanlang <b>${user.owner? '🕵️ Bot egasi' : `${user.admin?'🧑‍✈️ Admin ':`👤 ${user.fullName}`}`}</b>`,{
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: user.admin || user.owner ? adminKeyboard : userKeyboard,
                resize_keyboard: true
            }
        });
    }
}

module.exports = {
    start,
    request_contact,
};