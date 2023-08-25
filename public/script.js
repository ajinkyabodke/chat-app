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

    var typing = false; // Variable to track whether the local user is typing
    var typingTimeout; // Timer to control the typing notifications

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

    function sendTypingNotification(isTyping) {
        socket.emit('typing', { username, isTyping });
    }

    $('#input').on('input', function () {
        clearTimeout(typingTimeout); // Clear previous timer
        if ($(this).val().trim() !== "") {
            typing = true;
            sendTypingNotification(true); // Send typing notification
            typingTimeout = setTimeout(function () {
                typing = false;
                sendTypingNotification(false); // Send typing notification
            }, 2000); // Set timeout to 2 seconds
        } else {
            typing = false;
            sendTypingNotification(false); // Send typing notification
        }
    });



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


        socket.emit('userJoin'); // Emit userJoin event when user clicks join button

        handleUserJoin();

        scrollToBottom();
    });

    let leftChat = false; // Flag to prevent double leave emission

    $('#leave-button').click(function () {
        if (!leftChat) {
            leftChat = true;
            socket.emit('userLeave'); // Emit userLeave event when user clicks leave button
        }

        socket.emit('chat message', { message: `${username} has left the chat.`, color: userColors[username] });

        $('#chat').hide();
        $('#username-form').show();
        $('#messages').empty();

        handleUserLeave();
    });


    $('form').submit(function () {
        var message = $('#input').val().trim(); // Trim whitespace

        if (!message) {
            return false; // Don't send empty messages
        }

        if (message.startsWith('/')) {
            // Handle slash commands locally
            var commandParts = message.substr(1).split(' ');
            var command = commandParts[0].toLowerCase();

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
            } else if (command === 'rem') {
                // Handle /rem command
                if (commandParts.length === 1) {
                    showReminderList();
                } else if (commandParts.length === 2) {
                    var name = commandParts[1];
                    if (customValues[name]) {
                        $('#messages').append($('<li>').html(`<span style="color: ${userColors[username]};">${name}: ${customValues[name]}</span>`));
                        scrollToBottom();
                    } else {
                        $('#messages').append($('<li>').html(`<span style="color: ${userColors[username]};"> "${name}" not found.</span>`));
                        scrollToBottom();
                    }
                } else if (commandParts.length > 2) {
                    var name = commandParts[1];
                    var value = commandParts.slice(2).join(' ');
                    customValues[name] = value;
                    $('#messages').append($('<li>').html(`<span style="color: ${userColors[username]};">Set "${name}" to "${value}".</span>`));
                    scrollToBottom();
                }
                $('#input').val('');
                return false;
            } else if (command === 'calc') {
                // Handle /calc command
                var expression = commandParts.slice(1).join(' ');
                try {
                    var result = eval(expression);
                    $('#messages').append($('<li>').html(`<span style="color: ${userColors[username]};">${expression} = ${result}</span>`));
                    scrollToBottom();
                } catch (error) {
                    $('#messages').append($('<li>').html(`<span style="color: ${userColors[username]};">Invalid expression: ${error.message}</span>`));
                    scrollToBottom();
                }
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

    function updateTypingStatus(username, isTyping) {
        const typingStatusElement = $('.typing-status');

        if (isTyping) {
            if (typingStatusElement.length === 0) {
                $('#messages').append($('<li class="typing-status">').text(`${username} is typing...`));
            }
        } else {
            typingStatusElement.remove(); // Remove the typing status message
        }
        scrollToBottom();
    }

    $('#input').on('input', function () {
        clearTimeout(typingTimeout);
        if ($(this).val().trim() !== "") {
            typing = true;
            sendTypingNotification(true);
            typingTimeout = setTimeout(function () {
                typing = false;
                sendTypingNotification(false);
            }, 2000);
        } else {
            typing = false;
            sendTypingNotification(false);
        }
    });

    function showHelpPopup() {
        alert('Available slash commands:\n/help - Show this help\n/clear - Clear the chat\n/random - Generate a random number\n/calc <expression> - Perform calculations\n/rem - to show all keys\n/rem <key> <value> - Set or recall a reminder\n/rem <key> - to recall');
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

    function showReminderList() {
        var reminders = Object.keys(customValues).join(', ');
        $('#messages').append($('<li>').html(`<span style="color: ${userColors[username]};">Available reminders: ${reminders}</span>`));
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
    socket.on('onlineUsers', (count) => {
        onlineUsers = count; // Update the online user count
        updateOnlineUserCount(); // Call the function to update the count display
    });


    socket.on('connect', function () {
        handleUserJoin();
    });

    socket.on('typing', function (data) {
        updateTypingStatus(data.username, data.isTyping); // Update typing status
    });




});
