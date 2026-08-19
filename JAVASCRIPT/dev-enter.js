// ===== المنت‌ها =====
const codeInput = document.getElementById('code-input');
const backBtn = document.getElementById('back-btn');

// ===== رمز صحیح =====
const CORRECT_CODE = '13121389';

// ===== فوکوس خودکار =====
window.addEventListener('load', () => {
    setTimeout(() => {
        codeInput.focus();
    }, 300);
});

// ===== تابع بررسی رمز =====
function checkCode() {
    const enteredCode = codeInput.value.trim();
    
    if (enteredCode === CORRECT_CODE) {
        // ===== ذخیره در localStorage =====
        localStorage.setItem('devAccess', 'true');
        localStorage.setItem('deviceVerified', 'false');
        localStorage.setItem('lastPanel', 'dev');
        
        // ===== رفتن به Dev Panel =====
        window.location.href = '/HTML/dev.html';
    } else {
        // ===== رمز اشتباه =====
        codeInput.value = '';
        backBtn.classList.remove('hidden');
        codeInput.focus();
        
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
}

// ===== Event Listeners =====
codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkCode();
    }
});

backBtn.addEventListener('click', () => {
    window.location.href = '/';
});

document.addEventListener('click', () => {
    codeInput.focus();
});

codeInput.addEventListener('touchstart', (e) => {
    e.stopPropagation();
});

// ===== محدود کردن به 8 رقم =====
codeInput.addEventListener('input', () => {
    if (codeInput.value.length > 8) {
        codeInput.value = codeInput.value.slice(0, 8);
    }
});

console.log('🔐 Dev Enter page loaded');
console.log('📱 Enter the code to access Dev Panel');