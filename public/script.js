$(function() {
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




    $('#join-button').click(function() {
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
    });

    $('#leave-button').click(function() {
        socket.emit('chat message', { message: `${username} has left the chat.`, color: userColors[username] });
        $('#chat').hide();
        $('#username-form').show();
        $('#messages').empty();
    });

    $('form').submit(function() {
        var message = $('#input').val();
        socket.emit('chat message', { message: `${username}: ${message}`, color: userColors[username] });
        $('#input').val('');
        return false;
    });

    socket.on('chat message', function(data) {
        var message = data.message;

        // Replace words with emojis
        for (var word in emojiDictionary) {
            if (emojiDictionary.hasOwnProperty(word)) {
                var emoji = emojiDictionary[word];
                var wordPattern = new RegExp(`\\b${word}\\b`, 'gi'); // Create a RegExp for whole word match
                message = message.replace(wordPattern, emoji);
            }
        }

        $('#messages').append($('<li>').html(`<span style="color: ${data.color};">${message}</span>`));
    });

});

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}