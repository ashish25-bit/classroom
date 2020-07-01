const container = document.querySelector('.students_con')
const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}

window.onload = () => {
    if (!container)
        return container.innerText = 'No Results'

    // ajax call here
    const name = getClassId()
    // id.getAttribute('data-class-id')
    axios.get(`/api/request/students/${name}`)
        .then(res => {
            container.innerHTML = ''
            if (res.status !== 200 || res.statusText !== 'OK')
                return container.innerText = 'Server Error'
            
            res.data.forEach(data => {
                const { student } = data 
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
                container.prepend(div)
            })
        })
        .catch(err => console.log(err))
}

function acceptRequest(e) {
    const parent = e.target.parentElement
    e.target.classList.add('engaged')
    e.target.disabled = true
    e.target.innerText = 'Accepting'
    const data = {
        name: getClassId(),
        id: e.target.getAttribute('data-student-id')
    }
    axios.put('/api/accept/course/request', data, config)
        .then(res => {
            e.target.innerText = res.data
            setTimeout(() => parent.remove(), 2000)
        })
        .catch(err => {
            e.target.classList.remove('engaged')
            e.target.disabled = false
            e.target.innerText = 'Accept Request'
            alert('Unable to accept the request.')
            console.log(err) 
        })
}

function getClassId() {
    const href = window.location.href
    let n = href.lastIndexOf('/')
    return href.substring(n + 1, href.length)
}