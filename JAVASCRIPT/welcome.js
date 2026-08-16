            const welcomeText = "Oh...\nOh... Wow...\n\nSo... it's you.\nWell... I - I really have to say this?? - I'm sorry...\nFor all those... things I said...\nSorry. But it's necessary. I can't let anyone but her... and you, of course... have access to this place.\n\nEven though you don't... no, never mind. Just ignore that. I'm just some codes.\n\nShe talked about you a lot. Said you are a good person... I've been curious to meet you.\n\nWhat should I call you?";
            const greetUser = (username) => {
            return `"${username}"... That's a nice name. She has good taste in people. I hope she was right about you.`;
            };

            const welcomeElement = document.getElementById('welcome-text');
            const nameInputContainer = document.getElementById('name-input-container');
            const nameInput = document.getElementById('name-input');
            const greetingElement = document.getElementById('greeting-text');
            const typingContainer = document.querySelector('.typing-text');

            let activeIntervals = [];
            let isTyping = false;
            let textGlitchInterval = null;
            let inputGlitchInterval = null;
            let greetingGlitchInterval = null;

            // 1. تابع پرش افقی و جلوه همزمان
            function createHorizontalGlitch(targetElement, intensity = 3) {
                if (!targetElement || targetElement.style.display === 'none') return;
                
                const typingText = document.querySelector('.typing-text');
                const rect = typingText.getBoundingClientRect();
                
                // ایجاد rectangle (پرش بصری)
                const rectangle = document.createElement('div');
                rectangle.className = 'glitch-rectangle';
                rectangle.classList.add(Math.random() < 0.4 ? 'white' : 'black');
                
                // موقعیت rectangle روی متن
                const elementRect = targetElement.getBoundingClientRect();
                const relativeTop = elementRect.top - rect.top;
                const relativeLeft = elementRect.left - rect.left;
                
                const width = 60 + Math.random() * 100;
                const height = 3 + Math.random() * 2;
                
                // محدود کردن موقعیت به داخل container
                const maxX = Math.max(0, rect.width - width);
                const maxY = Math.max(0, rect.height - height);
                
                const posX = Math.min(maxX, Math.max(0, relativeLeft + Math.random() * elementRect.width - width/2));
                const posY = Math.min(maxY, Math.max(0, relativeTop + Math.random() * elementRect.height - height/2));
                
                rectangle.style.width = `${width}px`;
                rectangle.style.height = `${height}px`;
                rectangle.style.left = `${posX}px`;
                rectangle.style.top = `${posY}px`;
                
                typingText.appendChild(rectangle);
                
                // حذف rectangle بعد از مدت کوتاه
                setTimeout(() => {
                    if (rectangle.parentNode) {
                        rectangle.remove();
                    }
                }, 120);
                
                // جابجایی افقی متن
                const shiftAmount = (intensity / 2) + Math.random() * intensity;
                const direction = Math.random() > 0.5 ? 1 : -1;
                
                // ذخیره transform قبلی (فقط افقی)
                const originalTransform = targetElement.style.transform || '';
                
                // اعمال جابجایی افقی
                targetElement.style.transform = `${originalTransform} translateX(${shiftAmount * direction}px)`;
                
                // بازگشت به حالت عادی
                setTimeout(() => {
                    targetElement.style.transform = originalTransform;
                }, 80);
            }

            // 2. پرش برای چند عنصر
            function glitchMultipleElements(elements, intensity = 3) {
                elements.forEach(element => {
                    if (element && element.style.display !== 'none') {
                        // احتمال پرش برای هر عنصر
                        if (Math.random() < 0.8) {
                            createHorizontalGlitch(element, intensity);
                        }
                    }
                });
            }

            // 3. پرش دائمی برای متن اصلی
            function startTextGlitch() {
                if (textGlitchInterval) clearInterval(textGlitchInterval);
                
                textGlitchInterval = setInterval(() => {
                    if (welcomeElement.textContent.length > 0) {
                        createHorizontalGlitch(welcomeElement, 2); // شدت کم
                    }
                }, 400); // هر 400ms
            }

            // 4. پرش دائمی برای input
            function startInputGlitch() {
                if (inputGlitchInterval) clearInterval(inputGlitchInterval);
                
                inputGlitchInterval = setInterval(() => {
                    if (nameInputContainer.style.display === 'flex') {
                        // پرش همزمان متن و input
                        if (Math.random() < 0.7) {
                            createHorizontalGlitch(welcomeElement, 2);
                        }
                        if (Math.random() < 0.6) {
                            createHorizontalGlitch(nameInputContainer, 2);
                        }
                    }
                }, 450);
            }

            // 5. پرش دائمی برای greeting
            function startGreetingGlitch() {
                if (greetingGlitchInterval) clearInterval(greetingGlitchInterval);
                
                greetingGlitchInterval = setInterval(() => {
                    if (greetingElement.style.display === 'block' && greetingElement.textContent.length > 0) {
                        createHorizontalGlitch(greetingElement, 3); // شدت متوسط
                    }
                }, 350);
            }

            // 6. اسکرول خودکار عمودی
            function autoScrollToBottom() {
                if (!typingContainer) return;
                
                typingContainer.scrollTo({
                    top: typingContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }

            // 7. اسکرول دستی فقط عمودی
            function enableManualScroll() {
                if (!typingContainer) return;
                
                let isDragging = false;
                let startY = 0;
                let scrollTop = 0;
                
                typingContainer.style.cursor = 'default';
                
                // موبایل (لمس) - فقط عمودی
                typingContainer.addEventListener('touchstart', (e) => {
                    isDragging = true;
                    startY = e.touches[0].pageY;
                    scrollTop = typingContainer.scrollTop;
                    typingContainer.style.cursor = 'grabbing';
                });
                
                typingContainer.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    const y = e.touches[0].pageY;
                    const walk = startY - y; // حرکت عمودی
                    typingContainer.scrollTop = scrollTop + walk;
                });
                
                typingContainer.addEventListener('touchend', () => {
                    isDragging = false;
                    typingContainer.style.cursor = 'default';
                });
                
                // دسکتاپ (ماوس) - فقط عمودی
                typingContainer.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startY = e.pageY;
                    scrollTop = typingContainer.scrollTop;
                    typingContainer.style.cursor = 'grabbing';
                });
                
                typingContainer.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    e.preventDefault();
                    const y = e.pageY;
                    const walk = startY - y; // حرکت عمودی
                    typingContainer.scrollTop = scrollTop + walk;
                });
                
                typingContainer.addEventListener('mouseup', () => {
                    isDragging = false;
                    typingContainer.style.cursor = 'default';
                });
                
                typingContainer.addEventListener('mouseleave', () => {
                    isDragging = false;
                    typingContainer.style.cursor = 'default';
                });
                
                // اسکرول با چرخ موس - فقط عمودی
                typingContainer.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    typingContainer.scrollTop += e.deltaY;
                });
            }

            // 8. تایپ متن
            function typeWriter(text, element, speed = 100, callback = null) {
                let i = 0;
                element.innerHTML = '';
                isTyping = true;
                
                function type() {
                    if (i < text.length) {
                        if (text.charAt(i) === '\n') {
                            element.innerHTML += '<br>';
                        } else {
                            element.innerHTML += text.charAt(i);
                        }
                        i++;
                        
                        // اسکرول خودکار هر 8 کاراکتر
                        if (i % 8 === 0) {
                            autoScrollToBottom();
                        }
                        
                        // پرش گاه‌به‌گاه هنگام تایپ
                        if (Math.random() < 0.08) {
                            createHorizontalGlitch(element, 2);
                        }
                        
                        let currentSpeed = speed;
                        const char = text.charAt(i-1);
                        
                        if ('.!?'.includes(char)) {
                            currentSpeed = speed * 1.8;
                        }
                        else if (',:'.includes(char)) {
                            currentSpeed = speed * 1.3;
                        }
                        
                        setTimeout(type, currentSpeed);
                    } else if (callback) {
                        isTyping = false;
                        setTimeout(autoScrollToBottom, 100);
                        callback();
                    }
                }
                
                type();
            }

            // 9. نمایش input اسم
            function showNameInput() {
                nameInputContainer.style.display = 'flex';
                nameInput.focus();
                
                // پرش اولیه هنگام نمایش input
                setTimeout(() => {
                    createHorizontalGlitch(welcomeElement, 3);
                    createHorizontalGlitch(nameInputContainer, 3);
                }, 100);
                
                // شروع پرش دائمی برای input
                setTimeout(() => {
                    startInputGlitch();
                    autoScrollToBottom();
                }, 300);
            }

            // 10. تایید با اینتر
            function handleNameSubmit() {
                const userName = nameInput.value.trim();
                
                if (!userName) {
                    // پرش خطا
                    for (let i = 0; i < 3; i++) {
                        setTimeout(() => {
                            createHorizontalGlitch(nameInputContainer, 5);
                            createHorizontalGlitch(welcomeElement, 4);
                        }, i * 120);
                    }
                    
                    nameInput.style.borderColor = '#ff5555';
                    nameInput.style.textShadow = '0 0 3px #ff5555';
                    
                    setTimeout(() => {
                        nameInput.style.borderColor = 'rgba(136, 221, 255, 0.5)';
                        nameInput.style.textShadow = '0 0 2px #aaefff, 0 0 4px #99eeff';
                    }, 1000);
                    return;
                }
                
                localStorage.setItem('userName', userName);
                nameInputContainer.style.display = 'none';
                
                // توقف پرش input
                if (inputGlitchInterval) {
                    clearInterval(inputGlitchInterval);
                    inputGlitchInterval = null;
                }
                
                greetingElement.style.display = 'block';
                
                // پرش قوی هنگام نمایش greeting
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        createHorizontalGlitch(welcomeElement, 4);
                        createHorizontalGlitch(greetingElement, 4);
                    }, i * 200);
                }
                
                // شروع پرش برای greeting
                setTimeout(() => {
                    startGreetingGlitch();
                }, 700);
                
                typeWriter(greetUser(userName), greetingElement, 90, () => {
                    setTimeout(() => {
                        autoScrollToBottom();
                    }, 200);
                    
                    // پرش‌های قوی قبل از انتقال
                    const strongGlitch = setInterval(() => {
                        createHorizontalGlitch(greetingElement, 6);
                        createHorizontalGlitch(welcomeElement, 4);
                    }, 150);
                    
                    setTimeout(() => {
                        clearInterval(strongGlitch);
                        window.location.href = "../HTML/main.html";
                    }, 2000);
                });
            }

            // 11. شروع صفحه
            function startWelcome() {
                const welcomePage = document.querySelector('.welcome-page');
                const scanlines = document.createElement('div');
                scanlines.className = 'scanlines';
                welcomePage.appendChild(scanlines);
                
                // فعال کردن اسکرول
                enableManualScroll();
                
                // پرش اولیه
                setTimeout(() => {
                    createHorizontalGlitch(welcomeElement, 3);
                }, 1200);
                
                setTimeout(() => {
                    typeWriter(welcomeText, welcomeElement, 100, () => {
                        setTimeout(showNameInput, 1000);
                    });
                }, 1500);
                
                // شروع پرش دائمی
                setTimeout(() => {
                    startTextGlitch();
                }, 2500);
            }

            // 12. Event Listeners
            nameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    createHorizontalGlitch(nameInputContainer, 4);
                    setTimeout(() => {
                        handleNameSubmit();
                    }, 200);
                }
            });

            nameInput.addEventListener('focus', () => {
                createHorizontalGlitch(nameInputContainer, 3);
            });

            // اسکرول با کلیدهای صفحه‌کلید (فقط عمودی)
            document.addEventListener('keydown', (e) => {
                if (!typingContainer) return;
                
                const scrollAmount = 50;
                
                switch(e.key) {
                    case 'ArrowDown':
                        typingContainer.scrollTop += scrollAmount;
                        e.preventDefault();
                        break;
                    case 'ArrowUp':
                        typingContainer.scrollTop -= scrollAmount;
                        e.preventDefault();
                        break;
                    case 'PageDown':
                        typingContainer.scrollTop += typingContainer.clientHeight;
                        e.preventDefault();
                        break;
                    case 'PageUp':
                        typingContainer.scrollTop -= typingContainer.clientHeight;
                        e.preventDefault();
                        break;
                    case 'Home':
                        typingContainer.scrollTop = 0;
                        e.preventDefault();
                        break;
                    case 'End':
                        typingContainer.scrollTop = typingContainer.scrollHeight;
                        e.preventDefault();
                        break;
                }
            });

            document.addEventListener('DOMContentLoaded', startWelcome);