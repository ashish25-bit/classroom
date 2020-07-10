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
const Sample = require('../models/Sample')
const Assignment = require('../models/Assignment')
const Submission = require('../models/Submission')
const mailer = require('../private/nodemailer')
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
    const { name } = req.body
    try {
        const user = await Student.findOne({ _id: req.session.user._id })
        const classStudents = await Class.findOne({ name })
        let index = user.requests.findIndex(request => `${request.class}` == `${classStudents._id}`)
        
        // if already requested for the class then remove
        if (index >= 0) {
            user.requests.splice(index, 1)
            index = classStudents.requests.findIndex(request => `${request.student}` == `${user._id}`)
            classStudents.requests.splice(index, 1)
            await user.save()
            await classStudents.save()
            req.session.user = user
            return res.status(200).send('Request Cancelled')
        }
        
        // register here if not already requested
        user.requests.push({ class: classStudents._id })
        classStudents.requests.push({ student: req.session.user._id })
        await user.save()
        await classStudents.save()
        req.session.user = user
        res.status(200).json('Requested')
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
router.get('/request/students/:name', async (req, res) => {
    if (!req.session.user)
        return res.send('Not logged in')

    try {
        const { name } = req.params
        const students = await Class.findOne({ name })
            .populate('requests.student', ['name', 'regno', 'department', 'section', 'batch', 'semester'])
            .select('requests')
        res.status(200).send(students.requests)
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
        const cid = `${cls._id}`
        const student = await Student.findOne({ _id: id }).select('-password')
        let index = cls.requests.findIndex(request => `${request.student}` == id)
        cls.requests.splice(index, 1)
        index = student.requests.findIndex(request => `${request.class}` == cid)
        student.requests.splice(index, 1)
        cls.students.push(id)
        student.classes.push(cls._id)
        await cls.save()
        await student.save()
        req.session.user = student
        res.status(200).send('Request Accepted')
    }
    catch (err) {
        console.log(err)
        res.status(500).send('Error')
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
            const groups = await Class.find({ _id: { $in: user.classes } })
                .select(['name', 'subject', 'code'])
                .sort({ subject: 1 })
            res.send(groups)
            return
        }

        // if the requested user is a teacher
        const groups = await Class.find({ teacher: req.session.user._id })
            .select(['name', 'subject', 'code'])
            .sort({ subject: 1 })
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
            .select(['-requests'])

        const type = req.session.type === student ? 'student' : 'teacher'
        // if a student requesting this route but not in the class
        if (type === 'student') {
            if (!cls.students.includes(req.session.user._id))
                return res.json({ cls: {}, msg: 'You are not the member of this class.' })
        }

        // if a faculty requesting this route not the teacher of this class.
        if (type === 'teacher') {
            if (cls.teacher._id != req.session.user._id)
                return res.json({ cls: {}, msg: 'You are not the teacher of this class.' })
        }

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
            return res.status(500).send('Server Error')
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
            res.status(200).send('Documents Uploaded')
        }
        catch (err) {
            console.log(err)
            res.status(500).send('Server Error')
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
    const { _id, message } = req.body
    const fromModel = req.session.type === student ? 'student' : 'teacher'
    try {
        const newMsg = new Message({
            from,
            fromModel,
            class: _id,
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
        const type = req.session.type === student ? 'student' : 'teacher'
        const cls = await Class.findOne({ name })
            .populate('teacher', ['_id'])
            .select(['_id', 'students'])

        if (type === 'student') {
            if (!cls.students.includes(req.session.user._id))
                return res.json({ msg: '' })
        }

        if (type === 'teacher') {
            if (cls.teacher._id != req.session.user._id)
                return res.json({ msg: '' })
        }

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

router.post('/class/assignment', async (req, res) => {
    const { name } = req.query
    if (!fs.existsSync(`./public/assignments/${name}`))
        await fs.mkdirSync(`./public/assignments/${name}`)

    let storage = multer.diskStorage({
        destination: `./public/assignments/${name}`,
        filename: (req, file, cb) => {
            cb(null, `${file.fieldname}-${new Date()}-(${Date.now()})${path.extname(file.originalname)}`)
        }
    })

    const upload = multer({ storage: storage }).array('assignmentFile')
    upload(req, res, async err => {
        if (err) {
            console.log(err)
            return res.status(500).send('Server Error')
        }

        try {
            const { students, fileName, title, description, submissionDate } = req.body
            const cls = await Class.findOne({ name })
            let attachments = []
            for (let i = 0; i < req.files.length; i++)
                attachments.push(req.files[i].filename)
            const assignment = new Assignment({
                class: cls._id,
                title,
                submissionDate,
                description,
                attachments,
                fileName,
                students
            })
            await assignment.save()
            const emails = await Student.find({ _id: { $in: students } }).distinct('email')
            mailer(emails.toString(), `${cls.subject} Assignment`, `${title} is given as the assignment. Submission Date ${submissionDate}`)
            res.status(200).send('Assignment Posted')
        } 
        catch (err) {
            console.log(err)
            res.status(500).send('Server error')
        }
    })
})

// get the annoucements
router.get('/get/assignments/:name', async (req, res) => {
    if (!(req.session.user))
        return res.send('Not logged in')

    try {
        const { name } = req.params
        const cls = await Class.findOne({ name }).select('_id')
        if (!cls)
            return res.status(400).send('No classes found')

        const assignments = await Assignment
            .find({ class: cls._id })
            .sort({ date: -1 })
        res.status(200).send(assignments)
    } 
    catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})

// get a single assignment details
router.get('/single/assignment/:name/:id', async (req, res) => {
    if (!req.session.user) 
        return res.send('Not Logged In')
    
    try {
        const { name, id } = req.params
        const assignment = await Assignment.findOne({ _id: id })
            .populate('class', ['name', 'subject', 'code'])

        // if no assignments found
        if (!assignment) 
            return res.status(404).send('No Assignment Found')

        // if the class name does not matches then return error
        if (assignment.class.name !== name)
            return res.status(400).send('No Class exists')
        
        // if both the class and the assignment exists but the student id is not present in the students array
        if (!assignment.students.includes(req.session.user._id))
            return res.status(403).send('Not Authorized To Enter Here.')

        res.status(200).send(assignment)
    } 
    catch (err) {
        console.log(err)
        if (err.kind === 'ObjectId')
            return res.status(400).send('Incorrect Assignment Id')
        res.status(500).send('Error')
    }
})

// verification of the class and to authorization to access the video room
router.get('/get/authorization/:name', async (req, res) => {
    if (!req.session.user)
        return res.send('Not Logged In')
    
    try {
        const type = req.session.type === student ? 'student' : 'teacher'
        const { name } = req.params
        const cls = await Class.findOne({ name })
        
        // if the class does not exists
        if (!cls)
            return res.status(404).send('No Class Found')

        // if teacher
        if (type === 'teacher') {
            // if not authorized
            if (`${cls.teacher}` !== req.session.user._id)
                return res.status(403).send('Not Authorized To Enter The Room')
            // if authorized
            return res.status(200).json({ type, name: req.session.user.name })
        }
        
        //  if student
        if (!cls.students.includes(req.session.user._id)) 
            return res.status(403).send('Not Authorized To Enter The Room')
        res.json({ type, regNo: req.session.user.regno })    
    } 
    catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})

// sample route to perfrom various experiments on mongoose
router.get('/sample', async (req,res) => {
    const className = '18DEV001J-CSE-B2-5-Batch1'
    const ass = '5efee821eadfd92aa6802ab3'
    // studs - '5efb1f2e863eae5b144e17d5', '5efb1b8625015c5576d17938', '5efb1e78863eae5b144e17d3'
    // cls - 5efb1c1f3745d358763e4f5c
    try {        
        // const sample = await Sample.find({ students: { $in: stu_id } })
        //     .populate('class', ['name'])
        //     .select(['-students', '-__v'])
        //     .sort({ date: -1 })
        // res.send(sample)

        // for a new submission
        // const cls = await Class.findOne({ name: className })
        // const newSub = new Submission({
        //     assignment: ass,
        //     status: 'on time', 
        //     student: '5efb1f2e863eae5b144e17d5',
        //     class: cls._id
        // })
        // await newSub.save()
        // res.send('Done')
    } 
    catch (err) {
        console.log(err)
        res.send('Error')    
    }
})

// get the students and the assignment details as well as the submissions
router.get('/faculty/single/assignment/:name/:id', async (req, res) => {
    if (!req.session.user)
        return res.send('Not Logged in')
    
    try {
        const { id, name } = req.params
        const assignment = await Assignment.findOne({ _id: id })
            .populate('class', ['name', 'subject', 'code', 'teacher'])
        
        if (!assignment) 
            return res.status(404).send('Assignment not found')

        // if the class name does not matches then return error
        if (assignment.class.name !== name)
            return res.status(400).send('No Class exists')
        
        // if the faculty accessing the route is not the teacher of the class
        if (`${assignment.class.teacher}` !== req.session.user._id)
            return res.status(403).send('Not Authorized To Enter This Class')

        // response.status(code).send(new Error('description'));

        const students = await Student.find({ _id: { $in: assignment.students } }).select('regno')
        res.status(200).json({ assignment, students })
    } 
    catch (err) {
        console.log(err)
        if (err.kind === 'ObjectId')
            return res.status(400).send('Incorrect Assignment Id')
        res.status(500).send('Error')
    }
})

// get the students who have submitted the assignment
router.get('/submission/:name/:id', async (req, res) => {
    if (!req.session.user) 
        return res.send('Not Logged In')
    
    try {
        const { name, id } = req.params
        const cls = await Class.findOne({ name })

        if (!cls)
            return res.status(404).send('Class not found')

        const submission = await Submission.find({ $and: [{ class: cls._id }, { assignment: id }] })
            .populate('student', ['regno', 'name'])
            .select(['-_id', '-assignment', '-class'])
        if (!submission)
            return res.status(404).send('No submissions found')
        res.status(200).send(submission)
    } 
    catch (err) {
        console.log(err)
        if (err.kind === 'ObjectId')
            return res.status(400).send('Incorrect Assignment Id')
        res.status(500).send('Error')
    }
})


// returns the regex expression
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

module.exports = router
