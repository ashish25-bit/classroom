const mongoose = require('mongoose')

const DocumentSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class'
    },
    context: {
        type: String,
        required: true
    },
    attachments: [],
    fileName: [],
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = Document = mongoose.model('document', DocumentSchema)