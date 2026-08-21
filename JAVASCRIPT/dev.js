const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

// ===== SOCKET EVENTS =====
socket.on('chat-history', (history) => {
    messages = history.map(msg => ({
        sender: msg.username === 'DEV' ? 'DEV' : msg.username,
        content: msg.message || '',
        time: msg.time,
        type: msg.username === 'DEV' ? 'dev' : 'other',
        isImage: msg.isImage || false,
        imagePath: msg.imagePath || ''  // ← این مهمه
    }));
    displayMessages();
});

// ===== دریافت پیام =====
socket.on('chat-message', (data) => {
    console.log('Dev received message:', data);
    
    if (data.username === 'DEV') {
        return;
    }
    
    const newMessage = {
        sender: data.username,
        content: data.message || '',
        time: data.time,
        type: 'other',
        isImage: data.isImage || false,
        imagePath: data.imagePath || ''  // ← این مهمه
    };
    
    messages.push(newMessage);
    displayMessages();
});

// ===== SOCKET EVENTS =====
socket.on('user-joined', (data) => {
    // ذخیره اسم کاربر در localStorage
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
        if (msg.type === 'user') {
            messageDiv.className = 'message mine';
            msg.sender = 'You';
        } else if (msg.type === 'dev') {
            messageDiv.className = 'message other';
            msg.sender = 'DEV';
        } else if (msg.type === 'system') {
            messageDiv.className = 'message system';
        } else {
            messageDiv.className = 'message other';
            msg.sender = msg.sender || 'Unknown';
        }
        
        // ===== نمایش پیام =====
        if (msg.isImage) {
            // ساخت آدرس کامل تصویر
            let imageUrl = msg.imagePath || msg.content || '';
            
            // اگه آدرس با / شروع شد، آدرس کامل رو بساز
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = 'https://baroon-server.onrender.com' + imageUrl;
            }
            
            // اگه آدرس خالی بود، placeholder بذار
            if (!imageUrl) {
                imageUrl = 'https://via.placeholder.com/200x200?text=No+Image';
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
            // پیام متنی
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
            const userName = localStorage.getItem('userName') || 'User';
            const senderName = userName === 'User' ? 'You' : userName;
            
            // ارسال به سرور
            socket.emit('chat-message', {
                username: userName,
                message: '',
                isImage: true,
                imagePath: result.imagePath
            });
            
            // نمایش فوری
            const newMessage = {
                sender: senderName,
                content: result.imagePath,
                time: new Date().toLocaleTimeString(),
                type: userName === 'User' ? 'user' : 'other',
                isImage: true,
                imagePath: result.imagePath
            };
            
            messages.push(newMessage);
            displayMessages();
        }
    } catch (err) {
        console.error('Upload error:', err);
        addSystemMessage('❌ Failed to upload image');
    }
    
    fileInput.value = '';
});

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

// استایل‌های Lightbox (فقط یک بار اضافه بشه)
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
    
    // ===== MESSAGE INPUT =====
    messageInput.addEventListener('keydown', (e) => {
        // در گوشی، اینتر فقط خط جدید میده (نه ارسال)
        if (e.key === 'Enter') {
            // هیچ کاری نکن - فقط خط جدید
            // (textarea خودش خط جدید میسازه)
            return;
        }
    });

    // دکمه Send فقط ارسال کنه
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
