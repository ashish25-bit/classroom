const buttons = document.querySelectorAll('.register_cls')
const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}
let response_msg = document.querySelector('.response_msg')

// checking the register status
window.onload = () => { addText() }

buttons.forEach(button => {
    button.addEventListener('click', e => {
        button.style.opacity = 0.5
        button.disabled = true
        const id = button.getAttribute('data-class-id')
        axios.post('/api/request/class', { id }, config)
            .then(res => {
                const { cls, msg } = res.data
                classes = cls
                button.style.opacity = 1
                button.disabled = false
                if (msg !== 'Server Error')
                    addText()
                showResponse(msg)
            })
            .catch(err => {
                console.log(err)
                button.style.opacity = 1
                button.disabled = false
                showResponse('Server Error')
            })
    })
})

function addText() {
    buttons.forEach(button => {
        let id = button.getAttribute('data-class-id')
        button.disabled = false
        button.innerText = classes.includes(id) ? 'Requested' : 'Request'
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