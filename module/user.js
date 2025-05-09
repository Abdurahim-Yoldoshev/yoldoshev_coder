const {Schema, model} = require('mongoose');

const User = new Schema({
    fullName:String,
    chatId:Number,
    phone:String,
    owner: {
        type:Boolean,
        default:false
    },
    admin: {
        type:Boolean,
        defualt:false
    },
    action:String,
    status: {
        type:Boolean,
        defualt:true
    },
    createdAt:Date,
});

module.exports = model('User', User);