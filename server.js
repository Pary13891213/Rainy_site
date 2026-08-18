const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// ===== MONGODB CONNECTION =====
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// ===== MESSAGE SCHEMA =====
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    time: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// ===== USER SCHEMA =====
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    displayName: String,
    password: String,
    accessCode: String,
    createdAt: { type: Date, default: Date.now },
    lastLogin: Date,
    isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

// ===== FIND OR CREATE USER =====
async function findOrCreateUser(data) {
    try {
        let user = await User.findOne({ username: data.username });
        if (!user) {
            user = new User({
                username: data.username,
                displayName: data.displayName || data.username,
                password: data.password || '',
                accessCode: data.accessCode || '',
                lastLogin: new Date()
            });
            await user.save();
            console.log('✅ New user created:', user.username);
        } else {
            user.lastLogin = new Date();
            await user.save();
            console.log('✅ User updated:', user.username);
        }
        return user;
    } catch (err) {
        console.error('Error finding/creating user:', err);
        return null;
    }
}

// ===== CORS =====
const allowedOrigins = [
    'https://baroon.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: true
}));

// ===== SOCKET.IO =====
const io = require('socket.io')(http, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        credentials: true
    }
});

const path = require('path');
const PORT = process.env.PORT || 3000;

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

// ===== GET CHAT HISTORY =====
async function getChatHistory() {
    try {
        return await Message.find().sort({ timestamp: 1 }).limit(100);
    } catch (err) {
        console.error('Error getting chat history:', err);
        return [];
    }
}

// ===== SAVE MESSAGE =====
async function saveMessage(data) {
    try {
        const newMessage = new Message({
            username: data.username,
            message: data.message,
            time: data.time
        });
        await newMessage.save();
        return newMessage;
    } catch (err) {
        console.error('Error saving message:', err);
        return null;
    }
}

io.on('connection', async (socket) => {
    console.log('🟢 New user connected:', socket.id);

    const history = await getChatHistory();
    socket.emit('chat-history', history);

    socket.on('user-join', (username) => {
        users[socket.id] = username;
        console.log('👤 ' + username + ' joined');
        io.emit('user-joined', {
            username: username,
            users: Object.values(users)
        });
    });

    // ===== SAVE USER TO DATABASE =====
    socket.on('save-user', async (data) => {
        const user = await findOrCreateUser({
            username: data.username,
            displayName: data.displayName || data.username,
            password: data.password || '',
            accessCode: data.accessCode || ''
        });
        
        if (user) {
            socket.emit('user-saved', { success: true, user: user });
        } else {
            socket.emit('user-saved', { success: false });
        }
    });

    socket.on('chat-message', async (data) => {
        const messageData = {
            username: data.username,
            message: data.message,
            time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Tehran' })
        };
        
        const savedMessage = await saveMessage(messageData);
        
        if (savedMessage) {
            console.log('💬 ' + data.username + ': ' + data.message);
            io.emit('chat-message', {
                username: savedMessage.username,
                message: savedMessage.message,
                time: savedMessage.time
            });
        }
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
            console.log('🔴 ' + username + ' disconnected');
            delete users[socket.id];
            io.emit('user-left', {
                username: username,
                users: Object.values(users)
            });
        }
    });
});

http.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
    console.log('📍 Address: http://localhost:' + PORT);
});