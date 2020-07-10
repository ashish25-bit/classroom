import { getClassUid } from './module/class.js'
let socket = io()
let type

window.addEventListener('beforeunload', () => {
    const name = getClassUid()
    if (type === 'teacher')
        socket.emit('cancelRoom', { type, room: name })
})

function joinRoom() {
    const name = getClassUid()
    axios.get(`/api/get/authorization/${name}`)
        .then(res => {
            type = res.data.type
            const displayName = type === 'teacher' ? res.data.name : res.data.regNo
            socket.emit('makeVideoRoom', { name: displayName, type, room: name })
        })
        .catch(err => {
            console.log(err)
        })
}

joinRoom()

socket.on('roomMsg', msg => console.log(msg))
