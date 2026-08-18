// ===== SOCKET CONNECTION =====
const socket = io('https://rainy-server.onrender.com/');

// ===== SOCKET EVENTS =====
socket.on('chat-history', (history) => {
    // تاریخچه رو از دیتابیس بگیر و جایگزین کن
    messages = history.map(msg => ({
        sender: msg.username,
        content: msg.message,
        time: msg.time,
        type: msg.username === 'DEV' ? 'dev' : 'other'
    }));
    saveMessages();
    displayMessages();
});

socket.on('chat-message', (data) => {
    if (data.username === 'DEV') {
        const newMessage = {
            sender: 'DEV',
            content: data.message,
            time: data.time,
            type: 'dev'
        };
        messages.push(newMessage);
        saveMessages();
        displayMessages();
    } else {
        const newMessage = {
            sender: data.username,
            content: data.message,
            time: data.time,
            type: 'other'
        };
        messages.push(newMessage);
        saveMessages();
        displayMessages();
    }
});

socket.on('user-joined', (data) => {
    addSystemMessage(data.username + ' joined the chat');
});

socket.on('user-left', (data) => {
    addSystemMessage(data.username + ' left the chat');
});

socket.on('user-typing', (username) => {
    console.log(username + ' is typing...');
});

// ../JAVASCRIPT/dev.js
const STORAGE_KEY = 'chat_messages';
const DEV_STATUS_KEY = 'dev_online';
const CHECK_INTERVAL = 300;

let messages = [];
let lastMessageCount = 0;
let userOnline = false;
let checkInterval;

const messagesBox = document.getElementById('dev-messages-box');
const messageInput = document.getElementById('dev-message-input');
const sendBtn = document.getElementById('dev-send-btn');
const menuLinks = document.querySelectorAll('.menu-link');
const tabs = document.querySelectorAll('.tab');
const userStatusText = document.getElementById('user-status-text');
const statusIndicator = document.querySelector('.status-indicator');
const userActiveStatus = document.getElementById('user-active-status');
const clearChatBtn = document.getElementById('clear-chat-btn');

console.log('Dev.js loaded');
console.log('messagesBox:', messagesBox);
console.log('messageInput:', messageInput);
console.log('sendBtn:', sendBtn);
console.log('clearChatBtn:', clearChatBtn);

menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        menuLinks.forEach(l => l.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        
        link.classList.add('active');
        
        const tabId = link.getAttribute('data-tab') + '-tab';
        const tab = document.getElementById(tabId);
        if (tab) {
            tab.classList.add('active');
        }
    });
});

function saveMessages() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        console.log('Messages saved:', messages.length);
    } catch (e) {
        console.error('Error saving messages:', e);
    }
}

function loadMessages() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            messages = JSON.parse(saved);
            console.log('Messages loaded:', messages.length);
        } else {
            messages = [{
                sender: 'System',
                content: 'Chat initialized. Waiting for user...',
                time: new Date().toLocaleTimeString(),
                type: 'system'
            }];
            saveMessages();
        }
    } catch (e) {
        console.error('Error loading messages:', e);
        messages = [];
    }
}

function checkUserStatus() {
    const userStatus = localStorage.getItem('user_online');
    const wasOnline = userOnline;
    userOnline = userStatus === 'true';
    
    if (userOnline) {
        if (userStatusText) userStatusText.textContent = 'USER: ONLINE';
        if (userActiveStatus) userActiveStatus.textContent = 'YES';
        if (statusIndicator) statusIndicator.classList.add('online');
        
    } else {
        if (userStatusText) userStatusText.textContent = 'USER: OFFLINE';
        if (userActiveStatus) userActiveStatus.textContent = 'NO';
        if (statusIndicator) statusIndicator.classList.remove('online');
        
    }
}

