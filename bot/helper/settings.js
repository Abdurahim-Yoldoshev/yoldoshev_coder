const {bot} = require('../bot');
const User = require('../../module/user');
const Channel = require('../../module/channel');

const Settings = async (msg) => {
    const chatId = msg.from.id;
    const user = await User.findOne({chatId});
    if (user.admin) {
        bot.sendMessage(chatId, `<b>⚙️ Bot sozlamari bo'limiga xush kelibsiz!</b>\n\n<i>📁 Kerakli sozlamani tanlang:</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [{text: '🔔 Kanallarni boshqarish'},{text:'👤 Foydalanuvchiarni boshqarish'}],
                    [{text: "🔙 Bosh sahifaga qaytish"}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        })
    } else {
        bot.sendMessage(chatId, `<b>❌ Bu bo'lim faqat adminlar uchun!</b>`,{
            parse_mode: 'HTML'
        })
    }
};

const ChannelController = async (chatId) => {
    const user = await User.findOne({chatId});
    const channels = await Channel.find().lean();
    if(channels.length === 0){
        bot.sendMessage(chatId, `<b>❌ Kanallar ro'yxati bo'sh!</b>`,{
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '➕ Kanal qo\'shish', callback_data: 'add_channel'},
                        {text: '➖ Kanal o\'chirish', callback_data: 'remove_channel'}
                    ]
                ],
                remove_keyboard: true
            }
        })
    }else{
    if (user.admin) {
        let list = channels.map(channel => 
        [
            {
                text: '📁' + channel.channelName,
                callback_data: `channel_${channel._id}`
            }
        ]);
        bot.sendMessage(chatId, `<b>🔔 Kanallar ro'yxati:</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    ...list,
                    [
                        {text: '➕ Kanal qo\'shish', callback_data: 'add_channel'},
                        {text: '➖ Kanal o\'chirish', callback_data: 'remove_channel'}
                    ]
                ]
            }
        });
    } else {
            bot.sendMessage(chatId, `<b>❌ Bu bo'lim faqat adminlar uchun!</b>`,{
                parse_mode: 'HTML'
            })
        }
    }
};

const ChannelAdd = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    if (!user.admin) {
        bot.sendMessage(chatId, `<b>❌ Bu bo'lim faqat adminlar uchun!</b>`, {
            parse_mode: 'HTML'
        });
        return;
    }

    user.action = 'add_channel';
    await User.findByIdAndUpdate(user._id, user, {new: true});

    bot.sendMessage(chatId, `<b>📁 Kanal qo'shish uchun quyidagi ma'lumotlarni kiriting:</b>\n` +
        `\n<b> ⚠️ Diqqat: kanal qo'shishdan oldin shu kanalga botni Admin qiling!!</b>\n\n<i>📌 Kanal nomi:</i>`, {
        parse_mode: 'HTML',
        reply_markup: {
            remove_keyboard: true
        }
    });

    bot.once('message', async (msg) => {
        if (msg.from.id !== chatId) return;

        const channelName = msg.text;
        if (!channelName) {
            bot.sendMessage(chatId, `<b>❌ Kanal nomi kiritilmadi!</b>`, {
                parse_mode: 'HTML'
            });
            return;
        }

        const newChannel = new Channel({channelName});
        await newChannel.save();

        user.action = 'mainMenu';
        await User.findByIdAndUpdate(user._id, user, {new: true});

        bot.sendMessage(chatId, `<b>✅ Kanal muvaffaqiyatli qo'shildi!</b>\n\n` +
            `<b>Endi kanal usernameni kiriting:</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
            remove_keyboard: true
            }
        });

        bot.once('message', async (msg) => {
            if (msg.from.id !== chatId) return;
            const channelUsername = msg.text;
            await Channel.findByIdAndUpdate(newChannel._id, { channelLink: channelUsername }, { new: true });

            bot.sendMessage(chatId, `<b>✅ Kanal username muvaffaqiyatli qo'shildi!</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                [{ text: "🔙 Bosh sahifaga qaytish" }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
            });
            ChannelController(chatId);
        });
    });
};

