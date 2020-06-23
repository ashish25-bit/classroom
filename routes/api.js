const express = require('express')
const router = express.Router()

const subjects = require('../private/subjects')
const Class = require('../models/Class')

// get the options for subject and subject code
router.get('/code/subject/:semester', (req, res) => {
    const { semester } = req.params
    res.send(subjects[semester])
})

router.post('/add/class', async (req, res) => {
    let { name, department, semester, batch, section, subject, code } = req.body

    semester = parseInt(semester)
    batch = parseInt(batch)

    try {
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
            res.json({ cls: user.requests, msg: 'Request Cancelled' })
        }

        // register here if not registered
        else {
            user.requests.unshift(id)
            await user.save()
            req.session.user = user
            classStudents.requests.unshift(req.session.user._id)
            await classStudents.save()
            res.json({ cls: user.requests, msg: 'Requested' })
        }
    }
    catch (err) {
        console.log(err)
        res.json({ cls: user.requests, msg: 'Server Error' })
    }
})

// get the students for a class
router.get('/class/students/:id', async (req, res) => {
    if (req.session.user) {
        const { id } = req.params
        try {
            const cls = await Class.findOne({ _id: id })
            const students = await Student.find({ "_id": { $in: cls.students } }).select(['-password', '-email', '-date', '-classes'])
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
        const students = await Student.find({ _id: { $in: cls.requests } }).select(['-password', '-date', '-email', '-requests', '-classes'])
        res.send(students)
    }
    catch (err) {
        console.log(err)
        res.status(500).send('Server Error')
    }
})

// faculty accepts the request
router.put('/accept/course/request', async (req, res) => {
    const { id, cid } = req.body
    try {
        const cls = await Class.findOne({ _id: cid })
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

module.exports = router
