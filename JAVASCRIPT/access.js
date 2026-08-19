const socket = io('https://rainy-server.onrender.com', {
    transports: ['websocket', 'polling']
});

const headerText = document.getElementById('header-text');
const usernameInput = document.getElementById('username-input');
const codeInput = document.getElementById('code-input');
const verifyBtn = document.getElementById('verify-btn');

const correctUsername = "Rainy";
const correctCode = "developer1123";

let glitchInterval;

// تابع ایجاد پرش و جابجایی ناگهانی و شدید
function createTextGlitchWithShift(textElement) {
    const textRect = textElement.getBoundingClientRect();
    const pageRect = document.querySelector('.access-page').getBoundingClientRect();
    
    const rectangle = document.createElement('div');
    rectangle.className = 'glitch-rectangle';
    
    const colorType = Math.random();
    rectangle.style.background = colorType < 0.5 
        ? 'rgba(136, 221, 255, 0.9)'
        : 'rgba(30, 30, 30, 0.95)';
    
    const width = 100 + Math.random() * 200;
    const height = 3 + Math.random() * 2;
    
    const offsetX = Math.random() * 40 - 20;
    const offsetY = Math.random() * 20 - 10;
    
    const posX = (textRect.left - pageRect.left) + offsetX;
    const posY = (textRect.top - pageRect.top) + offsetY;
    
    const maxX = pageRect.width - width;
    const maxY = pageRect.height - height;
    const finalX = Math.max(0, Math.min(posX, maxX));
    const finalY = Math.max(0, Math.min(posY, maxY));
    
    rectangle.style.width = `${width}px`;
    rectangle.style.height = `${height}px`;
    rectangle.style.left = `${finalX}px`;
    rectangle.style.top = `${finalY}px`;
    
    document.querySelector('.access-page').appendChild(rectangle);
    
    const shiftAmount = 12 + Math.random() * 18;
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    textElement.style.transition = 'none';
    textElement.style.transform = `translateX(${shiftAmount * direction}px)`;
    
    setTimeout(() => {
        textElement.style.transition = 'transform 0.1s linear';
    }, 10);
    
    setTimeout(() => {
        rectangle.remove();
        textElement.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        textElement.style.transition = 'none';
    }, 110);
}

// شروع پرش‌های ناگهانی (همیشه فعال)
function startEffects() {
    clearInterval(glitchInterval);
    
    glitchInterval = setInterval(() => {
        if (Math.random() < 0.65) {
            createTextGlitchWithShift(headerText);
        }
    }, 140);
}

// تابع تغییر متن سربرگ
function changeHeaderText(newText) {
    headerText.textContent = newText;
    
    // اگر متن "Oh..." باشد، منتقل به صفحه بعد
    if (newText === "...Oh") {
        // پرش‌های بیشتر قبل از انتقال
        const intenseGlitch = setInterval(() => {
            createTextGlitchWithShift(headerText);
        }, 80);
        
        setTimeout(() => {
            clearInterval(intenseGlitch);
            window.location.href = "../HTML/welcome.html";
        }, 1500);
    }
}

// تابع اعتبارسنجی
function verifyCredentials() {
    const username = usernameInput.value.trim();
    const code = codeInput.value.trim();
    
    createTextGlitchWithShift(verifyBtn);
    
    if (!username || !code) {
        usernameInput.style.boxShadow = '0 0 10px rgba(255, 50, 50, 0.5)';
        codeInput.style.boxShadow = '0 0 10px rgba(255, 50, 50, 0.5)';
        
        setTimeout(() => {
            usernameInput.style.boxShadow = '';
            codeInput.style.boxShadow = '';
        }, 500);
        
        return;
    }
    
    if (username === correctUsername && code === correctCode) {
        // ===== این بخش جدید اضافه شده =====
        localStorage.setItem('deviceVerified', 'true');
        localStorage.setItem('devAccess', 'false');
        localStorage.setItem('lastPanel', 'user');
        localStorage.setItem('accessCode', code);
        localStorage.setItem('userPassword', correctCode);
        localStorage.setItem('userName', correctUsername);
        
        socket.emit('save-user', {
            username: correctUsername,
            displayName: correctUsername,
            password: correctCode,
            accessCode: code
        });
        // ===== بخش جدید تموم شد =====
        
        usernameInput.style.borderColor = '#55ff55';
        codeInput.style.borderColor = '#55ff55';
        verifyBtn.style.borderColor = '#55ff55';
        verifyBtn.style.color = '#55ff55';
        verifyBtn.textContent = "ACCESS GRANTED";
        
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                createTextGlitchWithShift(headerText);
            }, i * 200);
        }
        
        setTimeout(() => {
            changeHeaderText("...Oh");
        }, 800);
        
    } else {
        usernameInput.style.borderColor = '#ff5555';
        codeInput.style.borderColor = '#ff5555';
        
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                createTextGlitchWithShift(headerText);
                createTextGlitchWithShift(usernameInput);
                createTextGlitchWithShift(codeInput);
            }, i * 100);
        }
        
        setTimeout(() => {
            usernameInput.style.borderColor = '#88ddff';
            codeInput.style.borderColor = '#88ddff';
            changeHeaderText("Try not to guess");
        }, 500);
        
        setTimeout(() => {
            usernameInput.value = '';
            codeInput.value = '';
        }, 700);
    }
}
// Event Listeners
verifyBtn.addEventListener('click', verifyCredentials);

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        codeInput.focus();
    }
});

codeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        verifyCredentials();
    }
});

// شروع - پرش‌ها همیشه فعال هستند
document.addEventListener('DOMContentLoaded', startEffects);