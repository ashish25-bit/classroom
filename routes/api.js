const express = require('express')
const router = express.Router()

const subjects = require('../private/subjects')
const Class = require('../models/Class')
const Announcement = require('../models/Announcements')

// get the options for subject and subject code
router.get('/code/subject/:semester/:dept', (req, res) => {
    try {
        const { semester, dept } = req.params
        const department = subjects[dept]
        const courses = department[semester]
        res.send(courses)
    }
    catch (err) {
        console.log(err)
    }
})

router.post('/add/class', async (req, res) => {
    let { name, department, semester, batch, section, subject, code } = req.body

    semester = parseInt(semester)
    batch = parseInt(batch)

    try {

        const cls = await Class.findOne({ name: name })
        if (cls)
            return res.send('Someone has already registered for this class.')

        const newClass = new Class({
            teacher: req.session.user._id,
            name,
            department,
            semester,
            batch,
            section,
            subject,
            code
        })

        await newClass.save()
        res.send('New Class Made')
    }
    catch (err) {
        console.log(err)
        res.send('Server Error')
    }
})

// request for class
router.post('/request/class', async (req, res) => {
    const { id } = req.body
    try {
        const user = await Student.findOne({ _id: req.session.user._id })
        const classStudents = await Class.findOne({ _id: id })
        // if already registered to class then remove
        if (user.requests.includes(id)) {
            let index = user.requests.indexOf(id)
            user.requests.splice(index, 1)
            await user.save()
            req.session.user = user
            index = classStudents.requests.indexOf(req.session.user._id)
            classStudents.requests.splice(index, 1)
            await classStudents.save()
            res.status(200).send('Request Cancelled')
        }

        // register here if not registered
        else {
            user.requests.unshift(id)
            await user.save()
            req.session.user = user
            classStudents.requests.unshift(req.session.user._id)
            await classStudents.save()
            res.status(200).send('Requested')
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})

// get the students for a class
router.get('/class/students/:name', async (req, res) => {
    if (req.session.user) {
        const { name } = req.params
        try {
            const cls = await Class.findOne({ name })
            const students = await Student.find({ _id: { $in: cls.students } })
                .select(['-password', '-email', '-date', '-classes', '-requests'])
                .sort({ regno: 1 })
            res.json({ students, error: '' })
        }
        catch (err) {
            console.log(err)
            res.json({ students: [], error: 'Server Error' })
        }
    }
})

// get the students who have requested for a course
router.get('/request/students/:id', async (req, res) => {
    if (!req.session.user)
        return res.redirect('/')

    try {
        const { id } = req.params
        const cls = await Class.findOne({ _id: id })
        const students = await Student.find({ _id: { $in: cls.requests } })
            .select(['-password', '-date', '-email', '-requests', '-classes'])
        res.send(students)
    }
    catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})

// faculty accepts the request
router.put('/accept/course/request', async (req, res) => {
    const { id, name } = req.body
    try {
        const cls = await Class.findOne({ name })
        const cid = cls._id
        const student = await Student.findOne({ _id: id })
        let index = cls.requests.indexOf(id)
        cls.requests.splice(index, 1)
        index = student.requests.indexOf(cls)
        student.requests.splice(index, 1)
        cls.students.push(id)
        student.classes.push(cid)
        await cls.save()
        await student.save()
        res.send('Request Accepted')
    }
    catch (err) {
        console.log(err)
        res.send('Error')
    }
})

// get the requests
router.get('/get/requests', async (req, res) => {
    if (!req.session.user)
        return res.redirect('/')

    try {
        const user = await Student.findOne({ _id: req.session.user._id })
        res.send(user.requests)
    }
    catch (err) {
        console.log(err)
    }
})

// search for the courses
router.get('/search/:key', async (req, res) => {
    try {
        const { key } = req.params
        const regex = new RegExp(escapeRegex(key), 'i')

        const user = await Student.findOne({ _id: req.session.user._id })

        // searching for the classes which student is not a part of..
        // the requested courses will be shown
        const classes = await Class.find({
            $and: [
                {
                    $or: [
                        { name: { $regex: regex } },
                        { subject: { $regex: regex } },
                    ]
                },
                { _id: { $nin: user.classes } }
            ]
        }).populate('teacher', ['name', 'faculty_id'])
        res.json({ classes, error: '', requests: user.requests })
    }
    catch (err) {
        res.json({ classes: [], error: 'Server Error', requests: [] })
    }
})

// post the announcements
router.post('/post/announcement', async (req, res) => {
    const { post, name, context } = req.body

    try {
        const cls = await Class.findOne({ name })
        const announcement = new Announcement({
            class: cls._id,
            post,
            context
        })
        await announcement.save()
        res.send('Posted')
    }
    catch (err) {
        console.log(err)
        res.send('Sever Error')
    }
})

// get the announcements
router.get('/get/announcement/:name', async (req, res) => {
    if (!req.session.user)
        return res.redirect('/')
    
    try {
        const { name } = req.params
        const cls = await Class.findOne({ name })
        const announcement = await Announcement.find({ class: cls._id }).sort({ date: -1 })
        res.send(announcement)   
    } 
    catch (err) {
        console.log(err)
        res.send('Server Error')
    }
})

// returns the regex expression
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

module.exports = router
