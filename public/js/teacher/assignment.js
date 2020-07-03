import { getClassGroups, getClassStudents, addRemove, getAddedStudents, emptyAdded, contentAssigned } from '../module/assignment.js'
import { displayContainer, getClassUid } from '../module/class.js'
import { docPreview, getDocuments, getFileNames, emptyDocVariables } from '../module/docUpload.js'
const assign_btn = document.querySelector('.assign_btn')
const assigned_btn = document.querySelector('.assigned_btn')
const assign_container = document.querySelector('.assign_container')
const assignment_container = document.querySelector('.assignment_container')
const assign_docs = document.querySelector('.assign_docs')
const assign_form = document.querySelector('.assign_form')
const selectAll = document.querySelector('.select_all')
const upload = document.querySelector('.upload')
const title = document.querySelector('.title')
const content = document.querySelector('.content')
const submissionDate = document.querySelector('.submissionDate')
const progress = document.querySelector('.progress_text')
const fill = document.querySelector('.progress_fill')

window.onload = async () => {
    const name = getClassUid()
    getClassStudents(name)
    await getClassGroups()
}

assign_btn.addEventListener('click', () => {
    if (!assign_btn.classList.contains('active'))
        displayContainer(assign_btn, assigned_btn, assign_container, assignment_container)
})

assigned_btn.addEventListener('click', () => {
    if (!assigned_btn.classList.contains('active')) {
        displayContainer(assigned_btn, assign_btn, assignment_container, assign_container)
        contentAssigned()
    }
})

assign_docs.addEventListener('change', e => {
    let { files } = e.target
    for (let i = 0; i < files.length; i++)
        docPreview(files[i])
})

assign_form.addEventListener('submit', e => {
    e.preventDefault()
    const documents = getDocuments()
    const fileNames = getFileNames()
    const added = getAddedStudents()
    if (!title.value) {
        alert('Title cannot be empty')
        return
    }
    if (!submissionDate.value) {
        alert('Submission Date cannot be empty')
        return
    }
    if (!added.length) {
        alert('No Students selected')
        return
    }

    upload.style.opacity = '0.5'
    upload.disabled = true
    let formData = new FormData()
    // appending data
    formData.append('title', title.value)
    formData.append('description', content.innerHTML)
    formData.append('submissionDate', submissionDate.value)
    // if the documents are present 
    if (Object.keys(documents).length) {
        for (const objName in documents)
            formData.append('assignmentFile', documents[objName])
    }
    // if the filename is not empty then append it to the formData
    if (Object.keys(fileNames).length) {
        for (const objName in fileNames)
            formData.append('fileName', fileNames[objName])
    }

    //  add the ids of the students
    for (const id in added)
        formData.append('students', added[id])

    const options = {
        onUploadProgress: progressEvent => {
            const { loaded, total } = progressEvent
            let percent = Math.floor((loaded * 100) / total)
            progress.innerText = `Uploading ${percent}%`
            fill.style.width = `${percent}%`
        }
    }

    const name = getClassUid()
    // api call
    axios.post(`/api/class/assignment?name=${name}`, formData, options)
        .then(res => {
            progress.innerText = res.data
            backToNormal()
        })
        .catch(err => {
            backToNormal()
            console.log(err)
        })
})

selectAll.addEventListener('change', e => {
    const studentCheckbox = document.querySelectorAll('.student-checkbox')
    const status = e.target.checked
    if (!status) {
        emptyAdded()
        studentCheckbox.forEach(checkbox => checkbox.checked = false)
        return
    }
    studentCheckbox.forEach(checkbox => {
        checkbox.checked = true
        const checkBoxStatus = checkbox.checked
        addRemove(checkbox, checkBoxStatus, true)
    })
})

function backToNormal() {
    upload.style.opacity = '1'
    upload.disabled = false
    emptyDocVariables()
    emptyAdded()
    title.value = ''
    submissionDate.value = ''
    content.innerHTML = ''
    const button = document.createElement('button')
    button.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>'
    button.classList.add('close')
    button.addEventListener('click', e => {
        fill.style.width = '0'
        progress.innerText = ''
        e.target.remove()
    })
    document.querySelector('.progress_con').appendChild(button)
}
