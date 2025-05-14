const {Schema, model} = require('mongoose');

const PortfolioSchema = new Schema({
    title:String,
});

module.exports = model('portolio', PortfolioSchema);