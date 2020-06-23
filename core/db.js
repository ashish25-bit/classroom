const mongoose = require('mongoose')
const config = require('config')
const db = config.get('DB')

const connectDb = async () => {
    try {
        await mongoose.connect(db , {
            useNewUrlParser : true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        console.log('Mongodb connected')
    }
    catch(err) {
        console.error(err.message)
        // exit the app when there is failure in connecting to the database
        process.exit(1)
    }
}

module.exports = connectDb