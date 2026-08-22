const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

const fullText =
    "Welcome Back Developer\nAnd\nWelcome Back Baroon!";

const mainElement =
    document.getElementById("text-main");

let glitchInterval = null;
let glitchRunning = false;
let glitchTimeouts = [];


// =====================================================
// RANDOM
// =====================================================

function random(min, max) {
    return Math.random() * (max - min) + min;
}


// =====================================================
// BUILD TEXT STRUCTURE
// =====================================================

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

                const isBaroon =
                    word === 'Baroon!' ||
                    word === 'Baroon';

                const charClass =
                    isBaroon
                        ? 'glitch-char baroon-char'
                        : 'glitch-char';

                wordHtml += `
                    <span
                        class="${charClass}"
                        data-line="${lineIndex}"
                        data-word="${wordIndex}"
                        data-char="${charIndex}"
                    >${char}</span>
                `;
            });


            if (wordIndex < words.length - 1) {

                wordHtml += `
                    <span
                        class="glitch-char"
                        data-line="${lineIndex}"
                        data-word="${wordIndex}"
                        data-char="space"
                    > </span>
                `;
            }


            const isBaroonWord =
                word === 'Baroon!' ||
                word === 'Baroon';

            const wordClass =
                isBaroonWord
                    ? 'glitch-word baroon-word'
                    : 'glitch-word';


            lineHtml += `
                <span
                    class="${wordClass}"
                    data-line="${lineIndex}"
                    data-word="${wordIndex}"
                >${wordHtml}</span>
            `;
        });


        html += `
            <span
                class="glitch-line"
                data-line="${lineIndex}"
            >${lineHtml}</span>
        `;
    });


    return html;
}


// =====================================================
// GET VISIBLE TEXT AREA
// =====================================================

function getTextRect() {

    const rect =
        mainElement.getBoundingClientRect();

    return rect;
}


// =====================================================
// CHARACTER GLITCH
// =====================================================

function glitchCharacters() {

    const chars =
        Array.from(
            document.querySelectorAll(
                '.glitch-char'
            )
        );

    if (!chars.length) return;


    // فقط 1 تا 3 حرف
    const count =
        Math.floor(random(1, 4));


    for (let i = 0; i < count; i++) {

        const char =
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];


        const x1 =
            random(-5, 5);

        const y1 =
            random(-2, 2);

        const x2 =
            random(-3, 6);

        const y2 =
            random(-1, 1);

        const x3 =
            random(-4, 4);


        char.style.setProperty(
            '--char-x1',
            `${x1}px`
        );

        char.style.setProperty(
            '--char-y1',
            `${y1}px`
        );

        char.style.setProperty(
            '--char-x2',
            `${x2}px`
        );

        char.style.setProperty(
            '--char-y2',
            `${y2}px`
        );

        char.style.setProperty(
            '--char-x3',
            `${x3}px`
        );


        char.classList.remove(
            'glitch-char-active'
        );

        void char.offsetWidth;

        char.classList.add(
            'glitch-char-active'
        );


        const timeout =
            setTimeout(() => {

                char.classList.remove(
                    'glitch-char-active'
                );

            }, 130);

        glitchTimeouts.push(timeout);
    }
}


// =====================================================
// WORD GLITCH
// =====================================================

function glitchWords() {

    const words =
        Array.from(
            document.querySelectorAll(
                '.glitch-word'
            )
        );

    if (!words.length) return;


    if (Math.random() > 0.55) return;


    const word =
        words[
            Math.floor(
                Math.random() *
                words.length
            )
        ];


    word.style.setProperty(
        '--word-x1',
        `${random(-7, 7)}px`
    );

    word.style.setProperty(
        '--word-x2',
        `${random(-5, 8)}px`
    );

    word.style.setProperty(
        '--word-x3',
        `${random(-4, 4)}px`
    );


    word.classList.remove(
        'glitch-word-active'
    );

    void word.offsetWidth;

    word.classList.add(
        'glitch-word-active'
    );


    const timeout =
        setTimeout(() => {

            word.classList.remove(
                'glitch-word-active'
            );

        }, 150);

    glitchTimeouts.push(timeout);
}


