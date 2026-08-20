const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '_' + Math.random().toString(36).substring(7);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: fileFilter
});

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
    timestamp: { type: Date, default: Date.now },
    isImage: { type: Boolean, default: false },
    imagePath: { type: String, default: '' }
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
    'https://baroon.surge.sh',
    'https://baroon.netlify.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'https://rainy-server.onrender.com'
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
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/HTML', express.static(path.join(__dirname, 'HTML')));
app.use('/JAVASCRIPT', express.static(path.join(__dirname, 'JAVASCRIPT')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const imagePath = '/uploads/' + req.file.filename;
        res.json({ 
            success: true, 
            imagePath: imagePath 
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
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
            message: data.message || '',
            time: data.time,
            isImage: data.isImage || false,
            imagePath: data.imagePath || ''
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

// ===== SAVE USER =====
    socket.on('save-user', async (data) => {
        try {
            // پیدا کردن کاربر یا ساختن جدید
            let user = await User.findOne({ username: data.username });
            
            if (!user) {
                // ساختن کاربر جدید
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
                // به‌روزرسانی کاربر موجود
                user.displayName = data.displayName || data.username;
                user.lastLogin = new Date();
                await user.save();
                console.log('✅ User updated:', user.username);
            }
            
            socket.emit('user-saved', { 
                success: true, 
                user: {
                    username: user.username,
                    displayName: user.displayName
                }
            });
        } catch (err) {
            console.error('Error saving user:', err);
            socket.emit('user-saved', { success: false, error: err.message });
        }
    });

    // ===== UPDATE USERNAME =====
    socket.on('update-username', async (data) => {
        try {
            const user = await User.findOne({ username: data.oldUsername });
            if (user) {
                user.username = data.newUsername;
                user.displayName = data.newUsername;
                await user.save();
                console.log('✅ Username updated:', data.oldUsername, '→', data.newUsername);
                socket.emit('username-updated', { success: true, newUsername: data.newUsername });
            } else {
                socket.emit('username-updated', { success: false, error: 'User not found' });
            }
        } catch (err) {
            console.error('Error updating username:', err);
            socket.emit('username-updated', { success: false, error: err.message });
        }
    });

    // ===== UPDATE ACCESS CODE =====
    socket.on('update-code', async (data) => {
        try {
            const user = await User.findOne({ username: data.username });
            if (user) {
                user.accessCode = data.newCode;
                user.password = data.newCode;
                await user.save();
                console.log('✅ Access code updated for:', data.username);
                socket.emit('code-updated', { success: true });
            } else {
                socket.emit('code-updated', { success: false, error: 'User not found' });
            }
        } catch (err) {
            console.error('Error updating code:', err);
            socket.emit('code-updated', { success: false, error: err.message });
        }
    });

    // ===== LOGOUT =====
    socket.on('user-logout', (data) => {
        console.log('👤 User logged out:', data.username);
        for (let [id, username] of Object.entries(users)) {
            if (username === data.username) {
                delete users[id];
                break;
            }
        }
        io.emit('user-left', {
            username: data.username,
            users: Object.values(users)
        });
    });

    // ===== CLEAR CHAT HISTORY =====
    socket.on('clear-chat', async () => {
        try {
            await Message.deleteMany({});
            console.log('🗑️ All messages deleted from database');
            io.emit('chat-cleared');
        } catch (err) {
            console.error('Error clearing chat:', err);
        }
    });

    socket.on('chat-message', async (data) => {
        const messageData = {
            username: data.username,
            message: data.message || '',
            time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Tehran' }),
            isImage: data.isImage || false,
            imagePath: data.imagePath || ''
        };
        
        const savedMessage = await saveMessage(messageData);
        
        if (savedMessage) {
            console.log('💬 ' + data.username + ': ' + (data.isImage ? '[Image]' : data.message));
            io.emit('chat-message', {
                username: savedMessage.username,
                message: savedMessage.message,
                time: savedMessage.time,
                isImage: savedMessage.isImage,
                imagePath: savedMessage.imagePath
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