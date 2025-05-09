const {Schema, model} = require('mongoose');

const Product = new Schema({
    services: {
        type: Schema.Types.ObjectId,
        ref: 'Services'
    },
    title: String,
    price:String
});

module.exports = model('Products', Product);