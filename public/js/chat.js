import { getClassUid, removeClass, getTemplate, empty, messageElement } from './module/chat.js'
const group_con = document.querySelector('.class_groups')
const details = document.querySelector('.details')
const message_container = document.querySelector('.message_container')
const messages = document.querySelector('.message')
const socket = io()
const fullName = document.querySelector('.full-name').getAttribute('data-full-name')

window.onload = () => {
    const id = getClassUid()
    let rooms = []
    axios.get('/api/class/groups')
        .then(res => {
            group_con.innerHTML = ''
            if (!res.data.length) {
                group_con.innerText = 'No Class Groups'
                return
            }
            res.data.forEach(group => {
                const { name, subject, code } = group
                rooms.push(name)
                const div = document.createElement('div')
                div.classList.add('group')
                div.setAttribute('data-class-name', name)
                if (name === id)
                    div.classList.add('active')
                div.addEventListener('click', selectGroup)
                div.innerHTML =`<p class='name'>${subject}</p> <p class='code'>${code}</p>`
                group_con.appendChild(div)
            })
            socket.emit('joinRoom', rooms)
            // socket.emit('showRoom')
        })
        .catch(err => {
            group_con.innerText = 'Server Error'
            console.log(err)
        })

        // if the name is there in the parameters
        if (id) {
            // get the details
            getDetails(id)
            // get the messages
            getMessages(id)
        }
        else 
            details.innerHTML = empty
}

function selectGroup(e) {
    if (!e.target.classList.contains('active')) {
        removeClass()
        const name = e.target.getAttribute('data-class-name')
        e.target.classList.add('active')
        window.history.replaceState("/classroom/chat", "Message Room", `/classroom/chat/${name}`)
        details.innerHTML = `<h1>Loading</h1>`
        messages.innerHTML = '<h3>Loading</h3>'
        getDetails(name)
        getMessages(name)
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
            
            // add the message input to the dom
            if (message_container.lastElementChild.nodeName !== 'FORM') {
                const form = document.createElement('form')
                form.innerHTML = messageElement
                form.classList.add('message_form')
                form.addEventListener('submit', sendMessage)
                message_container.appendChild(form)
            }
        })
        .catch(err => console.log(err))
}

function getMessages(name) {
    axios.get(`/api/chat/messages/${name}`)
        .then(res => {
            console.log(res.data)
            messages.innerHTML = '<h3>Data Loaded</h3>'
        })
        .catch(err => {
            console.log(err)
            messages.innerHTML = '<h3>Server Error</h3>'
        })
}

function sendMessage(e) {
    e.preventDefault()
    const msg = document.querySelector('.message_input')
    if (msg.value) {
        console.log(msg.value)
        msg.value = ''
    }
}