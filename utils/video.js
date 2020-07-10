const rooms = new Map()

function makeRoom(name, room) {
    // const videoRoom = { name, room }
    // rooms.push(videoRoom)
    // return 'Room Made'
}

function joinVideoRoom(room) {
    // console.log(rooms)
    // const videoRoom = rooms.find(rm => rm.room === room)
    // if (videoRoom)
    //     return 'Room is present'
    // return 'Room is not present'
}

module.exports = { makeRoom, joinVideoRoom }


// // Used for mediaSoup room
// let room = null;
// // Used for mediaSoup peer
// let mediaPeer = null;
// const { roomId, peerName } = socket.handshake.query;

// if (rooms.has(roomId)) {
//   room = rooms.get(roomId);
// } else {
//   room = mediaServer.Room(config.mediasoup.mediaCodecs);
//   rooms.set(roomId, room);
//   room.on('close', () => {
//     rooms.delete(roomId);
//   });
// }