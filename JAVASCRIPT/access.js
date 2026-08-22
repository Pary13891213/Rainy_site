const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

const usernameInput = document.getElementById('username-input');
const codeInput = document.getElementById('code-input');
const verifyBtn = document.getElementById('verify-btn');
const backBtn = document.getElementById('back-btn');
const welcomeContainer = document.getElementById('welcome-message-container');
const welcomeMessage = document.getElementById('welcome-message');

const correctUsername = "Rainy";
const correctCode = "developer1123";

let isLoggingIn = false;
let glitchInterval = null;

// ===== GLITCH: مستطیل‌ها (همانند Start) =====
function createGlitchRectangles(count = 2) {
    const page = document.querySelector('.access-page');
    const rect = page.getBoundingClientRect();
    
    const num = Math.floor(Math.random() * count) + 1;
    
    for (let i = 0; i < num; i++) {
        const rectEl = document.createElement('div');
        rectEl.className = 'glitch-rectangle';
        
        const width = 30 + Math.random() * 150;
        const height = 1 + Math.random() * 4;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        rectEl.style.width = `${width}px`;
        rectEl.style.height = `${height}px`;
        rectEl.style.left = `${posX}px`;
        rectEl.style.top = `${posY}px`;
        rectEl.style.background = Math.random() < 0.4 
            ? `rgba(255, 255, 255, ${0.4 + Math.random() * 0.5})` 
            : `rgba(0, 0, 0, ${0.5 + Math.random() * 0.4})`;
        
        page.appendChild(rectEl);
        setTimeout(() => rectEl.remove(), 200 + i * 30);
    }
}

// ===== GLITCH: خطوط =====
function createGlitchLines() {
    const page = document.querySelector('.access-page');
    const rect = page.getBoundingClientRect();
    
    const count = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < count; i++) {
        const line = document.createElement('div');
        line.className = 'glitch-line-glitch';
        
        const width = 50 + Math.random() * 150;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - 10);
        
        line.style.width = `${width}px`;
        line.style.left = `${posX}px`;
        line.style.top = `${posY}px`;
        line.style.background = Math.random() < 0.5 
            ? `rgba(255,255,255,${0.3 + Math.random() * 0.4})` 
            : `rgba(0,0,0,${0.4 + Math.random() * 0.3})`;
        
        page.appendChild(line);
        setTimeout(() => line.remove(), 150 + i * 20);
    }
}

// ===== GLITCH: فلش =====
function createGlitchFlash() {
    const page = document.querySelector('.access-page');
    const rect = page.getBoundingClientRect();
    
    if (Math.random() < 0.3) {
        const flash = document.createElement('div');
        flash.className = 'glitch-flash';
        
        const width = 50 + Math.random() * 120;
        const height = 20 + Math.random() * 60;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        flash.style.width = `${width}px`;
        flash.style.height = `${height}px`;
        flash.style.left = `${posX}px`;
        flash.style.top = `${posY}px`;
        flash.style.background = Math.random() < 0.5 
            ? `rgba(255,255,255,${0.08 + Math.random() * 0.1})` 
            : `rgba(0,0,0,${0.1 + Math.random() * 0.15})`;
        
        page.appendChild(flash);
        setTimeout(() => flash.remove(), 100);
    }
}

// ===== GLITCH: بلوک =====
function createGlitchBlocks() {
    const page = document.querySelector('.access-page');
    const rect = page.getBoundingClientRect();
    
    if (Math.random() < 0.2) {
        const block = document.createElement('div');
        block.className = 'glitch-block';
        
        const width = 80 + Math.random() * 150;
        const height = 40 + Math.random() * 80;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        block.style.width = `${width}px`;
        block.style.height = `${height}px`;
        block.style.left = `${posX}px`;
        block.style.top = `${posY}px`;
        block.style.background = Math.random() < 0.5 
            ? `rgba(255,255,255,${0.05 + Math.random() * 0.08})` 
            : `rgba(0,0,0,${0.06 + Math.random() * 0.1})`;
        
        page.appendChild(block);
        setTimeout(() => block.remove(), 180);
    }
}

