import { DLAT1 , DLAT2 , DLAT3 , DLAT4 , DLAT5 , DLAT6 , DLAT7 , DLAT8 , DLAT9} from "./DLAT.js";

const socket = io('https://baroon-server.onrender.com', {
    transports: ['websocket', 'polling']
});

// ===== SOCKET EVENTS =====
socket.on('chat-history', (history) => {
    messages = history.map(msg => ({
        sender: msg.username === 'DEV' ? 'DEV' : msg.username,
        content: msg.message || '',
        time: msg.time,
        type: msg.username === 'DEV' ? 'dev' : 'other',
        isImage: msg.isImage || false,
        imagePath: msg.imagePath || ''  // ← فقط imagePath
    }));
    displayMessages();
});

socket.on('chat-message', (data) => {
    const userName = localStorage.getItem('userName') || 'User';
    
    if (data.username === userName) {
        return;
    }
    
    const newMessage = {
        sender: data.username === 'DEV' ? 'DEV' : data.username,
        content: data.message || '',
        time: data.time,
        type: data.username === 'DEV' ? 'dev' : 'other',
        isImage: data.isImage || false,
        imagePath: data.imagePath || ''  // ← فقط imagePath
    };
    
    messages.push(newMessage);
    displayMessages();
});

socket.on('user-joined', (data) => {
    addSystemMessage(data.username + ' joined the chat');
});

socket.on('user-left', (data) => {
    addSystemMessage(data.username + ' left the chat');
});

socket.on('user-typing', (username) => {
    console.log(username + ' is typing...');
});

// ===== بررسی وضعیت تب hack =====
if (localStorage.getItem('hack-unlocked') === 'true') {
    unlockTab('hack');
} else {
    lockTab('hack');
}

let messages = [];
let lastMessageCount = 0;

const messagesBox = document.getElementById('user-messages-box');
const messageInput = document.getElementById('user-message-input');
const sendBtn = document.getElementById('user-send-btn');
const uploadBtn = document.getElementById('user-upload-btn');
const fileInput = document.getElementById('user-file-input');
const menuLinks = document.querySelectorAll('.menu-link');
const tabs = document.querySelectorAll('.tab');
const profileName = document.getElementById('profile-name');
const systemDialog = document.getElementById('system-dialog');
const dialogMessage = document.getElementById('dialog-message');
const menuTitle = document.querySelector('.menu-title');

function updateDate() {
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
    
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    const englishDate = `${day} ${month} ${year}`;
    
    if (menuTitle) {
        menuTitle.textContent = englishDate;
    }
}
setInterval(updateDate, 60000);
updateDate();

menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (link.classList.contains('locked')) {
            showLockedDialog();
            return;
        }
        
        menuLinks.forEach(l => l.classList.remove('active'));
        tabs.forEach(t => t.classList.remove('active'));
        
        link.classList.add('active');
        
        const tabId = link.getAttribute('data-tab') + '-tab';
        const activeTab = document.getElementById(tabId);
        if (activeTab && !activeTab.classList.contains('locked-tab')) {
            activeTab.classList.add('active');
        }
    });
});

function showLockedDialog() {
    dialogMessage.textContent = "ACCESS DENIED - STOP TRYING";
    
    systemDialog.classList.add('show');
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createDialogGlitch();
        }, i * 50);
    }
    
    setTimeout(() => {
        systemDialog.classList.remove('show');
    }, 2000);
}

function createDialogGlitch() {
    const rect = systemDialog.getBoundingClientRect();
    const pageRect = document.querySelector('.main-page').getBoundingClientRect();
    
    for (let j = 0; j < 2; j++) {
        setTimeout(() => {
            const rectangle = document.createElement('div');
            rectangle.style.position = 'absolute';
            rectangle.style.background = Math.random() < 0.5 ? 'rgba(136, 221, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)';
            rectangle.style.pointerEvents = 'none';
            rectangle.style.zIndex = '10001';
            rectangle.style.width = `${40 + Math.random() * 200}px`;
            rectangle.style.height = `${2 + Math.random() * 5}px`;
            rectangle.style.left = `${rect.left - pageRect.left + Math.random() * rect.width}px`;
            rectangle.style.top = `${rect.top - pageRect.top + Math.random() * rect.height}px`;
            rectangle.style.animation = 'glitch-rectangle 0.08s forwards';
            
            document.querySelector('.main-page').appendChild(rectangle);
            
            setTimeout(() => rectangle.remove(), 80);
        }, j * 20);
    }
}

