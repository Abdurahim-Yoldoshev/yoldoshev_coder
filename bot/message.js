const {bot} = require('./bot');
const User = require('../module/user');
const {
    start,
    request_contact
} = require('./helper/start');
const {
    users
} = require('./helper/users');
const {servics} = require('./helper/service');

bot.setMyCommands([
    {command: '/start', description: 'Botni qayta ishga tushirish'},
    {command: '/help', description: 'Yordam markazi'},
    {command: '/info', description: 'Foydalanuvchi haqida ma\'lumot'},
    {command: '/apps', description: 'Ilovalar ro\'yxati'}
]);

bot.on('message', async msg => {
    const chatId = msg.from.id;
    const text = msg.text;
    let user = await User.findOne({chatId});
    console.log(msg);
    if(text === '/start'){
        start(msg);
    }
    if(user){
        if(user.action === 'requestContact' && msg.contact){
            request_contact(msg);
        }
        if(text === '👤 Profil' || text === '👤 Foydalanuvchilar'){
            users(msg);
        }
        if(text == '💎 Xizmatlarni boshqarish' || text == '💎 Xizmatlar'){
            servics(chatId);
        }
    }
});