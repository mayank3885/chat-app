const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const app = express()
const server = http.createServer(app)
const { addUser, removeUser, getUser, getUserByRoom } = require('./utils/users.js')
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket)=>{
    console.log('New webSocket Connection')

    socket.on('join',({username,room}, callback)=>{
        const {error, user} = addUser({ id: socket.id, username, room })
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage("Admin",'Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
        callback()
    })

    socket.on('sendMessage',(mssg,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.username,mssg))
        callback('Delivered')
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.emit('message', generateMessage('Admin',`${user.username} has left!`))
        }
    })

    socket.on('sendLocation',(e,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${e.lat},${e.lon}`))
        callback()
    })
})

server.listen(port, () => {
    console.log('Server is up and running')
})