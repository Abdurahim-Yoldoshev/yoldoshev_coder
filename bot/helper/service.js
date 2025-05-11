const {bot} = require('../bot.js');
const User = require('../../module/user.js');
const Service = require('../../module/services.js');
const Product = require('../../module/product.js');

const servics = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    const services = await Service.find({}).lean();
    user.action = 'services';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    if (services.length === 0) {
        bot.sendMessage(chatId, `🚫 Xizmatlar mavjud emas.`, {
            reply_markup: {
                inline_keyboard: user.admin || user.owner ? [
                    [
                        {
                            text: '✏️',
                            callback_data: 'new_service'
                        },
                        {
                            text: '🗑',
                            callback_data: 'del_service'
                        }
                    ],
                    [
                        {
                            text: '➕',
                            callback_data: 'new_service'
                        }
                    ]
                ] : [],
            }
        });
    } else {
        let list = services.map(service => 
       [
            {
                text: '📁'+service.title,
                callback_data: `service_${service._id}`
            }
        ]).concat(
            user.admin || user.owner ? [
                [
                    {
                        text: '✏️',
                        callback_data: 'edit_service'
                    },
                    {
                        text: '🗑',
                        callback_data: 'del_service'
                    }
                ],
                [
                    {
                        text: '➕',
                        callback_data: 'new_service'
                    }
                ]
            ] : [
       ]
       )
        bot.sendMessage(chatId, `💎 Xizmatlar sahifasi:

     📁 O'zingizga kerakli xizmatni tanlang:`, {
            reply_markup: {
                inline_keyboard: list, // Use the list array here
            },
            parse_mode: 'HTML'
        });
    }
}

const newService = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    const services = await Service.find({}).lean();
    bot.sendMessage(chatId, `Yangi xizmat nomini kiriting:`,{
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
    user.action = 'new_service';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const serviceName = response.text;
        if (!serviceName || serviceName.trim() === '') {
            bot.sendMessage(chatId, `❌ Xizmat nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        const newService = new Service({ title: serviceName });
        await newService.save();
        bot.sendMessage(chatId, `✅ Yangi xizmat muvaffaqiyatli qo'shildi: ${serviceName}`);
        servics(chatId);
    });
}

const editService = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `Xizmatni tahrirlash uchun xizmat nomini kiriting:`,{
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
    user.action = 'edit_service';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const serviceName = response.text;
        if (!serviceName || serviceName.trim() === '') {
            bot.sendMessage(chatId, `❌ Xizmat nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        const service = await Service.findOne({ title: serviceName });
        if (!service) {
            bot.sendMessage(chatId, `❌ Bunday xizmat topilmadi.`);
            return;
        }
        await bot.sendMessage(chatId, `Xizmatni yangi nomini kiriting:`);
        bot.once('message', async (newResponse) => {
            const newServiceName = newResponse.text;
            if (!newServiceName || newServiceName.trim() === '') {
                bot.sendMessage(chatId, `❌ Yangi xizmat nomi bo'sh bo'lishi mumkin emas.`);
                return;
            }
            service.title = newServiceName;
            await service.save();
            bot.sendMessage(chatId, `✅ Xizmat muvaffaqiyatli tahrirlandi: ${newServiceName}`);
            servics(chatId);
        });
    });
}

const deleteService = async (chatId) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `Xizmatni o'chirish uchun xizmat nomini kiriting:`, {
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard: [
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_service'
                    }
                ]
            ]
        }
    });
    user.action = 'delete_service';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    bot.once('message', async (response) => {
        const serviceName = response.text;
        if (!serviceName || serviceName.trim() === '') {
            bot.sendMessage(chatId, `❌ Xizmat nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        const service = await Service.findOne({ title: serviceName });
        if (!service) {
            bot.sendMessage(chatId, `❌ Bunday xizmat topilmadi.`);
            return;
        }
        const productsCount = await Product.countDocuments({ services: service._id });
        if (productsCount > 0) {
            bot.sendMessage(chatId, `❌ Ushbu xizmatni o'chirib bo'lmaydi, avval unga bog'liq mahsulotlarni o'chiring.`);
            return;
        }
        await Service.deleteOne({ _id: service._id });
        bot.sendMessage(chatId, `✅ Xizmat muvaffaqiyatli o'chirildi: ${serviceName}`);
        await servics(chatId);
    });
}

const products = async (chatId, id) => {
    const user = await User.findOne({chatId}).lean();
    const services = await Service.findById(id).lean();
    user.action = 'products';
    await User.findByIdAndUpdate(user._id, user, {new: true});
    let products = await Product.find({services: id }).lean();
    if (products.length === 0) {
        bot.sendMessage(chatId, `<b>📂 ${services.title} sahifasi:

        🚫 Xizmatlar mavjud emas.</b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: user.admin || user.owner ? [
                    [
                        {
                            text: '✏️',
                            callback_data: `new_product-${id}`
                        },
                        {
                            text: '🗑',
                            callback_data: `del_product-${id}`
                        }
                    ],
                    [
                        {
                            text: '➕',
                            callback_data: `new_product-${id}`
                        }
                    ]
                ] : [],
            }
        });
    } else {
        let list = products.map(product => 
       [
            {
                text: `${product.title} - ${product.price} 000 so'm`,
                callback_data: `product_${product._id}`
            }
        ]).concat(
            user.admin || user.owner ? [
                 [
                        {
                            text: '✏️',
                            callback_data: `edit_product-${id}`
                        },
                        {
                            text: '🗑',
                            callback_data: `del_product-${id}`
                        }
                    ],
                    [
                        {
                            text: '➕',
                            callback_data: `new_product-${id}`
                        }
                    ]
            ] : [ ]
)
        bot.sendMessage(chatId, `<b>📂 ${services.title} sahifasi:

     📁 O'zingizga kerakli xizmatni tanlang </b>`, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: list, // Use the list array here
            },
            parse_mode: 'HTML'
        });
    } 
}