// =====================================================
// GLITCH RECTANGLES
// =====================================================

function createGlitchRectangles() {

    const container =
        document.querySelector(
            '.typing-text'
        );

    if (!container) return;


    const rect =
        container.getBoundingClientRect();


    // متوسط: 3 تا 6 قطعه
    const count =
        Math.floor(
            random(3, 7)
        );


    for (let i = 0; i < count; i++) {

        const rectangle =
            document.createElement('div');


        rectangle.className =
            'glitch-rectangle';


        // اندازه
        const width =
            random(
                18,
                Math.min(
                    150,
                    rect.width * 0.45
                )
            );


        const height =
            random(1, 4);


        // موقعیت
        const left =
            random(
                0,
                Math.max(
                    0,
                    rect.width - width
                )
            );


        const top =
            random(
                0,
                rect.height
            );


        rectangle.style.width =
            `${width}px`;

        rectangle.style.height =
            `${height}px`;

        rectangle.style.left =
            `${left}px`;

        rectangle.style.top =
            `${top}px`;


        // سیاه یا سفید
        if (Math.random() < 0.55) {

            rectangle.classList.remove(
                'black'
            );

        } else {

            rectangle.classList.add(
                'black'
            );
        }


        // حرکت
        rectangle.style.setProperty(
            '--x1',
            `${random(-15, 15)}px`
        );

        rectangle.style.setProperty(
            '--x2',
            `${random(-25, 25)}px`
        );

        rectangle.style.setProperty(
            '--x3',
            `${random(-12, 12)}px`
        );

        rectangle.style.setProperty(
            '--x4',
            `${random(-5, 5)}px`
        );


        rectangle.style.setProperty(
            '--opacity',
            `${random(0.45, 0.9)}`
        );


        rectangle.style.setProperty(
            '--duration',
            `${random(80, 160)}ms`
        );


        container.appendChild(
            rectangle
        );


        const timeout =
            setTimeout(() => {

                rectangle.remove();

            }, 180);

        glitchTimeouts.push(timeout);
    }
}


// =====================================================
// TEXT FRAGMENT
// =====================================================

function createTextFragment() {

    const lines =
        Array.from(
            document.querySelectorAll(
                '.glitch-line'
            )
        );

    if (!lines.length) return;


    // حدود 35% مواقع
    if (Math.random() > 0.35) return;


    const source =
        lines[
            Math.floor(
                Math.random() *
                lines.length
            )
        ];


    const rect =
        source.getBoundingClientRect();


    const container =
        document.querySelector(
            '.typing-text'
        );


    const containerRect =
        container.getBoundingClientRect();


    const fragment =
        document.createElement('div');


    fragment.className =
        'glitch-fragment';


    fragment.textContent =
        source.textContent;


    // قسمت تصادفی از خط
    const sliceHeight =
        random(
            3,
            Math.max(
                5,
                rect.height * 0.3
            )
        );


    const sliceTop =
        random(
            0,
            Math.max(
                0,
                rect.height - sliceHeight
            )
        );


    fragment.style.height =
        `${sliceHeight}px`;


    fragment.style.left =
        `${rect.left - containerRect.left}px`;


    fragment.style.top =
        `${rect.top - containerRect.top + sliceTop}px`;


    fragment.style.clipPath =
        `inset(${sliceTop}px 0 ${
            Math.max(
                0,
                rect.height -
                sliceTop -
                sliceHeight
            )
        }px 0)`;


    fragment.style.setProperty(
        '--x1',
        `${random(-15, 15)}px`
    );

    fragment.style.setProperty(
        '--x2',
        `${random(-30, 30)}px`
    );

    fragment.style.setProperty(
        '--x3',
        `${random(-10, 10)}px`
    );

    fragment.style.setProperty(
        '--duration',
        `${random(80, 150)}ms`
    );


    container.appendChild(
        fragment
    );


    const timeout =
        setTimeout(() => {

            fragment.remove();

        }, 170);

    glitchTimeouts.push(timeout);
}


