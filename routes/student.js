const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const path = require('path')
const Verifier = require("email-verifier")
const config = require('config')

const app = express()
const mailer = require('../private/nodemailer')
const Student = require('../models/Student')
const Class = require('../models/Class')
const { student } = require('../secret')
const authUser = require('../middleware/authUser')

// for body parser
app.use(express.urlencoded({ extended: false }))

// setting the static folder
app.use(express.static(path.join(__dirname, 'public')))

// setting the views folder
app.set('views', path.join(__dirname, 'views'))

// logout request 
router.get('/logout', (req, res) => {
    if (!req.session.user)
        return res.redirect('/')

    req.session.destroy(() => res.redirect('/'))
})

// login route for student
router.get('/', (req, res) => {
    if (req.session.user)
        return res.redirect('/home')

    res.render('student/Login', {
        title: 'Login - Student',
        error: '',
        action: 'student'
    })
})

// logging in student
router.post('/', async (req, res) => {
    const { email, password } = req.body
    try {
        let user = await Student.findOne({ email })
        if (!user)
            return res.render('student/Login', {
                title: 'Login - Student',
                action: 'student',
                error: 'User does not exists.'
            })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.render('student/Login', {
                title: 'Login - Student',
                action: 'student',
                error: 'Invalid Credentials.'
            })

        req.session.user = user
        req.session.type = student
        res.redirect(`/home`)
    }
    catch (err) {
        console.log(err)
        return res.render('student/Login', {
            title: 'Login - Student',
            action: 'student',
            error: 'Server Error'
        })
    }
})

// signup page for student
router.get('/register', (req, res) => {
    if (req.session.user)
        return res.redirect('/home')

    res.render('student/Signup', {
        title: 'Register - Student',
        error: ''
    })
})

// register the student
router.post('/register', async (req, res) => {
    let { name, email, password, regno, department, semester, batch, section } = req.body

    semester = parseInt(semester)
    batch = parseInt(batch)

    try {
        let user = await Student.findOne({ $or: [{ email }, { regno }] })

        if (user) {
            if (user.email === email)
                return res.render('student/Signup', {
                    title: 'Register - Student',
                    error: `User Already Exists`
                })

            return res.render('student/Signup', {
                title: 'Register - Student',
                error: `User Already Exists with RegNo: ${regno}`
            })
        }

        // verifying the email
        let verifier = new Verifier(config.get('WHO_API_KEY'))

        verifier.verify(email, async (err, data) => {
            if (err)
                return res.render('student/Signup', {
                    title: 'Register - Student',
                    error: 'Server Error'
                })

            if (data.smtpCheck === 'false')
                return res.render('student/Signup', {
                    title: 'Register - Student',
                    error: 'Entered Email does not exists.'
                })

            // entering the data in the database
            user = new Student({
                name,
                email,
                password,
                regno,
                semester,
                department,
                batch,
                section
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
            req.session.type = student
            res.redirect(`/home`)
        })
    }
    catch (err) {
        console.log(err)
        res.render('student/Signup', {
            title: 'Register - Student',
            error: 'Server error'
        })
    }
})

// home page for student
router.get('/home', authUser, async (req, res) => {
    if (!req.session.user)
        return res.redirect('/login')

    try {
        const { classes } = req.session.user
        // if no classes
        if (!classes.length)
            return res.render('student/Home', {
                title: 'SRM-GCR',
                user: req.session.user,
                classes: [],
                msg: 'No Classes.'
            })

        const classDet = await Class.find({ "_id": { $in: classes } }).populate('teacher', ['name', 'faculty_id'])
        return res.render('student/Home', {
            title: 'SRM-GCR',
            user: req.session.user,
            classes: classDet,
            msg: ''
        })

    }
    catch (err) {
        console.log(err)
        res.render('student/Home', {
            title: 'SRM-GCR',
            user: req.session.user,
            classes: [],
            msg: 'Server Error'
        })
    }
})

// searched class
router.get('/search/class', authUser, (req, res) => {

    if (!req.session.user)
        return res.redirect('/')

    const { q: key } = req.query    
    res.render('student/Search', {
        title: `Results for - ${key}`,
        user: req.session.user,
    })
})

// get the courses requested by the student
router.get('/requests', authUser, async (req, res) => {
    if (!req.session.user)
        return res.redirect('/')

    try {
        const { requests } = req.session.user
        const cls = await Class.find({ _id: { $in: requests } }).populate('teacher', ['name', 'faculty_id']).select(['subject', 'code'])

        if (!cls.length)
            return res.render('student/Requests', {
                title: `No Requested Courses`,
                user: req.session.user,
                cls: [],
                msg: 'No Courses Requested'
            })

        res.render('student/Requests', {
            title: `${cls.length} Requested Courses`,
            user: req.session.user,
            cls,
            msg: ''
        })
    }
    catch (err) {
        console.log(err)
        res.render('student/Requests', {
            title: `SRM - GCR`,
            user: req.session.user,
            cls: [],
            msg: 'Server Error'
        })
    }
})

module.exports = router
