// FRONTEND JAVASCRIPT
const chatform = document.getElementById('chat-form');
const chatmessage = document.querySelector('.chat-messages');
const roomname = document.getElementById('room-name');
const userlist = document.getElementById('users');
const socket = io();

// Get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true /*ignore special characters like ? ,/ in url*/,
}); /*take username and room from url : http://localhost:3000/chat.html?username=amogh&room=JavaScript */

// Join chat room
socket.emit('joinRoom', { username, room });

// Get room users
socket.on('roomusers', ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

// console.log(username, room);

// Medssage from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  //   Scroll down
  chatmessage.scrollTop = chatmessage.scrollHeight;
}); /*whenecer we get message event */

// Outyput message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message'); /*add a message class to all the classList */
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
    ${message.text}
    </p>`;
  document
    .querySelector('.chat-messages')
    .appendChild(
      div
    ); /*for classes use querySelector and for ids use getElementbyId */
}

// Add room name to DOM
function outputRoomName(room) {
  roomname.innerText = room;
}

// Add users to DOM
function outputRoomUsers(users) {
  userlist.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join('')}
    `;/*join changes an array into string */
}

// Message submit
chatform.addEventListener('submit', (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;

  // Emmiting a message to the server
  socket.emit('chatmessage', msg);

  //   Clear input after submitting
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});
