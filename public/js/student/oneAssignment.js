import { getAssignmentId, sendAssignmentTemplate } from '../module/assignment.js'
import { docPreview, getDocuments, getFileNames, emptyDocVariables } from '../module/docUpload.js'
const container = document.querySelector('.single_assignment_con')
const submission = document.querySelector('.submission_con')

const attributes = {
    name: 'files', 
    accept: '.xlsx, .xls, image/*, .doc, .docx, .ppt, .pptx, .txt, .pdf', 
    id: 'documents',
    class: 'document_input',
}

window.onload = () => {
    const [id, name] = getAssignmentId()
    axios.get(`/api/single/assignment/${name}/${id}`)
        .then(res => {
            if (res.status == 200)
                container.innerHTML = sendAssignmentTemplate(res.data)
        })
        .catch(err => container.innerHTML = `<h2>${err.response.data}</h2>`)
    
    // get the submission status
    axios.get(`/api/submission/status/${id}`,)
        .then(res => {
            // if the assignment is already submitted
            if (res.status == 200 || res.statusText == 'OK') {
                submission.innerHTML = '<h1>Assignment Submitted</h1>'
                // show the submitted assignment with details
                return console.log(res)
            }
            // show the submission form
            const form = document.createElement('form')
            form.classList.add('submit_assignment')

            // input element for selecting the images
            const input = document.createElement('input')
            input.type = 'file'
            for (const prop in attributes)
                input.setAttribute(prop, attributes[prop])
            input.multiple = true

            // button element for submitting the form
            const button = document.createElement('button')
            button.type = 'submit'
            button.classList.add('upload')
            button.innerText = 'Upload'

            form.appendChild(input)
            form.innerHTML += `<label for="documents" class='label_doc_input'>Select Files</label>
                <small style='color: #7f7f7f; margin-left: 10px;'>*Only .pdf, .txt, .ppt, .png, .doc, .docx, .jpg, .svg, .jpeg, .xls, .xlsx are allowed.</small> 
                <div class='preview_doc'></div>`
            form.appendChild(button)
            form.innerHTML += `<div class='progress_con'>
                    <div class='progress_fill'></div>
                    <div class='progress_text' style='position: relative;'></div>
                </div>`
            submission.appendChild(form)
            document.querySelector('.document_input').addEventListener('change', selectFiles)
            document.querySelector('.upload').addEventListener('click', submitAssignment)
        })
        .catch(err => {
            if (err.response != undefined)
                return console.log(err.response.data)
            console.log(err)
        })
}

// form submit handler
function submitAssignment(e) {
    e.preventDefault()
    const documents = getDocuments()
    const fileNames = getFileNames()
    if (!Object.keys(documents).length) {
        alert('Enter Select Atleast 1 file.')
        return
    }
    const progress = document.querySelector('.progress_text')
    const fill = document.querySelector('.progress_fill')
    e.target.disabled = true
    let formData = new FormData()
    // appending the documents
    for (const objName in documents)
        formData.append('submissionFile', documents[objName])
    // appending the file names
    for (const objName in fileNames)
        formData.append('fileName', fileNames[objName])
    
    const [id, name] = getAssignmentId()

    const options = {
        onUploadProgress: progressEvent => {
            const { loaded, total } = progressEvent
            let percent = Math.floor((loaded * 100) / total)
            progress.innerText = `Uploading ${percent}%`
            fill.style.width = `${percent}%`
        }
    }

    axios.post(`/api/submit/assignment/${name}/${id}`, formData, options)
    .then(res => {
        console.log(res.data)
    })
    .catch(err => {
        console.log(err)
    })
}

// selecting the files
function selectFiles(e) {
    let { files } = e.target
    for (let i = 0; i < files.length; i++)
        docPreview(files[i])
}