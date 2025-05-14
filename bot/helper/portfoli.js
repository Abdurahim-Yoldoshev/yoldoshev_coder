const {bot} = require('../bot');
const User = require('../../module/user');
const Product = require('../../module/product');
const Portfolio = require('../../module/portfolio');

const portfolio = async(chatId,msg) => {
    const user = await User.findOne({chatId}).lean();
    const portfolios = await Portfolio.find({}).lean();
    user.action = 'Portfolio';
    await User.findByIdAndUpdate(user.id,user, {new:true});
    if (portfolios.length == 0) {
        bot.deleteMessage(chatId, msg.message.message_id);
        bot.sendMessage(chatId, `🚫 Xizmatlar mavjud emas.`, {
            reply_markup: {
                inline_keyboard: user.admin || user.owner ? [
                    [
                        {
                            text: '✏️',
                            callback_data: 'edit_portfolio'
                        },
                        {
                            text: '🗑',
                            callback_data: 'del_portfolio'
                        }
                    ],
                    [
                        {
                            text: '➕',
                            callback_data: 'new_portfolio'
                        }
                    ]
                ] : [],
            }
        });
    } else {
        bot.deleteMessage(chatId, msg.message_id);
       let list = portfolios.map(portfolioes => 
       [
            {
                text: '📁'+portfolioes.title,
                callback_data: `portfolio_${portfolioes._id}`
            }
        ]).concat(
            user.admin || user.owner ? [
                [
                    {
                        text: '✏️',
                        callback_data: 'edit_portfolio'
                    },
                    {
                        text: '🗑',
                        callback_data: 'del_portfolio'
                    }
                ],
                [
                    {
                        text: '➕',
                        callback_data: 'new_portfolio'
                    }
                ]
            ] : [
       ]);
        bot.sendMessage(chatId, `<i>📁 Portfolio sahifasi:</i>\n\n<b>📌 Kerakli amliyotni tanlang:</b>`,{
            parse_mode:'HTML',
            reply_markup:{
                inline_keyboard:list
            }
        })
    } 
    
};

const newPortfolio = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `<b>📁 Yangi portfolio nomini kiriting:</b>`,{
        parse_mode: 'HTML',
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard:[
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_portfolio'
                    }
                ]
            ]
        }
    });
    user.action = 'new_portfolio';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const serviceName = response.text;
        if (!serviceName || serviceName.trim() === '') {
            bot.sendMessage(chatId, `❌ Xizmat nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        const newPortfolioes = new Portfolio({ title: serviceName });
        await newPortfolioes.save();
        bot.sendMessage(chatId, `✅ Yangi xizmat muvaffaqiyatli qo'shildi: ${serviceName}`);
        portfolio(chatId);
    });
}

const editPortfolio = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `📁 Portfolioni tahrirlash uchun portfolio nomini kiriting:`,{
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard:[
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_service'
                    }
                ]
            ]
        }
    });
    user.action = 'edit_portfolio';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const serviceName = response.text;
        if (!serviceName || serviceName.trim() === '') {
            bot.sendMessage(chatId, `❌ Portfolio nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        const portfoli = await Portfolio.findOne({ title: serviceName });
        if (!portfoli) {
            bot.sendMessage(chatId, `❌ Bunday portfolio topilmadi.`);
            return;
        }
        await bot.sendMessage(chatId, `📁 Portfolio yangi nomini kiriting:`);
        bot.once('message', async (newResponse) => {
            const newServiceName = newResponse.text;
            if (!newServiceName || newServiceName.trim() === '') {
                bot.sendMessage(chatId, `❌ Yangi portfolio nomi bo'sh bo'lishi mumkin emas.`);
                return;
            }
            portfoli.title = newServiceName;
            await portfoli.save();
            bot.sendMessage(chatId, `<b>✅ Portfolio muvaffaqiyatli tahrirlandi:</b> <i>📁 ${newServiceName}</i>`,{
                parse_mode: 'HTML'
            });
            portfolio(chatId);
        });
    });
}

const deletePortfolio = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `📁 Portfolio o'chirish uchun xizmat nomini kiriting:`, {
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard: [
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_portfolio'
                    }
                ]
            ]
        }
    });
    user.action = 'delete_portfolio';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const serviceName = response.text;
        if (!serviceName || serviceName.trim() === '') {
            bot.sendMessage(chatId, `❌ Portfolio nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        const portfoli = await Portfolio.findOne({ title: serviceName });
        if (!portfoli) {
            bot.sendMessage(chatId, `❌ Bunday portfolio topilmadi.`);
            return;
        }
        const productsCount = await Product.countDocuments({ services: portfoli._id });
        if (productsCount > 0) {
            bot.sendMessage(chatId, `❌ Ushbu portfolio o'chirib bo'lmaydi, avval unga bog'liq mahsulotlarni o'chiring.`);
            return;
        }
        await Portfolio.deleteOne({ _id: portfoli._id });
        bot.sendMessage(chatId, `✅ Portfolio muvaffaqiyatli o'chirildi: ${serviceName}`);
        await portfolio(chatId);
    });
}

