const express = require('express')
const router = express.Router()
const path = require('path')

const app = express()
const { student, teacher } = require('../secret')
const Class = require('../models/Class')

// setting the static folder
app.use(express.static(path.join(__dirname, 'public')))

// setting the views folder
app.set('views', path.join(__dirname, 'views'))

router.get('/:name', async (req, res) => {
    if (!req.session.user)
        return res.redirect('/')

    const type = req.session.type === student ? 'student' : 'teacher'
    try {
        const { name } = req.params

        const cls = await Class.findOne({ name }).populate('teacher', ['name', 'faculty_id'])
        if (!cls)
            return res.render('common/NotFound', {
                title: 'Class Not Found',
                user: req.session.user,
                type
            })

        if (req.session.type === student) {
            if (!cls.students.includes(req.session.user._id))
                return res.render('common/Classroom', {
                    title: `Not Authorized`,
                    user: req.session.user,
                    type,
                    error: 'You are not authorize to enter this class.'
                })
        }

        if (req.session.type === teacher) {
            if(cls.teacher._id != req.session.user._id) 
                return res.render('common/Classroom', {
                    title: `${cls.subject} classroom`,
                    user: req.session.user,
                    type,
                    error: 'You are not authorize to enter this class.'
                })
        }

        res.render('common/Classroom', {
            title: `${cls.subject} classroom`,
            user: req.session.user,
            type,
            cls,
            error: ''
        })
    }
    catch (err) {
        console.log(err)
        res.render('common/Classroom', {
            title: 'Server Error',
            user: req.session.user,
            type,
            error: 'Server Error'
        })
    }
})

// to the message room
router.get('/message/room/:name', (req, res) => {
    if (!req.session.user)
        return res.redirect('/')

    const type = req.session.type === student ? 'student' : 'teacher'
    res.render('common/Chat', {
        title: 'Message Room',
        user: req.session.user,
        type
    })
})

// get the assignment page
router.get('/assignment/:name', async (req, res) => {
    if (!req.session.user)
        return res.redirect('/')
    
    const type = req.session.type === student ? 'student' : 'teacher'
    try {
        const { name } = req.params
        const cls = await Class.findOne({ name }).select('subject')
        if (!cls) 
            return res.render('common/Assignment', {
                title: 'Class Not Found',
                user: req.session.user,
                type,
                msg: 'Class Not Found'
            })   
        
        res.render('common/Assignment', {
            title: `${cls.subject} - Assignment`,
            user: req.session.user,
            type,
            msg: ''
        })
    } 
    catch (err) {
        console.log(err)
        res.render('common/Assignment', {
            title: 'Error',
            user: req.session.user,
            type,
            msg: 'Server Error'
        })
    }
})

// video route
router.get('/video/room/:name', (req, res) => {
    if (!req.session.user)
        return res.redirect('/')
    
    res.render('common/Video', {
        title: 'Video Room'
    })
})

module.exports = router