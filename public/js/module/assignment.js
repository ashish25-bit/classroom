const group_con = document.querySelector('.class_groups')
const details = document.querySelector('.details')
import { getClassUid } from './class.js'
import { removeClass, getTemplate } from './chat.js'
const selectAll = document.querySelector('.select_all')
const students = document.querySelector('.students_con')
let added = []

export async function getClassGroups() {
    try {
        const id = getClassUid()
        getDetails(id)
        const res = await axios.get('/api/class/groups')
        group_con.innerText = ''
        if (!res.data.length) {
            group_con.innerText = 'No Class Groups'
            return false
        }
        res.data.forEach(group => {
            const { name, subject, code } = group
            const div = document.createElement('div')
            div.classList.add('group')
            div.setAttribute('data-class-name', name)
            if (name === id)
                div.classList.add('active')
            div.addEventListener('click', selectGroup)
            div.innerHTML = `<p class='name'>${subject}</p> <p class='code'>${code}</p>`
            group_con.appendChild(div)
        })
        return true
    }
    catch (err) {
        console.log(err)
        group_con.innerText = 'Server Error'
    }
}

function selectGroup(e) {
    if (!e.target.classList.contains('active')) {
        removeClass()
        const name = e.target.getAttribute('data-class-name')
        e.target.classList.add('active')
        window.history.replaceState("/classroom/assignment", "Message Room", `/classroom/assignment/${name}`)
        details.innerHTML = `<h1>Loading...</h1>`
        getDetails(name)
        if (type === 'teacher')
            getClassStudents(name)
    }
}

function getDetails(name) {
    axios.get(`/api/class/details/${name}`)
        .then(res => {
            const { msg, cls } = res.data
            if (msg) {
                details.innerHTML = `<h1>${msg}</h1>`
                return
            }
            const template = getTemplate(cls)
            details.innerHTML = template
        })
}

export function getClassStudents(name) {
    selectAll.disabled = true
    students.innerHTML = '<h2>Loading...</h2>'
    axios.get(`/api/class/students/${name}`)
        .then(res => {
            const { students: studs, error } = res.data
            if (!studs.length) {
                students.innerHTML = '<h3>Assignments cannot be added since there are no students.</h3>'
                return
            }

            if (error !== '') {
                students.innerHTML = '<h3>Error in retreiving students</h3>'
                return
            }

            students.innerHTML = ''
            selectAll.disabled = false
            studs.forEach(student => {
                const { regno, _id } = student
                const div = document.createElement('div')
                let checkbox = document.createElement('input')
                checkbox.type = 'checkbox'
                checkbox.setAttribute('data-student-id', _id)
                checkbox.classList.add('student-checkbox')
                div.appendChild(checkbox)
                div.innerHTML += `<label>${regno}</label>`
                students.appendChild(div)
            })
            document.querySelectorAll('.student-checkbox').forEach(
                checkbox => checkbox.addEventListener('change', e => addRemove(e.target, e.target.checked, false))
            )
        })
        .catch(err => console.log(err))
}

export function addRemove(checkbox, status, selectAll) {
    const id = checkbox.getAttribute('data-student-id')
    // this means the `id` is not here and is to be added to the added array.
    if (status && !added.includes(id)) {
        added.push(id)
        return
    }

    // if the select all button is clicked
    if (!selectAll) {
        const index = added.indexOf(id)
        added.splice(index, 1)
    } 
}

export function emptyAdded() {
    added = []
}

export function getAddedStudents() {
    return added
}