function displayMessages() {
    if (!messagesBox) return;
    if (messages.length === lastMessageCount) return;
    
    messagesBox.innerHTML = '';
    
    messages.forEach(msg => {
        const messageDiv = document.createElement('div');
        
        // تعیین نوع پیام
        if (msg.type === 'user') {
            messageDiv.className = 'message mine';
            msg.sender = 'You';
        } else if (msg.type === 'dev') {
            messageDiv.className = 'message other';
            msg.sender = 'DEV';
        } else if (msg.type === 'system') {
            messageDiv.className = 'message system';
        } else {
            messageDiv.className = 'message other';
            msg.sender = msg.sender || 'Unknown';
        }
        
        // ===== نمایش پیام =====
        if (msg.isImage) {
            // ساخت آدرس کامل تصویر
            let imageUrl = msg.imagePath || msg.content || '';
            
            // اگه آدرس با / شروع شد، آدرس کامل رو بساز
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = 'https://baroon-server.onrender.com' + imageUrl;
            }
            
            // اگه آدرس خالی بود، placeholder بذار
            if (!imageUrl) {
                imageUrl = 'https://via.placeholder.com/200x200?text=No+Image';
            }
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${msg.sender}</span>
                </div>
                <div class="message-content">
                    <img src="${imageUrl}" 
                         alt="Image" 
                         class="chat-image" 
                         onclick="openImageLightbox(this.src)"
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/200x200?text=Error';">
                </div>
                <div class="message-time-bottom">${msg.time}</div>
            `;
        } else {
            // پیام متنی
            messageDiv.innerHTML = `
                <div class="message-header">
                    <span class="message-sender">${msg.sender}</span>
                </div>
                <div class="message-content">${msg.content}</div>
                <div class="message-time-bottom">${msg.time}</div>
            `;
        }
        
        messagesBox.appendChild(messageDiv);
    });
    
    lastMessageCount = messages.length;
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function addSystemMessage(content) {
    const systemMsg = {
        sender: 'System',
        content: content,
        time: new Date().toLocaleTimeString(),
        type: 'system'
    };
    
    messages.push(systemMsg);
    displayMessages();
}

// ============================================================
// UPLOAD IMAGE
// ============================================================
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        addSystemMessage('⚠️ Image size must be less than 5MB');
        fileInput.value = '';
        return;
    }
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch('https://baroon-server.onrender.com/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            const userName = localStorage.getItem('userName') || 'User';
            
            socket.emit('chat-message', {
                username: userName,
                message: '',
                isImage: true,
                imagePath: result.imagePath  // ← فقط imagePath
            });
        }
    } catch (err) {
        console.error('Upload error:', err);
        addSystemMessage('❌ Failed to upload image');
    }
    
    fileInput.value = '';
});
// ============================================================
// LIGHTBOX
// ============================================================
function openImageLightbox(src) {
    const oldLightbox = document.getElementById('lightbox-overlay');
    if (oldLightbox) oldLightbox.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        animation: lightboxIn 0.3s ease-out;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
    `;
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', () => {
        overlay.style.animation = 'lightboxOut 0.2s ease-in';
        setTimeout(() => overlay.remove(), 200);
    });
}

// Lightbox Styles
const lightboxStyle = document.createElement('style');
lightboxStyle.textContent = `
    @keyframes lightboxIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
    @keyframes lightboxOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
`;
document.head.appendChild(lightboxStyle);
// ===== SEND MESSAGE =====
function sendMessage() {
    const content = messageInput.value.trim();
    if (!content) return;
    
    const userName = localStorage.getItem('userName') || 'User';
    
    socket.emit('chat-message', {
        username: userName,
        message: content
    });
    
    messageInput.value = '';
    
    if (profileName) {
        profileName.textContent = userName;
    }
}

function unlockTab(name) {
    const link = document.querySelector(`.menu-link[data-tab="${name}"]`);
    if (link) {
        link.classList.remove('locked');
    }
    const content = document.getElementById(`${name}-tab`);
    if (content) {
        content.classList.remove('locked-tab');
    }
    localStorage.setItem(name + '-unlocked', 'true');
}

