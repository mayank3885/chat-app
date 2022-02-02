const users =[]

const addUser =({ id, username, room }) =>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    }

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id===id)
    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = id => {
    return users.find(user => {
        return user.id === id
    })
}

const getUserByRoom = (room)=>{
    const user1 = users.filter((user)=>user.room===room)
    if(user1){
        return user1
    }
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserByRoom
}