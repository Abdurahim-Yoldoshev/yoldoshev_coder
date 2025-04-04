const User = require('../../module/user');
const {contactUz} = require('./language/uz');
const {contactRu} = require('./language/ru');
const {contactEn} = require('./language/en');

const contact = async(chatId) => {
    let user = await User.findOne({chatId}).lean();
    if(user.language === 'uz'){
        contactUz(chatId);
    }
    if(user.language === 'ru'){
        contactRu(chatId);
    }
    if(user.language === 'en'){
        contactEn(chatId);
    }
}

module.exports = {
    contact
}