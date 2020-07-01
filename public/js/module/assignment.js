const group_con = document.querySelector('.class_groups')
const details = document.querySelector('.details')
import { getClassUid } from './class.js'
import { removeClass, getTemplate } from './chat.js'

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