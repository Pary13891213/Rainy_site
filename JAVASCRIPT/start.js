const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

// ===== TEXT با حروف اول کپیتال =====
const fullText = "Welcome Back Developer\nAnd\nWelcome Back Baroon!";

const mainElement = document.getElementById("text-main");

let glitchInterval = null;

// ===== GLITCH REAL FUNCTIONS =====
function createGlitchReal() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    // مستطیل اصلی
    const rectCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < rectCount; i++) {
        const rectangle = document.createElement('div');
        rectangle.className = 'glitch-rectangle';
        
        const width = 30 + Math.random() * 80;
        const height = 1.5 + Math.random() * 2.5;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        rectangle.style.width = `${width}px`;
        rectangle.style.height = `${height}px`;
        rectangle.style.left = `${posX}px`;
        rectangle.style.top = `${posY}px`;
        rectangle.style.background = Math.random() < 0.3 
            ? 'rgba(255, 255, 255, 0.7)' 
            : 'rgba(0, 0, 0, 0.8)';
        
        typingText.appendChild(rectangle);
        setTimeout(() => rectangle.remove(), 200);
    }
    
    // RGB اثر (گاهی)
    if (Math.random() < 0.3) {
        const rgb = document.createElement('div');
        rgb.className = 'glitch-rgb';
        rgb.style.width = `${80 + Math.random() * 120}px`;
        rgb.style.height = `${2 + Math.random() * 3}px`;
        rgb.style.left = `${Math.random() * (rect.width - 80)}px`;
        rgb.style.top = `${Math.random() * (rect.height - 10)}px`;
        
        const colors = ['rgba(255,0,0,0.4)', 'rgba(0,255,0,0.4)', 'rgba(0,0,255,0.4)'];
        rgb.style.background = colors[Math.floor(Math.random() * colors.length)];
        rgb.style.boxShadow = '0 0 10px currentColor';
        
        typingText.appendChild(rgb);
        setTimeout(() => rgb.remove(), 200);
    }
}

function shiftTextReal(element) {
    if (!element || !element.textContent || element.textContent.length === 0) return;
    if (Math.random() < 0.4) return;
    
    const shiftAmount = 2 + Math.random() * 4;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const originalTransform = element.style.transform || '';
    
    element.style.transition = 'transform 0.05s ease-out';
    element.style.transform = `${originalTransform} translateX(${shiftAmount * direction}px)`;
    
    setTimeout(() => {
        element.style.transform = originalTransform;
    }, 100);
}

// ===== TYPEWRITER =====
function typeWriterWithClickable(text, element, clickableWord, speed = 100, callback = null) {
    let i = 0;
    element.innerHTML = '';
    let wordTyped = false;
    element.style.opacity = '1';
    
    function type() {
        if (i >= text.length) {
            if (callback) callback();
            return;
        }
        
        const remaining = text.slice(i);
        const wordIndex = remaining.indexOf(clickableWord);
        
        if (wordIndex === 0 && !wordTyped) {
            wordTyped = true;
            typeClickableWord(0);
            return;
        }
        
        const currentChar = text.charAt(i);
        element.innerHTML += currentChar;
        i++;
        
        // Glitch real during typing (12% chance)
        if (Math.random() < 0.12) {
            createGlitchReal();
            shiftTextReal(element);
        }
        
        let currentSpeed = speed;
        const char = text.charAt(i - 1);
        if ('.!?'.includes(char)) currentSpeed = speed * 2;
        else if (',:'.includes(char)) currentSpeed = speed * 1.5;
        else if (char === '\n') currentSpeed = speed * 1.5;
        
        const variation = 0.9 + Math.random() * 0.2;
        setTimeout(type, currentSpeed * variation);
    }
    
    function typeClickableWord(index) {
        const word = clickableWord;
        if (index < word.length) {
            const typedWord = word.slice(0, index + 1);
            const beforeText = text.slice(0, i);
            const afterText = text.slice(i + word.length);
            
            const fullHtml = beforeText + 
                `<span class="clickable" id="clickable-word">${typedWord}</span>` + 
                afterText;
            element.innerHTML = fullHtml;
            
            if (Math.random() < 0.12) {
                createGlitchReal();
                shiftTextReal(element);
            }
            
            setTimeout(() => {
                typeClickableWord(index + 1);
            }, speed * 0.8);
        } else {
            i += word.length;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ===== CLICK HANDLER =====
function setupClickableWord() {
    const clickable = document.getElementById('clickable-word');
    if (clickable) {
        clickable.addEventListener('click', function(e) {
            e.stopPropagation();
            
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    createGlitchReal();
                    shiftTextReal(mainElement);
                }, i * 80);
            }
            
            setTimeout(() => {
                window.location.href = "../HTML/access.html";
            }, 400);
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
    
    setTimeout(() => {
        typeWriterWithClickable(fullText, mainElement, 'Baroon!', 100, () => {
            setTimeout(() => {
                setupClickableWord();
                
                // Glitch real after typing (every 1.2s, 35% chance)
                glitchInterval = setInterval(() => {
                    if (Math.random() < 0.35) {
                        createGlitchReal();
                        shiftTextReal(mainElement);
                    }
                }, 1200);
            }, 500);
        });
    }, 800);
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