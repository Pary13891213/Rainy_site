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

// ===== GLITCH: مستطیل‌های سرتاسر صفحه =====
function createGlitchRectangles() {
    const page = document.querySelector('.start-page');
    const rect = page.getBoundingClientRect();
    
    const count = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < count; i++) {
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
            ? `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})` 
            : `rgba(0, 0, 0, ${0.6 + Math.random() * 0.4})`;
        
        page.appendChild(rectEl);
        setTimeout(() => rectEl.remove(), 200 + i * 30);
    }
}

// ===== GLITCH: خطوط افقی سرتاسر صفحه =====
function createGlitchLines() {
    const page = document.querySelector('.start-page');
    const rect = page.getBoundingClientRect();
    
    const count = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < count; i++) {
        const line = document.createElement('div');
        line.className = 'glitch-line-glitch';
        
        const width = 50 + Math.random() * 200;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - 10);
        
        line.style.width = `${width}px`;
        line.style.left = `${posX}px`;
        line.style.top = `${posY}px`;
        line.style.background = Math.random() < 0.5 
            ? `rgba(255,255,255,${0.4 + Math.random() * 0.4})` 
            : `rgba(0,0,0,${0.5 + Math.random() * 0.3})`;
        
        page.appendChild(line);
        setTimeout(() => line.remove(), 150 + i * 20);
    }
}

// ===== GLITCH: فلش سرتاسر صفحه =====
function createGlitchFlash() {
    const page = document.querySelector('.start-page');
    const rect = page.getBoundingClientRect();
    
    if (Math.random() < 0.4) {
        const flash = document.createElement('div');
        flash.className = 'glitch-flash';
        
        const width = 50 + Math.random() * 150;
        const height = 20 + Math.random() * 80;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        flash.style.width = `${width}px`;
        flash.style.height = `${height}px`;
        flash.style.left = `${posX}px`;
        flash.style.top = `${posY}px`;
        flash.style.background = Math.random() < 0.5 
            ? `rgba(255,255,255,${0.1 + Math.random() * 0.15})` 
            : `rgba(0,0,0,${0.15 + Math.random() * 0.2})`;
        
        page.appendChild(flash);
        setTimeout(() => flash.remove(), 100);
    }
}

// ===== GLITCH: بلوک‌های بزرگ =====
function createGlitchBlocks() {
    const page = document.querySelector('.start-page');
    const rect = page.getBoundingClientRect();
    
    if (Math.random() < 0.3) {
        const block = document.createElement('div');
        block.className = 'glitch-block';
        
        const width = 80 + Math.random() * 200;
        const height = 40 + Math.random() * 100;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        block.style.width = `${width}px`;
        block.style.height = `${height}px`;
        block.style.left = `${posX}px`;
        block.style.top = `${posY}px`;
        block.style.background = Math.random() < 0.5 
            ? `rgba(255,255,255,${0.05 + Math.random() * 0.1})` 
            : `rgba(0,0,0,${0.08 + Math.random() * 0.12})`;
        
        page.appendChild(block);
        setTimeout(() => block.remove(), 180);
    }
}

// ===== GLITCH: حرکت حروف/کلمات/خطوط =====
function applyGlitchMovement() {
    // حرکت خطوط
    document.querySelectorAll('.glitch-line').forEach(line => {
        if (Math.random() < 0.18) {
            const shiftX = (Math.random() - 0.5) * 20;
            const shiftY = (Math.random() - 0.5) * 8;
            line.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                line.style.transform = '';
            }, 150 + Math.random() * 100);
        }
    });
    
    // حرکت کلمات
    document.querySelectorAll('.glitch-word').forEach(word => {
        if (Math.random() < 0.25) {
            const shiftX = (Math.random() - 0.5) * 12;
            const shiftY = (Math.random() - 0.5) * 5;
            word.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                word.style.transform = '';
            }, 120 + Math.random() * 80);
        }
    });
    
    // حرکت حروف
    document.querySelectorAll('.glitch-char').forEach(char => {
        if (Math.random() < 0.30) {
            const shiftX = (Math.random() - 0.5) * 7;
            const shiftY = (Math.random() - 0.5) * 4;
            char.style.transform = `translate(${shiftX}px, ${shiftY}px)`;
            setTimeout(() => {
                char.style.transform = '';
            }, 100 + Math.random() * 60);
        }
    });
}

// ===== GLITCH FULL =====
function applyFullGlitch() {
    createGlitchRectangles();
    createGlitchLines();
    createGlitchFlash();
    createGlitchBlocks();
    applyGlitchMovement();
}

// ===== TYPEWRITER (سرعت 130ms) =====
function typeWriter(text, element, speed = 130, callback = null) {
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
        
        // Glitch هنگام تایپ با حرکت حروف/کلمات/خطوط
        if (Math.random() < 0.45) {
            // مستطیل‌ها و خطوط
            createGlitchRectangles();
            createGlitchLines();
            createGlitchFlash();
            createGlitchBlocks();
            // حرکت حروف/کلمات/خطوط
            applyGlitchMovement();
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
            for (let i = 0; i < 8; i++) {
                setTimeout(() => applyFullGlitch(), i * 60);
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
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => applyFullGlitch(), i * 60);
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
        typeWriter(fullText, mainElement, 130, () => {
            setTimeout(() => {
                glitchInterval = setInterval(() => {
                    if (Math.random() < 0.50) {
                        applyFullGlitch();
                    }
                }, 400);
            }, 500);
        });
    }, 500);
}

document.addEventListener('DOMContentLoaded', startPage);