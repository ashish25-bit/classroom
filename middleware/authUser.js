const { student, teacher, teacherRoutes, studentRoutes } = require('../secret')

module.exports = (req, res, next) => {
    const { type } = req.session

    let { pathname } = req._parsedOriginalUrl
    if (req.params) {
        for (let param of Object.values(req.params))
            pathname = pathname.replace(param, '')
    }
    console.log(pathname)

    // student tries to access faculty route
    if(type === student) {
        if(!studentRoutes.includes(pathname)) {
            console.log('Student tried to access faculty route')
            return res.redirect('/home')
        }
    }
    // teacher tries to access student route
    if(type === teacher) {
        if(!teacherRoutes.includes(pathname)) {
            console.log('Faculty tried to access student route')
            return res.redirect('/faculty/home')
        }
    }
    next()
}