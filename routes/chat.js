const express = require('express')
const router = express.Router()
const path = require('path')

const app = express()

// setting the static folder
app.use(express.static(path.join(__dirname, 'public')))

// setting the views folder
app.set('views', path.join(__dirname, 'views'))

router.get('/room', (req, res) => {
    if (!req.session.user)
        return res.redirect('/')

    res.render('Chat', {
        title: 'Chat Room',
        user: req.session.user,
        type: req.session.type
    })    
})

module.exports = router
