const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

const fullText = "Welcome Back Developer\nAnd\nWelcome Back Baroon!";
const mainElement = document.getElementById("text-main");
let glitchInterval = null;

// ===== ساخت ساختار خط/کلمه/حرف =====
function buildGlitchStructure(text) {
    const lines = text.split('\n');
    let html = '';
    
    lines.forEach((line, lineIndex) => {
        const words = line.split(' ');
        let lineHtml = '';
        
        words.forEach((word, wordIndex) => {
            const chars = word.split('');
            let wordHtml = '';
            
            chars.forEach((char, charIndex) => {
                wordHtml += `<span class="glitch-char" data-line="${lineIndex}" data-word="${wordIndex}" data-char="${charIndex}">${char}</span>`;
            });
            
            if (wordIndex < words.length - 1) {
                wordHtml += `<span class="glitch-char" data-line="${lineIndex}" data-word="${wordIndex}" data-char="space"> </span>`;
            }
            
            lineHtml += `<span class="glitch-word" data-line="${lineIndex}" data-word="${wordIndex}">${wordHtml}</span>`;
        });
        
        html += `<span class="glitch-line" data-line="${lineIndex}">${lineHtml}</span>`;
    });
    
    return html;
}

// ===== GLITCH: حرکت تصادفی حروف، کلمات، خطوط =====
function applyGlitchMovement() {
    // ۱. حرکت خطوط (بزرگ‌ترین) - هر خط با زمان و مقدار متفاوت
    document.querySelectorAll('.glitch-line').forEach(line => {
        if (Math.random() < 0.12) {
            const shiftX = (Math.random() - 0.5) * 10;
            const shiftY = (Math.random() - 0.5) * 4;
            const duration = 100 + Math.random() * 150;
            line.style.transition = `transform ${duration}ms ease-out`;
            line.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                line.style.transform = '';
            }, duration + 50);
        }
    });
    
    // ۲. حرکت کلمات (متوسط) - هر کلمه با زمان و مقدار متفاوت
    document.querySelectorAll('.glitch-word').forEach(word => {
        if (Math.random() < 0.18) {
            const shiftX = (Math.random() - 0.5) * 6;
            const shiftY = (Math.random() - 0.5) * 3;
            const duration = 80 + Math.random() * 120;
            word.style.transition = `transform ${duration}ms ease-out`;
            word.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                word.style.transform = '';
            }, duration + 40);
        }
    });
    
    // ۳. حرکت حروف (کوچک‌ترین) - هر حرف با زمان و مقدار متفاوت
    document.querySelectorAll('.glitch-char').forEach(char => {
        if (Math.random() < 0.22) {
            const shiftX = (Math.random() - 0.5) * 4;
            const shiftY = (Math.random() - 0.5) * 2.5;
            const duration = 60 + Math.random() * 100;
            char.style.transition = `transform ${duration}ms ease-out`;
            char.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                char.style.transform = '';
            }, duration + 30);
        }
    });
}

// ===== GLITCH: مستطیل‌های سفید/مشکی =====
function createGlitchRectangles() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
        const rectangle = document.createElement('div');
        rectangle.className = 'glitch-rectangle';
        
        const width = 30 + Math.random() * 80;
        const height = 1.5 + Math.random() * 3;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        rectangle.style.width = `${width}px`;
        rectangle.style.height = `${height}px`;
        rectangle.style.left = `${posX}px`;
        rectangle.style.top = `${posY}px`;
        rectangle.style.background = Math.random() < 0.4 
            ? 'rgba(255, 255, 255, 0.6)' 
            : 'rgba(0, 0, 0, 0.7)';
        
        setTimeout(() => {
            typingText.appendChild(rectangle);
        }, i * 30);
        
        setTimeout(() => {
            rectangle.remove();
        }, 250 + i * 30);
    }
}

// ===== GLITCH FULL =====
function applyFullGlitch() {
    createGlitchRectangles();
    applyGlitchMovement();
}

