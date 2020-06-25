const mongoose = require('mongoose')

const AnnouncementSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class'
    },
    context: {
        type: String,
        required: true
    },
    post: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = Announcement = mongoose.model('announcement', AnnouncementSchema)
