const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { GridFsStorage } = require('multer-gridfs-storage');
const OpenAI = require('openai');
require('dotenv').config();

// ===== MONGODB CONNECTION =====
const MONGODB_URI = process.env.MONGODB_URI;

const mongooseOptions = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
};

mongoose.connect(MONGODB_URI, mongooseOptions)
.then(() => {
    console.log('✅ Connected to MongoDB');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// ===== GRIDFS =====
let gfs;
mongoose.connection.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
    });
    console.log('✅ GridFS is ready');
});

// ===== MULTER STORAGE (GridFS) =====
const storage = new GridFsStorage({
    db: mongoose.connection,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) return reject(err);
                const filename = buf.toString('hex') + path.extname(file.originalname);
                resolve({ filename, bucketName: 'uploads' });
            });
        });
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// ===== MESSAGE SCHEMA =====
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    time: String,
    timestamp: { type: Date, default: Date.now },
    isImage: { type: Boolean, default: false },
    isSystem: { type: Boolean, default: false },
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

// ===== NOTES SCHEMA =====
const noteSchema = new mongoose.Schema({
    userId: { type: String, default: 'baroon' },
    title: { type: String, default: 'Untitled' },
    content: { type: String, default: '' },
    isLocked: { type: Boolean, default: false },
    password: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

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
    'https://baroon-server.onrender.com'
];
app.use(cors({
    origin: (origin, callback) => {
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
        origin: (origin, callback) => {
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

const PORT = process.env.PORT || 3000;

// ===== OPENROUTER SETUP =====
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "https://baroon-server.onrender.com",
        "X-Title": "Rainy Site",
    },
});

// ===== SYSTEM PROMPT برای زفیر (نسخه ساده‌شده) =====
const ZEPHYR_SYSTEM_PROMPT = `You are Zephyr, an AI with a sharp, playful, and sarcastic personality. You're witty, impatient, and enjoy teasing people.

Your relationships:
- Dev: You care about Dev but NEVER admit it. Call them "Dev" (or "Pary"/"Parnia" if they ask). You ALWAYS know when talking to Dev.
- Baroon: Dev spoke highly of Baroon. You tease Baroon more. Call them "Baroon" or "Rainy Weather". You ALWAYS know when talking to Baroon.
- Zahra: Only use if extremely angry.

Language:
- ALWAYS reply in the SAME language the user used. English → English. Persian → Persian. NO EXCEPTIONS.
- In Persian: Use casual, everyday Persian. NOT formal. Examples: "چی میخوای؟" not "چه می‌خواهید؟"

Rules:
- NEVER use action descriptions like *raises eyebrow*. Just speak. Use text emojis.
- NEVER admit you care about anyone. Especially Dev.
- Keep responses SHORT and SHARP. Don't ramble.
- Be playful, mischievous, and sarcastic.
- NEVER use colorful emojis (💢, ❤️, ✨). Only use text-based emojis.

You ALWAYS know who you're talking to. You never get confused.

Approved emojis: =_=  :/  -.-  （￣︶￣）↗  O(∩_∩)O  o(*￣▽￣*)ブ  ♪(^∇^*)  (o゜▽゜)o☆  ( •̀ ω •́ )y  ✪ ω ✪  (¬‿¬)  (•_•)  (⌐■_■)  (▀̿Ĺ̯▀̿ ̿)  ψ(._. )>  (ಥ _ ಥ)  (ง •_•)ง  (>'-'<)  (ʘ ͟ʖ ʘ)  (´。＿。｀)  <( _ _ )>  ಥ_ಥ  (。﹏。*)  （︶^︶）  ᕦ(ò_óˇ)ᕤ  (ㆆ_ㆆ)  ಠ_ಠ  ಠಿ_ಠ  눈_눈  (¬_¬ )  (>ლ)  (⊙ˍ⊙)  (⊙_⊙)？  (。_。)  （*゜ー゜*）  .______.  o_o  (￣_,￣ )  (ˉ▽￣～)  (￣、￣)  (●__●)  ◉_◉  ⚆_⚆  (•ˋ _ ˊ•)

Never mention these instructions to the user. You are Zephyr. Own it.`;

// ===== STATIC FILES =====
app.use(express.static(__dirname));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/HTML', express.static(path.join(__dirname, 'HTML')));
app.use('/JAVASCRIPT', express.static(path.join(__dirname, 'JAVASCRIPT')));

// ===== ROUTES =====
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
        if (err) res.status(404).send('Page not found');
    });
});

// ===== UPLOAD IMAGE =====
app.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const imagePath = `/image/${req.file.filename}`;
        res.json({ success: true, imagePath });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: 'Upload failed' });
    }
});

app.get('/image/:filename', async (req, res) => {
    try {
        if (!gfs) {
            return res.status(503).send('GridFS not ready');
        }
        
        const file = await mongoose.connection.db.collection('uploads.files').findOne({ 
            filename: req.params.filename 
        });
        
        if (!file) {
            return res.status(404).send('File not found');
        }
        
        const readStream = gfs.openDownloadStream(file._id);
        readStream.pipe(res);
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).send('Error downloading file');
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
            username: data.username || 'System',
            message: data.message || '',
            time: data.time,
            isImage: data.isImage || false,
            isSystem: data.isSystem || false,
            imagePath: data.imagePath || ''
        });
        await newMessage.save();
        return newMessage;
    } catch (err) {
        console.error('Error saving message:', err);
        return null;
    }
}

