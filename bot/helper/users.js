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
            parse_mode: 'HTML'
        });
    }else{
        user.action = 'profile';
        await User.findByIdAndUpdate(user._id, user, {new: true});
        bot.sendMessage(chatId,`👤 Profilingiz:\n\n` +
            `📛 Ism: ${user.fullName}\n` +
            `📞 Telefon raqami: ${user.phone}\n` +
            `🆔 ID: <code>${user.chatId}</code>\n` +
            `🛡 Admin: ${user.admin ? '✅ Ha' : '❌ Yo\'q'}\n` +
            `📅 Yaratilgan vaqt: ${user.createdAt.toLocaleDateString()}\n` +
            `🚫 Blocklangan: ${user.status ? '❌ Yo\'q' : '✅ Ha'}\n` +
            `⚡ Aktivlik: ${user.action}\n`,
            {
                parse_mode: 'HTML',
            }
        )
    }
}

module.exports = {
    users
}