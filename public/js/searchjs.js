const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}
let response_msg = document.querySelector('.response_msg')
const container = document.querySelector('.grid_con')

const { q } = Qs.parse(location.search, { ignoreQueryPrefix: true })

window.onload = () => {
    axios.get(`/api/search/${q}`)
        .then(res => {
            const { classes, error, requests } = res.data
            if (error) {
                container.innerHTML = `<h2>${error}/h2>`
                return
            }
            if (!classes.length) {
                container.innerHTML = `<div style='font-size:1.5rem;'>No results for: <span style='font-weight: bold;'>${q}</span></div>`
                return
            }

            container.innerHTML = ''

            classes.forEach(cls => {
                const { _id, subject, teacher, name, code } = cls
                const div = document.createElement('div')
                div.classList.add('class')
                div.innerHTML = `<h2>${subject}</h2>
                <p>Faculty: ${teacher.name} (${teacher.faculty_id})</p> 
                <p>Code: ${code}</p> <p>UniqueId: ${name}</p>`

                const button = document.createElement('button')
                button.innerText = requests.filter(request => request.class == _id).length ? 'REQUESTED': 'REQUEST'
                button.setAttribute('data-class-name', name)
                button.classList.add('register_cls')
                button.addEventListener('click', requestCourse)

                div.appendChild(button)
                container.appendChild(div)
            })
        })
        .catch(err => container.innerHTML = `<h2>${err}/h2>`)
}

function requestCourse(e) {
    const button = e.target
    const name = button.getAttribute('data-class-name')
    button.classList.add('engaged')
    button.disabled = true
    axios.post('/api/request/class', { name }, config)
        .then(res => {
            button.disabled = false
            button.classList.remove('engaged')
            if(res.status == 200) {
                button.innerText =  button.innerText === 'REQUESTED' ? 'REQUEST' : 'REQUESTED'
                showResponse(res.data)
            }
        })
        .catch(err => {
            button.disabled = false
            button.classList.remove('engaged')
            showResponse(err)
        })
}

function showResponse(msg) {
    response_msg.classList.add('response_msg_active')
    response_msg.innerText = msg

    setTimeout(() => {
        response_msg.classList.remove('response_msg_active')
        response_msg.innerText = ''
    }, 5000)
}