// ===== TYPEWRITER =====
function typeWriterWithClickable(text, element, clickableWord, speed = 100, callback = null) {
    let i = 0;
    element.innerHTML = '';
    let wordTyped = false;
    element.style.opacity = '1';
    let fullTextTyped = '';
    
    function type() {
        if (i >= text.length) {
            // بعد از تایپ کامل، ساختار گلیچ‌دار رو بازسازی کن
            element.innerHTML = buildGlitchStructure(text);
            if (callback) callback();
            return;
        }
        
        fullTextTyped += text.charAt(i);
        // نمایش متن ساده هنگام تایپ
        element.innerHTML = fullTextTyped;
        i++;
        
        // Glitch هنگام تایپ (۳۰٪)
        if (Math.random() < 0.30) {
            applyFullGlitch();
        }
        
        let currentSpeed = speed;
        const char = text.charAt(i - 1);
        if ('.!?'.includes(char)) currentSpeed = speed * 2;
        else if (',:'.includes(char)) currentSpeed = speed * 1.5;
        else if (char === '\n') currentSpeed = speed * 1.5;
        
        const variation = 0.9 + Math.random() * 0.2;
        setTimeout(type, currentSpeed * variation);
    }
    
    type();
}

// ===== CLICKABLE WORD SETUP =====
function setupClickableWord() {
    const clickable = document.querySelector('#text-main .clickable');
    if (clickable) {
        clickable.addEventListener('click', function(e) {
            e.stopPropagation();
            
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    applyFullGlitch();
                }, i * 80);
            }
            
            setTimeout(() => {
                window.location.href = "../HTML/access.html";
            }, 500);
        });
    }
}

// ===== START PAGE =====
function startPage() {
    const isVerified = localStorage.getItem('deviceVerified') === 'true';
    const isDev = localStorage.getItem('devAccess') === 'true';
    const lastPanel = localStorage.getItem('lastPanel');
    
    if (isVerified && lastPanel === 'user') {
        window.location.href = "../HTML/main.html";
        return;
    }
    
    if (isDev && lastPanel === 'dev') {
        window.location.href = "../HTML/dev.html";
        return;
    }
    
    // ساختار اولیه
    mainElement.innerHTML = buildGlitchStructure(fullText);
    
    setTimeout(() => {
        // تایپ مجدد با افکت
        typeWriterWithClickable(fullText, mainElement, 'Baroon!', 100, () => {
            setTimeout(() => {
                // بعد از تایپ، کلمه کلیک‌پذیر رو تنظیم کن
                const clickableSpan = document.querySelector('#text-main .clickable');
                if (clickableSpan) {
                    clickableSpan.addEventListener('click', function(e) {
                        e.stopPropagation();
                        for (let i = 0; i < 6; i++) {
                            setTimeout(() => applyFullGlitch(), i * 80);
                        }
                        setTimeout(() => {
                            window.location.href = "../HTML/access.html";
                        }, 500);
                    });
                }
                
                // Glitch بعد از تایپ (۳۰٪)
                glitchInterval = setInterval(() => {
                    if (Math.random() < 0.30) {
                        applyFullGlitch();
                    }
                }, 1000);
            }, 500);
        });
    }, 500);
}

// ===== DEV PANEL ACCESS =====
document.addEventListener('keydown', function(event) {
    if ((event.key === 'D' || event.key === 'd') && 
        event.target.tagName !== 'INPUT' && 
        event.target.tagName !== 'TEXTAREA') {
        window.location.href = "../HTML/dev-enter.html";
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const mainEl = document.getElementById('text-main');
    if (!mainEl) return;
    
    let tapCount = 0;
    let tapTimer = null;
    const isMobile = window.innerWidth < 768;
    
    function openDevEnter() {
        if (navigator.vibrate) navigator.vibrate(15);
        setTimeout(() => {
            window.location.href = '/HTML/dev-enter.html';
        }, 200);
    }
    
    function isDeveloperClick(target) {
        return target && target.textContent && target.textContent.includes('Developer');
    }
    
    mainEl.addEventListener('touchstart', function(e) {
        if (!isMobile) return;
        const target = e.target;
        if (isDeveloperClick(target)) {
            tapCount++;
            clearTimeout(tapTimer);
            if (tapCount >= 2) {
                tapCount = 0;
                clearTimeout(tapTimer);
                e.preventDefault();
                openDevEnter();
                return;
            }
            tapTimer = setTimeout(() => { tapCount = 0; }, 400);
        }
    });
    
    mainEl.addEventListener('click', function(e) {
        if (isMobile) return;
        const target = e.target;
        if (isDeveloperClick(target)) {
            tapCount++;
            clearTimeout(tapTimer);
            if (tapCount >= 2) {
                tapCount = 0;
                clearTimeout(tapTimer);
                openDevEnter();
                return;
            }
            tapTimer = setTimeout(() => { tapCount = 0; }, 400);
        }
    });
});

document.addEventListener('DOMContentLoaded', startPage);