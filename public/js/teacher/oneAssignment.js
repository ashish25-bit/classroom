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
            if (!res.data.length) {
                submissions.innerHTML = '<h2>No Submissions.</h2>'
                return
            }
            submissions.innerHTML = '<h2>Submissions</h2>'
            res.data.forEach(submission => {
                const parent = document.createElement('div')
                parent.classList.add('submission')
                const { attachments, fileName, checked, status, student, submitted } = submission
                const checkbox = document.createElement('input')
                checkbox.type = 'checkbox'
                checkbox.classList.add('status')
                checkbox.checked = checked
                parent.appendChild(checkbox)
                parent.innerHTML += `<span style='margin-left: 15px; color: #555;'> 
                    <b style='color: #000;'>${student.regno}</b> 
                (${student.name})</span>
                <p style='margin-top:10px;margin-bottom:5px; color: #555;'>${moment(submitted).format('Do MMM YYYY, hh:mm A')}</p>
                <span class='${status ? 'on' : 'late'} time'>${status ? 'On Time' : 'Late Submission'}</span>`
                submissions.appendChild(parent)
            })
            document.querySelectorAll('.submission .status').forEach(
                checkbox => checkbox.addEventListener('change', changeCheckedStatus)
            )
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
function changeCheckedStatus(e) {
    console.log('checking')
}