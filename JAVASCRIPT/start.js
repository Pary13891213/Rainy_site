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
                const isBaroon = (word === 'Baroon!' || word === 'Baroon');
                const charClass = isBaroon ? 'glitch-char baroon-char' : 'glitch-char';
                wordHtml += `<span class="${charClass}" data-line="${lineIndex}" data-word="${wordIndex}" data-char="${charIndex}">${char}</span>`;
            });
            
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

// ===== GLITCH: مستطیل‌های گلیچ =====
function createGlitchRectangles() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
        const rectEl = document.createElement('div');
        rectEl.className = 'glitch-rectangle';
        
        const width = 20 + Math.random() * 100;
        const height = 1 + Math.random() * 3;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        rectEl.style.width = `${width}px`;
        rectEl.style.height = `${height}px`;
        rectEl.style.left = `${posX}px`;
        rectEl.style.top = `${posY}px`;
        rectEl.style.background = Math.random() < 0.4 
            ? `rgba(255, 255, 255, ${0.5 + Math.random() * 0.4})` 
            : `rgba(0, 0, 0, ${0.6 + Math.random() * 0.3})`;
        
        typingText.appendChild(rectEl);
        setTimeout(() => rectEl.remove(), 200 + i * 30);
    }
}

// ===== GLITCH: خطوط افقی =====
function createGlitchLines() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    const count = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < count; i++) {
        const line = document.createElement('div');
        line.className = 'glitch-line-glitch';
        
        const width = 40 + Math.random() * 120;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - 10);
        
        line.style.width = `${width}px`;
        line.style.left = `${posX}px`;
        line.style.top = `${posY}px`;
        line.style.background = Math.random() < 0.5 
            ? 'rgba(255,255,255,0.5)' 
            : 'rgba(0,0,0,0.6)';
        
        typingText.appendChild(line);
        setTimeout(() => line.remove(), 150 + i * 20);
    }
}

// ===== GLITCH: فلش (Flash) =====
function createGlitchFlash() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    if (Math.random() < 0.3) {
        const flash = document.createElement('div');
        flash.className = 'glitch-flash';
        
        const width = 30 + Math.random() * 60;
        const height = 10 + Math.random() * 30;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        flash.style.width = `${width}px`;
        flash.style.height = `${height}px`;
        flash.style.left = `${posX}px`;
        flash.style.top = `${posY}px`;
        flash.style.background = Math.random() < 0.5 
            ? 'rgba(255,255,255,0.15)' 
            : 'rgba(0,0,0,0.2)';
        
        typingText.appendChild(flash);
        setTimeout(() => flash.remove(), 100);
    }
}

// ===== GLITCH: حرکت حروف/کلمات/خطوط =====
function applyGlitchMovement() {
    // حرکت خطوط
    document.querySelectorAll('.glitch-line').forEach(line => {
        if (Math.random() < 0.12) {
            const shiftX = (Math.random() - 0.5) * 14;
            const shiftY = (Math.random() - 0.5) * 6;
            line.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                line.style.transform = '';
            }, 120 + Math.random() * 80);
        }
    });
    
    // حرکت کلمات
    document.querySelectorAll('.glitch-word').forEach(word => {
        if (Math.random() < 0.18) {
            const shiftX = (Math.random() - 0.5) * 8;
            const shiftY = (Math.random() - 0.5) * 4;
            word.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                word.style.transform = '';
            }, 100 + Math.random() * 60);
        }
    });
    
    // حرکت حروف
    document.querySelectorAll('.glitch-char').forEach(char => {
        if (Math.random() < 0.22) {
            const shiftX = (Math.random() - 0.5) * 5;
            const shiftY = (Math.random() - 0.5) * 3;
            char.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                char.style.transform = '';
            }, 80 + Math.random() * 50);
        }
    });
}

// ===== GLITCH FULL =====
function applyFullGlitch() {
    createGlitchRectangles();
    createGlitchLines();
    createGlitchFlash();
    applyGlitchMovement();
}

// ===== TYPEWRITER =====
function typeWriter(text, element, speed = 100, callback = null) {
    let i = 0;
    let fullTextTyped = '';
    
    function type() {
        if (i >= text.length) {
            element.innerHTML = buildGlitchStructure(text);
            setupBaroonClick();
            setupDeveloperDblClick();
            if (callback) callback();
            return;
        }
        
        fullTextTyped += text.charAt(i);
        element.innerHTML = fullTextTyped;
        i++;
        
        // Glitch هنگام تایپ
        if (Math.random() < 0.35) {
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

// ===== SETUP: کلیک روی Baroon =====
function setupBaroonClick() {
    document.querySelectorAll('.baroon-word').forEach(el => {
        el.style.cursor = 'pointer';
        el.style.fontStyle = 'italic';
        
        el.addEventListener('mouseenter', () => {
            el.style.textDecoration = 'underline';
            el.style.textDecorationColor = 'rgba(255,255,255,0.4)';
            el.style.textUnderlineOffset = '3px';
        });
        el.addEventListener('mouseleave', () => {
            el.style.textDecoration = 'none';
        });
        
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            for (let i = 0; i < 6; i++) {
                setTimeout(() => applyFullGlitch(), i * 70);
            }
            setTimeout(() => {
                window.location.href = "../HTML/access.html";
            }, 500);
        });
    });
}

// ===== SETUP: دابل کلیک روی Developer =====
function setupDeveloperDblClick() {
    document.querySelectorAll('.glitch-word').forEach(word => {
        if (word.textContent.trim() === 'Developer') {
            word.addEventListener('dblclick', function(e) {
                e.stopPropagation();
                for (let i = 0; i < 6; i++) {
                    setTimeout(() => applyFullGlitch(), i * 70);
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
    
    mainElement.innerHTML = buildGlitchStructure(fullText);
    
    setTimeout(() => {
        typeWriter(fullText, mainElement, 100, () => {
            setTimeout(() => {
                glitchInterval = setInterval(() => {
                    if (Math.random() < 0.45) {
                        applyFullGlitch();
                    }
                }, 500);
            }, 500);
        });
    }, 500);
}

document.addEventListener('DOMContentLoaded', startPage);