const previewContainer = document.querySelector('.preview_doc')
const extImg = ['pdf.svg', 'document.svg', 'powerpoint.svg', 'word.svg', 'powerpoint.svg']
const extensions = [
    'application/pdf', 'text/plain', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]
let documents = {}
let fileNames = {}

export function docPreview(file) {
    const rnd = random()
    documents[rnd] = file
    fileNames[rnd] = file.name
    let reader = new FileReader()
    const div = document.createElement('div')
    div.setAttribute('title', 'click me to remove me.')
    div.classList.add('docImg')
    const img = document.createElement('img')
    img.setAttribute('data-obj-id', rnd)
    const input = document.createElement('input')
    input.setAttribute('type', 'text')
    input.setAttribute('data-obj-id', rnd)
    input.value = file.name
    const extension = file.type
    if (extension === 'image/jpeg' || extension === 'image/svg+xml' || extension === 'image/png') {
        reader.onload = () => img.src = reader.result
        reader.readAsDataURL(file)
    }
    else {
        const index = extensions.indexOf(extension)
        img.src = `./assets/${extImg[index]}`
    }
    div.appendChild(img)
    div.appendChild(input)
    input.addEventListener('keyup', changeDocName)
    img.addEventListener('click', removeDoc)
    previewContainer.appendChild(div)
}

function random() {
    return Math.floor(Math.random() * 1000) + 'xyz'
}

function removeDoc(e) {
    const parent = e.target.parentElement
    parent.remove()
    const objName = e.target.getAttribute('data-obj-id')
    delete documents[objName]
    delete fileNames[objName]
}

export function getDocuments() {
    return documents
}

export function getFileNames() {
    return fileNames
}

function changeDocName(e) {
    const objName = e.target.getAttribute('data-obj-id')
    fileNames[objName] = e.target.value
}

export function emptyDocVariables() {
    documents = {}
    fileNames = {}
}