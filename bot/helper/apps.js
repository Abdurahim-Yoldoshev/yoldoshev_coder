const {bot} = require('../bot');
const User = require('../../module/user');
const Apps = require('../../module/apps');

const AppsController =  async (chatId) => {
    const user = await User.findOne({chatId: chatId}).lean();
    user.action = 'apps';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    const apps = await Apps.find().lean();
    if(apps.length > 0){
        let text = `<i>📲 Ilovalarga ma'sul bot:</i> @AppsStoreUzBot\n\n`;
        text += `<b>📱 Botda mavjud bo'lgan ilovalar:</b>`;
        let list = apps.map(app => 
               [
                {
                text:app.name,
                callback_data: `app_${app._id}`
                }
            ]).concat(
                user.admin || user.owner ? [
                [
                    {
                    text: '➕',
                    callback_data: 'new_app'
                    },
                    {
                    text: '🗑',
                    callback_data: 'del_app'
                    }
                ]
                ] : []
               );
        bot.sendMessage(chatId, text, {
            parse_mode: 'HTML',
            reply_markup: {
            inline_keyboard: list
            }
        });
    } else {
        bot.sendMessage(chatId, `❌ Hozirda ilovalar mavjud emas`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '➕',
                            callback_data: `new_app`
                        },
                        {
                            text: '🗑',
                            callback_data: `del_app`
                        }
                    ]
                ]
            }
        });
    }
}

const newApp = async (chatId) => {
    const user = await User.findOne({chatId: chatId}).lean();
    user.action = 'new_app';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.sendMessage(chatId, `📎 Iltimos, ilova faylini yuboring!`);
    bot.once('document', async (fileMsg) => {
        const fileId = fileMsg.document.file_id;
        const fileName = fileMsg.document.file_name;
        bot.sendMessage(chatId, `📛 Endi ilova nomini yuboring!`);
        bot.once('message', async (nameMsg) => {
            if (nameMsg.text) {
            const appName = nameMsg.text;
            bot.sendMessage(chatId, `📄 Endi ilova tavsifini yuboring!`);
            bot.once('message', async (descMsg) => {
                if (descMsg.text) {
                const newApp = new Apps({
                    name: appName,
                    description: descMsg.text,
                    fileId: fileId,
                    fileName: fileName,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                await newApp.save();
                bot.sendMessage(chatId, `✅ Ilova muvaffaqiyatli qo'shildi!`);
                AppsController(chatId);
                } else {
                bot.sendMessage(chatId, `❌ Iltimos faqat matn yuboring!`);
                }
            });
            } else {
            bot.sendMessage(chatId, `❌ Iltimos faqat matn yuboring!`);
            }
        });
    });
}

const openApp = async (chatId, appId) => {
    const user = await User.findOne({chatId: chatId}).lean();
    const app = await Apps.findById(appId).lean();
    if (app) {
        bot.sendDocument(chatId, app.fileId, {
            caption: `<b>📱 Ilova: ${app.name}\n\n⚠️ Diqqat: Ilovani yuklashdan oldin uni tavsifi bilan tanishib chiqing.\n\n📝 Tavsif:\n${app.description}\n\n</b><b>📲 Ilovalarga ma\'sul bot:</b>@AppsStoreUzBot\n`,
            parse_mode: 'HTML',
            reply_markup: {
            inline_keyboard: [
            [
            {
                text: '⬅️ Orqaga',
                callback_data: 'apps'
            }
            ]
            ]
            }
        });
    } else {
        bot.sendMessage(chatId, `❌ Ilova topilmadi!`);
    }
}

module.exports = {
    AppsController,
    newApp,
    openApp
}