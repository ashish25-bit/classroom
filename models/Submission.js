const mongoose = require('mongoose')

const SubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class',
        required: true
    },
    attachment: [],
    fileName: [],
    submitted: {
        type: Date, 
        default: Date.now(),
        required: true
    },
    status: {
        type: String,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student', 
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class',
        required: true
    }
})

module.exports = Submission = mongoose.model('submission', SubmissionSchema)
