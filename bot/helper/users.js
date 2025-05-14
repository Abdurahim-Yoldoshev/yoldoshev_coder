const {bot} = require('../bot');
const User = require('../../module/user');

const users = async (msg) => {
    const chatId = msg.from.id;
    const user = await User.findOne({chatId}).lean();
    const users = await User.find({owner:false}).lean();
    if(user.admin || user.owner){
        user.action = 'users';
        await User.findByIdAndUpdate(user._id, user, {new: true});
        let text = `<b>📋 Foydalanuvchilar ro'yxati:</b>\n\n`;
        if (users.length === 0) {
            text += `<b>🚫 Foydalanuvchilar mavjud emas.</b>\n`;
        } else {
            users.forEach((user, index) => {
            text += ` <b>${index + 1}. ${user.fullName} - <code>${user.chatId}</code></b>\n`;
            });
            text += `\n<b>📊 Foydalanuvchilar soni: ${users.length}</b>\n`;
        }
        bot.sendMessage(chatId, text,{
            parse_mode: 'HTML',
             reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: '🔍 Qidiruv',
                                callback_data: 'search_user'
                            }
                        ]
                    ]
                }
        });
    }else{
        user.action = 'profile';
        await User.findByIdAndUpdate(user._id, user, {new: true});
        bot.sendMessage(chatId,`<i>👤 Profilingiz:</i>\n\n` +
            `<b>╭───────────────────\n` +
            `├‣📛 Ism: ${user.fullName}\n` +
            `├‣ 📞 Telefon raqami: ${user.phone}\n` +
            `├‣ 🆔 ID: <code>${user.chatId}</code>\n` +
            `├‣ 🛡 Admin: ${user.admin ? '✅ Ha' : '❌ Yo\'q'}\n` +
            `├‣ 📅 Yaratilgan vaqt: ${user.createdAt.toLocaleDateString()}\n` +
            `├‣ 🚫 Blocklangan: ${user.status ? '❌ Yo\'q' : '✅ Ha'}\n` +
            `├‣ ⚡ Aktivlik: ${user.action}\n`+
            `╰───────────────────</b>\n\n` +
            `<i>📊 Foydalanuvchilar soni:</i> ${users.length}`,
            {
                parse_mode: 'HTML'
            }
        )
    }
}
const SearchUser = async (chatId) => {
    const user = await User.findOne({ chatId }).lean();
    const users = await User.find({ owner: false }).lean();
    if (user.admin || user.owner) {
       bot.sendMessage(chatId, `🕵️ Qidirilayotgan foydalanuvchining ID raqamini yoki ismini kiriting:`);
       bot.once('message', async (msg) => {
            const searchText = msg.text;
            const foundUsers = users.filter((user) => {
                return user.fullName.toLowerCase().includes(searchText.toLowerCase()) || user.chatId.toString() === searchText;
            });
            let text = `<b>📋 Qidiruv natijalari:</b>\n\n`;
            if (foundUsers.length === 0) {
                text += `<b>🚫 Foydalanuvchi topilmadi.</b>\n`;
            } else {
                foundUsers.forEach((user, index) => {
                    text += `<b>╭───────────────────\n` +
            `├‣📛 Ism: ${user.fullName}\n` +
             `├‣ 📞 Telefon raqami: ${user.phone}\n` +
            `├‣ 🆔 ID: <code>${user.chatId}</code>\n` +
            `├‣ 🛡 Admin: ${user.admin ? '✅ Ha' : '❌ Yo\'q'}\n` +
            `├‣ 📅 Yaratilgan vaqt: ${user.createdAt.toLocaleDateString()}\n` +
            `├‣ 🚫 Blocklangan: ${user.status ? '❌ Yo\'q' : '✅ Ha'}\n` +
            `├‣ ⚡ Aktivlik: ${user.action}\n`+
            `╰───────────────────</b>\n`;
                });;
            }
            bot.sendMessage(chatId, text, { parse_mode: 'HTML', 
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: "🔙 Bosh sahifaga qaytish"
                            }
                        ]
                    ],
                    resize_keyboard: true
                }
            });
        });
    }
};
module.exports = {
    // Ensure the function signature matches the updated definition
    users,
    SearchUser
}