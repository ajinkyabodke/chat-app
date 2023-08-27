const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + '/public'));


let onlineUsers = 0; // Variable to keep track of online users
const activeUsers = []; // Keep track of active users

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('userJoin', () => {
        socket.join('chatRoom'); // Join a specific room for the chat
        onlineUsers++;
        activeUsers.push(socket.username); // Assuming socket.username is set on the client side
        io.emit('onlineUsers', { count: onlineUsers, users: activeUsers });
    });

    socket.on('userLeave', () => {
        if (onlineUsers > 0) {
            onlineUsers--;
        }
        activeUsers.splice(activeUsers.indexOf(socket.username), 1);
        io.emit('onlineUsers', { count: onlineUsers, users: activeUsers });  // Update count and users for the chatRoom
    });

    socket.on('chat message', (msg) => {
        io.to('chatRoom').emit('chat message', msg);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', { username: data.username, isTyping: data.isTyping });
    });



    socket.on('disconnect', () => {
        console.log('A user disconnected');
        if (onlineUsers > 0) {
            onlineUsers--;
        }
        io.to('chatRoom').emit('onlineUsers', onlineUsers); // Update count for the chatRoom
    });
});





const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});