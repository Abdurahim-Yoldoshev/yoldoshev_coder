const {bot} = require('../bot');
const User = require('../../module/user');

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
        bot.sendMessage(chatId, 'Salom! Iltimos, telefon raqamingizni yuboring',{
            reply_markup: {
                keyboard: [
                    [{
                        text: 'Telefon raqamni yuborish', 
                        request_contact: true
                    }]
                ],
                resize_keyboard: true
            }   
    })
}};

const requestContact = async (msg) => {
    const chatId = msg.from.id;

    if(msg.contact.phone_number){
        let user = await User.findOne({chatId}).lean()
        user.phone = msg.contact.phone_number;
        user.admin = msg.contact.phone_number == '998335222080'
        await User.findByIdAndUpdate(user._id, user,{new: true});
        bot.sendMessage(chatId, `Telefon raqamingiz qabul qilindi. Rahmat! Menyuni tanlang, ${user.admin ? 'Admin' : 'Foydalanuvchi'}`, {
            reply_markup:{
                keyboard: [
                    [
                        {
                            text: `Katalog`
                        }
                    ]
                ],
                resize_keyboard: true
            }
        })
    }
}

module.exports = {
    start, requestContact
}