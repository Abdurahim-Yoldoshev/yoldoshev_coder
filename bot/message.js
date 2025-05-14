const {bot} = require('./bot');
const User = require('../module/user');
const {
    start,
    request_contact
} = require('./helper/start');
const {
    users
} = require('./helper/users');
const {Settings, ChannelController, UserController} = require('./helper/settings');
const {servics} = require('./helper/service');
const {AppsController} = require('./helper/apps');
const {portfolio} = require('./helper/portfoli');
const {weDate} = require("./helper/weDate");

bot.setMyCommands([
    {command: '/start', description: '🚀 Botni qayta ishga tushirish'},
    {command: '/help', description: '❓ Yordam markazi'},
    {command: '/info', description: 'ℹ️ Foydalanuvchi haqida ma\'lumot'},
    {command: '/apps', description: '📱 Ilovalar ro\'yxati'}
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
        if(text === '👤 Profil' || text === '👤 Foydalanuvchilar' || text === '/info'){
            users(msg);
        }
        if(text == '💎 Xizmatlarni boshqarish' || text == '💎 Xizmatlar'){
            servics(chatId);
        }
        if(text === '💠 Ilovlar' || text ==='/apps'){
            AppsController(chatId);
        }
        if(text === '⚙️ Sozlamalar'){
            Settings(msg);
        }
        if(text === '🔔 Kanallarni boshqarish'){
            ChannelController(chatId);
        }
        if(text === '🔙 Bosh sahifaga qaytish'){
            start(msg);
        }
        if(text === '👤 Foydalanuvchiarni boshqarish'){
            UserController(chatId);
        }
        if(text === '💼 Portfolio'){
            portfolio(chatId,msg);
        }
        if(text === 'ℹ Biz haqimizda' || text === '/help'){
            weDate(msg);
        }
    }
});