const ChannelRemove = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    const channels = await Channel.find().lean();
    if (channels.length === 0) {
        bot.sendMessage(chatId, `<b>❌ O'chirish uchun kanal yo'q!</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔙 Bosh sahifaga qaytish", callback_data: 'menu' }]
                ],
                remove_keyboard: true
            }
        });
        return;
    }
    if (user.admin) {
        let list = channels.map(channel => 
        [
            {
                text: '📁' + channel.channelName,
                callback_data: `remove_channel_${channel._id}`
            }
        ]);
        bot.sendMessage(chatId, `<b>🔔 O'chirish uchun kanalni tanlang:</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    ...list,
                    [{ text: "🔙 Bosh sahifaga qaytish", callback_data: 'menu' }]
                ]
            }
        });
    } else {
        bot.sendMessage(chatId, `<b>❌ Bu bo'lim faqat adminlar uchun!</b>`, {
            parse_mode: 'HTML'
        });
    }
    bot.on('callback_query', async (query) => {
        const { data } = query;
        const chatId = query.from.id;
        if (data.startsWith('remove_channel_')) {
            const channelId = data.split('_')[2];
            await Channel.findByIdAndDelete(channelId);
            bot.sendMessage(chatId, `<b>✅ Kanal muvaffaqiyatli o'chirildi!</b>`, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "🔙 Bosh sahifaga qaytish", callback_data: 'menu' }]
                    ],
                    remove_keyboard: true
                }
            });
            ChannelController(chatId);
        }
    });
};

const UserController = async (chatId) => {
    const user = await User.findOne({ chatId }).lean();
    const users = await User.find().lean();
    if (user.admin) {
        let list = users.map((user, index) => 
            `${index + 1}. ${user.firstName || `${user.owner ? 'BOSS' : `${user.admin ? 'Admin' : `${user.fullName}`}`}`} - <code>${user.chatId}</code>`
        ).join('\n');
        bot.sendMessage(chatId, `<b>👥 Foydalanuvchilar ro'yxati:\n\n${list}</b>\n\n<i>Jami foydalanuvchilar: ${users.length}</i>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: user.owner ?[
                    [
                        {
                            text: '🛡️ Admin qilish',
                            callback_data: 'make_admin'
                        },
                        {
                            text: '❌ Adminlikni olib tashlash',
                            callback_data: 'remove_admin'
                        }
                    ],
                    [
                        {
                            text: '👑 Egalikni o\'zgartirish',
                            callback_data: 'change_owner'
                        }
                    ] 
                ]: [],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
    } else {
        bot.sendMessage(chatId, `<b>❌ Bu bo'lim faqat adminlar uchun!</b>`, {
            parse_mode: 'HTML'
        });
    }
};

const makeAdmin = async (chatId) => {
    const user = await User.findOne({ chatId }).lean();
    if (!user.admin) {
        bot.sendMessage(chatId, `<b>❌ Bu bo'lim faqat adminlar uchun!</b>`, {
            parse_mode: 'HTML'
        });
        return;
    }

    user.action = 'make_admin';
    await User.findByIdAndUpdate(user._id, user, { new: true });

    bot.sendMessage(chatId, `<b>🛡️ Admin qilish uchun foydalanuvchi chat ID sini kiriting:</b>`, {
        parse_mode: 'HTML',
        reply_markup: {
            remove_keyboard: true
        }
    });

    bot.once('message', async (msg) => {
        if (msg.from.id !== chatId) return;

        const targetChatId = msg.text;
        const targetUser = await User.findOne({ chatId: targetChatId }).lean();

        if (!targetUser) {
            bot.sendMessage(chatId, `<b>❌ Foydalanuvchi topilmadi!</b>`, {
                parse_mode: 'HTML'
            });
            return;
        }

        if (targetUser.admin) {
            bot.sendMessage(chatId, `<b>❌ Ushbu foydalanuvchi allaqachon admin!</b>`, {
                parse_mode: 'HTML'
            });
            return;
        }

        await User.findByIdAndUpdate(targetUser._id, { admin: true }, { new: true });

        bot.sendMessage(chatId, `<b>✅ ${targetUser.firstName || targetUser.fullName} admin qilindi!</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [{ text: "🔙 Bosh sahifaga qaytish" }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        bot.sendMessage(targetChatId, '🛡️ <b><i>Tabriklaymiz siz admin bo`ldingiz</i>\n\nSidqi dildan ishlaysiz degan umiddamiz.\n\n                                       <i>Hurmat bilan: Bot Egasi</i></b>',{
            parse_mode:"HTML"
        })
    });
    UserController(chatId);
};

