const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

// ===== TEXTS =====
const textOne = "Welcome back Developer";
const textTwo = "And";
const textThree = "Welcome Back Baroon!";

const element1 = document.getElementById("text-one");
const element2 = document.getElementById("text-two");
const element3 = document.getElementById("text-three");

let glitchInterval = null;

// ===== GLITCH FUNCTIONS (More active) =====
function createGlitchRectangle() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    const rectangleCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < rectangleCount; i++) {
        const rectangle = document.createElement('div');
        rectangle.className = 'glitch-rectangle';
        
        const width = 40 + Math.random() * 100;
        const height = 2 + Math.random() * 2.5;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        rectangle.style.width = `${width}px`;
        rectangle.style.height = `${height}px`;
        rectangle.style.left = `${posX}px`;
        rectangle.style.top = `${posY}px`;
        rectangle.style.background = Math.random() < 0.4 
            ? 'rgba(255, 255, 255, 0.7)' 
            : 'rgba(0, 0, 0, 0.8)';
        
        typingText.appendChild(rectangle);
        
        setTimeout(() => {
            rectangle.remove();
        }, 180);
    }
}

function shiftText(element, intensity) {
    if (!element || !element.textContent || element.textContent.length === 0) return;
    
    const shiftAmount = intensity;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const originalTransform = element.style.transform || '';
    
    element.style.transition = 'transform 0.08s ease-out';
    element.style.transform = `${originalTransform} translateX(${shiftAmount * direction}px)`;
    
    setTimeout(() => {
        element.style.transform = originalTransform;
    }, 120);
}

// ===== TYPEWRITER (Slower) =====
function typeWriter(text, element, speed = 100, callback = null) {
    let i = 0;
    element.innerHTML = '';
    element.style.opacity = '1';
    
    function type() {
        if (i >= text.length) {
            if (callback) callback();
            return;
        }
        
        const currentChar = text.charAt(i);
        element.innerHTML += currentChar;
        i++;
        
        // Glitch during typing (8% chance)
        if (Math.random() < 0.08) {
            createGlitchRectangle();
            if (Math.random() < 0.5) {
                shiftText(element, 5);
            }
        }
        
        let currentSpeed = speed;
        const char = text.charAt(i - 1);
        if ('.!?'.includes(char)) currentSpeed = speed * 2;
        else if (',:'.includes(char)) currentSpeed = speed * 1.5;
        
        setTimeout(type, currentSpeed);
    }
    
    type();
}

// ===== TYPEWRITER WITH CLICKABLE WORD (Slower) =====
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
        
        if (Math.random() < 0.08) {
            createGlitchRectangle();
            if (Math.random() < 0.5) {
                shiftText(element, 5);
            }
        }
        
        let currentSpeed = speed;
        const char = text.charAt(i - 1);
        if ('.!?'.includes(char)) currentSpeed = speed * 2;
        else if (',:'.includes(char)) currentSpeed = speed * 1.5;
        
        setTimeout(type, currentSpeed);
    }
    
    function typeClickableWord(index) {
        const word = clickableWord;
        if (index < word.length) {
            const typedWord = word.slice(0, index + 1);
            const beforeText = text.slice(0, i);
            const afterText = text.slice(i + word.length);
            
            element.innerHTML = beforeText + 
                `<span class="clickable" id="clickable-word">${typedWord}</span>` + 
                afterText;
            
            setTimeout(() => {
                typeClickableWord(index + 1);
            }, speed * 0.9);
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
            
            for (let i = 0; i < 4; i++) {
                setTimeout(() => {
                    createGlitchRectangle();
                    shiftText(element3, 6);
                }, i * 120);
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
    
    // اسکن‌لاین توی HTML هست
    setTimeout(() => {
        typeWriter(textOne, element1, 120, () => {
            setTimeout(() => {
                typeWriter(textTwo, element2, 80, () => {
                    setTimeout(() => {
                        typeWriterWithClickable(textThree, element3, 'Baroon!', 120, () => {
                            setTimeout(() => {
                                setupClickableWord();
                                
                                // Glitch every 1.5 seconds with 35% chance
                                glitchInterval = setInterval(() => {
                                    if (Math.random() < 0.35) {
                                        createGlitchRectangle();
                                        if (Math.random() < 0.4) {
                                            const elements = [element1, element2, element3];
                                            const el = elements[Math.floor(Math.random() * elements.length)];
                                            shiftText(el, 5);
                                        }
                                    }
                                }, 1500);
                            }, 600);
                        });
                    }, 500);
                });
            }, 400);
        });
    }, 1000);
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
    const textOneEl = document.getElementById('text-one');
    if (!textOneEl) return;
    
    let tapCount = 0;
    let tapTimer = null;
    const isMobile = window.innerWidth < 768;
    
    function openDevEnter() {
        if (navigator.vibrate) navigator.vibrate(15);
        setTimeout(() => {
            window.location.href = '/HTML/dev-enter.html';
        }, 200);
    }
    
    textOneEl.addEventListener('touchstart', function(e) {
        if (!isMobile) return;
        const target = e.target;
        if (target && target.textContent && target.textContent.includes('Developer')) {
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
    
    textOneEl.addEventListener('click', function(e) {
        if (isMobile) return;
        const target = e.target;
        if (target && target.textContent && target.textContent.includes('Developer')) {
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