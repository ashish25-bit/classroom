const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}
const messages = document.querySelector('.messages')
// no chats selected
export const empty = `<h1 style='font-size: 3rem;'>No Chats Selected</h1>`
// message form
export const messageElement = `<input class='message_input' placeholder='Enter Your message' /> <button>Send</button>`

// get the class uid 
export function getClassUid() {
    const href = window.location.href
    if (!href.includes('-'))
        return null
    let n = href.lastIndexOf('/')
    return href.substring(n + 1, href.length)
}

// removes the a active class from the element
export function removeClass() {
    const groups = document.querySelectorAll('.group')
    if (groups.length)
        groups.forEach(group => group.classList.remove('active'))
}

// return the template with name and everything
export function getTemplate(cls) {
    const { subject, section, batch, department, teacher, semester, students, name } = cls
    let temp = `<h1 style='font-size: 1.7rem;'>
                <a title='Go Back To ${subject} Class' class='back_link' href='/classroom/${name}'> <i class="fa fa-arrow-left" aria-hidden="true"></i> </a>
                ${subject}</h1>`
    temp += `<p>${department} - ${section} (Batch ${batch})</p>`
    temp += `<p>Semester: ${semester}</p>`
    temp += `<p>Faculty: ${teacher.name} (${teacher.faculty_id})</p>`
    temp += `<p>Class Strength: ${students.length}</p>`
    return temp
}

export function appendMessage({ cls, text, time, fullName }) {
    const div = document.createElement('div')
    div.classList.add(cls)
    div.classList.add('msg')
    div.innerHTML = `<div class="msg-bubble">
                        <div class="msg-info">
                            <div class="msg-info-name">${fullName}</div>
                            <div class="msg-info-time">${time}</div>
                        </div>
                        <div class="msg-text">${text}</div>
                    </div>`
    messages.appendChild(div)
}

export function messageToDatabase(_id, message) {
    axios.post('/api/post/message', { _id, message }, config)
        .then(res => {})
        .catch(err => console.log(err))
}