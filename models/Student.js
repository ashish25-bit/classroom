const mongoose = require('mongoose')

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    regno: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    department: {
        type: String,
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
    date: {
        type: Date,
        default: Date.now()
    },
    classes: [],
    requests: []
})

module.exports = Student = mongoose.model('student', StudentSchema)