// ===== GLITCH: حرکت عناصر =====
function applyGlitchMovement() {
    // حرکت خطوط
    document.querySelectorAll('.glitch-line').forEach(line => {
        if (Math.random() < 0.12) {
            const shiftX = (Math.random() - 0.5) * 14;
            const shiftY = (Math.random() - 0.5) * 6;
            line.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => { line.style.transform = ''; }, 150);
        }
    });
    
    // حرکت کلمات
    document.querySelectorAll('.glitch-word').forEach(word => {
        if (Math.random() < 0.18) {
            const shiftX = (Math.random() - 0.5) * 8;
            const shiftY = (Math.random() - 0.5) * 4;
            word.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => { word.style.transform = ''; }, 120);
        }
    });
    
    // حرکت حروف
    document.querySelectorAll('.glitch-char').forEach(char => {
        if (Math.random() < 0.22) {
            const shiftX = (Math.random() - 0.5) * 5;
            const shiftY = (Math.random() - 0.5) * 3;
            char.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => { char.style.transform = ''; }, 100);
        }
    });
}

// ===== GLITCH FULL =====
function applyFullGlitch() {
    createGlitchRectangles(2);
    createGlitchLines();
    createGlitchFlash();
    createGlitchBlocks();
    applyGlitchMovement();
}

// ===== GLITCH ERROR =====
function applyErrorGlitch() {
    const page = document.querySelector('.access-page');
    const rect = page.getBoundingClientRect();
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const rectEl = document.createElement('div');
            rectEl.className = 'glitch-error';
            
            const width = 50 + Math.random() * 120;
            const height = 2 + Math.random() * 4;
            const posX = Math.random() * (rect.width - width);
            const posY = Math.random() * (rect.height - height);
            
            rectEl.style.width = `${width}px`;
            rectEl.style.height = `${height}px`;
            rectEl.style.left = `${posX}px`;
            rectEl.style.top = `${posY}px`;
            rectEl.style.background = Math.random() < 0.3 
                ? `rgba(255,255,255,${0.5 + Math.random() * 0.4})` 
                : `rgba(0,0,0,${0.6 + Math.random() * 0.3})`;
            
            page.appendChild(rectEl);
            setTimeout(() => rectEl.remove(), 300);
        }, i * 100);
    }
    
    // جابجایی کادرها
    [usernameInput, codeInput, verifyBtn].forEach(el => {
        if (el) {
            const shift = (Math.random() - 0.5) * 8;
            el.style.transition = 'transform 0.1s ease-out';
            el.style.transform = `translateX(${shift}px)`;
            setTimeout(() => { el.style.transform = ''; }, 200);
        }
    });
}

// ===== WELCOME MESSAGES =====
function getWelcomeMessage() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    
    // تاریخ‌های خاص
    if (month === 1 && day === 1) {
        return "Happy New Year, Baroon! I wish you a great year... maybe. It was a good year with you!! (◔◡◔)";
    }
    if (month === 12 && day === 25) {
        return "Merry Christmas! (Why are we celebrating this? (ಥ _ ಥ))";
    }
    if (month === 9 && day === 25) {
        return "Why must I say \"Happy longest night of the year\" when it's just one minute more?? (⊙_⊙)？ What do you want to do in that one minute?";
    }
    if (month === 3 && day === 10) {
        return "Let me see... Oh look! It's your birthday today. Happy birthday, Baroon (Dear Rainy Weather). (o゜▽゜)o☆ Wait for Dev to write you a book just to say congratulations! HEHEHEHE";
    }
    if (month === 3 && day === 13) {
        return "It's a very special day today. A very, very, very special day. You didn't forget it, did you? (ㆆ_ㆆ) 눈_눈 Say congratulations to her. And if you can, go and see her. Or call her.";
    }
    
    // ساعت ۰۰:۰۰
    if (hours === 0 && minutes === 0) {
        return "Come on. Wish something ( •̀ ω •́ )y . (Don't tell her I said you this, but Dev wished you A lot of good and beautiful things that make me want to kill you because you were the one she wished for〒▽〒(•ˋ _ ˊ•))";
    }
    
    // بر اساس ساعت
    if (hours >= 4 && hours < 5) {
        return "Good morning Baroon. ^_~ May I know why you are here at this hour? (´。＿。｀) Just for you to know, Dev is asleep now. A very deep sleep. ◉_◉";
    }
    if (hours >= 5 && hours < 12) {
        return "Good morning Baroon. ^_~";
    }
    if (hours >= 12 && hours < 14) {
        return "What do you expect me to say? Good noon?? (。_。)";
    }
    if (hours >= 14 && hours < 17) {
        return "Good afternoon, Rainy weather! (HEHEHEHE) (¬‿¬)";
    }
    if (hours >= 17 && hours < 21) {
        return "Good evening. How was your day? ╰(*°▽°*)╯";
    }
    if (hours >= 21 && hours < 23) {
        return "Was your day good? How was it? Did you enjoy your day? (°°)～";
    }
    if (hours >= 23 && hours < 24) {
        return "Don't you want to sleep? It's better to sleep now than to be sleepy tomorrow. ( ఠ ͟ʖ ఠ)";
    }
    if (hours >= 0 && hours < 1) {
        return "GO AND SLEEP NOW. RIGHT NOW!! ಠ_ಠ Really, what are you doing? (ㆆ_ㆆ)";
    }
    if (hours >= 1 && hours < 4) {
        return "Don't you want to rest? Are you an owl or what? ಠಿ_ಠ Anyway, do whatever you want, I don't care. (GO AND SLEEP!) ᕦ(ò_óˇ)ᕤ";
    }
    
    return "Welcome Baroon. ^_~";
}

