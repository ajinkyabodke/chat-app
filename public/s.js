$(function () {
  var socket = io();
  var username = "";
  var userColors = {};
  var emojiDictionary = {
      "react": "⚛️",
      "woah": "😮",
      "hey": "👋",
      "lol": "😂",
      "like": "❤️",
      "congratulations": "🎉",
  };

  // Define a dictionary to store the user's custom values
  var customValues = {};

  var onlineUsers = 0; // Counter for online users

  function scrollToBottom() {
      var messages = document.getElementById("messages");
      messages.scrollTop = messages.scrollHeight;
  }

  function updateOnlineUserCount() {
      $('#online-users').text(`Online Users: ${onlineUsers}`);
  }

  function handleUserJoin() {
      onlineUsers++; // Increment the online user count
      updateOnlineUserCount();
  }

  function handleUserLeave() {
      onlineUsers--; // Decrement the online user count
      updateOnlineUserCount();
  }

  $('#join-button').click(function () {
      username = $('#username').val();
      if (username.trim() === "") {
          alert("Please enter a valid username.");
          return;
      }

      if (!userColors[username]) {
          userColors[username] = getRandomColor();
      }

      $('#username-form').hide();
      $('#logged-in-username').text(username);
      $('#chat').show();

      socket.emit('chat message', { message: `${username} has joined the chat.`, color: userColors[username] });

      handleUserJoin();

      scrollToBottom();
  });

  $('#leave-button').click(function () {
      socket.emit('chat message', { message: `${username} has left the chat.`, color: userColors[username] });
      $('#chat').hide();
      $('#username-form').show();
      $('#messages').empty();

      handleUserLeave();
  });

  // Rest of your code remains the same
  // ...

  // Socket event listeners
  socket.on('connect', function () {
      handleUserJoin();
  });

  socket.on('disconnect', function () {
      handleUserLeave();
  });
});
