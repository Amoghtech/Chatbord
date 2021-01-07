const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const PORT = 3000 || process.env.PORT;
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {
  userjoin,
  getcurrentuser,
  userleave,
  getroomusers,
} = require('./utils/users');
const server = http.createServer(app);

const io = socketio(server);
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
const botname = 'ChatCORD BOT';
// Run wgen a client connects
io.on('connection', (socket) => {
  // console.log("New WS connection....");

  socket.on('joinRoom', ({ username, room }) => {
    const user = userjoin(socket.id, username, room);
    socket.join(user.room); /*socket.io has buil;t in function to join room */

    //   Welcome current user
    socket.emit('message', formatMessage(botname, 'Welcome to ChatCord!'));
    /*as this type of messages will be send by Chatbot */
    /*goes to main.js */

    // Broadcasts when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(
          botname,
          `${user.username} has joined the chat`
        ) /*broadcast the info to that room only */
      ); /*this will emit to everybody except user that's connecting and socket.emit() will emit to just single client
and io.emit() will emit to everybody*/

    // Send users and room info
    io.to(user.room).emit('roomusers', {
      room: user.room,
      users: getroomusers(user.room),
    });
  });

  // Listen for chatmessage
  socket.on('chatmessage', (message) => {
    const user = getcurrentuser(socket.id);
    // console.log(message);
    io.to(user.room).emit(
      'message',
      formatMessage(`${user.username}`, message)
    );
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userleave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botname, `${user.username} has left the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomusers', {
        room: user.room,
        users: getroomusers(user.room),
      });
    
    }
});

}); /*it's going to listen an event */

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
