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
// UTILITY
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


            const isBaroonWord =
                word === 'Baroon!' ||
                word === 'Baroon';

            const wordClass =
                isBaroonWord
                    ? 'glitch-word baroon-word'
                    : 'glitch-word';


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
// CLEAR GLITCH
// =====================================================

function clearGlitch() {

    glitchTimeouts.forEach(timeout => {
        clearTimeout(timeout);
    });

    glitchTimeouts = [];


    document
        .querySelectorAll(
            '.glitch-line, .glitch-word, .glitch-char'
        )
        .forEach(element => {

            element.style.transform = '';
            element.style.opacity = '';
        });


    if (mainElement) {

        mainElement.classList.remove(
            'glitch-active'
        );

        mainElement.style.transform = '';
        mainElement.style.opacity = '';
        mainElement.style.filter = '';
    }


    document
        .querySelectorAll('.glitch-bar')
        .forEach(bar => bar.remove());
}


// =====================================================
// CREATE GLITCH BARS
// =====================================================

function createGlitchBars(intensity = 1) {

    const container =
        document.querySelector('.typing-text');

    if (!container) return;


    const rect =
        container.getBoundingClientRect();


    const count =
        Math.floor(
            random(1, 3 + intensity)
        );


    for (let i = 0; i < count; i++) {

        const bar =
            document.createElement('div');

        bar.className =
            'glitch-bar';


        const width =
            random(
                25,
                Math.min(180, rect.width * 0.4)
            );


        const height =
            random(1, 2.5);


        const left =
            random(
                0,
                Math.max(0, rect.width - width)
            );


        const top =
            random(
                0,
                rect.height
            );


        bar.style.width =
            `${width}px`;

        bar.style.height =
            `${height}px`;

        bar.style.left =
            `${left}px`;

        bar.style.top =
            `${top}px`;


        // فقط سیاه و سفید
        bar.style.background =
            Math.random() < 0.5
                ? '#ffffff'
                : '#000000';


        container.appendChild(bar);


        const timeout =
            setTimeout(() => {

                bar.remove();

            }, random(100, 180));


        glitchTimeouts.push(timeout);
    }
}


// =====================================================
// APPLY GLITCH
// =====================================================

function applyFullGlitch(intensity = 1) {

    if (glitchRunning) return;

    if (!mainElement) return;

    glitchRunning = true;

    clearGlitch();


    // -------------------------------------------------
    // Main text
    // -------------------------------------------------

    mainElement.classList.add(
        'glitch-active'
    );


    // -------------------------------------------------
    // Lines
    // -------------------------------------------------

    document
        .querySelectorAll('.glitch-line')
        .forEach(line => {

            if (
                Math.random() <
                0.25 * intensity
            ) {

                const x =
                    random(-5, 5) * intensity;

                const y =
                    random(-1, 1) * intensity;

                line.style.transform =
                    `translate(${x}px, ${y}px)`;
            }
        });


    // -------------------------------------------------
    // Words
    // -------------------------------------------------

    document
        .querySelectorAll('.glitch-word')
        .forEach(word => {

            if (
                Math.random() <
                0.12 * intensity
            ) {

                const x =
                    random(-4, 4) * intensity;

                word.style.transform =
                    `translateX(${x}px)`;
            }
        });


    // -------------------------------------------------
    // Characters
    // -------------------------------------------------

    document
        .querySelectorAll('.glitch-char')
        .forEach(char => {

            if (
                Math.random() <
                0.08 * intensity
            ) {

                const x =
                    random(-3, 3) * intensity;

                char.style.transform =
                    `translateX(${x}px)`;
            }
        });


    // -------------------------------------------------
    // Horizontal bars
    // -------------------------------------------------

    createGlitchBars(intensity);


    // -------------------------------------------------
    // Cleanup
    // -------------------------------------------------

    const duration =
        random(100, 180);


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

        element.innerHTML =
            fullTextTyped;

        i++;


        // Glitch بسیار محدود هنگام تایپ
        if (Math.random() < 0.08) {

            applyFullGlitch(0.6);
        }


        let currentSpeed = speed;

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
            0.9 + Math.random() * 0.2;


        setTimeout(
            type,
            currentSpeed * variation
        );
    }


    type();
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
                function (event) {

                    event.stopPropagation();


                    // Glitch شدیدتر هنگام ورود
                    for (let i = 0; i < 6; i++) {

                        setTimeout(() => {

                            applyFullGlitch(1.8);

                        }, i * 75);
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
                    function (event) {

                        event.stopPropagation();


                        // Glitch شدیدتر هنگام ورود
                        for (let i = 0; i < 6; i++) {

                            setTimeout(() => {

                                applyFullGlitch(1.8);

                            }, i * 75);
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


    // Already logged in as user
    if (
        isVerified &&
        lastPanel === 'user'
    ) {

        window.location.href =
            "../HTML/main.html";

        return;
    }


    // Already logged in as developer
    if (
        isDev &&
        lastPanel === 'dev'
    ) {

        window.location.href =
            "../HTML/dev.html";

        return;
    }


    // Initial structure
    mainElement.innerHTML =
        buildGlitchStructure(fullText);


    // Start typewriter
    setTimeout(() => {

        typeWriter(
            fullText,
            mainElement,
            100,
            () => {

                setTimeout(() => {

                    // -------------------------------------------------
                    // Ambient glitch
                    // -------------------------------------------------

                    glitchInterval =
                        setInterval(() => {

                            if (
                                Math.random() <
                                0.28
                            ) {

                                applyFullGlitch(1);
                            }

                        }, 900);

                }, 500);
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