const {bot} = require('../../bot');
const {userKeyUz} = require('../../menu/keyboards');

const Home = async(chatId,checkUser,msg) => {
    bot.sendMessage(chatId,`Salom! <b> ${checkUser.admin ? 'Admin' : `${msg.from.first_name}`}</b>`,{
        parse_mode:'HTML',
        reply_markup: {
            keyboard: userKeyUz,
            resize_keyboard: true
    }
  })
}

const contactUz = async(chatId) => {
    bot.sendMessage(chatId,`Biz bilan bog'lanish\n\n📞 Telefon raqam: <b>+998904181980</b>\n\n📧 Email: <b>yoldoshevcoder@gmail.com</b>\n\n`,{
        parse_mode:'HTML',
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text:'Botga yozish',
                        callback_data:'bot write'
                    }
                ]
            ]
        }
})
}
module.exports = {
    Home, contactUz
}