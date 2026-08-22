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
                // تشخیص کلمه Baroon برای ایتالیک و کلیک
                const isBaroon = (word === 'Baroon!' || word === 'Baroon');
                const charClass = isBaroon ? 'glitch-char baroon-char' : 'glitch-char';
                wordHtml += `<span class="${charClass}" data-line="${lineIndex}" data-word="${wordIndex}" data-char="${charIndex}">${char}</span>`;
            });
            
            // تشخیص کلمه Baroon برای کلیک
            const isBaroonWord = (word === 'Baroon!' || word === 'Baroon');
            const wordClass = isBaroonWord ? 'glitch-word baroon-word' : 'glitch-word';
            
            if (wordIndex < words.length - 1) {
                wordHtml += `<span class="glitch-char" data-line="${lineIndex}" data-word="${wordIndex}" data-char="space"> </span>`;
            }
            
            lineHtml += `<span class="${wordClass}" data-line="${lineIndex}" data-word="${wordIndex}">${wordHtml}</span>`;
        });
        
        html += `<span class="glitch-line" data-line="${lineIndex}">${lineHtml}</span>`;
    });
    
    return html;
}

// ===== GLITCH: حرکت مستقل حروف، کلمات، خطوط =====
function applyGlitchMovement() {
    // ۱. حرکت خطوط (بزرگ‌ترین)
    document.querySelectorAll('.glitch-line').forEach(line => {
        if (Math.random() < 0.15) {
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
    
    // ۲. حرکت کلمات (متوسط)
    document.querySelectorAll('.glitch-word').forEach(word => {
        if (Math.random() < 0.20) {
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
    
    // ۳. حرکت حروف (کوچک‌ترین)
    document.querySelectorAll('.glitch-char').forEach(char => {
        if (Math.random() < 0.25) {
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

// ===== GLITCH: مستطیل‌ها =====
function createGlitchRectangles() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    const count = Math.floor(Math.random() * 2) + 1;
    
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
        
        typingText.appendChild(rectangle);
        setTimeout(() => rectangle.remove(), 200 + i * 30);
    }
}

// ===== GLITCH FULL (مستطیل + حرکت) =====
function applyFullGlitch() {
    createGlitchRectangles();
    applyGlitchMovement();
}

// ===== TYPEWRITER =====
function typeWriter(text, element, speed = 100, callback = null) {
    let i = 0;
    let fullTextTyped = '';
    
    function type() {
        if (i >= text.length) {
            // بعد از تایپ کامل، ساختار گلیچ‌دار رو بازسازی کن
            element.innerHTML = buildGlitchStructure(text);
            // تنظیم کلیک برای Baroon
            setupBaroonClick();
            // تنظیم دابل کلیک برای Developer
            setupDeveloperDblClick();
            if (callback) callback();
            return;
        }
        
        fullTextTyped += text.charAt(i);
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

// ===== SETUP: کلیک روی Baroon (تک کلیک) =====
function setupBaroonClick() {
    document.querySelectorAll('.baroon-word').forEach(el => {
        el.style.cursor = 'pointer';
        el.style.fontStyle = 'italic';
        
        // هاور: زیرخط
        el.addEventListener('mouseenter', () => {
            el.style.textDecoration = 'underline';
            el.style.textDecorationColor = 'rgba(255,255,255,0.3)';
        });
        el.addEventListener('mouseleave', () => {
            el.style.textDecoration = 'none';
        });
        
        // کلیک
        el.addEventListener('click', function(e) {
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
        
        // حروف داخل کلمه Baroon هم کلیک‌پذیر باشن
        el.querySelectorAll('.baroon-char').forEach(char => {
            char.style.cursor = 'pointer';
        });
    });
}

// ===== SETUP: دابل کلیک روی Developer =====
function setupDeveloperDblClick() {
    const textContent = mainElement.textContent || '';
    const devIndex = textContent.indexOf('Developer');
    if (devIndex === -1) return;
    
    // پیدا کردن کلمه Developer در DOM
    const allWords = document.querySelectorAll('.glitch-word');
    allWords.forEach(word => {
        if (word.textContent.trim() === 'Developer') {
            word.style.cursor = 'pointer';
            
            // دابل کلیک
            word.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => {
                        applyFullGlitch();
                    }, i * 80);
                }
                
                setTimeout(() => {
                    window.location.href = "../HTML/dev-enter.html";
                }, 500);
            });
        }
    });
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
        typeWriter(fullText, mainElement, 100, () => {
            setTimeout(() => {
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

// ===== DEV PANEL ACCESS (دابل کلیک روی Developer) =====
document.addEventListener('DOMContentLoaded', function() {
    // اینجا دیگه نیازی نیست چون توی setupDeveloperDblClick هندل میشه
});

document.addEventListener('DOMContentLoaded', startPage);