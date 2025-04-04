const {bot} = require('../bot');
const User = require('../../module/user');
const {adminKey, userKeyUz} = require('../menu/keyboards');
const {Home} = require('../commands/language/uz');
const {HomeEn} = require('../commands/language/en');
const {HomeRu} = require('../commands/language/ru');

const start = async (msg) => {
    const chatId = msg.from.id;
    let checkUser = await User.findOne({chatId});
    if (!checkUser) {
        let newUser = new User({
            name: msg.from.first_name,
            chatId,
            admin: false,
            action: 'request_contact',
            status: true,
            creted: new Date()
        })
        await newUser.save();
        bot.sendMessage(chatId, 'Salom! Iltimos, telefon raqamingizni yuboring.\n\nHello! Please send your phone number.\n\nПривет! Пожалуйста, пришлите свой номер телефона.',{
            reply_markup: {
                keyboard: [
                    [{
                        text: 'Telefon raqamni yuborish/ Send phone number/ Отправить номер телефона', 
                        request_contact: true
                    }]
                ],
                resize_keyboard: true
            }   
    })
    }else{
        if(checkUser.language === 'uz'){
            Home(chatId,checkUser,msg);
        }
        if(checkUser.language === 'en'){
            HomeEn(chatId,checkUser,msg);
        }
        if(checkUser.language === 'ru'){
            HomeRu(chatId,checkUser,msg);
        }
        bot.sendMessage(chatId, `🏠`);
    }};

const requestContact = async (msg) => {
    const chatId = msg.from.id; 

    if(msg.contact.phone_number){
        let user = await User.findOne({chatId}).lean()
        user.phone = msg.contact.phone_number;
        user.admin = msg.contact.phone_number == '+998335222080'
        user.action = 'home';
        await User.findByIdAndUpdate(user._id, user,{new: true});
        bot.sendMessage(chatId, `Telefon raqamingiz qabul qilindi. Rahmat! Kerakli menyuni tanlang,<b> ${user.admin ? 'Admin' : `${msg.from.first_name}`}</b>\n\nВаш номер телефона принят. Спасибо! Выберите нужное меню,<b> ${user.admin ? 'Администратор': `${msg.from.first_name}`}</b>!\n\nYour phone number has been received. Thank you! Select the appropriate menu,<b> ${user.admin ? 'Admin' : `${msg.from.first_name}`}</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: user.admin ? adminKey : userKeyUz,
                resize_keyboard: true
            }
        });
        bot.sendMessage(chatId, `🏠`);
    }
}

module.exports = {
    start, requestContact
};