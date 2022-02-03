const socket = io()

//elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username,room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight+ newMessageMargin
    
    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop+visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(a)=>{
    console.log(a)
    const html = Mustache.render(messageTemplate,{
        username:a.username,
        message:a.text,
        createdAt: moment(a.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(mssg)=>{
    console.log(mssg)
    const html = Mustache.render(locationTemplate,{
        username: mssg.username,
        url: mssg.url,
        createdAt: moment(mssg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')

    const mssg = e.target.elements.message.value

    socket.emit('sendMessage',mssg,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$sendLocation.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocation.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            lat:position.coords.latitude,
            lon:position.coords.longitude
        },()=>{
            $sendLocation.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})