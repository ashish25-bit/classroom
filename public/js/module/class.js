const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}

// add active class to btn 1
// remove active class from btn2
// display container 1
// remove container 2 from display
export function displayContainer(btn1, btn2, container1, container2) {
    btn2.classList.remove('active')
    btn1.classList.add('active')
    container2.style.display = 'none'
    container1.style.display = 'block'
}

// post the announcements
export function postAnnouncement(context, button, post, responseElement, name) {
    axios.post('/api/post/announcement', { post, name, context }, config)
        .then(res => {
            button.disabled = false
            button.style.opacity = 1
            showResponse(res.data, responseElement)
        })
        .catch(err => {
            button.disabled = false
            button.style.opacity = 1
            console.log(err)
            showResponse(err, responseElement)
        })
}

// display the response message
function showResponse(msg, element) {
    element.classList.add('response_msg_active')
    element.innerText = msg

    setTimeout(() => {
        element.classList.remove('response_msg_active')
        element.innerText = ''
    }, 5000)
}

// get the announcements 
export function getAnnouncements(name, element) {
    axios.get(`/api/get/announcement/${name}`)
        .then(res => {
            if (!res.data.length) {
                element.innerHTML = '<h3>No Announcements</h3>'
                return
            }
            element.innerHTML = ''
            res.data.forEach(announcement => {
                const { date, post, context } = announcement
                const div = document.createElement('div')
                const Date = moment(date)
                div.classList.add('announcement')
                div.innerHTML = `<p class=date>Posted On: ${Date.format('MMMM Do YYYY, h:m:A')}</p><h3>${context}</h3>`
                div.innerHTML += post
                element.appendChild(div)
            })
        })
        .catch(err => {
            console.log(err)
            element.innerHTML = '<h3>Error</h3>'
        })
}

// get the name from the url
export function getClassUid() {
    const href = window.location.href
    let n = href.lastIndexOf('/')
    return href.substring(n + 1, href.length)
}