// =====================================================
// FLICKER
// =====================================================

function glitchFlicker() {

    if (Math.random() > 0.3) return;


    mainElement.classList.remove(
        'glitch-flicker'
    );

    void mainElement.offsetWidth;

    mainElement.classList.add(
        'glitch-flicker'
    );


    const timeout =
        setTimeout(() => {

            mainElement.classList.remove(
                'glitch-flicker'
            );

        }, 130);

    glitchTimeouts.push(timeout);
}


// =====================================================
// CLEAR GLITCH
// =====================================================

function clearGlitch() {

    glitchTimeouts.forEach(
        timeout => clearTimeout(timeout)
    );

    glitchTimeouts = [];


    document
        .querySelectorAll(
            '.glitch-char-active'
        )
        .forEach(element => {

            element.classList.remove(
                'glitch-char-active'
            );
        });


    document
        .querySelectorAll(
            '.glitch-word-active'
        )
        .forEach(element => {

            element.classList.remove(
                'glitch-word-active'
            );
        });


    document
        .querySelectorAll(
            '.glitch-rectangle, .glitch-fragment'
        )
        .forEach(element => {

            element.remove();
        });


    mainElement.classList.remove(
        'glitch-flicker'
    );
}


// =====================================================
// FULL GLITCH
// =====================================================

function applyFullGlitch() {

    if (glitchRunning) return;

    if (!mainElement) return;

    glitchRunning = true;


    // مهم:
    // clearGlitch اینجا structure متن را دست نمی‌زند.
    clearGlitch();


    // 1. چند حرف
    glitchCharacters();


    // 2. گاهی یک کلمه
    glitchWords();


    // 3. مستطیل‌ها
    createGlitchRectangles();


    // 4. گاهی تکه‌ای از خط
    createTextFragment();


    // 5. گاهی flicker
    glitchFlicker();


    // مدت glitch
    const duration =
        random(100, 190);


    const timeout =
        setTimeout(() => {

            clearGlitch();

            glitchRunning = false;

        }, duration);


    glitchTimeouts.push(timeout);
}


// =====================================================
// TYPEWRITER
// =====================================================

function typeWriter(
    text,
    element,
    speed = 100,
    callback = null
) {

    let i = 0;

    let fullTextTyped = '';


    function type() {

        if (i >= text.length) {

            // فقط بعد از اتمام کامل تایپ
            element.innerHTML =
                buildGlitchStructure(text);


            setupBaroonClick();
            setupDeveloperDblClick();


            if (callback) {
                callback();
            }

            return;
        }


        fullTextTyped +=
            text.charAt(i);

        element.textContent =
            fullTextTyped;

        i++;


        // -----------------------------------------
        // GLITCH DURING TYPING
        // -----------------------------------------

        // در هنگام تایپ، glitch سبک‌تر
        if (Math.random() < 0.16) {

            createTypingGlitch();
        }


        let currentSpeed =
            speed;


        const char =
            text.charAt(i - 1);


        if ('.!?'.includes(char)) {

            currentSpeed =
                speed * 2;

        } else if (',:'.includes(char)) {

            currentSpeed =
                speed * 1.5;

        } else if (char === '\n') {

            currentSpeed =
                speed * 1.5;
        }


        const variation =
            0.9 +
            Math.random() * 0.2;


        setTimeout(
            type,
            currentSpeed * variation
        );
    }


    type();
}


// =====================================================
// GLITCH DURING TYPING
// =====================================================

