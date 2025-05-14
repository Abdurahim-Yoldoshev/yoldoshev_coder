'use strict';

const {bot} = require('../bot');
const User = require('../../module/user');
const {userKeyboard, adminKeyboard} = require('./additional/menuKeyboard');
const Channel = require('../../module/channel');

const start = async (msg) => {
    const chatId = msg.from.id;
    const user = await User.findOne({chatId});
    if (!user) {
        const newUser = new User({
            fullName: msg.from.first_name,
            chatId,
            admin: false,
            action: 'requestContact',
            status: true,
            createdAt: new Date()
        });
        await newUser.save();
        bot.sendMessage(chatId,`<b>👋 Assalomu aleykum hurmatli</b> <i>'${newUser.owner? '🧑‍💻 BOSS' : `${newUser.admin?'🧑‍✈️ Admin ':`👤 ${newUser.fullName}`}`}'</i> <b>botimizga xush kelibsiz.</b>\n\n<b>🤖 Botdan foydalanish uchun</b> <i>"📱 Ulashish"</i><b> tugmasini bosib telfon raqamingizni yuboring ‼</b>`,{
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [{text: '📱 Ulanish', request_contact: true}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })
    } else {
        if(!user.phone){
            if(msg.contact){
            const phone = msg.contact.phone_number;
            user.phone = phone;
            user.owner = phone == '+998904181980';
            user.admin = phone == '+998904181980';
            user.action = 'mainMenu';
            await User.findByIdAndUpdate(user._id, user, {new: true});
           
            }else{
                bot.sendMessage(chatId, '🤖 <b>Botdan foydalanish uchun telefon raqamingizni yuboring:</b>', {
                    parse_mode: 'HTML',
                    reply_markup: {
                        keyboard: [
                            [{text: '📱 Ulanish', request_contact: true}]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                }
            )
            }
        }else{
            bot.sendMessage(chatId,`<b>👋 Assalomu aleykum hurmatli</b><i>'${user.owner? '🧑‍💻 BOSS' : `${user.admin?'🧑‍✈️ Admin ':`👤 ${user.fullName}`}`}'</i><b>botimizga xush kelibsiz.</b>\n\n<i>📁 Kerakli bo'limni tanlang:</i>`,{
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: user.admin || user.owner ? adminKeyboard : userKeyboard,
                    resize_keyboard: true
                }
            });
        }
}
}

const request_contact = async (msg) => {
    const chatId = msg.from.id;
    const channels = await Channel.find().lean();
    if(msg.contact){
        const user = await User.findOne({chatId}).lean();
        const phone = msg.contact.phone_number;
        user.phone = phone;
        user.owner = phone == '+998904181980';
        user.admin = phone == '+998904181980';
        user.action = 'mainMenu';
        await User.findByIdAndUpdate(user._id, user, {new: true});
        let list = channels.map(channel => 
            [
                    {
                        text: '📁' + channel.channelName,
                        url: `https://t.me/${channel.channelLink}`
                    }
            ]
        );
    }
}

const enforceSubscription = async (chatId) => {
    const channels = await Channel.find().lean();
    let list = channels.map(channel => 
            [
                    {
                        text: '📁' + channel.channelName,
                        url: `https://t.me/${channel.channelLink}`
                    }
            ]
        );
        return bot.sendMessage(chatId,`<b>📢 Botdan foydalanish uchun quyidagi kanallarga obuna bo'ling:</b>\n\n`+
        `<b>✅ Obuna bo'lgandan so'ng "Tekshirish" tugmasini bosing.</b>`,{
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    ...list,
                    [{ text: '✅ Tekshirish', callback_data: 'check_subscription' }]
                ]
            }
        });
};

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const channels = await Channel.find().lean();
    const user = await User.findOne({ chatId }).lean();
    if (query.data === 'check_subscription') {
        try {
            const members = await Promise.all(
                channels.map(channel => bot.getChatMember('@' + channel.channelLink, chatId))
            );
            const isSubscribed = members.every(member => 
                ['member', 'administrator', 'creator'].includes(member.status)
            );

            if (isSubscribed) {
                bot.deleteMessage(chatId, query.message.message_id);
                bot.deleteMessage(chatId, query.message.message_id - 1);
                bot.sendMessage(chatId,`<b>📱 Telefon raqamingiz qabul qilindi.\n\n✅ Botdan foydanishingiz mumkin❗️</b>\n\n<i>📁 Kerakli bo'limni tanlang:</i>`,{
                parse_mode: 'HTML',
                reply_markup: {
                    keyboard: user.admin || user.owner ? adminKeyboard : userKeyboard,
                    resize_keyboard: true
                }
            });
            } else {
                bot.deleteMessage(chatId, query.message.message_id);
                bot.sendMessage(chatId, `<b>❌ Obuna tasdiqlanmadi. Iltimos, barcha kanallarga obuna bo'ling va qayta tekshiring.</b>`, {
                    parse_mode: 'HTML'
                });
                enforceSubscription(chatId);
            }
        } catch (error) {
            console.error('Error checking subscription:', error);
            bot.sendMessage(chatId, `<b>❌ Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.</b>`, {
                parse_mode: 'HTML'
            });
        }
    }
});


bot.on('message', async (msg) => {
    if (msg.contact) {
        const chatId = msg.from.id;
        const user = await User.findOne({ chatId });
        if (user) {
            const phone = msg.contact.phone_number;
            user.phone = phone;
            user.owner = phone == '+998904181980';
            user.admin = phone == '+998904181980';
            user.action = 'mainMenu';
            await User.findByIdAndUpdate(user._id, user, { new: true });
            await checkSubscriptionAfterPhone(chatId);
        }
    }
});

const checkSubscriptionAfterPhone = async (chatId) => {
    const channels = await Channel.find().lean();
    let list = channels.map(channel => 
            [
                    {
                        text: '📁' + channel.channelName,
                        url: `https://t.me/${channel.channelLink}`
                    }
            ]
        );
        return bot.sendMessage(chatId,`<b>📢 Botdan foydalanish uchun quyidagi kanallarga obuna bo'ling:</b>\n\n`+
        `<b>✅ Obuna bo'lgandan so'ng "Tekshirish" tugmasini bosing.</b>`,{
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    ...list,
                    [{ text: '✅ Tekshirish', callback_data: 'check_subscription' }]
                ]
            }
        });
};

module.exports = {
    start,
    request_contact  
};