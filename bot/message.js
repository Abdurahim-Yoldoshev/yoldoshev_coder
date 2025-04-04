const {bot} = require('./bot');
const {start, requestContact} = require('./helper/start');
const User = require('../module/user');
const {contact} = require('./commands/contact');
const {information} = require('./keyboards/information');
const {operations} = require('./keyboards/Oparations');

bot.setMyCommands([
    {command: '/start', description: 'Botni qayta ishga tushirish'},
    {command: '/language', description: 'Tilni tanlash'},   
    {command: '/contact', description: 'Contactni tanlash'},
    {command:'/informationbot', description: 'Bot haqida malumot'},
    {command: '/informationprogrammer', description: `Dasturchi haqida malumot`},
]);

bot.on('message', async msg => {
    const chatId = msg.chat.id;
    const text = msg.text;
    let user = await User.findOne({chatId});
    console.log(msg);
    if(text === '/start'){
        start(msg);
    }

    if(user){
        if(user.action === 'request_contact' && msg.contact){
            requestContact(msg);
        }
    }

    if(text === '/language'){
        bot.sendMessage(chatId, 'Kerakli tilni tanlang!\n\nSelect the desired language!\n\nВыберите желаемый язык!',{
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Русский',
                            callback_data: 'ru'
                        },
                        {
                            text: 'English',
                            callback_data: 'en'
                        }
                    ],
                    [
                        {
                            text: 'O`zbekcha',
                            callback_data: 'uz'
                        }
                    ]
                ]
            }
        })
    }
    if(text === '/contact' || text === 'Aloqa' || text === 'Communication' || text === 'Связь'){
        contact(chatId);
    }

    if(text === '/informationbot' || text === 'Malumotlar' || text === 'Information' || text === 'Информация'){
        information(chatId);
    }

    if(text === 'Amaliyot' || text === 'Operations' || text === 'Операции'){
        operations(chatId);
    }

});