function createTypingGlitch() {

    const container =
        document.querySelector(
            '.typing-text'
        );

    if (!container) return;


    const rect =
        container.getBoundingClientRect();


    // فقط 1 تا 3 مستطیل
    const count =
        Math.floor(random(1, 4));


    for (let i = 0; i < count; i++) {

        const rectangle =
            document.createElement('div');


        rectangle.className =
            'glitch-rectangle';


        const width =
            random(15, 100);


        const height =
            random(1, 3);


        rectangle.style.width =
            `${width}px`;

        rectangle.style.height =
            `${height}px`;


        rectangle.style.left =
            `${random(
                0,
                Math.max(
                    0,
                    rect.width - width
                )
            )}px`;


        rectangle.style.top =
            `${random(
                0,
                rect.height
            )}px`;


        if (Math.random() < 0.5) {

            rectangle.classList.add(
                'black'
            );
        }


        rectangle.style.setProperty(
            '--x1',
            `${random(-8, 8)}px`
        );

        rectangle.style.setProperty(
            '--x2',
            `${random(-14, 14)}px`
        );

        rectangle.style.setProperty(
            '--x3',
            `${random(-6, 6)}px`
        );

        rectangle.style.setProperty(
            '--x4',
            `0px`
        );

        rectangle.style.setProperty(
            '--opacity',
            `${random(0.4, 0.75)}`
        );

        rectangle.style.setProperty(
            '--duration',
            `${random(60, 120)}ms`
        );


        container.appendChild(
            rectangle
        );


        setTimeout(() => {

            rectangle.remove();

        }, 130);
    }
}


// =====================================================
// BAROON CLICK
// =====================================================

function setupBaroonClick() {

    document
        .querySelectorAll('.baroon-word')
        .forEach(element => {

            element.style.cursor =
                'pointer';


            element.addEventListener(
                'mouseenter',
                () => {

                    element.style.textDecoration =
                        'underline';

                    element.style.textDecorationColor =
                        'rgba(255,255,255,0.4)';

                    element.style.textUnderlineOffset =
                        '3px';
                }
            );


            element.addEventListener(
                'mouseleave',
                () => {

                    element.style.textDecoration =
                        'none';
                }
            );


            element.addEventListener(
                'click',
                function(event) {

                    event.stopPropagation();


                    // چند glitch پشت سر هم
                    for (let i = 0; i < 6; i++) {

                        setTimeout(() => {

                            applyFullGlitch();

                        }, i * 70);
                    }


                    setTimeout(() => {

                        window.location.href =
                            "../HTML/access.html";

                    }, 500);
                }
            );
        });
}


// =====================================================
// DEVELOPER DOUBLE CLICK
// =====================================================

function setupDeveloperDblClick() {

    document
        .querySelectorAll('.glitch-word')
        .forEach(word => {

            if (
                word.textContent.trim() ===
                'Developer'
            ) {

                word.style.cursor =
                    'default';


                word.addEventListener(
                    'dblclick',
                    function(event) {

                        event.stopPropagation();


                        for (let i = 0; i < 6; i++) {

                            setTimeout(() => {

                                applyFullGlitch();

                            }, i * 70);
                        }


                        setTimeout(() => {

                            window.location.href =
                                "../HTML/dev-enter.html";

                        }, 500);
                    }
                );
            }
        });
}


// =====================================================
// START PAGE
// =====================================================

function startPage() {

    const isVerified =
        localStorage.getItem(
            'deviceVerified'
        ) === 'true';


    const isDev =
        localStorage.getItem(
            'devAccess'
        ) === 'true';


    const lastPanel =
        localStorage.getItem(
            'lastPanel'
        );


    // User already verified
    if (
        isVerified &&
        lastPanel === 'user'
    ) {

        window.location.href =
            "../HTML/main.html";

        return;
    }


    // Developer already verified
    if (
        isDev &&
        lastPanel === 'dev'
    ) {

        window.location.href =
            "../HTML/dev.html";

        return;
    }


    // Start empty
    mainElement.innerHTML = '';


    setTimeout(() => {

        typeWriter(
            fullText,
            mainElement,
            100,
            () => {

                // ---------------------------------
                // TYPING FINISHED
                // ---------------------------------

                setTimeout(() => {

                    glitchInterval =
                        setInterval(() => {

                            // glitch معمولی
                            if (
                                Math.random() <
                                0.38
                            ) {

                                applyFullGlitch();
                            }

                        }, 700);

                }, 300);
            }
        );

    }, 500);
}


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    startPage
);