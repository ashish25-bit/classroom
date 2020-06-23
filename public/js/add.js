const add = document.querySelector('.btn_con button')
const name = document.querySelector('.name')
const department = document.querySelector('.department')
const semester = document.querySelector('.semester')
const batch = document.querySelector('.batch')
const section = document.querySelector('.section')
const subject = document.querySelector('.subject')
const code = document.querySelector('.code')
const form = document.querySelector('.add_class_form')
const labels = document.querySelectorAll('.field label') 
let response_msg = document.querySelector('.response_msg')

{ name.disabled = true; subject.disabled = true; code.disabled = true }

add.addEventListener('click', e => {
    e.preventDefault()
    let flag = 1

    removeClass()

    // if department is empty
    if (!department.value) {
        flag = 0
        emptyInput(department.previousSibling)
    }

    // if semester is empty 
    if (!semester.value) {
        flag = 0
        emptyInput(semester.previousSibling)
    }

    // if section is empty
    if (!section.value) {
        flag = 0
        emptyInput(section.previousSibling)
    }

    // if batch is empty
    if (!batch.value) {
        flag = 0
        emptyInput(batch.previousSibling)
    }

    // if subject is empty
    if (!subject.value) {
        flag = 0
        emptyInput(subject.previousSibling)
    }

    // if code is empty
    if (!code.value) {
        flag = 0
        emptyInput(code.previousSibling)
    }

    if (!flag) return

    add.disabled = true
    add.style.opacity = 0.5

    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    const data = {
        name: name.value,
        department: department.value,
        semester: semester.value,
        batch: batch.value,
        section: section.value,
        subject: subject.value,
        code: code.value
    }

    // posting the data
    axios.post(`/api/add/class`, data, config)
        .then(res => {
            name.value = ''
            department.value = ''
            batch.value = ''
            section.value = ''
            subject.value = ''
            code.value = ''
            semester.value = ''
            subject.disabled = true
            subject.innerHTML = ''
            showResponse(res.data)
        })
        .catch(err => showResponse(err))
})

function showResponse(msg) {
    response_msg.classList.add('response_msg_active')
    response_msg.innerText = msg
    add.disabled = false
    add.style.opacity = 1

    setTimeout(() => {
        response_msg.classList.remove('response_msg_active')
        response_msg.innerText = ''
    }, 5000)
}

department.addEventListener('change', changeName)
section.addEventListener('change', changeName)
batch.addEventListener('change', changeName)

function changeName() {
    let generate = ''
    generate += !code.value ? '' : code.value
    generate += !department.value ? '' : `-${department.value}`
    generate += !section.value ? '' : `-${section.value}`
    generate += !batch.value ? '' : `-Batch${batch.value}`
    name.value = generate
}

semester.addEventListener('change', e => {
    // call to fetch the subject name and the subject code
    if (e.target.value) {
        axios.get(`/api/code/subject/${e.target.value}`)
            .then(res => {
                if (res.data.length) {
                    subject.disabled = false
                    subject.innerHTML = ''
                    code.value = ''
                    makeNode('', 'Select Your Course Here.', '')
                    code.placeholder = ''
                    res.data.forEach(course => {
                        const { name, code } = course
                        makeNode(name, name, code)
                    })
                }
            })
            .catch(err => console.log(err))
    }

    else {
        subject.disabled = true; subject.disabled = true
        subject.innerHTML = `<option value="">Select The Semester first</option>`
        code.placeholder = 'Select The Semester first'
        code.value = ''
        changeName()
    }
})

subject.addEventListener('change', () => {
    const index = subject.selectedIndex
    code.value = subject.options[index].getAttribute('code')
    changeName()
})

function makeNode(value, text, attribute) {
    const option = document.createElement('option')
    option.value = value
    option.innerText = text
    if (attribute) {
        option.setAttribute('code', attribute)
    }
    subject.appendChild(option)
}

function emptyInput(element) {
    element.style.color = 'red'
}

function removeClass() {
    for(label of labels)
        label.style.color = '#757575'
}