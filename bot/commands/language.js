const {bot} = require('../bot');
const User = require('../../module/user');

const uz = async (chatId) => {
    let user = await User.findOne({chatId}).lean();
    user.language = 'uz';
    await User.findByIdAndUpdate(user._id,user,{new: true});
    bot.sendMessage(chatId,`Tabriklaymiz til Muvafqiyatli uzgardi🎉 \n\nTanlagan tilingiz: <b>${user.language}</b>\n\nEndi /start tugmasini bosing`,{
        parse_mode:'HTML',
        reply_markup: {
            keyboard: [
                [
                    {
                      text:'/start'
                    }
                ]
            ], 
            resize_keyboard: true
        }
    })
}

const ru = async(chatId) =>{
    let user = await User.findOne({chatId}).lean();
    user.language = 'ru';
    await User.findByIdAndUpdate(user._id,user,{new: true});
    bot.sendMessage(chatId, `Поздравляем, язык успешно изменён! 🎉\n\nВыбранный язык: <b>${user.language}</b>\n\nТеперь нажмите /start`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              {
                text:'/start'
              }
            ]
          ],
          resize_keyboard: true
        }
      });      
}

const en = async(chatId) => {
    let user = await User.findOne({chatId}).lean();
    user.language = 'en';
    await User.findByIdAndUpdate(user._id,user,{new: true});
    bot.sendMessage(chatId, `Congratulations, the language has been successfully changed! 🎉\n\nSelected language: <b>${user.language}</b>\n\nNow press the /start button`, {
        parse_mode: 'HTML',
        reply_markup: {
          keyboard: [
            [
              {
                text: '/start',
              }
            ]
          ],
          resize_keyboard: true
        }
    });      
}

module.exports = {uz,ru,en}