const {bot} = require('../bot');
const User = require('../../module/user');

const information = (chatId) => {
    bot.sendPhoto(chatId, 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSm9t6s04HuZJTcydKjvnDgvE65TKt__ZTHQhSomoJ0a06gMOAe', {
        caption: '📌Bot haqida malumot' 
    })
}

module.exports = {
    information
}