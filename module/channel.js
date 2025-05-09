const {Schema, model} = require('mongoose');

const Channel = new Schema({
    channelName: String,
    channelId: Number,
    channelLink: String,
    channelStatus: {
        type: Boolean,
        default: true
    },
    channelCreatedAt: Date,
    channelAdmin: {
        type: Boolean,
        default: false
    },
    type: String,
});

module.exports = model('Channel', Channel);