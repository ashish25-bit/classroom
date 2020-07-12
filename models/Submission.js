const mongoose = require('mongoose')

const SubmissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class',
        required: true
    },
    attachments: [],
    fileName: [],
    submitted: {
        type: Date, 
        default: Date.now(),
        required: true
    },
    checked: {
        type: Boolean,
        default: false
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
    },
    status: {
        type: Boolean,
        required: true
    }
    // if false -> means late submission
    // if true -> means submission on time
})

module.exports = Submission = mongoose.model('submission', SubmissionSchema)
