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

    function scrollToBottom() {
        var messages = document.getElementById("messages");
        messages.scrollTop = messages.scrollHeight;
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

        // Scroll to the bottom after joining the chat
        scrollToBottom();
    });

    $('#leave-button').click(function () {
        socket.emit('chat message', { message: `${username} has left the chat.`, color: userColors[username] });
        $('#chat').hide();
        $('#username-form').show();
        $('#messages').empty();
    });

    $('form').submit(function () {
        var message = $('#input').val().trim(); // Trim whitespace

        if (!message) {
            return false; // Don't send empty messages
        }

        if (message.startsWith('/')) {
            // Handle slash commands locally
            var command = message.substr(1).toLowerCase();
            if (command === 'help') {
                showHelpPopup();
                $('#input').val('');
                return false;
            } else if (command === 'clear') {
                clearChat();
                $('#input').val('');
                return false;
            } else if (command === 'random') {
                showRandomNumber();
                $('#input').val('');
                return false;
            }
        } else {
            // Regular message
            socket.emit('chat message', { message: `${username}: ${message}`, color: userColors[username] });
        }

        // Scroll to the bottom after sending a message
        scrollToBottom();

        $('#input').val('');
        return false;
    });

    function showHelpPopup() {
        alert('Available slash commands:\n/help - Show this help\n/clear - Clear the chat\n/random - Generate a random number');
    }

    function clearChat() {
        $('#messages').empty();
    }

    function showRandomNumber() {
        var randomNumber = Math.floor(Math.random() * 100) + 1;
        $('#messages').append($('<li>').html(`<span style="color: ${userColors[username]};">You generated a random number: ${randomNumber}</span>`));
        // Scroll to the bottom after showing the random number
        scrollToBottom();
    }

    function getCurrentTimestamp() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes().toString().padStart(2, '0');
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = (hours % 12) || 12;
        return `${hours}:${minutes} ${ampm}`;
    }

    socket.on('chat message', function (data) {
        var timestamp = getCurrentTimestamp();
        var message = data.message;

        for (var word in emojiDictionary) {
            if (emojiDictionary.hasOwnProperty(word)) {
                var emoji = emojiDictionary[word];
                var wordPattern = new RegExp(`\\b${word}\\b`, 'gi');
                message = message.replace(wordPattern, emoji);
            }
        }

        $('#messages').append($('<li>').html(`<span style="color: ${data.color};">${timestamp} - ${message}</span>`));
        // Scroll to the bottom after receiving a new message
        scrollToBottom();
    });

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
