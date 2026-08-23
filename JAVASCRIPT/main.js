import { DLAT1 , DLAT2 , DLAT3 , DLAT4 , DLAT5 , DLAT6 , DLAT7 , DLAT8 , DLAT9} from "./DLAT.js";

const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

// ===== SOCKET EVENTS =====
socket.on('chat-history', (history) => {
    const userName = 'baroon';
    
    messages = history.map(msg => {
        let sender = msg.username;
        let type = msg.username === 'DEV' ? 'dev' : 'other';
        
        // ===== تشخیص پیام سیستمی =====
        if (msg.isSystem) {
            type = 'system';
            sender = 'System';
        } else if (msg.username === userName) {
            sender = 'You';
            type = 'user';
        }
        
        return {
            sender: sender,
            content: msg.message || '',
            time: msg.time,
            type: type,
            isImage: msg.isImage || false,
            isSystem: msg.isSystem || false,
            imagePath: msg.imagePath || ''
        };
    });
    displayMessages();
    
    // ===== بعد از لود تاریخچه، پیام سیستمی ارسال کن =====
    setTimeout(() => {
        sendSystemMessageIfNeeded();
    }, 500);
});

socket.on('chat-message', (data) => {
    const userName = 'baroon';
    
    let sender = data.username;
    let type = data.username === 'DEV' ? 'dev' : 'other';
    
    // ===== تشخیص پیام سیستمی =====
    if (data.isSystem) {
        type = 'system';
        sender = 'System';
    } else if (data.username === userName) {
        sender = 'You';
        type = 'user';
    }
    
    const newMessage = {
        sender: sender,
        content: data.message || '',
        time: data.time,
        type: type,
        isImage: data.isImage || false,
        isSystem: data.isSystem || false,
        imagePath: data.imagePath || ''
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

// ===== VARIABLES =====
let messages = [];
let lastMessageCount = 0;
let lastMessageHour = -1;

const messagesBox = document.getElementById('user-messages-box');
const messageInput = document.getElementById('user-message-input');
const sendBtn = document.getElementById('user-send-btn');
const uploadBtn = document.getElementById('user-upload-btn');
const fileInput = document.getElementById('user-file-input');
const menuLinks = document.querySelectorAll('.menu-link');
const tabs = document.querySelectorAll('.tab');
const profileName = document.getElementById('profile-name');
const systemDialog = document.getElementById('system-dialog');
const dialogMessage = document.getElementById('dialog-message');
const menuTitle = document.querySelector('.menu-title');

// ===== DATE UPDATE =====
function updateDate() {
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const englishDate = `${day} ${month} ${year}`;
    
    if (menuTitle) {
        menuTitle.textContent = englishDate;
    }
}
setInterval(updateDate, 60000);
updateDate();

// ===== MENU TABS =====
menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        menuLinks.forEach(l => l.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        
        link.classList.add('active');
        
        const tabId = link.getAttribute('data-tab') + '-tab';
        const activeTab = document.getElementById(tabId);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    });
});

// ===== SYSTEM DIALOG =====
function showSystemDialog(message) {
    dialogMessage.textContent = message;
    systemDialog.classList.add('show');
    setTimeout(() => {
        systemDialog.classList.remove('show');
    }, 2500);
}

// ===== DISPLAY MESSAGES =====
function displayMessages() {
    if (!messagesBox) return;
    if (messages.length === lastMessageCount) return;
    
    messagesBox.innerHTML = '';
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        
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
                         onerror="this.onerror=null; console.log('Image load error');">
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

// ===== SYSTEM MESSAGES =====
function addSystemMessage(content) {
    // ===== ارسال به سرور برای ذخیره =====
    socket.emit('system-message', {
        message: content
    });
    
    // ===== نمایش فوری =====
    const systemMsg = {
        sender: 'System',
        content: content,
        time: new Date().toLocaleTimeString(),
        type: 'system',
        isSystem: true
    };
    messages.push(systemMsg);
    displayMessages();
}

// ===== SYSTEM MESSAGES BY HOUR =====
function getSystemMessage() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    if (month === 1 && day === 1) {
        return "Happy New Year, Baroon! I wish you a great year... maybe. It was a good year with you!! \n (◔◡◔)";
    }
    if (month === 12 && day === 25) {
        return "Merry Christmas! (Why are we celebrating this? ) \n(ಥ _ ಥ)";
    }
    if (month === 9 && day === 25) {
        return "Why must I say \"Happy longest night of the year\" when it's just one minute more?? \n (⊙_⊙)？\n (What do you want to do in that one minute?)";
    }
    if (month === 3 && day === 10) {
        return "Let me see... Oh look! It's your birthday today. Happy birthday, Baroon (Dear Rainy Weather). \n(o゜▽゜)o☆\n (Wait for Dev to write you a book just to say congratulations! HEHEHEHE)";
    }
    if (month === 3 && day === 13) {
        return "It's a very special day today. A very, very, very special day. You didn't forget it, did you? \n(ㆆ_ㆆ) 눈_눈\n (Say congratulations to her. And if you can, go and see her. Or call her.)";
    }
    
    if (hours === 0 && minutes === 0) {
        return "Come on. Wish something ( •̀ ω •́ )y . \n(Don't tell her I said you this, but Dev wished you A lot of good and beautiful things that make me want to kill you because you were the one she wished for) \n〒▽〒(•ˋ _ ˊ•)";
    }
    
    if (hours >= 4 && hours < 5) {
        return "Good morning Baroon. \n^_~\n May I know why you are here at this hour? \n(´。＿。｀)\n Just for you to know, Dev is asleep now. A very deep sleep. \n◉_◉";
    }
    if (hours >= 5 && hours < 12) {
        return "Good morning Baroon.\n ^_~";
    }
    if (hours >= 12 && hours < 14) {
        return "What do you expect me to say? Good noon?? \n(。_。)";
    }
    if (hours >= 14 && hours < 17) {
        return "Good afternoon, Rainy weather! (HEHEHEHE) \n(¬‿¬)";
    }
    if (hours >= 17 && hours < 21) {
        return "Good evening. How was your day? \n╰(*°▽°*)╯";
    }
    if (hours >= 21 && hours < 23) {
        return "Was your day good? How was it? Did you enjoy your day? \n(°°)～";
    }
    if (hours >= 23 && hours < 24) {
        return "Don't you want to sleep? It's better to sleep now than to be sleepy tomorrow. \n( ఠ ͟ʖ ఠ)";
    }
    if (hours >= 0 && hours < 1) {
        return "GO AND SLEEP NOW. RIGHT NOW!! \nಠ_ಠ\n Really, what are you doing? \n(ㆆ_ㆆ)";
    }
    if (hours >= 1 && hours < 4) {
        return "Don't you want to rest? Are you an owl or what? \nಠಿ_ಠ\n Anyway, do whatever you want, I don't care. (GO AND SLEEP!) \nᕦ(ò_óˇ)ᕤ";
    }
    
    return "Welcome Baroon. \n^_~";
}

