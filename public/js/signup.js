const form = document.querySelector('.form_container')
const name = document.querySelector('.name_input')
const email = document.querySelector('.email_input')
const password = document.querySelector('.pwd_input')
const faculty_id = document.querySelector('.faculty_id')
const department = document.querySelector('.department')
const position = document.querySelector('.pos_input')
const error = document.querySelector('.form_container section')
const btn = document.querySelector('.btn_con button')

form.addEventListener('submit', async e => {    
    // disabling the button
    btn.disable = true
    btn.style.opacity = 0.5

    error.innerText = ''

    // checking all the fields are filled
    if (!name.value || !department.value || !email.value || !password.value || !faculty_id.value || !position.value) {
        e.preventDefault()
        btnEnable()
        return error.innerText = 'All The Fields Should Be Filled'
    }

    // validating srm email
    else if (!email.value.endsWith('@srmist.edu.in')) {
        e.preventDefault()
        btnEnable()
        return error.innerText = 'Valid SRM Email is required'
    }

    // if everything is okay
    form.setAttribute('action', '/faculty/register')
})

// enabling the button
function btnEnable() {
    btn.disable = false
    btn.style.opacity = 1
}