// ===== TYPEWRITER =====
function typeWriter(text, element, speed = 70, callback = null) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i >= text.length) {
            if (callback) callback();
            return;
        }
        
        element.textContent += text.charAt(i);
        i++;
        
        if (Math.random() < 0.25) {
            applyFullGlitch();
        }
        
        let currentSpeed = speed;
        const char = text.charAt(i - 1);
        if ('.!?'.includes(char)) currentSpeed = speed * 2;
        else if (',:'.includes(char)) currentSpeed = speed * 1.5;
        else if (char === '\n') currentSpeed = speed * 1.5;
        
        setTimeout(type, currentSpeed);
    }
    
    type();
}

// ===== VERIFY =====
function verifyCredentials() {
    if (isLoggingIn) return;
    
    const username = usernameInput.value.trim();
    const code = codeInput.value.trim();
    
    applyFullGlitch();
    
    if (!username || !code) {
        usernameInput.style.borderColor = 'rgba(255,50,50,0.3)';
        codeInput.style.borderColor = 'rgba(255,50,50,0.3)';
        setTimeout(() => {
            usernameInput.style.borderColor = '';
            codeInput.style.borderColor = '';
        }, 500);
        return;
    }
    
    if (username === correctUsername && code === correctCode) {
        isLoggingIn = true;
        
        localStorage.setItem('deviceVerified', 'true');
        localStorage.setItem('devAccess', 'false');
        localStorage.setItem('lastPanel', 'user');
        localStorage.setItem('accessCode', code);
        localStorage.setItem('userPassword', correctCode);
        localStorage.setItem('userName', 'baroon');
        
        socket.emit('save-user', {
            username: 'baroon',
            displayName: 'baroon',
            password: correctCode,
            accessCode: code
        });
        
        document.querySelector('.input-wrapper').style.display = 'none';
        verifyBtn.style.display = 'none';
        
        welcomeContainer.style.display = 'flex';
        const message = getWelcomeMessage();
        
        typeWriter(message, welcomeMessage, 70, () => {
            setTimeout(() => {
                window.location.href = "../HTML/main.html";
            }, 5000);
        });
        
    } else {
        applyErrorGlitch();
        
        usernameInput.value = '';
        codeInput.value = '';
        usernameInput.style.borderColor = 'rgba(255,50,50,0.3)';
        codeInput.style.borderColor = 'rgba(255,50,50,0.3)';
        
        setTimeout(() => {
            usernameInput.style.borderColor = '';
            codeInput.style.borderColor = '';
            backBtn.classList.remove('hidden');
        }, 500);
    }
}

// ===== BACK BUTTON =====
backBtn.addEventListener('click', () => {
    window.location.href = '/';
});

// ===== EVENT LISTENERS =====
verifyBtn.addEventListener('click', verifyCredentials);

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') codeInput.focus();
});

codeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyCredentials();
});

// ===== GLITCH LOOP (همانند Start) =====
setInterval(() => {
    if (!welcomeContainer.style.display || welcomeContainer.style.display === 'none') {
        if (Math.random() < 0.25) {
            applyFullGlitch();
        }
    }
}, 800);

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('deviceVerified') === 'true' && 
        localStorage.getItem('lastPanel') === 'user') {
        window.location.href = "../HTML/main.html";
        return;
    }
});