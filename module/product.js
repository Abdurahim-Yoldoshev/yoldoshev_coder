const {Schema, model} = require('mongoose');

const Product = new Schema({
    services: {
        type: Schema.Types.ObjectId,
        ref: 'Services'
    },
    title: String,
    price:String,
    description: {
        type: String,
        defult: 'Xizmat haqida ma\'lumotlar yo\'q'
    }
});

module.exports = model('Products', Product);