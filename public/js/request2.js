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
            const name = e.target.getAttribute('data-class-name')
            button.style.opacity = 0.5
            button.disabled = true
            const parent = e.target.parentElement
            axios.post('/api/request/class', { name }, config)
                .then(res => {
                    if (res.status !== 200) {
                        showResponse('Server Error')
                        button.disabled = false
                        button.style.opacity = 1
                        return
                    }
                    parent.remove()
                    buttons = document.querySelectorAll('.cancel')
                    document.title = buttons.length ? `${buttons.length} Requested Courses` : 'No Courses Requested'
                    showResponse(res.data)
                })
                .catch(err => {
                    console.log(err)
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
