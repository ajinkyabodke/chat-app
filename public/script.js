$(function() {
    var socket = io();
    var username = "";

    $('#join-button').click(function() {
        username = $('#username').val();
        if (username.trim() === "") {
            alert("Please enter a valid username.");
            return;
        }

        $('#username-form').hide();
        $('#logged-in-username').text(username);
        $('#chat').show();

        socket.emit('chat message', `${username} has joined the chat.`);
    });

    $('#leave-button').click(function() {
        socket.emit('chat message', `${username} has left the chat.`);
        $('#chat').hide();
        $('#username-form').show();
        $('#messages').empty();
    });

    $('form').submit(function() {
        var message = $('#input').val();
        socket.emit('chat message', `${username}: ${message}`);
        $('#input').val('');
        return false;
    });

    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    });
});