const {bot} = require('../../bot');
const {userKeyRu} = require('../../menu/keyboards');

const HomeRu = async(chatId, checkUser,msg) => {
    bot.sendMessage(chatId,`Привет! <b> ${checkUser.admin ? 'Админ' : `${msg.from.first_name}`}</b>`,{
        parse_mode:'HTML',
        reply_markup: {
            keyboard: userKeyRu,
            resize_keyboard: true
    }
  })
}

const contactRu = async(chatId) => {
    bot.sendMessage(chatId, `Связаться с нами\n\n📞 Телефон: <b>+998904181980</b>\n\n📧 Электронная почта: <b>yoldoshevcoder@gmail.com</b>\n\n`, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Написать боту',
                        callback_data: 'bot write'
                    }
                ]
            ]
        }
    });
}


module.exports = {
    HomeRu, contactRu
}