// ===== ارسال پیام سیستمی در صورت نیاز =====
function sendSystemMessageIfNeeded() {
    const now = new Date();
    const currentHour = now.getHours();
    
    // اگه قبلاً برای این ساعت پیام فرستاده نشده
    if (currentHour !== lastMessageHour) {
        const message = getSystemMessage();
        if (message) {
            addSystemMessage(message);
            lastMessageHour = currentHour;
        }
    }
}

// ============================================================
// UPLOAD IMAGE
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
                username: 'baroon',
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
// LIGHTBOX
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

const lightboxStyle = document.createElement('style');
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

// ===== SEND MESSAGE =====
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    socket.emit('chat-message', {
        username: 'baroon',
        message: content
    });
    
    messageInput.value = '';
    
    if (profileName) {
        profileName.textContent = 'baroon';
    }
}

// ===== SAVE USER TO SERVER =====
function saveUserToServer() {
    socket.emit('save-user', {
        username: 'baroon',
        displayName: 'baroon',
        password: localStorage.getItem('userPassword') || '',
        accessCode: localStorage.getItem('accessCode') || ''
    });
}

// ===== INIT =====
function init() {
    if (profileName) {
        profileName.textContent = 'baroon';
    }
    
    socket.emit('user-join', 'baroon');
    saveUserToServer();
    
    displayMessages();
    
    localStorage.setItem('user_online', 'true');
    
    sendBtn.addEventListener('click', sendMessage);
    
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            return;
        }
    });
    
    sendBtn.addEventListener('click', sendMessage);
    
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('user_online', 'false');
    });
    
    // ===== THEME =====
    const themeOptions = [
        { name: 'DEFAULT', value: 'default' },
        { name: 'WINERED', value: 'winered' },
        { name: 'ROYALGREEN', value: 'royalgreen' },
        { name: 'ROYALBLUE', value: 'royalblue' },
        { name: 'WHITE', value: 'white' }
    ];

    const allSettingItems = document.querySelectorAll('.setting-item');
    let themeButtons = [];
    
    allSettingItems.forEach(item => {
        const buttons = item.querySelectorAll('.theme-btn');
        if (buttons.length > 0) {
            themeButtons = [...themeButtons, ...buttons];
        }
    });

    let currentIndex = 0;
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        const foundIndex = themeOptions.findIndex(opt => opt.value === savedTheme);
        if (foundIndex !== -1) currentIndex = foundIndex;
    }

    function applyTheme(index) {
        const current = themeOptions[index];
        document.documentElement.setAttribute('data-theme', current.value);
        localStorage.setItem('selectedTheme', current.value);

        themeButtons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        console.log('Theme applied:', current.value);
    }

    if (themeButtons.length > 0) {
        applyTheme(currentIndex);
        themeButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                applyTheme(index);
            });
        });
    }

    // ===== HAMBURGER =====
    const hamburger = document.querySelector('.hamburger-menu');
    const menuLinks = document.querySelector('.menu-links');

    if (hamburger && menuLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            menuLinks.classList.toggle('active');
        });
    }
    
    // ===== SYSTEM MESSAGES BY HOUR =====
    // اگر تاریخچه خالی بود، پیام سیستمی ارسال کن
    setTimeout(() => {
        if (messages.length === 0) {
            sendSystemMessageIfNeeded();
        }
    }, 1500);
    
    // چک کردن هر دقیقه
    setInterval(sendSystemMessageIfNeeded, 60000);
}

// ============================================================
// SETTINGS EVENTS
// ============================================================

document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('deviceVerified');
    localStorage.removeItem('userName');
    localStorage.removeItem('accessCode');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('displayName');
    localStorage.removeItem('user_online');
    localStorage.removeItem('devAccess');
    localStorage.removeItem('lastPanel');
    
    socket.emit('user-logout', {
        username: 'baroon'
    });
    
    window.location.href = '/';
});

// ===== UPDATE ACCESS CODE =====
document.getElementById('update-code-btn').addEventListener('click', function() {
    const newCode = document.getElementById('new-code-input').value.trim();
    if (!newCode) {
        showSystemDialog('Access code cannot be empty!');
        return;
    }
    
    localStorage.setItem('accessCode', newCode);
    localStorage.setItem('userPassword', newCode);
    
    socket.emit('update-code', {
        username: 'baroon',
        newCode: newCode
    });
    
    showSystemDialog('✅ Access code updated!');
});

document.addEventListener('DOMContentLoaded', init);