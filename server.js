const express = require('express')
const session = require('express-session')
const path = require('path')
const config = require('config')
// const fs = require('fs')
const socketio = require('socket.io')
const http = require('http')
// const https = require('https')
const connectDb = require('./core/db')
const { joinRoom, showRoom, removeUser } = require('./utils/chat')

// const options = {
//     key: fs.readFileSync('./server.key'),
//     cert: fs.readFileSync('./server.cert')
// }

const app = express()
connectDb()
const server = http.createServer(app)
const io = socketio(server)

// initialize the body parser for ajax calls
app.use(express.json({ extented: false }))

// initialize body parser for normal logging in and signing in 
app.use(express.urlencoded({ extended: false }))

// setting the static folder
app.use(express.static(path.join(__dirname, '/public')))
app.use('/faculty', express.static('public'))
app.use('/chat', express.static('public'))
app.use('/search', express.static('public'))
app.use('/faculty/add', express.static('public'))
app.use('/faculty/class', express.static('public'))
app.use('/faculty/register', express.static('public'))
app.use('/faculty/request', express.static('public'))
app.use('/classroom', express.static('public'))
app.use('/classroom/message/room/', express.static('public'))
app.use('/classroom/assignment/', express.static('public'))

//set template engine 
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.disable('x-powered-by')
// setting the proxy
app.set('trust proxy', 1)
// setting the session
app.use(session({
    secret: config.get('SESSION_SECRET'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000
    } // 5 days cookie
}))

// setting up the routes
app.use('/', require('./routes/student'))
app.use('/faculty', require('./routes/faculty'))
app.use('/api', require('./routes/api'))
app.use('/classroom', require('./routes/classroom'))

//errors
app.use((req, res, next) => {
    var err = new Error('Page Not found')
    err.status = 404
    next(err)
})

// socket connections
io.on('connection', socket => {
    // join the chat room 
    socket.on('joinRoom', rooms => {
        rooms.forEach(room => {
            user = joinRoom(room, socket.id)
            socket.join(user.room)
        })
    })

    // checking the user when he is disconnected
    socket.on('disconnect', () => removeUser(socket.id))

    // to show all the rooms
    socket.on('showRoom', () => showRoom())

    // receive the message
    socket.on('sendMessage', info => socket.broadcast.to(info.room).emit('message', info))
})

//handling error
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send(err.message)
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`)) 