const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const subjects = require('../private/subjects')
const Class = require('../models/Class')
const Announcement = require('../models/Announcements')
const Document = require('../models/Document')
const Message = require('../models/Messages')
const Student = require('../models/Student')
const { student } = require('../secret')

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
    if (!req.session.user)
        return res.json({ students: [], error: 'Not Logged in' })

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
})

// get the students who have requested for a course
router.get('/request/students/:id', async (req, res) => {
    if (!req.session.user)
        return res.send('Not logged in')

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
        return res.send('Not logged in')

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
    if (!req.session.user)
        return res.send('Not logged in')

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
        return res.send('Not logged in')

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

// get the class groups
router.get('/class/groups', async (req, res) => {
    if (!req.session.user)
        return res.send('Not logged in')

    try {
        // if the user is a student
        if (req.session.type === student) {
            const user = await Student.findOne({ _id: req.session.user._id })
            const groups = await Class.find({ _id: { $in: user.classes } }).select(['name', 'subject', 'code']).sort({ subject: 1 })
            res.send(groups)
            return
        }

        // if the requested user is a teacher
        const groups = await Class.find({ teacher: req.session.user._id }).select(['name', 'subject', 'code']).sort({ subject: 1 })
        res.send(groups)
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }
})

// get the class details
router.get('/class/details/:name', async (req, res) => {
    if (!req.session.user)
        return res.send('Not logged in')

    try {
        const { name } = req.params
        const cls = await Class.findOne({ name })
            .populate('teacher', ['name', 'faculty_id'])
            .select(['-requests', '-_id'])
        if (!cls)
            return res.json({ cls, msg: 'Requested Class Does Not Exists' })
        res.json({ cls, msg: '' })
    }
    catch (err) {
        console.log(err)
        res.json({ cls: {}, msg: 'Server Error' })
    }
})

// document upload route
router.post('/document/upload', async (req, res) => {
    const { name } = req.query
    if (!fs.existsSync(`./public/documents/${name}`))
        await fs.mkdirSync(`./public/documents/${name}`)

    let storage = multer.diskStorage({
        destination: `./public/documents/${name}`,
        filename: (req, file, cb) => {
            cb(null, `${file.fieldname}-${new Date()}-(${Date.now()})${path.extname(file.originalname)}`)
        }
    })

    const upload = multer({ storage: storage }).array('myfile')
    upload(req, res, async err => {
        if (err) {
            console.log(err)
            return res.send('Server Error')
        }
        let attachments = []
        for (let i = 0; i < req.files.length; i++)
            attachments.push(req.files[i].filename)

        try {
            const { context, fileName } = req.body
            const cls = await Class.findOne({ name })
            const document = new Document({
                class: cls._id,
                context,
                attachments,
                fileName
            })
            await document.save()
            res.send('Documents Uploaded')
        }
        catch (err) {
            console.log(err)
            res.send('Server Error')
        }
    })
})

// get the uploaded documents 
router.get('/get/document/:name', async (req, res) => {
    if (!req.session.user)
        return res.send('Not logged in')

    try {
        const { name } = req.params
        const cls = await Class.findOne({ name })
        const documents = await Document.find({ class: cls._id }).sort({ date: -1 })
        res.send(documents)
    }
    catch (err) {
        console.log(err)
        res.send('Server Error')
    }
})

router.get('/message', async (req, res) => {
    const _id = '5eef00c3b1e5ac7cff1e24f1'
    try {
        const cls = await Class.find({ teacher: _id }).select('_id')
        const messages = await Message.find({ class: { $in: cls } })
            .sort({ date: -1 })
            .select(['message', 'date', '-_id'])
            .populate('class', ['subject', 'code'])  

        res.send(messages)
    }
    catch (err) {
        console.log(err)
        res.send('Error')
    }
})

// put the message to the database
router.post('/post/message', async (req, res) => {
    const { _id: from } = req.session.user
    const { name, message } = req.body
    const fromModel = req.session.type === student ? 'student' : 'teacher'
    try {
        const cls = await Class.findOne({ name }).select('_id')
        const newMsg = new Message({
            from,
            fromModel,
            class: cls._id,
            message
        })
        await newMsg.save()
        res.send('')
    } catch (err) {
        console.log(err)
        res.send(err)
    }
})

// get all the messages of a group
router.get('/get/group/messages/:name', async (req, res) => {
    if (!req.session.user)
        return res.send('Not logged in')

    const { name } = req.params
    try {
        const cls = await Class.findOne({ name }).select('_id')
        const messages = await Message.find({ class: cls._id })
            .populate('from', ['regno', 'name'])
            .select(['-_id', '-class'])
            .sort({ date: 1 })
        res.json({ messages, your_id: req.session.user._id })
    }
    catch (err) {
        console.log(err)
        res.send(err)
    }
})

// returns the regex expression
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

module.exports = router
