const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
require('./bot/bot');

async function dev() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((error) => {
            console.log("Xatolik:"+error);
        })

        app.listen(process.env.PORT, () => {
            console.log('Server is running on port: ' + process.env.PORT);
    })}
    catch (error) {
        console.log(error);
        
    }
}

dev();