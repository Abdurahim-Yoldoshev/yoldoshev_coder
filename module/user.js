const {Schema, model} = require('mongoose');

const User = new Schema({
    name:String,
    chatId:Number,
    phone:String,
    admin: {
        type:Boolean,
        defualt:false
    },
    action:String,
    status: {
        type:Boolean,
        defualt:true
    },
    creted:Date
})

module.exports = model('User', User);