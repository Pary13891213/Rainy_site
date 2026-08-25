const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

socket.on('chat-history', (history) => {
    messages = history.map(msg => ({
        sender: msg.isSystem ? 'System' : (msg.username === 'DEV' ? 'DEV' : msg.username),
        content: msg.message || '',
        time: msg.time,
        type: msg.isSystem ? 'system' : (msg.username === 'DEV' ? 'dev' : 'other'),
        isImage: msg.isImage || false,
        isSystem: msg.isSystem || false,
        imagePath: msg.imagePath || ''
    }));
    displayMessages();
});

socket.on('chat-message', (data) => {
    // ===== تشخیص پیام سیستمی =====
    if (data.isSystem) {
        const newMessage = {
            sender: 'System',
            content: data.message || '',
            time: data.time,
            type: 'system',
            isImage: false,
            isSystem: true,
            imagePath: ''
        };
        messages.push(newMessage);
        displayMessages();
        return;
    }
    
    // اگه پیام از DEV هست
    if (data.username === 'DEV') {
        const newMessage = {
            sender: 'DEV',
            content: data.message || '',
            time: data.time,
            type: 'dev',
            isImage: data.isImage || false,
            imagePath: data.imagePath || ''
        };
        messages.push(newMessage);
        displayMessages();
        return;
    }
    
    // پیام از کاربر عادی
    const newMessage = {
        sender: 'baroon',
        content: data.message || '',
        time: data.time,
        type: 'other',
        isImage: data.isImage || false,
        imagePath: data.imagePath || ''
    };
    
    messages.push(newMessage);
    displayMessages();
});

// ===== SOCKET EVENTS =====
socket.on('user-joined', (data) => {
    // ===== ذخیره اسم کاربر در localStorage (فقط برای dev) =====
    if (data.username && data.username !== 'DEV') {
        localStorage.setItem('userName', data.username);
        localStorage.setItem('displayName', data.username);
    }
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
let lastMessageCount = 0;

const messagesBox = document.getElementById('dev-messages-box');
const messageInput = document.getElementById('dev-message-input');
const sendBtn = document.getElementById('dev-send-btn');
const menuLinks = document.querySelectorAll('.menu-link');
const tabs = document.querySelectorAll('.tab');
const userStatusText = document.getElementById('user-status-text');
const statusIndicator = document.querySelector('.status-indicator');
const userActiveStatus = document.getElementById('user-active-status');
const clearChatBtn = document.getElementById('clear-chat-btn');
const uploadBtn = document.getElementById('dev-upload-btn');
const fileInput = document.getElementById('dev-file-input');

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
    if (!messagesBox) return;
    if (messages.length === lastMessageCount) return;
    
    messagesBox.innerHTML = '';
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        
        // تعیین نوع پیام
        if (msg.type === 'dev') {
            messageDiv.className = 'message mine';
            msg.sender = 'DEV';
        } else if (msg.type === 'user' || msg.type === 'other') {
            messageDiv.className = 'message other';
            msg.sender = msg.sender || 'baroon';  // ← پیش‌فرض baroon
        } else if (msg.type === 'system') {
            messageDiv.className = 'message system';
        } else {
            messageDiv.className = 'message other';
            msg.sender = msg.sender || 'baroon';
        }
        
        // ===== نمایش پیام =====
        if (msg.isImage) {
            let imageUrl = msg.imagePath || msg.content || '';
            
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = 'https://baroon-server.onrender.com' + imageUrl;
            }
            
            if (!imageUrl) {
                imageUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-family='monospace' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
            }
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${msg.sender}</span>
                </div>
                <div class="message-content">
                    <img src="${imageUrl}" 
                         alt="Image" 
                         class="chat-image" 
                         onclick="openImageLightbox(this.src)"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/200x200?text=Error';">
                </div>
                <div class="message-time-bottom">${msg.time}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${msg.sender}</span>
                </div>
                <div class="message-content">${msg.content}</div>
                <div class="message-time-bottom">${msg.time}</div>
            `;
        }
        
        messagesBox.appendChild(messageDiv);
    });
    
    lastMessageCount = messages.length;
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
// ===== UPLOAD IMAGE =====
// ============================================================
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        addSystemMessage('⚠️ Image size must be less than 5MB');
        fileInput.value = '';
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch('https://baroon-server.onrender.com/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            socket.emit('chat-message', {
                username: 'DEV',
                message: '',
                isImage: true,
                imagePath: result.imagePath
            });
        }
    } catch (err) {
        console.error('Upload error:', err);
        addSystemMessage('❌ Failed to upload image');
    }
    
    fileInput.value = '';
});

// ============================================================
// ===== LIGHTBOX =====
// ============================================================
function openImageLightbox(src) {
    const oldLightbox = document.getElementById('lightbox-overlay');
    if (oldLightbox) oldLightbox.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        animation: lightboxIn 0.3s ease-out;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
    `;
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', () => {
        overlay.style.animation = 'lightboxOut 0.2s ease-in';
        setTimeout(() => overlay.remove(), 200);
    });
}

