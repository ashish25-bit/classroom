const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class',
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'fromModel',
        required: true
    },
    fromModel: {
        type: String,
        enum: ['teacher', 'student'],
        required: true
    },
    message:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = Message = mongoose.model('message', MessageSchema)
