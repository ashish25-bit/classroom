const mongoose = require('mongoose')

const ClassSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher'
    },
    name: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    batch: {
        type: Number,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    students: [],
    requests: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'student',
                required: true
            },
            date: {
                type: Date,
                default: Date.now()
            }
        }
    ]
})

module.exports = Class = mongoose.model('class', ClassSchema)