const portfolioProducts = async (chatId, id, query) => {
    const user = await User.findOne({chatId}).lean();
    const portfoli = await Portfolio.findById(id).lean();
    user.action = 'products';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    let products = await Product.find({services: id }).lean();
    if (products.length === 0) {
        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, `<b>📂 ${portfoli.title} "Portfolio" sahifasi:

        🚫 Xizmatlar mavjud emas.</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: user.admin || user.owner ? [
                    [
                        {
                            text: '✏️',
                            callback_data: `new_portfolio_product-${id}`
                        },
                        {
                            text: '🗑',
                            callback_data: `del_portfoli_oproduct-${id}`
                        }
                    ],
                    [
                        {
                            text: '➕',
                            callback_data: `new_portfolio_product-${id}`
                        }
                    ]
                ] : [],
            }
        });
    } else {
        bot.deleteMessage(chatId, query.message.message_id);
        let list = products.map(product => 
       [
            {
                text:product.title,
                url: product.url
            }
        ]).concat(
            user.admin || user.owner ? [
                 [
                        {
                            text: '✏️',
                            callback_data: `edit_portfolio_product-${id}`
                        },
                        {
                            text: '🗑',
                            callback_data: `del_portfolio_product-${id}`
                        }
                    ],
                    [
                        {
                            text: '➕',
                            callback_data: `new_portfolio_product-${id}`
                        }
                    ]
            ] : [ ]
)
        bot.sendMessage(chatId, `<b>📂 ${portfoli.title} sahifasi:

     📌 O'zingizga kerakli portfolio tanlang </b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: list, // Use the list array here
            },
            parse_mode: 'HTML'
        });
    } 
}

const newPortfolioProduct = async (chatId, id) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `Yangi mahsulot nomini kiriting:`, {
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard: [
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_portfolio_product'
                    }
                ]
            ]
        }
    });
    user.action = 'new_product';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const productName = response.text;
        if (!productName || productName.trim() === '') {
            bot.sendMessage(chatId, `❌ Mahsulot nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        bot.sendMessage(chatId, ` Portfolio URL manzilini kiriting:`);
        bot.once('message', async (urlResponse) => {
            const productUrl = urlResponse.text;
            if (!productUrl || productUrl.trim() === '') {
                bot.sendMessage(chatId, `❌ URL manzili bo'sh bo'lishi mumkin emas.`);
                return;
            }
            const newProduct = new Product({
                title: productName,
                services: id,
                url: productUrl
            });
            await newProduct.save();
            bot.sendMessage(chatId, `✅ Yangi mahsulot muvaffaqiyatli qo'shildi: ${productName}\nURL: ${productUrl}`);
            portfolioProducts(chatId, id);
        });
    });
}

const deletePortfolioProduct = async (chatId, id) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `🔴 Portfolioni  o'chirish uchun mahsulot nomini kiriting:`,{
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard:[
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_product_portfolio'
                    }
                ]
            ]
        }
    });
    user.action = 'delete_product_portfolio';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const productName = response.text;
        if (!productName || productName.trim() === '') {
            bot.sendMessage(chatId, `❌ Mahsulot nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        const product = await Product.findOne({ title: productName });
        if (!product) {
            bot.sendMessage(chatId, `❌ Bunday mahsulot topilmadi.`);
            return;
        }
        await Product.deleteOne({ _id: product._id });
        bot.sendMessage(chatId, `✅ Mahsulot muvaffaqiyatli o'chirildi: ${productName}`);
        portfolioProducts(chatId, id);
    });
}

const editPortfoliyoProduct = async (chatId, id) => {
    const user = await User.findOne({chatId}).lean();   
    bot.sendMessage(chatId, `🟡 Mahsulotni tahrirlash uchun mahsulot nomini kiriting:`,{
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard:[
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_portfolio_product'
                    }
                ]
            ]
        }
    });
    user.action = 'edit_product';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const productName = response.text;
        if (!productName || productName.trim() === '') {
            bot.sendMessage(chatId, `❌ Mahsulot nomi bo'sh bo'lishi mumkin emas.`,{
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard:[
                        [
                            {
                                text: '❌ Bekor qilish',
                                callback_data: 'cencel_portfolio_product'
                            }
                        ]
                    ]
                }
            });
            return;
        }
        const product = await Product.findOne({ title: productName });
        if (!product) {
            bot.sendMessage(chatId, `❌ Bunday mahsulot topilmadi.`,{
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard:[
                        [
                            {
                                text: '❌ Bekor qilish',
                                callback_data: 'cencel_portfolio_product'
                            }
                        ]
                    ]
                }
            });
            return;
        }
        bot.sendMessage(chatId, `Mahsulotni yangi nomini kiriting:`);
        const newResponse = await new Promise((resolve) => {
            bot.once('message', (msg) => {
            resolve(msg);
            });
        });

        const newProductName = newResponse.text;
        if (!newProductName || newProductName.trim() === '') {
            bot.sendMessage(chatId, `❌ Yangi mahsulot nomi bo'sh bo'lishi mumkin emas.`,{
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard:[
                        [
                            {
                                text: '❌ Bekor qilish',
                                callback_data: 'cencel_portfolio_product'
                            }
                        ]
                    ]
                }
            });
            return;
        }
        product.title = newProductName;
        await product.save();
        bot.sendMessage(chatId, `✅ Mahsulot muvaffaqiyatli tahrirlandi: ${newProductName}`);

bot.sendMessage(chatId, `Mahsulotning yangi URL manzilini kiriting:`);
const urlResponse = await new Promise((resolve) => {
    bot.once('message', (msg) => {
        resolve(msg);
    });
});

const newProductUrl = urlResponse.text;
if (!newProductUrl || newProductUrl.trim() === '') {
    bot.sendMessage(chatId, `❌ URL manzili bo'sh bo'lishi mumkin emas.`, {
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard: [
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_portfolio_product'
                    }
                ]
            ]
        }
    });
    return;
}
product.url = newProductUrl;
await product.save();
bot.sendMessage(chatId, `✅ Mahsulot muvaffaqiyatli tahrirlandi: ${product.title}\nURL: ${newProductUrl}`);
portfolioProducts(chatId, id);
    });
}

module.exports = {
    portfolio,
    newPortfolio,
    editPortfolio,
    deletePortfolio,
    portfolioProducts,
    newPortfolioProduct,
    deletePortfolioProduct,
    editPortfoliyoProduct
}