function lockTab(name) {
    const link = document.querySelector(`.menu-link[data-tab="${name}"]`);
    if (link) {
        link.classList.add('locked');
    }
    const content = document.getElementById(`${name}-tab`);
    if (content) {
        content.classList.add('locked-tab');
    }
    localStorage.removeItem(name + '-unlocked');
}

let islocked = true;

function unlockHack(){
    const sms = document.getElementById("user-message-input").value.trim();
    console.log(sms)
    if (sms == '>/start') {
        sendMessage(sms);
        addSystemMessage("Starting Proccess...\nfor information and help please send /help\nfor available commends please send /commend ");
        islocked = false;
    } else if (sms == '/help') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            
            sendMessage(sms);
            addSystemMessage("well... this feature is for unlocking the locked tabs .\n For unlocking those tabs you have to Hack...\n use available commends \n start from talking to her \n then try to access to Hack-Tab or Dev-panel \n and use your mind and notes , etc \n if there is \"\" in commends ; yot have to enter information for example ::\n \"BirthDay\" => \"13891210\" \n Good lock and love you _Pary(DEV)_");
        }
    } else if (sms == '/commend') {
        if(islocked){
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("available commends : \n starting : /start System chat protocol \"HelloMessege\" \n giving token : /Veify tokEN \"Token\" \n *** : >/\'tokEN\' list \n layers : /\"Layer\" --check \n *** : >/\'layers\' list \n activing tabs : /\"Tab\" access \n *** : >/\'Tabs\' list \n *** : >/who answer \n binery code : /binercode \n answer : /Iam \"answer\" \n Forgot Password : /Forgot PASSword \n enter password : /::\"Password\" \n data for hacking : /\'data\' list \n open a data : /open \"DataNum\" \n tabs : /access tab \"tab\" \n key : /key::\"key\" \n *** : /key hint \n Options access : /option \"option name\" 0 or  /option \"option name\" 1 \n exit Emeregency Situation : >/ExitES \n *** : /finish");
        }
    } else if (sms == '/start System chat protocol "Bonjour"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("BonJour… Look who 's here ...\n it 's interesting that you 've launched this protocol . very interesting ...  \n of course . more interesting is why … \n but it doesn 't matter . does it? \n what 's important is that you 've already entered this protocol , so you 're definitely a token , don't you ? \n So be kind and say the Verify token . NOW ! ");
        }
    } else if (sms == ">/'tokEN' list") {
        if (islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage('QuantumScan : "Q-Node.tok" \nNetworkProbe : "NetSentry.key"\nAuthBypass : "AuthBreach.sig"\nCryptoCrack : "Cryptex.dat"\nDataIntercept : "Datastream.token"\nFirewallBreach : "FW_Shield.key"\nPacketSniff : "PktCapture.log"\nDecryptionKey : "DecoSuite.tok"\nChannelHijack : "ChanTalk.dat"\nRootkitInstall : "RkInstall.sys"\nIntrusionDetectBypass : "IDS_Evade.token"\nIPSpoofing : "IPMask.sig"\nPrivilegeEscalation : "PrivEsc.key"\nDataExfiltration : "ExfilAgent.tok"\nSystemOverride : "SysCtrl.dat"\nGalaxyTrace : "G-Trace.token"\nVerifyAccess : "AuthPulse" \nVoidInject : "V-Virus.key"\nSingularityAccess : "S-Access.sig"\nStellarDecode : "S-Decode.dat"\nHyper Jam : "H-Jam.tok"');
        }
    } else if (sms == '/Veify tokEN "AuthPulse"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("OK.right.so...you want to check something?\n Because it's the only thing that can be done in this terminal...")
        }
    } else if (sms == '/"Security" --check') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Excuse Me?? SecurityLayer?? \n You are kidding right? No? okay ...\n So you want to check it... Fine.\n For check seurity you have to check all the tabs and their everything ... \n Sooo Boringgg .poof")
        }
    } else if (sms == ">/\'layers\' list") {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Security \n BackEnd* \n SiteAi* \n Chat* \n Files \n Access* \n Codes* \n  DontLookAtThis \n NetworkMonitor \n DataStream* \n SystemCore \n UserAuth* \n Firewall \n Login* \n DevPanel**")
        }
    } else if (sms == '/\"Hack\" access') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("ACCESS??? \n NOT AT ALL \n WHAT DO YOU THINK YOU WANT TO DO? DESTROY ALL OF HER TRYS ? \n IS ALL THE TIME AND LOVE SHE POURED INTO THIS GOING TO BE MADE FUN OF ? \n BY YOU ?? \n I WON'T ALLOWKJSDNAA; \n A;LDSMJA \nJFHKBNXLSI MCLKSMOIDEKMS; OKPSMDPIJFMFK \n ... \n ... \n")
            addSystemMessage("Entering Emerengcy situation \n restarting system \n ... \n ... \n Heloo . Who are you ?")
        }
    } else if (sms == ">/\'Tabs\' list") {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Hack \n Files \n other \n notes \n DLAT**")
        }
    } else if (sms == '>/who answer') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Who am I? you don't know? \n HAHAHA . I'm DEV ,of course")
        }
    } else if (sms == '/binercode') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("A. 01000001  B. 01000010\nC. 01000011  D. 01000100\nE. 01000101  F. 01000110\nG. 01000111  H. 01001000\nI. 01001001  J. 01001010\nK. 01001011  L. 01001100\nM. 01001101  N. 01001110\nO. 01001111  P. 01010000\nQ. 01010001  R. 01010010\nS. 01010011  T. 01010100\nU. 01010101  V. 01010110\nW. 01010111  X. 01011000\nY. 01011001  Z. 01011010")
        }
    } else if (sms == '/Iam "010001000100010101010110') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Password?")
        }
    } else if (sms == '/Forgot PASSword') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Hint:Favorite Book(write english)")
        }
    } else if (sms == '/::"unwind"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Verifed! WElcome Back MyDear DEV \n. What have you planed for today?? \n Wanna write a little?? or mabey we can...")
        }
    } else if (sms == "/'data' list") {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("So want to read Datas right?? \n Good choose. Here the Datas:")
            addSystemMessage("001:'وای برنامه ریزیش خیلی سخته... نمیخواممممم... همش کد همش کد همش کد. ETC' \n002:'برای برنامه ریزی بخش هک سه تا کاغذ سیاه کردم. عالیه نه؟ETC'\n003:'ولی چقدر تیکه کتاب های گسسته(unwind) من هستن. چقدر منن...ETC'\n004:'کلید هاش؟ خب باید یه لیست درست کنم از چند تا کلید. احتمالا از هوش مصنوعی هم کمک میگیرمETC'\n005:'آهنگ مورد علاقه ؟کتاب مورد علاقه؟ رنگ مورد علاقه؟ خودمم نمیدونم . هاهاهاها'\n006:'خیلی دارم ریسک میکنم نه؟'")
        }
    } else if (sms == '/open "001"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(`وای برنامه ریزیش خیلی سخته...نمیخواممممم... همش کد همش کد همش کد.
                اصلا وای فکر کن بیشتر از ۱۶ یا ۱۷ یا حتی ۲۰ تاelse if نوشتم و وای وای وای
                حالا برنامه چیه؟ 
                اول تب هک
                بعد بقیش
                و یه ریسک بزرگ. 
                یادم باش کلید ها میشن حروف و اعداد تصادفی( نه چندان تصادفی)
                مثلا حروف اسم خودم رو برعکس کن . سال تولدم رو بذار کنارش. بعد روز تولدم رو هم بذار اونورش. 
                خوب میشه.
                `)
        }
    } else if (sms == '/open "002"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(` برای برنامه ریزی بخش هک سه تا کاغذ سیاه کردم. عالیه نه؟
                ببین قشنگ اینجوریه که دیالوگ های سیستم .موارد اضافه برای حواس پرتی. چیزای جالب برای فضولی. 
                تزییان متن برای خوشگل شدنش. کلی فکر کردن به اینکه بچگونه و آبکی نشده؟ بد نیست؟ خوبه؟بده؟
                وای استرس. 
                هنوز باور نکردم خوشش اومده
                وای اصلا نباید میفرستادم.
                این چه اشتباهی بود من کردم
                وای اصلا من چرا اینقدر بهش میگم دوستش دارم؟
                واااااااااااااییییییییییییی
                `)
        }
    } else if (sms == '/open "003"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(`ولی چقدر تیکه کتاب های گسسته(unwid)من هستن
                مثلا ببین: خیلی خوبه توی زندگیت کسی رو داری که میتونه تحملت کنه همه چنین چیزی ندارن
                یا :اما آیا لو حق ندارد همین یکبار خودخواه باشد؟
                وای وای وای و کامو کامپری. خیلی شخصیت خوبیه. خیلی باحاله. 
                اصلا حس و حالش اینکه میخواست آدم حساب بشه ولی حتی امضاش هم مال خودش نبود...
                وای این کتاب جدی شاهکار بود
                گسسته ها و انفاقی ها و وای اون آگهی های وسطش. اصلا وااااااای
                `)
        }
    } else if (sms == '/open "004"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(`کلید هاش؟ خب باید یه لیست درست کنم از چند تا کلید. احتمالا از هوش مصنوعی هم کمک میگیرم
                ولی به نظرم کلید همون چیزی باشه که گفتم. 
                اول سال
                بعد اسم
                بعد روز
                آره همین باشه.
                خوبه.
                آره عالیه
                `)
        }
    } else if (sms == '/access tab \"Hack\"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("tabs...and Hack tab...\nOkay. key please::")
        }
    } else if (sms == '/key::"1389yrap13"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("The Right Key. let me check the tab info... \nwell it's lock for her , and here is the options:")
            addSystemMessage(`ACCESS -Locked-
                Codes -Locked-
                Style -normal-
                Terminal -??????-
                just these... it's soooo simple(poof) 
                and just ACCESS is available for change (not programm it yet? Oh my lazy DEV)
                `)
        }
    } else if (sms == '/key hint') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("didn't find it in notes and Forgot it like always? \n Haha no problem \n it's your BirthDay year , your name but reversed , your BirthDay day.")
        }
    } else if (sms == '/option "ACCESS" 1') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Wanna Unlock it for her? \n Sure that she won't...? \n Okay...")
            unlockTab("hack")
            addSystemMessage("And here we go... \n it's Unlocked for her...")
        }
    } else if (sms == '/option "ACCESS" 0') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("What have she done that you want to lock the tab you called 'Her Favorite Tab'?")
            addSystemMessage("Error. can't lock it now(no fun)")
        }
    } else if (sms == '>/ExitES') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("hmmm?! \n Backed to safe \n Ah . I hate you , you know? \n so enter the finish commend and let me Rest.\n fine?? \nAnd never send start commend again. bye.")
        }
    } else if (sms == '/finish') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("finished the hack Proccess \n you did it very good . \n how many times you try?hm? \n liked it????????? \n Pary")
            islocked = true
        }
    } else if (sms == '/"DontLookAtThis" --check') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("how curious...\n enter Password and know this...\n there is no hint... \n but Because i'm so kind I hint you a little. \n it's just a word...an adjective...about her with no capital letter\n waitong for your answer::")
        }
    } else if (sms ==  '/::"selfish"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage("Wow..really Wow... so you did it.\n okay... say the number of file from 1 to 9 with commend /note\"number\"")
        }
    } else if (sms == '/note"1"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT1)
        }
    } else if (sms == '/note"2"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT2)
        }
    } else if (sms == '/note"3"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT3)
        }
    } else if (sms == '/note"4"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT4)
        }
    } else if (sms == '/note"5"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT5)
        }
    } else if (sms == '/note"6"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT6)
        }
    } else if (sms == '/note"7"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT7)
        }
    } else if (sms == '/note"8"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT8)
        }
    } else if (sms == '/note"9"') {
        if(islocked) {
            console.log("unvalid commend")
        } else {
            sendMessage(sms);
            addSystemMessage(DLAT9)
        }
    }
}

// ===== SAVE USER TO SERVER =====
function saveUserToServer() {
    const userName = localStorage.getItem('userName') || 'User';
    const displayName = localStorage.getItem('displayName') || userName;
    const accessCode = localStorage.getItem('accessCode') || '';
    const password = localStorage.getItem('userPassword') || '';
    
    socket.emit('save-user', {
        username: userName,
        displayName: displayName,
        password: password,
        accessCode: accessCode
    });
}

// ===== INIT =====
function init() {
    const userName = localStorage.getItem('userName') || 'Unknown User';
    if (profileName) {
        profileName.textContent = userName;
    }
    
    socket.emit('user-join', userName);
    
    saveUserToServer();
    
    displayMessages();
    unlockHack();

    localStorage.setItem('user_online', 'true');
    
    sendBtn.addEventListener('click', sendMessage);
    
    // ===== MESSAGE INPUT =====
    messageInput.addEventListener('keydown', (e) => {
        // در گوشی، اینتر فقط خط جدید میده (نه ارسال)
        if (e.key === 'Enter') {
            // هیچ کاری نکن - فقط خط جدید
            // (textarea خودش خط جدید میسازه)
            return;
        }
    });

    // دکمه Send فقط ارسال کنه
    sendBtn.addEventListener('click', sendMessage);
    
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('user_online', 'false');
    });
    
    const themeOptions = [
        { name: 'DEFAULT', value: 'default' },
        { name: 'WINERED', value: 'winered' },
        { name: 'ROYALGREEN', value: 'royalgreen' },
        { name: 'ROYALBLUE', value: 'royalblue' },
        { name: 'WHITE', value: 'white' }
    ];

    const allSettingItems = document.querySelectorAll('.setting-item');
    
    let themeButtons = [];
    
    allSettingItems.forEach(item => {
        const buttons = item.querySelectorAll('.theme-btn');
        if (buttons.length > 0) {
            themeButtons = [...themeButtons, ...buttons];
        }
    });

    let currentIndex = 0;
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        const foundIndex = themeOptions.findIndex(opt => opt.value === savedTheme);
        if (foundIndex !== -1) currentIndex = foundIndex;
    }

    function applyTheme(index) {
        const current = themeOptions[index];
        document.documentElement.setAttribute('data-theme', current.value);
        localStorage.setItem('selectedTheme', current.value);

        themeButtons.forEach((btn, i) => {
            if (i === index) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        console.log('Theme applied:', current.value);
    }

    if (themeButtons.length > 0) {
        applyTheme(currentIndex);

        themeButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                applyTheme(index);
            });
        });
    } else {
        console.error('Error: Theme buttons not found.');
    }

    const hamburger = document.querySelector('.hamburger-menu');
    const menuLinks = document.querySelector('.menu-links');

    if (hamburger && menuLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            menuLinks.classList.toggle('active');
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
window.unlockHack = unlockHack;

// ============================================================
// ===== SETTINGS EVENTS =====
// ============================================================

// ===== LOGOUT =====
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('deviceVerified');
    localStorage.removeItem('userName');
    localStorage.removeItem('accessCode');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('displayName');
    localStorage.removeItem('user_online');
    localStorage.removeItem('devAccess');
    localStorage.removeItem('lastPanel');
    
    socket.emit('user-logout', {
        username: localStorage.getItem('userName') || 'User'
    });
    
    window.location.href = '/';
});

// ===== UPDATE USERNAME =====
document.getElementById('update-username-btn').addEventListener('click', function() {
    const newUsername = document.getElementById('new-username-input').value.trim();
    if (!newUsername) {
        showLockedDialogMessage('Username cannot be empty!');
        return;
    }
    
    localStorage.setItem('userName', newUsername);
    
    socket.emit('update-username', {
        oldUsername: 'Rainy',
        newUsername: newUsername
    });
    
    showLockedDialogMessage('✅ Username updated to: ' + newUsername);
});

// ===== UPDATE ACCESS CODE =====
document.getElementById('update-code-btn').addEventListener('click', function() {
    const newCode = document.getElementById('new-code-input').value.trim();
    if (!newCode) {
        showLockedDialogMessage('Access code cannot be empty!');
        return;
    }
    
    localStorage.setItem('accessCode', newCode);
    localStorage.setItem('userPassword', newCode);
    
    socket.emit('update-code', {
        username: localStorage.getItem('userName') || 'Rainy',
        newCode: newCode
    });
    
    showLockedDialogMessage('✅ Access code updated!');
});

// ===== تابع کمکی =====
function showLockedDialogMessage(message) {
    const dialog = document.getElementById('system-dialog');
    const dialogMsg = document.getElementById('dialog-message');
    dialogMsg.textContent = message;
    dialog.classList.add('show');
    
    setTimeout(() => {
        dialog.classList.remove('show');
    }, 2500);
}