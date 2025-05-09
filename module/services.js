const {Schema, model} = require('mongoose');

const Service = new Schema({
    title: String,
});

module.exports = model('Services', Service);