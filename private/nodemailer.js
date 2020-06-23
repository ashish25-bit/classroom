const transporter = require('./transporter')
const config = require('config')

module.exports = async (mail, subject, text) => {
    let mailOptions = {
        from: config.get('EMAIL'),
        to: mail,
        subject,
        text
    }

    try {
        await transporter.sendMail(mailOptions)
        return true
    } 
    catch (err) {
        console.log(err)
        return false
    }
}