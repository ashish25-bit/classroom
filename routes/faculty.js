const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const path = require('path')
const Verifier = require("email-verifier")
const config = require('config')

const app = express()
const mailer = require('../private/nodemailer')
const Teacher = require('../models/Teacher')
const Class = require('../models/Class')
const { teacher, departments, sections, semesters, batches } = require('../secret')
const authUser = require('../middleware/authUser')

// setting the static folder
app.use(express.static(path.join(__dirname, 'public')))

// setting the views folder
app.set('views', path.join(__dirname, 'views'))

// login route for faculty
router.get('/login', (req, res) => {
    if (req.session.user)
        return res.redirect('/faculty/home')

    res.render('faculty/Login', {
        title: 'Login - Faculty',
        error: '',
        action: 'faculty'
    })
})

// logging in the user
router.post('/login', async (req, res) => {
    const { email, password } = req.body
    try {
        let user = await Teacher.findOne({ email })
        if (!user)
            return res.render('faculty/Login', {
                title: 'Login - Faculty',
                action: 'faculty',
                error: 'User does not exists.'
            })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.render('faculty/Login', {
                title: 'Login - Faculty',
                action: 'faculty',
                error: 'Invalid Credentials.'
            })

        req.session.user = user
        req.session.type = teacher
        res.redirect(`/classroom/18DEV001J-CSE-C2-5-Batch2`)
    }
    catch (err) {
        console.log(err)
        return res.render('faculty/Login', {
            title: 'Login - Faculty',
            action: 'faculty',
            error: 'Server Error'
        })
    }
})

// get the signup for faculty
router.get('/signup', (req, res) => {
    if (req.session.user)
        return res.redirect('/faculty/home')
    res.render('faculty/Signup', {
        title: 'Register - Faculty',
        error: ''
    })
})

// registering the faculty
router.post('/register', async (req, res) => {
    const { name, email, password, faculty_id, position, department } = req.body

    try {

        let user = await Teacher.findOne({ $or: [{ email }, { faculty_id }] })

        // if the user exists
        if (user) {
            if (user.email === email)
                return res.render('faculty/Signup', {
                    title: 'Register - Faculty',
                    error: `User Already Exists`
                })

            return res.render('faculty/Signup', {
                title: 'Register - Faculty',
                error: `User Already Exists with ID: ${faculty_id}`
            })
        }

        // verifying the email
        let verifier = new Verifier(config.get('WHO_API_KEY'))

        verifier.verify(email, async (err, data) => {
            if (err)
                return res.render('faculty/Signup', {
                    title: 'Register - Faculty',
                    error: 'Server Error'
                })

            if (data.smtpCheck === 'false')
                return res.render('faculty/Signup', {
                    title: 'Register - Faculty',
                    error: 'Entered Email does not exists.'
                })

            // entering the data in the database
            user = new Teacher({
                name,
                email,
                password,
                faculty_id,
                position,
                department
            })

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(password, salt)
            await user.save()

            // sending the mail
            const subject = 'Welcome To SRM-GCR'
            const text = `Hello ${name}, thanks for using SRM-GCR. No Reply Mail`
            mailer(email, subject, text)

            // setting the session
            req.session.user = user
            req.session.type = teacher
            res.redirect(`/faculty/home`)
        })
    }
    catch (err) {
        console.log(err)
        res.render('faculty/Signup', {
            title: 'Register - Faculty',
            error: 'Server error'
        })
    }
})

// home page for faculty
router.get('/home', authUser, async (req, res) => {
    if (!req.session.user)
        return res.redirect('/faculty/login')

    try {
        const classes = await Class.find({ teacher: req.session.user._id })

        if (!classes || !classes.length)
            return res.render('faculty/Classes', {
                title: 'Home - Faculty',
                user: req.session.user,
                msg: 'No Classes Found',
                classes: [],
            })

        res.render('faculty/Classes', {
            title: 'Home - Faculty',
            user: req.session.user,
            msg: '',
            classes,
        })
    }
    catch (err) {
        console.log(err)
        res.render('faculty/Classes', {
            title: 'Home - Faculty',
            user: req.session.user,
            msg: 'Error in getting the classes',
            classes: [],
        })
    }
})

// get add class page
router.get('/add/class', authUser, (req, res) => {
    if (!req.session.user)
        return res.redirect('/faculty/login')

    res.render('faculty/Add', {
        title: 'Add Class',
        user: req.session.user,
        departments,
        semesters,
        sections,
        batches
    })
})

// get the requests page
router.get('/requests', authUser, async (req, res) => {
    if (!req.session.user)
        return res.redirect('/')

    try {
        const requests = await Class.find({
            requests: { $exists: true, $not: { $size: 0 } }
        })
        
        if(!requests.length)
            return res.render('faculty/Requests', { 
                title: 'Requests', 
                user: req.session.user, 
                requests,
                msg: 'No Requests'
            })

        res.render('faculty/Requests', { 
            title: 'Requests', 
            user: req.session.user, 
            requests,
            msg: ''
        })
    }
    catch (err) {
        res.render('faculty/Requests', {
            title: 'Requests', 
            user: req.session.user, 
            requests: [],
            msg: 'Server Error'
        })
    }
})

// get the requests for a particular course
router.get('/request/:name', authUser, async (req, res) => {
    if(!req.session.user)
        return res.redirect('/')
    
    try {
        const { name } = req.params
        const cls = await Class.findOne({ name }).select(['-name, -students, -batch, -teacher'])
        
        if(!cls)
            return res.render('faculty/Request', {
                title: `No class found`,
                user: req.session.user,
                cls: {},
                msg: 'No Class Found',
            })

        res.render('faculty/Request', {
            title: `Requests for ${cls.subject}`,
            user: req.session.user,
            cls,
            msg: '',
        })
    } 
    catch (err) {
        console.log(err)
        res.render('faculty/Request', {
            title: 'Server Error',
            user: req.session.user,
            cls: {},
            msg: 'Server Error',
        })
    }
})

module.exports = router
