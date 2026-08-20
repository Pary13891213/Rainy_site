// ===== SOCKET CONNECTION =====
const socket = io('https://rainy-server.onrender.com/', {
    transports: ['websocket', 'polling']
});

// ===== SOCKET EVENTS =====
socket.on('chat-history', (history) => {
    messages = history.map(msg => ({
        sender: msg.username === 'DEV' ? 'DEV' : msg.username,
        content: msg.message,
        time: msg.time,
        type: msg.username === 'DEV' ? 'dev' : 'other'
    }));
    displayMessages();
});

socket.on('chat-message', (data) => {
    console.log('Dev received message:', data);
    
    // اگه پیام از خود Dev باشه → نادیده بگیر (قبلاً توی sendMessage اضافه شده)
    if (data.username === 'DEV') {
        return;
    }
    
    // پیام از User
    const newMessage = {
        sender: data.username,
        content: data.message,
        time: data.time,
        type: 'other'
    };
    messages.push(newMessage);
    displayMessages();
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

// ============================================================
// ===== VARIABLES =====
// ============================================================
let messages = [];
let userOnline = false;

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

// ============================================================
// ===== MENU TABS =====
// ============================================================
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

// ============================================================
// ===== USER STATUS =====
// ============================================================
function checkUserStatus() {
    const userStatus = localStorage.getItem('user_online');
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

// ============================================================
// ===== DISPLAY MESSAGES =====
// ============================================================
function displayMessages() {
    if (!messagesBox) {
        console.error('messagesBox not found!');
        return;
    }
    
    messagesBox.innerHTML = '';
    const userName = localStorage.getItem('userName') || 'User';
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        
        if (msg.type === 'dev') {
            messageDiv.className = 'message mine';
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">DEV</span>
                </div>
                <div class="message-content">${msg.content}</div>
                <div class="message-time-bottom">${msg.time}</div>
            `;
        } else if (msg.type === 'user' || msg.type === 'other') {
            messageDiv.className = 'message other';
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${userName}</span>
                </div>
                <div class="message-content">${msg.content}</div>
                <div class="message-time-bottom">${msg.time}</div>
            `;
        } else if (msg.type === 'system') {
            messageDiv.className = 'message system';
            messageDiv.innerHTML = `
                <div class="message-content">${msg.content}</div>
            `;
        } else {
            messageDiv.className = 'message other';
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${msg.sender || 'Unknown'}</span>
                </div>
                <div class="message-content">${msg.content}</div>
                <div class="message-time-bottom">${msg.time}</div>
            `;
        }
        
        messagesBox.appendChild(messageDiv);
    });
    
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

// ============================================================
// ===== SYSTEM MESSAGES =====
// ============================================================
function addSystemMessage(content) {
    const systemMsg = {
        sender: 'System',
        content: content,
        time: new Date().toLocaleTimeString(),
        type: 'system'
    };
    messages.push(systemMsg);
    displayMessages();
}

// ============================================================
// ===== CLEAR CHAT =====
// ============================================================
function clearChat() {
    console.log('Clearing chat...');
    
    messages = [{
        sender: 'System',
        content: 'Chat cleared by Developer',
        time: new Date().toLocaleTimeString(),
        type: 'system'
    }];
    
    displayMessages();
    createGlitchEffect();
}

// ============================================================
// ===== GLITCH EFFECT =====
// ============================================================
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

// ============================================================
// ===== SEND MESSAGE =====
// ============================================================
function sendMessage() {
    console.log('Send button clicked');
    
    if (!messageInput) {
        console.error('messageInput not found!');
        return;
    }
    
    const content = messageInput.value.trim();
    console.log('Message content:', content);
    
    if (!content) {
        console.log('Empty message');
        return;
    }
    
    // ۱. به سرور بفرست
    socket.emit('chat-message', {
        username: 'DEV',
        message: content
    });
    
    // ۲. برای نمایش فوری، به لیست پیام‌ها اضافه کن
    const newMessage = {
        sender: 'DEV',
        content: content,
        time: new Date().toLocaleTimeString(),
        type: 'dev'
    };
    
    messages.push(newMessage);
    displayMessages();
    
    messageInput.value = '';
    createGlitchEffect();
    
    console.log('Message sent');
}

// ============================================================
// ===== UPDATE DEV STATUS =====
// ============================================================
function updateDevStatus(isOnline) {
    localStorage.setItem('dev_online', isOnline);
}

// ============================================================
// ===== INIT =====
// ============================================================
function init() {
    console.log('Initializing dev.js');
    
    displayMessages();
    checkUserStatus();
    
    socket.emit('user-join', 'Dev');
    
    updateDevStatus(true);
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
        console.log('Send button event listener added');
    } else {
        console.error('sendBtn not found!');
    }
    
    messageInput.addEventListener('keydown', (e) => {
        // ===== تشخیص گوشی =====
        const isMobile = window.innerWidth < 768;
        
        // ===== در گوشی: اینتر رو نادیده بگیر (فقط دکمه Send) =====
        if (isMobile && e.key === 'Enter') {
            e.preventDefault();
            return;
        }
        
        // ===== در لپ‌تاپ: =====
        if (e.key === 'Enter') {
            // Shift+Enter → خط جدید (همیشه مجاز)
            if (e.shiftKey) {
                return;
            }
            
            // فقط Enter (بدون Shift) → ارسال پیام
            e.preventDefault();
            sendMessage();
        }
    });
    
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', clearChat);
        console.log('Clear chat button event listener added');
    }
    
    window.addEventListener('beforeunload', () => {
        updateDevStatus(false);
    });
    
    // ===== Hamburger Menu =====
    const hamburger = document.querySelector('.hamburger-menu');
    const menuLinks = document.querySelector('.menu-links');

    if (hamburger && menuLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            menuLinks.classList.toggle('active');
        });
        
        menuLinks.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                menuLinks.classList.remove('active');
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.top-menu')) {
                hamburger.classList.remove('active');
                menuLinks.classList.remove('active');
            }
        });
    }
    
    // ===== Glitch Animation Style =====
    const style = document.createElement('style');
    style.textContent = `
        @keyframes glitch-rectangle {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    console.log('dev.js initialization complete');
}

// ===== LOGOUT =====
document.getElementById('dev-logout-btn').addEventListener('click', function() {
    localStorage.removeItem('deviceVerified');
    localStorage.removeItem('userName');
    localStorage.removeItem('accessCode');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('displayName');
    localStorage.removeItem('user_online');
    localStorage.removeItem('devAccess');
    localStorage.removeItem('lastPanel');
    
    socket.emit('user-logout', {
        username: 'DEV'
    });
    
    window.location.href = '/';
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
