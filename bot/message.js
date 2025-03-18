const {bot} = require('./bot');
const {start, requestContact} = require('./helper/start');
const User = require('../module/user');


bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    let user = await User.findOne({chatId});
    
    if(text === '/start'){
        start(msg);
    }

    if(user){
        if(user.action === 'request_contact' && msg.contact){
            requestContact(msg);
        }
    }
});