// استایل‌های Lightbox
if (!document.getElementById('lightbox-styles')) {
    const lightboxStyle = document.createElement('style');
    lightboxStyle.id = 'lightbox-styles';
    lightboxStyle.textContent = `
        @keyframes lightboxIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        @keyframes lightboxOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
    `;
    document.head.appendChild(lightboxStyle);
}

// ============================================================
// ===== SEND MESSAGE =====
// ============================================================
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    socket.emit('chat-message', {
        username: 'DEV',
        message: content
    });
    
    messageInput.value = '';
    createGlitchEffect();
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
    
    // ===== MESSAGE INPUT =====
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            return;
        }
    });

    sendBtn.addEventListener('click', sendMessage);
    
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

// ============================================================
// ZEPHYR CHAT (ZEPHYR TAB)
// ============================================================
const zephyrMessagesBox = document.getElementById('zephyr-messages-box');
const zephyrInput = document.getElementById('zephyr-message-input');
const zephyrSendBtn = document.getElementById('zephyr-send-btn');
const zephyrTypingIndicator = document.getElementById('zephyr-typing-indicator');

let isZephyrWaiting = false;

function addZephyrMessageDev(sender, content, isUser = false) {
    if (!zephyrMessagesBox) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = isUser ? 'message mine' : 'message other';
    msgDiv.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${sender}</span>
        </div>
        <div class="message-content">${content}</div>
    `;
    zephyrMessagesBox.appendChild(msgDiv);
    zephyrMessagesBox.scrollTop = zephyrMessagesBox.scrollHeight;
}

function sendToZephyrDev() {
    if (!zephyrInput) return;
    if (isZephyrWaiting) return;
    
    const message = zephyrInput.value.trim();
    if (!message) return;
    
    addZephyrMessageDev('Dev', message, true);
    zephyrInput.value = '';
    zephyrInput.disabled = true;
    zephyrSendBtn.disabled = true;
    isZephyrWaiting = true;
    
    if (zephyrTypingIndicator) {
        zephyrTypingIndicator.style.display = 'block';
    }
    
    socket.emit('zephyr-chat', {
        message: message,
        userId: 'dev'
    });
}

socket.on('zephyr-reply', (data) => {
    if (data.userId === 'dev') {
        if (zephyrTypingIndicator) {
            zephyrTypingIndicator.style.display = 'none';
        }
        addZephyrMessageDev('Zephyr', data.reply);
        zephyrInput.disabled = false;
        zephyrSendBtn.disabled = false;
        isZephyrWaiting = false;
        zephyrInput.focus();
    }
});

socket.on('zephyr-error', (data) => {
    if (zephyrTypingIndicator) {
        zephyrTypingIndicator.style.display = 'none';
    }
    addZephyrMessageDev('System', '❌ ' + data.error);
    zephyrInput.disabled = false;
    zephyrSendBtn.disabled = false;
    isZephyrWaiting = false;
});

if (zephyrSendBtn) {
    zephyrSendBtn.addEventListener('click', sendToZephyrDev);
}
if (zephyrInput) {
    zephyrInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendToZephyrDev();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}