function displayMessages() {
    if (!messagesBox) {
        console.error('messagesBox not found!');
        return;
    }
    
    if (messages.length === lastMessageCount) return;
    
    messagesBox.innerHTML = '';
    const userName = localStorage.getItem('userName') || 'User';
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        
        if (msg.type === 'dev') {
            messageDiv.className = 'message mine';
            msg.sender = 'DEV';
        } else if (msg.type === 'user') {
            messageDiv.className = 'message other';
            msg.sender = 'User';
        } else if (msg.type === 'system') {
            messageDiv.className = 'message system';
        } else {
            messageDiv.className = 'message other';
            msg.sender = msg.sender || 'Unknown';
        }
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${msg.sender}</span>
            </div>
            <div class="message-content">${msg.content}</div>
            <div class="message-time-bottom">${msg.time}</div>
        `;
        
        messagesBox.appendChild(messageDiv);
    });
    
    lastMessageCount = messages.length;
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function addSystemMessage(content) {
    const systemMsg = {
        sender: 'System',
        content: content,
        time: new Date().toLocaleTimeString(),
        type: 'system'
    };
    messages.push(systemMsg);
    saveMessages();
    displayMessages();
}

function clearChat() {
    console.log('Clearing chat...');
    
    messages = [{
        sender: 'System',
        content: 'Chat cleared by Developer',
        time: new Date().toLocaleTimeString(),
        type: 'system'
    }];
    
    saveMessages();
    displayMessages();
    createGlitchEffect();
}

function createGlitchEffect() {
    if (!messagesBox) return;
    
    const rect = messagesBox.getBoundingClientRect();
    const pageRect = document.querySelector('.dev-page').getBoundingClientRect();
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const rectangle = document.createElement('div');
            rectangle.style.position = 'absolute';
            rectangle.style.background = Math.random() < 0.4 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.98)';
            rectangle.style.pointerEvents = 'none';
            rectangle.style.zIndex = '9999';
            rectangle.style.width = `${60 + Math.random() * 120}px`;
            rectangle.style.height = `${5 + Math.random() * 3}px`;
            rectangle.style.left = `${rect.left - pageRect.left + Math.random() * rect.width}px`;
            rectangle.style.top = `${rect.top - pageRect.top + Math.random() * rect.height}px`;
            rectangle.style.animation = 'glitch-rectangle 0.15s forwards';
            
            document.querySelector('.dev-page').appendChild(rectangle);
            
            setTimeout(() => rectangle.remove(), 150);
        }, i * 50);
    }
}

function sendMessage() {
    if (!messageInput) return;
    
    const content = messageInput.value.trim();
    if (!content) return;
    
    // فقط به سرور بفرست
    socket.emit('chat-message', {
        username: 'DEV',
        message: content
    });
    
    messageInput.value = '';
    createGlitchEffect();
}

function checkNewMessages() {
    loadMessages();
    displayMessages();
    checkUserStatus();
}

function updateDevStatus(isOnline) {
    localStorage.setItem(DEV_STATUS_KEY, isOnline);
}

// ===== INIT =====
function init() {
    console.log('Initializing dev.js');
    
    loadMessages();
    displayMessages();
    checkUserStatus();
    
    // Send username to server
    socket.emit('user-join', 'Dev');
    
    checkInterval = setInterval(checkNewMessages, CHECK_INTERVAL);
    updateDevStatus(true);
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        console.log('Send button event listener added');
    } else {
        console.error('sendBtn not found!');
    }
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            return;
        }
    });
    
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
        console.log('Clear chat button event listener added');
    }
    
    window.addEventListener('beforeunload', () => {
        updateDevStatus(false);
    });
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes glitch-rectangle {
            0% { opacity: 0; }
             100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('dev.js initialization complete');

    // ===== Hamburger Menu =====
    const hamburger = document.querySelector('.hamburger-menu');
    const menuLinks = document.querySelector('.menu-links');

    if (hamburger && menuLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            menuLinks.classList.toggle('active');
        });
        
        // بستن منو با کلیک روی هر لینک
        menuLinks.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                menuLinks.classList.remove('active');
            });
        });
        
        // بستن منو با کلیک بیرون
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.top-menu')) {
                hamburger.classList.remove('active');
                menuLinks.classList.remove('active');
            }
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}