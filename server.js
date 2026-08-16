const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');

// ===== CORS تنظیمات =====
app.use(cors({
    origin: ['https://baroon.netlify.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// ===== Socket.io با تنظیمات CORS =====
const io = require('socket.io')(http, {
    cors: {
        origin: ['https://baroon.netlify.app', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const path = require('path');

const PORT = process.env.PORT || 3000;

// ===== بقیه کدهای server.js =====
app.use(express.static(__dirname));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/HTML', express.static(path.join(__dirname, 'HTML')));
app.use('/JAVASCRIPT', express.static(path.join(__dirname, 'JAVASCRIPT')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    if (page === 'index.html') {
        res.sendFile(path.join(__dirname, 'index.html'));
        return;
    }
    const htmlPath = path.join(__dirname, 'HTML', `${page}.html`);
    res.sendFile(htmlPath, (err) => {
        if (err) {
            res.status(404).send('Page not found');
        }
    });
});

const users = {};
const chatHistory = [];

io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    socket.emit('chat-history', chatHistory);

    socket.on('user-join', (username) => {
        users[socket.id] = username;
        console.log(username + ' joined');
        io.emit('user-joined', {
            username: username,
            users: Object.values(users)
        });
    });

    socket.on('chat-message', (data) => {
        const messageData = {
            username: data.username,
            message: data.message,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        };
        chatHistory.push(messageData);
        if (chatHistory.length > 100) {
            chatHistory.shift();
        }
        console.log(data.username + ': ' + data.message);
        io.emit('chat-message', messageData);
    });

    socket.on('private-message', (data) => {
        const targetSocketId = Object.keys(users).find(
            id => users[id] === data.to
        );
        if (targetSocketId) {
            io.to(targetSocketId).emit('private-message', {
                from: data.from,
                message: data.message,
                time: new Date().toLocaleTimeString()
            });
        }
    });

    socket.on('typing', (username) => {
        socket.broadcast.emit('user-typing', username);
    });

    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            console.log(username + ' disconnected');
            delete users[socket.id];
            io.emit('user-left', {
                username: username,
                users: Object.values(users)
            });
        }
    });
});

http.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
    console.log('Address: http://localhost:' + PORT);
});