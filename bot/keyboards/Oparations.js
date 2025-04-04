const {bot} = require('../bot');
const User = require('../../module/user');

const operations = (chatId) => {
    bot.sendPhoto(chatId, 'https://www.sincera.in/wp-content/uploads/2024/01/operations-manager-job-description-880x470-1.jpg', {
        caption: '📌Bot haqida malumot' 
    })
}

module.exports = {
    operations
}