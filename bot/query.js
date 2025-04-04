const {bot} = require('./bot');
const User = require('../module/user');
const {uz,ru,en} = require('./commands/language');

bot.on('callback_query', async query => {
    const {data} = query
    const chatId = query.from.id;
    const user = await User.findOne({chatId});
    if(data === 'uz'){
        uz(chatId);
    }
    if(data === 'ru'){
        ru(chatId);
    }
    if(data === 'en'){
        en(chatId);
    }
})