const textOne = "Welcome Back Developer...";
const textTwo = "Wait...\nWHAT???\nWHO ARE YOU?\nThis Is HER Private Vault. Only HER And One Other__.\nHOW DID YOU GET IN?\nThe Access Code...Give Me The ACCESS CODE. NOW.\nIf You Don't Have It... I Will Find You. I Will Find Everything About Who You Are.\nANSWER ME.";

const element1 = document.getElementById("text-one");
const element2 = document.getElementById("text-two");
const continueBtn = document.getElementById('continue-btn');

function createGlitchRectangle() {
    const typingText = document.querySelector('.typing-text');
    const rect = typingText.getBoundingClientRect();
    
    const rectangleCount = Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < rectangleCount; i++) {
        const rectangle = document.createElement('div');
        rectangle.className = 'glitch-rectangle';
        rectangle.classList.add(Math.random() < 0.4 ? 'white' : 'black');
        
        const width = 60 + Math.random() * 120;
        const height = 5 + Math.random() * 3;
        const posX = Math.random() * (rect.width - width);
        const posY = Math.random() * (rect.height - height);
        
        rectangle.style.width = `${width}px`;
        rectangle.style.height = `${height}px`;
        rectangle.style.left = `${posX}px`;
        rectangle.style.top = `${posY}px`;
        
        typingText.appendChild(rectangle);
        
        setTimeout(() => {
            rectangle.remove();
        }, 150);
    }
}

function shiftText(element, intensity) {
    if (element && element.textContent && element.textContent.length > 0) {
        const shiftAmount = intensity;
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        element.style.transform = `translateX(${shiftAmount * direction}px)`;
        
        setTimeout(() => {
            element.style.transform = 'translateX(0)';
        }, element === element1 ? 100 : 60);
    }
}

function createBtnGlitch() {
    if (!continueBtn.classList.contains('show')) return;
    
    const rect = continueBtn.getBoundingClientRect();
    const pageRect = document.querySelector('.start-page').getBoundingClientRect();
    
    const rectangle = document.createElement('div');
    rectangle.className = 'glitch-btn-rectangle';
    
    const colorType = Math.random();
    if (colorType < 0.5) {
        rectangle.style.background = 'rgba(136, 221, 255, 0.6)';
    } else {
        rectangle.style.background = 'rgba(170, 239, 255, 0.7)';
    }
    
    rectangle.style.width = `${rect.width + 10}px`;
    rectangle.style.height = `${rect.height + 10}px`;
    rectangle.style.left = `${rect.left - pageRect.left - 5}px`;
    rectangle.style.top = `${rect.top - pageRect.top - 5}px`;
    
    document.querySelector('.start-page').appendChild(rectangle);
    
    setTimeout(() => {
        rectangle.remove();
    }, 150);
}

function showContinueButton() {
    setTimeout(() => {
        continueBtn.classList.add('show');
        
        setInterval(() => {
            if (Math.random() < 0.25) {
                createBtnGlitch();
                
                if (Math.random() < 0.3) {
                    const shiftAmount = 3 + Math.random() * 4;
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    
                    continueBtn.style.transform = `translateX(${-50 + (shiftAmount * direction)}%) translateY(20px)`;
                    
                    setTimeout(() => {
                        continueBtn.style.transform = 'translateX(-50%) translateY(20px)';
                    }, 80);
                }
            }
        }, 1200);
    }, 1500);
}

function typeWriter(text, element, speed = 80, intensity = 0, callback = null) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            if (text.charAt(i) === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += text.charAt(i);
                
                if (intensity > 0 && Math.random() < (element === element2 ? 0.08 : 0.04)) {
                    createGlitchRectangle();
                    if (Math.random() < (element === element2 ? 0.7 : 0.5)) {
                        shiftText(element, element === element2 ? 15 : 5);
                    }
                }
            }
            i++;
            
            let currentSpeed = speed;
            const char = text.charAt(i-1);
            
            if ('.!?'.includes(char)) {
                currentSpeed = speed * (element === element2 ? 1.5 : 2);
            }
            else if (',:'.includes(char)) {
                currentSpeed = speed * (element === element2 ? 1.2 : 1.5);
            }
            
            setTimeout(type, currentSpeed);
        } else if (callback) {
            callback();
            if (element === element2) {
                showContinueButton();
            }
        }
    }
    
    type();
}

const TEST_MODE = false; // false کن وقتی می‌خوای ثبت بشه

function startTyping() {
    if (!TEST_MODE && localStorage.getItem('deviceVerified') === 'true') {
        window.location.href = "../HTML/main.html";
        return;
    }
    const startPage = document.querySelector('.start-page');
    const scanlines = document.createElement('div');
    scanlines.className = 'scanlines';
    startPage.appendChild(scanlines);
    
    let part1Glitch = setInterval(() => {
        createGlitchRectangle();
        shiftText(element1, 5);
    }, 1800);
    
    setTimeout(() => {
        typeWriter(textOne, element1, 100, 3, () => {
            clearInterval(part1Glitch);
            
            setTimeout(() => {
                let prePart2Glitch = setInterval(() => {
                    createGlitchRectangle();
                    shiftText(element1, 8);
                }, 300);
                
                setTimeout(() => {
                    clearInterval(prePart2Glitch);
                    
                    let part2Glitch = setInterval(() => {
                        if (Math.random() < 0.8) createGlitchRectangle();
                        if (Math.random() < 0.7) shiftText(element2, 15);
                    }, 200);
                    
                    typeWriter(textTwo, element2, 60, 8, () => {
                        clearInterval(part2Glitch);
                        
                        setInterval(() => {
                            if (Math.random() < 0.6) createGlitchRectangle();
                            if (Math.random() < 0.5) shiftText(element2, 12);
                        }, 400);
                    });
                    
                }, 1000);
                
            }, 1500);
        });
    }, 1500);
}

continueBtn.addEventListener('click', function() {
    this.style.background = 'rgba(136, 221, 255, 0.2)';
    this.style.textShadow = '0 0 8px #aaefff, 0 0 16px #99eeff, 0 0 24px #88ddff';
    this.style.boxShadow = 'inset 0 0 20px rgba(136, 221, 255, 0.6), 0 0 30px rgba(136, 221, 255, 0.7)';
    
    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            createGlitchRectangle();
            createBtnGlitch();
            shiftText(element2, 10);
        }, i * 200);
    }
    
    setTimeout(() => {
        window.location.href = "../HTML/access.html";
    }, 1000);
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'D' || event.key === 'd') {
        window.location.href = "../HTML/dev.html";
    }
});

document.addEventListener('DOMContentLoaded', startTyping);