const newProduct = async (chatId, id) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `Yangi xizmat nomini kiriting:`,{
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard:[
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_product'
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
            bot.sendMessage(chatId, `❌ Xizmat nomi bo'sh bo'lishi mumkin emas.`);
            return;
        }
        const newProduct = new Product({ 
            title: productName,
            services: id
        });
        await newProduct.save();
        bot.sendMessage(chatId, `Mahsulotning narxini kiriting:`, {
            reply_markup: {
            remove_keyboard: true,
            inline_keyboard: [
                [
                {
                    text: '❌ Bekor qilish',
                    callback_data: 'cencel_product'
                }
                ]
            ]
            }
        });
        bot.once('message', async (priceResponse) => {
            const productPrice = parseFloat(priceResponse.text);
            if (isNaN(productPrice) || productPrice <= 0) {
            bot.sendMessage(chatId, `❌ Narx noto'g'ri kiritilgan. Iltimos, to'g'ri qiymat kiriting.`);
            return;
            }
            newProduct.price = productPrice;
            await newProduct.save();
            bot.sendMessage(chatId, `✅ Yangi mahsulot muvaffaqiyatli qo'shildi: ${productName} - ${productPrice} 000 so'm`);
            products(chatId, id);
        });
    });
}

const deleteProduct = async (chatId, id) => {
    const user = await User.findOne({chatId}).lean();
    bot.sendMessage(chatId, `Mahsulotni o'chirish uchun mahsulot nomini kiriting:`,{
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard:[
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: 'cencel_product'
                    }
                ]
            ]
        }
    });
    user.action = 'delete_product';
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
        products(chatId, id);
    });
}

const editProduct = async (chatId, id) => {
    const user = await User.findOne({chatId}).lean();   
    bot.sendMessage(chatId, `Mahsulotni tahrirlash uchun mahsulot nomini kiriting:`,{
        reply_markup: {
            remove_keyboard: true,
            inline_keyboard:[
                [
                    {
                        text: '❌ Bekor qilish',
                        callback_data: `cencel_product-${id}`
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
                                text: '♻️ Qayta kiritish',
                                callback_data: `reset_product-${id}`
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
                                text: '♻️ Qayta kiritish',
                                callback_data: `reset_product-${id}`
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
                                text: '♻️ Qayta kiritish',
                                callback_data: `reset_product-${id}`
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

        bot.sendMessage(chatId, `Mahsulotning yangi narxini kiriting:`);
        const priceResponse = await new Promise((resolve) => {
            bot.once('message', (msg) => {
            resolve(msg);
        });
});

        const newProductPrice = parseFloat(priceResponse.text);
        if (isNaN(newProductPrice) || newProductPrice <= 0) {
            bot.sendMessage(chatId, `❌ Narx noto'g'ri kiritilgan. Iltimos, to'g'ri qiymat kiriting.`,{
                reply_markup: {
                    remove_keyboard: true,
                    inline_keyboard:[
                        [
                            {
                                text: '♻️ Qayta kiritish',
                                callback_data: `reset_product-${id}`
                            }
                        ]
                    ]
                }
            });
            return;
        }
        product.price = newProductPrice;
        await product.save();
        bot.sendMessage(chatId, `✅ Mahsulot muvaffaqiyatli tahrirlandi: ${product.title} - ${newProductPrice} 000 so'm`);
        products(chatId, id);
    });
}

module.exports = {
    servics,
    newService,
    editService,
    deleteService,
    products,
    newProduct,
    editProduct,
    deleteProduct
}