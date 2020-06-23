let buttons = document.querySelectorAll('.cancel')
const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}
let response_msg = document.querySelector('.response_msg')

if(buttons) {
    buttons.forEach(button => {
        button.addEventListener('click', e => {
            const id = e.target.getAttribute('data-class-id')
            button.style.opacity = 0.5
            button.disabled = true
            const parent = e.target.parentElement
            axios.post('/api/request/class', { id }, config)
                .then(res => {
                    const { msg } = res.data
                    if(msg !== 'Server Error') {
                        parent.remove()
                        buttons = document.querySelectorAll('.cancel')
                        document.title = buttons.length ? `${buttons.length} Requested Courses` : 'No Courses Requested'
                        showResponse(msg)
                    }
                    else {
                        button.style.opacity = 1
                        button.disabled = false
                        showResponse(msg)
                    }
                })
                .catch(err => {
                    button.style.opacity = 1
                    button.disabled = false
                    showResponse('Server Error')
                })
                
        })
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