const express = require('express'); //requiring express
const app = express(); //app has all the properties of express
const server = require('http').Server(app); //creting http server
const io = require('socket.io')(server); //socket runs on this server
const { ExpressPeerServer } = require('peer'); //WebRTC api for real time media communication


const peerServer = ExpressPeerServer(server, {
    debug: true
});


app.use(express.static('./assets')); //setting up static path
app.set('view engine', 'ejs'); //setting up view engine
const path = require('path');  
app.set('views', path.join(__dirname, 'views'));  
app.use('/', require('./router'));


//socket handels users joining/leaving and messaging
io.on('connection', socket => {
    //request for joining room
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId); //joining the mentioned room
        socket.broadcast.to(roomId).emit('user-connected', userId, userName);
        socket.on('send-message', (inputMsg, userName, org) => {
            io.to(roomId).emit('recieve-message', inputMsg, userName, org);
        })
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId, userName);
        })
    });
});

//running the server
server.listen(8000, function (err) {
    if (err) {
        console.log(`Error :: ${err} occured while starting the server in server.js!`);
    }
    console.log(`Server is up and running on port 8000`);
});
