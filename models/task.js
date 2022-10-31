const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    done: {
        type: Boolean,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Task', taskSchema)