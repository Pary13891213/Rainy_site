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

// ===== GLITCH FUNCTIONS =====
function createGlitchRectangle() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    const rectangleCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < rectangleCount; i++) {
        const rectangle = document.createElement('div');
        rectangle.className = 'glitch-rectangle';
        rectangle.classList.add(Math.random() < 0.4 ? 'white' : 'black');
        
        const width = 40 + Math.random() * 80;
        const height = 3 + Math.random() * 2;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        rectangle.style.width = `${width}px`;
        rectangle.style.height = `${height}px`;
        rectangle.style.left = `${posX}px`;
        rectangle.style.top = `${posY}px`;
        
        typingText.appendChild(rectangle);
        
        setTimeout(() => {
            rectangle.remove();
        }, 120);
    }
}

function shiftText(element, intensity) {
    if (!element || !element.textContent || element.textContent.length === 0) return;
    
    const shiftAmount = intensity;
    const direction = Math.random() > 0.5 ? 1 : -1;
    const originalTransform = element.style.transform || '';
    
    element.style.transform = `${originalTransform} translateX(${shiftAmount * direction}px)`;
    
    setTimeout(() => {
        element.style.transform = originalTransform;
    }, 80);
}

// ===== TYPEWRITER =====
function typeWriter(text, element, speed = 80, callback = null) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i >= text.length) {
            if (callback) callback();
            return;
        }
        
        const currentChar = text.charAt(i);
        element.innerHTML += currentChar;
        i++;
        
        // Glitch during typing (reduced)
        if (Math.random() < 0.04) {
            createGlitchRectangle();
            if (Math.random() < 0.3) {
                shiftText(element, 4);
            }
        }
        
        let currentSpeed = speed;
        const char = text.charAt(i - 1);
        if ('.!?'.includes(char)) currentSpeed = speed * 1.5;
        else if (',:'.includes(char)) currentSpeed = speed * 1.2;
        
        setTimeout(type, currentSpeed);
    }
    
    type();
}

// ===== TYPEWRITER WITH CLICKABLE WORD =====
function typeWriterWithClickable(text, element, clickableWord, speed = 80, callback = null) {
    let i = 0;
    element.innerHTML = '';
    let wordTyped = false;
    
    function type() {
        if (i >= text.length) {
            if (callback) callback();
            return;
        }
        
        const remaining = text.slice(i);
        const wordIndex = remaining.indexOf(clickableWord);
        
        // اگه به کلمه رسیدیم و هنوز تایپ نشده
        if (wordIndex === 0 && !wordTyped) {
            wordTyped = true;
            typeClickableWord(0);
            return;
        }
        
        // تایپ عادی
        const currentChar = text.charAt(i);
        element.innerHTML += currentChar;
        i++;
        
        if (Math.random() < 0.04) {
            createGlitchRectangle();
            if (Math.random() < 0.3) shiftText(element, 4);
        }
        
        let currentSpeed = speed;
        const char = text.charAt(i - 1);
        if ('.!?'.includes(char)) currentSpeed = speed * 1.5;
        else if (',:'.includes(char)) currentSpeed = speed * 1.2;
        
        setTimeout(type, currentSpeed);
    }
    
    function typeClickableWord(index) {
        const word = clickableWord;
        if (index < word.length) {
            const typedWord = word.slice(0, index + 1);
            const beforeText = text.slice(0, i);
            const afterText = text.slice(i + word.length);
            
            // با span clickable
            element.innerHTML = beforeText + 
                `<span class="clickable" id="clickable-word">${typedWord}</span>` + 
                afterText;
            
            setTimeout(() => {
                typeClickableWord(index + 1);
            }, speed);
        } else {
            i += word.length;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ===== CLICK HANDLER (ONCE) =====
function setupClickableWord() {
    const clickable = document.getElementById('clickable-word');
    if (clickable) {
        clickable.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Glitch effect on click
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    createGlitchRectangle();
                    shiftText(element3, 6);
                }, i * 100);
            }
            
            setTimeout(() => {
                window.location.href = "../HTML/access.html";
            }, 400);
        });
    }
}

// ===== START PAGE =====
function startPage() {
    // Check if already logged in
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
    
    // Add scanlines
    const startPage = document.querySelector('.start-page');
    const scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    startPage.appendChild(scanlines);
    
    // Start typing
    setTimeout(() => {
        typeWriter(textOne, element1, 100, () => {
            setTimeout(() => {
                typeWriter(textTwo, element2, 80, () => {
                    setTimeout(() => {
                        typeWriterWithClickable(textThree, element3, 'Baroon!', 100, () => {
                            // After typing complete, start reduced glitch
                            setTimeout(() => {
                                setupClickableWord();
                                
                                glitchInterval = setInterval(() => {
                                    if (Math.random() < 0.25) {
                                        createGlitchRectangle();
                                        if (Math.random() < 0.3) {
                                            const elements = [element1, element2, element3];
                                            const el = elements[Math.floor(Math.random() * elements.length)];
                                            shiftText(el, 3);
                                        }
                                    }
                                }, 2000);
                            }, 500);
                        });
                    }, 400);
                });
            }, 300);
        });
    }, 1000);
}

// ===== DEV PANEL ACCESS (Keyboard: D) =====
document.addEventListener('keydown', function(event) {
    if ((event.key === 'D' || event.key === 'd') && 
        event.target.tagName !== 'INPUT' && 
        event.target.tagName !== 'TEXTAREA') {
        window.location.href = "../HTML/dev-enter.html";
    }
});

// ===== DEV PANEL ACCESS (Double tap on "Developer") =====
document.addEventListener('DOMContentLoaded', function() {
    // Double tap on "Developer" in text-one
    const textOneEl = document.getElementById('text-one');
    if (!textOneEl) return;
    
    let tapCount = 0;
    let tapTimer = null;
    const isMobile = window.innerWidth < 768;
    
    function openDevEnter() {
        if (navigator.vibrate) navigator.vibrate(20);
        setTimeout(() => {
            window.location.href = '/HTML/dev-enter.html';
        }, 200);
    }
    
    // Mobile: touchstart
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
    
    // Desktop: click
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

// ===== START =====
document.addEventListener('DOMContentLoaded', startPage);