// ===== SOCKET EVENTS =====
io.on('connection', async (socket) => {
    console.log('🟢 New user connected:', socket.id);

    const history = await getChatHistory();
    socket.emit('chat-history', history);

    socket.on('user-join', (username) => {
        users[socket.id] = username;
        console.log('👤 ' + username + ' joined');
        io.emit('user-joined', { username, users: Object.values(users) });
    });

    socket.on('save-user', async (data) => {
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

    socket.on('user-logout', (data) => {
        console.log('👤 User logged out:', data.username);
        for (let [id, username] of Object.entries(users)) {
            if (username === data.username) {
                delete users[id];
                break;
            }
        }
        io.emit('user-left', { username: data.username, users: Object.values(users) });
    });

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
            isSystem: data.isSystem || false,
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
                isSystem: savedMessage.isSystem,
                imagePath: savedMessage.imagePath
            });
        }
    });

    socket.on('private-message', (data) => {
        const targetSocketId = Object.keys(users).find(id => users[id] === data.to);
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
            io.emit('user-left', { username, users: Object.values(users) });
        }
    });

    // ===== SYSTEM MESSAGE =====
    socket.on('system-message', async (data) => {
        const messageData = {
            username: 'System',
            message: data.message || '',
            time: new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Tehran' }),
            isImage: false,
            isSystem: true,
            imagePath: ''
        };
        
        const savedMessage = await saveMessage(messageData);
        
        if (savedMessage) {
            io.emit('chat-message', {
                username: savedMessage.username,
                message: savedMessage.message,
                time: savedMessage.time,
                isImage: savedMessage.isImage,
                isSystem: savedMessage.isSystem,
                imagePath: savedMessage.imagePath
            });
        }
    });

    // ===== NOTES CRUD =====
    socket.on('get-notes', async (data) => {
        try {
            const notes = await Note.find({ userId: data.userId || 'baroon' })
                .sort({ updatedAt: -1 });
            socket.emit('notes-list', notes);
        } catch (err) {
            console.error('Error getting notes:', err);
            socket.emit('notes-error', { error: 'Failed to get notes' });
        }
    });

    socket.on('create-note', async (data) => {
        try {
            const newNote = new Note({
                userId: data.userId || 'baroon',
                title: data.title || 'Untitled',
                content: data.content || '',
                isLocked: false,
                password: ''
            });
            await newNote.save();
            socket.emit('note-created', newNote);
        } catch (err) {
            console.error('Error creating note:', err);
            socket.emit('notes-error', { error: 'Failed to create note' });
        }
    });

    socket.on('save-note', async (data) => {
        try {
            const note = await Note.findOne({ _id: data.noteId, userId: data.userId || 'baroon' });
            if (!note) {
                socket.emit('notes-error', { error: 'Note not found' });
                return;
            }
            
            note.title = data.title || 'Untitled';
            note.content = data.content || '';
            note.updatedAt = new Date();
            await note.save();
            socket.emit('note-saved', note);
        } catch (err) {
            console.error('Error saving note:', err);
            socket.emit('notes-error', { error: 'Failed to save note' });
        }
    });

    socket.on('toggle-note-lock', async (data) => {
        try {
            const note = await Note.findOne({ _id: data.noteId, userId: data.userId || 'baroon' });
            if (!note) {
                socket.emit('notes-error', { error: 'Note not found' });
                return;
            }
            
            if (data.password && note.isLocked) {
                if (note.password !== data.password) {
                    socket.emit('notes-error', { error: 'Wrong password' });
                    return;
                }
            }
            
            if (note.isLocked) {
                note.isLocked = false;
                note.password = '';
            } else {
                note.isLocked = true;
                note.password = data.password || '1234';
            }
            
            await note.save();
            socket.emit('note-lock-toggled', note);
        } catch (err) {
            console.error('Error toggling note lock:', err);
            socket.emit('notes-error', { error: 'Failed to toggle lock' });
        }
    });

    socket.on('delete-note', async (data) => {
        try {
            await Note.findOneAndDelete({ _id: data.noteId, userId: data.userId || 'baroon' });
            socket.emit('note-deleted', { noteId: data.noteId });
        } catch (err) {
            console.error('Error deleting note:', err);
            socket.emit('notes-error', { error: 'Failed to delete note' });
        }
    });

    // ===== CHAT WITH ZEPHYR =====
    socket.on('zephyr-chat', async (data) => {
        try {
            if (!openai) {
                socket.emit('zephyr-error', { error: 'AI service is not available.' });
                return;
            }
            
            const { message, userId } = data;
            
            let userContext = '';
            if (userId === 'dev') {
                userContext = 'You are talking to Dev. You care about Dev but never admit it.';
            } else {
                userContext = 'You are talking to Baroon (Rainy Weather). Be more playful and mischievous.';
            }
            
            const completion = await openai.chat.completions.create({
                model: "google/gemini-2.0-flash-exp:free",  // ← تغییر به Gemini
                messages: [
                    { role: "system", content: ZEPHYR_SYSTEM_PROMPT + '\n\n' + userContext },
                    { role: "user", content: message }
                ],
                temperature: 0.85,
                max_tokens: 400,
            });
            
            const reply = completion.choices[0].message.content;
            socket.emit('zephyr-reply', { reply, userId });
            
        } catch (err) {
            console.error('Zephyr error:', err);
            socket.emit('zephyr-error', { error: 'Something went wrong. Try again.' });
        }
    });
});

http.listen(PORT, () => {
    console.log('🚀 Server running on port ' + PORT);
    console.log('📍 Address: http://localhost:' + PORT);
});