const removiAdmin = async (chatId) => {
    const user = await User.findOne({ chatId }).lean();
    if (!user.admin) {
        bot.sendMessage(chatId, `<b>❌ Bu bo'lim faqat adminlar uchun!</b>`, {
            parse_mode: 'HTML'
        });
        return;
    }

    user.action = 'remove_admin';
    await User.findByIdAndUpdate(user._id, user, { new: true });

    bot.sendMessage(chatId, `<b>❌ Adminlikni olib tashlash uchun foydalanuvchi chat ID sini kiriting:</b>`, {
        parse_mode: 'HTML',
        reply_markup: {
            remove_keyboard: true
        }
    });

    bot.once('message', async (msg) => {
        if (msg.from.id !== chatId) return;

        const targetChatId = msg.text;
        const targetUser = await User.findOne({ chatId: targetChatId }).lean();

        if (!targetUser) {
            bot.sendMessage(chatId, `<b>❌ Foydalanuvchi topilmadi!</b>`, {
                parse_mode: 'HTML'
            });
            return;
        }

        if (!targetUser.admin) {
            bot.sendMessage(chatId, `<b>❌ Ushbu foydalanuvchi admin emas!</b>`, {
                parse_mode: 'HTML'
            });
            return;
        }

        await User.findByIdAndUpdate(targetUser._id, { admin: false }, { new: true });

        bot.sendMessage(chatId, `<b>✅ ${targetUser.firstName || targetUser.fullName} adminlikdan olib tashlandi!</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [{ text: "🔙 Bosh sahifaga qaytish" }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        bot.sendMessage(targetChatId, `❌ Afsus bilan ma'lum qilamizki, siz endi "Admin" emassiz!\n\n⚠️ Agarda xatolik bilan bo'lgan bo'lsa, Bot egasiga murojat qiling!`);
        UserController(chatId);
    });
};

const changeOwner = async (chatId) => {
    const user = await User.findOne({ chatId }).lean();
    if (!user.owner) {
        bot.sendMessage(chatId, `<b>❌ Bu bo'lim faqat bot egasi uchun!</b>`, {
            parse_mode: 'HTML'
        });
        return;
    }

    user.action = 'change_owner';
    await User.findByIdAndUpdate(user._id, user, { new: true });

    bot.sendMessage(chatId, `<b>👑 Egalikni o'zgartirish uchun foydalanuvchi chat ID sini kiriting:</b>`, {
        parse_mode: 'HTML',
        reply_markup: {
            remove_keyboard: true
        }
    });

    bot.once('message', async (msg) => {
        if (msg.from.id !== chatId) return;

        const targetChatId = msg.text;
        const targetUser = await User.findOne({ chatId: targetChatId }).lean();

        if (!targetUser) {
            bot.sendMessage(chatId, `<b>❌ Foydalanuvchi topilmadi!</b>`, {
                parse_mode: 'HTML'
            });
            return;
        }

        if (targetUser.owner) {
            bot.sendMessage(chatId, `<b>❌ Ushbu foydalanuvchi allaqachon bot egasi!</b>`, {
                parse_mode: 'HTML'
            });
            return;
        }

        await User.updateMany({}, { owner: false }); // Remove owner status from all users
        await User.findByIdAndUpdate(targetUser._id, { owner: true, admin: true }, { new: true });

        bot.sendMessage(chatId, `<b>✅ ${targetUser.firstName || targetUser.fullName} endi bot egasi bo'ldi!</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                keyboard: [
                    [{ text: "🔙 Bosh sahifaga qaytish" }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });

        bot.sendMessage(targetChatId, `👑 <b>Tabriklaymiz! Siz endi bot egasi bo'ldingiz!</b>\n\n<i>Hurmat bilan: Bot</i>`, {
            parse_mode: 'HTML'
        });
        UserController(chatId);
    });
};
module.exports = {
    Settings,
    ChannelController,
    ChannelAdd,
    ChannelRemove,
    UserController,
    makeAdmin,
    removiAdmin,
    changeOwner
};