const {bot} = require('../../bot');
const {userKeyEn} = require('../../menu/keyboards');

const HomeEn = async(chatId,checkUser,msg) => {
    bot.sendMessage(chatId,`Hello! <b> ${checkUser.admin ? 'Admin' : `${msg.from.first_name}`}</b>`,{
        parse_mode:'HTML',
        reply_markup: {
            keyboard: userKeyEn,
            resize_keyboard: true
    }
  })
}

const contactEn = async(chatId) => {
    bot.sendMessage(chatId, `Contact us\n\n📞 Phone: <b>+998904181980</b>\n\n📧 Email: <b>yoldoshevcoder@gmail.com</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Write to the bot',
                        callback_data: 'bot write'
                    }
                ]
            ]
        }
    });
}


module.exports = {
    HomeEn, contactEn
}