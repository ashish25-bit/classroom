const mongoose = require('mongoose')

const AssignmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now()
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class'
    },
    title: {
        type: String,
        required: true
    },
    description: { 
        type: String 
    },
    submissionDate: {
        type: String,
        required: true
    },
    attachments:[],
    fileName: [],
    students: []
})

module.exports = Assignment = mongoose.model('assignment', AssignmentSchema)
