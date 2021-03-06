const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}
const announcements = document.querySelector('.announcements')
const documents = document.querySelector('.documents')
let response_msg = document.querySelector('.response_msg')
const extensions = ['txt', 'pdf', 'doc', 'docx', 'ppt', 'pptx']
const extImg = ['document.svg', 'pdf.svg', 'word.svg', 'word.svg', 'powerpoint.svg', 'powerpoint.svg']

// add active class to btn 1
// remove active class from btn2
// display container 1
// remove container 2 from display
export function displayContainer(btn1, btn2, container1, container2) {
    btn2.classList.remove('active')
    btn1.classList.add('active')
    container2.style.display = 'none'
    container1.style.display = 'block'
}

// post the announcements
export function postAnnouncement(context, button, post, name) {
    axios.post('/api/post/announcement', { post: post.innerHTML, name, context: context.value }, config)
        .then(res => {
            button.disabled = false
            button.style.opacity = 1
            showResponse(res.data)
            appendAnnouncement(context.value, post.innerHTML)
            context.value = ''
            post.innerHTML = ''
        })
        .catch(err => {
            button.disabled = false
            button.style.opacity = 1
            console.log(err)
            showResponse(err)
        })
}

// display the response message
function showResponse(msg) {
    response_msg.classList.add('response_msg_active')
    response_msg.innerText = msg

    setTimeout(() => {
        response_msg.classList.remove('response_msg_active')
        response_msg.innerText = ''
    }, 5000)
}

// get the announcements 
export function getAnnouncements(name) {
    axios.get(`/api/get/announcement/${name}`)
        .then(res => {
            if (!res.data.length) {
                announcements.innerHTML = '<h3>No Announcements</h3>'
                return
            }
            announcements.innerHTML = ''
            res.data.forEach(announcement => {
                const { date, post, context } = announcement
                const div = document.createElement('div')
                const Date = moment(date)
                div.classList.add('announcement')
                div.innerHTML = `<p class='date'>Posted On: ${Date.format('MMMM Do YYYY, hh:mm A')}</p><h3>${context}</h3>`
                div.innerHTML += post
                announcements.appendChild(div)
            })
        })
        .catch(err => {
            console.log(err)
            announcements.innerHTML = '<h3>Error</h3>'
        })
}

// get the name from the url
export function getClassUid() {
    const href = window.location.href
    let n = href.lastIndexOf('/')
    return href.substring(n + 1, href.length)
}

function appendAnnouncement(context, content) {
    const Date = moment().format('MMMM Do YYYY, hh:mm A')
    const div = document.createElement('div')
    div.classList.add('announcement')
    div.innerHTML = `<p class=date>Posted On: ${Date}</p><h3>${context}</h3>`
    div.innerHTML += content
    announcements.prepend(div)
}

// get the documents 
export function getDocuments(name) {
    axios.get(`/api/get/document/${name}`)
        .then(res => {
            if (!res.data.length) {
                documents.innerHTML = '<h3>No Documents</h3>'
                return
            }
            documents.innerHTML = ''
            for (const doc in res.data) {
                const { attachments, date, context, fileName } = res.data[doc]
                const div = document.createElement('div')
                div.classList.add('document')
                const Date = moment(date)
                div.innerHTML = `<p class='date'>Uploaded On: ${Date.format('MMMM Do YYYY, hh:mm A')}</p> <h3>${context}</h3>`
                let preview = ''
                attachments.forEach((pic, index) => {
                    const ext = pic.substring(pic.lastIndexOf('.') + 1, pic.length)
                    const filename = fileName[index].endsWith(`.${ext}`) ? fileName[index] : `${fileName[index]}.${ext}`
                    preview += `<div class='docImg'>`
                    if (extensions.includes(ext)) {
                        const index = extensions.indexOf(ext)
                        preview += `<img src='../../assets/${extImg[index]}' />`
                    }
                    else 
                        preview += `<img src='../../documents/${name}/${pic}' />`
                    preview += `<p>${fileName[index]}</p>`
                    preview += `<a class='download' href='../../documents/${name}/${pic}' download='${filename}'>
                        <i class="fa fa-arrow-down" aria-hidden="true"></i></a></div>`
                })            
                div.innerHTML += `<div class='preview_doc'>${preview}</div>`
                documents.appendChild(div) 
            }
        })
        .catch(err => {
            console.log(err)
            documents.innerHTML = '<h3>Error</h3>'
        })
}
