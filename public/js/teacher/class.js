import { displayContainer, postAnnouncement, getClassUid, getAnnouncements } from '../module/class.js'
import { docPreview, getDocuments, getFileNames, emptyDocVariables } from '../module/docUpload.js'
const post = document.querySelector('.post')
const post_input = document.querySelector('.announcement_input div')
const docs_btn = document.querySelector('.docs_btn')
const anounce_btn = document.querySelector('.anouncements_btn')
const document_con = document.querySelector('.document_con')
const announcement_con = document.querySelector('.announcement_con')
const context = document.querySelector('.context')
const addLink = document.querySelector('.add_link')
const linkHref = document.querySelector('.link_url')
const linkName = document.querySelector('.link_title')
const addDocBtn = document.querySelector('.add_doc')
const docInput = document.querySelector('.document_input')
const docContext = document.querySelector('.doc_context')
const progress = document.querySelector('.progress_text')
const fill = document.querySelector('.progress_fill')
const upload = document.querySelector('.upload')
const previewContainer = document.querySelector('.preview_doc')
let flagAnnouncement = 1

docs_btn.addEventListener('click', () => {
    if (!docs_btn.classList.contains('active'))
        displayContainer(docs_btn, anounce_btn, document_con, announcement_con)
})

anounce_btn.addEventListener('click', () => {
    if (!anounce_btn.classList.contains('active')) {
        displayContainer(anounce_btn, docs_btn, announcement_con, document_con)
        if (flagAnnouncement) {
            const name = getClassUid()
            getAnnouncements(name)
            flagAnnouncement = 0
        }
    }
})

post.addEventListener('click', () => {
    if (!post_input.innerHTML || !context.value) {
        alert('Cannot Post Empty Annoucement.')
        return
    }

    post.disabled = true
    post.style.opacity = 0.5
    const name = getClassUid()
    postAnnouncement(context, post, post_input, name)
})

addLink.addEventListener('click', () => {
    if (!linkHref.value) {
        alert('Enter atleast the link')
        return
    }
    const tag = `<a target='_blank' href=${linkHref.value}>${!linkName.value ? linkHref.value : linkName.value}</a>`
    post_input.innerHTML += tag
    linkName.value = ''
    linkHref.value = ''
})

// event listener for document uploading
addDocBtn.addEventListener('submit', e => {
    e.preventDefault()
    const documents = getDocuments()
    const fileNames = getFileNames()

    if (!docContext.value || !Object.keys(documents).length) {
        alert('Enter Context and Select Atleast 1 file.')
        return
    }
    upload.style.opacity = '0.5'
    upload.disabled = true

    let formData = new FormData()
    const options = {
        onUploadProgress: progressEvent => {
            const { loaded, total } = progressEvent
            let percent = Math.floor((loaded * 100) / total)
            progress.innerText = `Uploading ${percent}%`
            fill.style.width = `${percent}%`
        }
    }
    // appending the document
    formData.append('context', docContext.value)
    for (const objName in documents)
        formData.append('myfile', documents[objName])

    // appending the file names
    for (const objName in fileNames)
        formData.append('fileName', fileNames[objName])

    const name = getClassUid()
    axios.post(`/api/document/upload?name=${name}`, formData, options)
        .then(res => {
            progress.innerText = res.data
            emptyInputs()
        })
        .catch(err => {
            emptyInputs()
            console.log(err)
        })
})

function emptyInputs() {
    upload.style.opacity = '1'
    upload.disabled = false
    docContext.value = ''
    emptyDocVariables()
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

// check the type of document
docInput.addEventListener('change', e => {
    let { files } = e.target
    for (let i = 0; i < files.length; i++)
        docPreview(files[i])
})