import { getAssignmentId, sendAssignmentTemplate } from '../module/assignment.js'
const details = document.querySelector('.details')
const allStudents = document.querySelector('.all_students')
const submissions = document.querySelector('.submissions')
let all_students = []

window.onload = () => {
    const [ id, name ] = getAssignmentId()
    axios.get(`/api/faculty/single/assignment/${name}/${id}`)
        .then(res => {
            const { assignment, students } = res.data
            details.innerHTML = sendAssignmentTemplate(assignment)
            let content = `<h2>All Students</h2><div class='assigned'><div class='students_con'>`
            students.forEach(student => content += `<div>${student.regno}</div>`)
            content += '</div></div>'
            allStudents.innerHTML = content
            all_students = students
        })
        .catch(err => {
            console.log(err)
            if (err.response != undefined) {
                details.innerHTML = `<h2>${err.response.data}</h2>`
                allStudents.innerHTML = `<h2>${err.response.data}</h2>`
            }
            else {
                details.innerHTML = `<h2>An unknown error has occurred</h2>`
                allStudents.innerHTML = `<h2>An unknown error has occurred</h2>`
            }
        })

    axios.get(`/api/submission/${name}/${id}`)
        .then(res => {
            submissions.innerHTML = '<h2>Data Loaded.</h2>'
            console.log(res.data)
        })
        .catch(err => {
            console.log(err)
            if (err.response != undefined) {
                details.innerHTML = `<h2>${err.response.data}</h2>`
                allStudents.innerHTML = `<h2>${err.response.data}</h2>`
            }
            else {
                details.innerHTML = `<h2>An unknown error has occurred</h2>`
                allStudents.innerHTML = `<h2>An unknown error has occurred</h2>`
            }
        })
}