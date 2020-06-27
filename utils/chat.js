let users = []

function joinRoom(room, id) {
    const user = { id, room }
    users.push(user)
    return user
}

function showRoom() {
    console.log(users)
}

function removeUser(id) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) {
            users.splice(i, 1)[0]
            i--
        }
    }
}

module.exports = { joinRoom, showRoom, removeUser }
