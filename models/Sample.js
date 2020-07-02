const mongoose = require('mongoose')

const SampleSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'class'
    },
    students: [],
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = Sample = mongoose.model('sample', SampleSchema)
