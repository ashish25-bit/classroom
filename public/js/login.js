const form = document.querySelector('.form_container')
const email = document.querySelector('.email_input')
const password = document.querySelector('.pwd_input')
const btn = document.querySelector('.btn_con button')
const error = document.querySelector('.form_container section')
const action = form.classList[1] === 'faculty' ? '/faculty/login' : '/'


form.addEventListener('submit', e => {
    // disabling the button
    btn.disable = true
    btn.style.opacity = 0.5

    error.innerText = ''

    if(!email.value || !password.value) {
        e.preventDefault()
        btnEnable()
        return error.innerText = 'All The Fields Should Be Filled'
    }

    // if everything is okay
    form.setAttribute('action', action)
})

// enabling the button
function btnEnable() {
    btn.disable = false
    btn.style.opacity = 1
}