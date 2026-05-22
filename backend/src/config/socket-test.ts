import { io } from "socket.io-client";

const socket = io('http://localhost:5000') ; 

socket.on('connect', () => {
    console.log('Connected to server: ', socket.id) ; 

    // simulate author joining their room 

    socket.emit('join:author', 'AUTH001') ; 
    console.log('Joined author room: AUTH001') ;
})

// listen for ticket updates 

socket.on('ticket:updated', (data) => {
    console.log('Ticket updated event received: ', data) ; 
})

socket.on('disconnect', () => {
    console.log('Disconnected from server')
})