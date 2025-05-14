const {bot} = require('./bot');
const User = require('../module/user');
const {
    newService, 
    editService, 
    servics, 
    deleteService, 
    products,
    newProduct,
    editProduct,
    deleteProduct
} = require('./helper/service');
const {newApp, openApp, AppsController} = require('./helper/apps');
const {ChannelAdd, ChannelRemove, makeAdmin, removiAdmin, changeOwner} = require('./helper/settings');
const { start } = require('./helper/start');
const {SearchUser} = require('./helper/users');
const {
    newPortfolio, 
    editPortfolio, 
    deletePortfolio, 
    portfolioProducts,
    newPortfolioProduct,
    deletePortfolioProduct,
    editPortfoliyoProduct
} = require('./helper/portfoli')

bot.on('callback_query', async query => {
    const {data} = query;
    const text = query.message.text;
    const chatId = query.from.id;
    const user = await User.findOne({chatId}).lean();
    console.log(data);
    if(data === 'new_service'){
        newService(chatId);
    }
    if(data === 'edit_service'){
        editService(chatId);
    }
    if(data === 'cencel_service'){
        servics(chatId);
    }
    if(data === 'del_service'){
        deleteService(chatId);
    }
    if(data.startsWith('service_')){
        const id = data.split('_')[1];
        products(chatId, id);
    }
    if(data.startsWith('new_product-')){
        const id = data.split('-')[1];
        newProduct(chatId, id);
    }
    if(data.startsWith('edit_product-')){
        const id = data.split('-')[1];
        editProduct(chatId, id);
    }
    if(data.startsWith('del_product')){
        const id = data.split('-')[1];
        deleteProduct(chatId,id);
    }
    if( data.startsWith('reset_product')){
        const id = data.split('-')[1];
        editService(chatId, id);
    }
    if(data === 'new_app'){
        newApp(chatId);
    }
    if(data.startsWith('app_')){
        const appId = data.split('_')[1];
        openApp(chatId, appId);
    }
    if(data === 'apps'){
        AppsController(chatId);
    }
    if(data === 'add_channel'){
        ChannelAdd(chatId);
    }
    if(data === 'remove_channel'){
        ChannelRemove(chatId);
    }
    if(data === 'search_user'){
        SearchUser(chatId,text);
    }
    if(data === 'new_portfolio'){
        newPortfolio(chatId);
    }
    if(data === 'edit_portfolio'){
        editPortfolio(chatId);
    }
    if(data === 'del_portfolio'){
        deletePortfolio(chatId);
    }
    if(data.startsWith('portfolio_')){
        const id = data.split('_')[1];
        portfolioProducts(chatId,id, query);
    }
    if(data.startsWith('new_portfolio_product-')){
        const id = data.split('-')[1];
        newPortfolioProduct(chatId, id);
    }
    if(data.startsWith('del_portfolio_product-')){
        const id = data.split('-')[1];
        deletePortfolioProduct(chatId, id);
    }
    if(data.startsWith('edit_portfolio_product-')){
        const id = data.split('-')[1];
        editPortfoliyoProduct(chatId, id)
    }
    if(data === 'make_admin'){
        makeAdmin(chatId);
    }
    if(data === 'remove_admin'){
        removiAdmin(chatId);
    }

    if(data === 'change_owner'){
        changeOwner(chatId);
    }
})