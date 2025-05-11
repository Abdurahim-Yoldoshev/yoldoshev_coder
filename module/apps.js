const {Schema, model} = require('mongoose');

const appsSchema = new Schema({
    fileId: String,
    title: String,
    description: String,
    name: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = model('Apps', appsSchema);