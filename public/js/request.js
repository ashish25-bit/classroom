const container = document.querySelector('.students_con')
const id = document.querySelector('#cid')
const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}

window.onload = () => {
    if (!container)
        return container.innerText = 'No Results'

    // ajax call here
    axios.get(`/api/request/students/${id.getAttribute('data-class-id')}`)
        .then(res => {
            container.innerHTML = ''
            if (res.status !== 200 || res.statusText !== 'OK')
                return container.innerText = 'Server Error'
            const { data: students } = res
            students.forEach(student => {
                const { _id: id, regno, batch, section, name, semester, department } = student
                const div = document.createElement('div')
                div.classList.add('student')
                const innerDiv = document.createElement('div')
                innerDiv.innerHTML = `<h2>${regno}</h2> <p>${name}</p> <p>${department} - ${section} (${batch})</p> <p>Semester: ${semester}</p>`
                div.appendChild(innerDiv)
                const button = document.createElement('button')
                button.innerText = 'Accept Request'
                button.setAttribute('data-student-id', id)
                div.appendChild(button)
                button.addEventListener('click', acceptRequest)
                container.appendChild(div)
            })
        })
        .catch(err => console.log(err))
}

function acceptRequest(e) {
    const parent = e.target.parentElement
    e.target.classList.add('engaged')
    e.target.disabled = true
    const data = {
        cid: getClassId(),
        id: e.target.getAttribute('data-student-id')
    }
    axios.put('/api/accept/course/request', data, config)
        .then(res => {
            if (res.data === 'Error') {
                e.target.classList.remove('engaged')
                e.target.disabled = false
                console.log(res.data)
            }
            else 
                parent.remove()
        })
        .catch(err => console.log(err) )
}

function getClassId() {
    const href = window.location.href
    let n = href.lastIndexOf('/')
    return href.substring(n + 1, href.length)
}