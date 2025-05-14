const {bot} = require('../bot');

const weDate = async(msg) =>{
    const chatId = msg.from.id;
    bot.sendMessage(chatId, `<b>📄 Ma'lumotlar:\n\n👋Salom\nMening ismim: <i>Yo'ldoshev Abdurahim</i>\n\n🤖 Bot yaratishdan maqsad portfoliom uchun yaratilgan bot bo'lib, Portfoliomni ommaga taqdim etish maqsadida ochilgan bot.\n\nAgarda savol va takliflar bo'lsa 🌐 Ijtimoiy tarmoqlar orqali murojat qiling:\n<a href="https://www.instagram.com/yoldoshev_abdurahim">📸 Instagram</a>, <a href="https://t.me/YoldoshevCoder">📩 Telegram</a>, <a href="https://mail.google.com/yoldoshevcoder">E-Mail</a>\n\n</b>`, {
        parse_mode: 'HTML',
        reply_markup:{
            inline_keyboard:[
                [
                    {
                        text:"👁 Blog kanal",
                        url:'https://t.me/YuldoshevCoder'
                    }
                ]
            ]
        }
    })
}

module.exports = {
    weDate
}