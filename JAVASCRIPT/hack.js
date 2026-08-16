document.addEventListener('DOMContentLoaded', () => {
    const terminalOutput = document.getElementById('terminal-output');
    const inputField = document.getElementById('terminal-input');
    const runBtn = document.getElementById('terminal-send-btn');
    // const hackTab = document.getElementById('hack-tab'); // این قسمت دیگه استفاده نمیشه

    let PROMPT = "user@terminal:~#";
    let commandHistory = [];
    let historyIndex = -1;
    const availableCommands = {
        // ==========================================
        // 🎮 FUN, GAMES & CREATIVE COMMANDS (بالا)
        // ==========================================
        
        'clear': { 
            description: 'Clear the terminal screen', 
            func: () => { terminalOutput.innerHTML = ""; } 
        },
        'help': { 
            description: 'Show available commands', 
            func: () => { displayHelp() } 
        },
        'status': { 
            description: 'Show system status', 
            func: () => { addTerminalLine("System status: All systems nominal."); } 
        },
        'time': { 
            description: 'Show current system time', 
            func: () => { addTerminalLine("Current time: " + new Date().toLocaleTimeString()); } 
        },
        'echo': { 
            description: 'Print text to the terminal', 
            func: (args) => { addTerminalLine(args.join(" ")); } 
        },
        
        // --- بازی‌ها (Games) ---
        'guess': { 
            description: 'Play a number guessing game (1-100)', 
            func: () => { 
            const target = Math.floor(Math.random() * 100) + 1;
            addTerminalLine("🎮 Game: Guess the number (1-100). Type 'exit' to quit.");
            addTerminalLine(`(Hint: I'm thinking of a number...)`);
            // نکته: برای بازی واقعی نیاز به هندل کردن ورودی کاربر دارید، اینجا فقط شروع بازی را نشان می‌دهیم
            addTerminalLine("Waiting for your input...");
            } 
        },
        'rps': { 
            description: 'Play Rock-Paper-Scissors', 
            func: () => { 
            const choices = ['Rock', 'Paper', 'Scissors'];
            const userChoice = choices[Math.floor(Math.random() * 3)];
            const cpuChoice = choices[Math.floor(Math.random() * 3)];
            addTerminalLine("🎮 Rock-Paper-Scissors!");
            addTerminalLine(`You chose: ${userChoice}`);
            addTerminalLine(`CPU chose: ${cpuChoice}`);
            if (userChoice === cpuChoice) {
                addTerminalLine("Result: It's a tie!");
            } else if (
                (userChoice === 'Rock' && cpuChoice === 'Scissors') ||
                (userChoice === 'Paper' && cpuChoice === 'Rock') ||
                (userChoice === 'Scissors' && cpuChoice === 'Paper')
            ) {
                addTerminalLine("Result: You Win! 🎉");
            } else {
                addTerminalLine("Result: CPU Wins! 🤖");
            }
            } 
        },
        'maze': { 
            description: 'Generate a simple ASCII maze', 
            func: () => { 
            const maze = `
        +---+---+---+---+---+
        |   |   |   |   |   |
        +   +   +   +   +   +
        |   |   |   |   |   |
        +   +   +   +   +   +
        |   |   |   |   |   |
        +---+---+---+---+---+
        Start: Top-Left | End: Bottom-Right
        `;
            addTerminalLine(maze);
            addTerminalLine("Navigate the maze by typing 'up', 'down', 'left', 'right'.");
            } 
        },
        'fortune': { 
            description: 'Get a random fortune cookie message', 
            func: () => { 
            const fortunes = [
                "A beautiful, smart, and loving person will be coming to you.",
                "A period of struggle will be followed by a period of success.",
                "You will be surprised by a pleasant surprise.",
                "Your future depends on what you do today.",
                "The best way to predict the future is to create it.",
                "You will soon receive a pleasant surprise.",
                "A new adventure awaits you."
            ];
            const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
            addTerminalLine(`🔮 Fortune: "${randomFortune}"`);
            } 
        },
        'joke': { 
            description: 'Tell a random programming joke', 
            func: () => { 
            const jokes = [
                "Why do programmers prefer dark mode? Because light attracts bugs.",
                "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
                "Why did the developer go broke? Because he used up all his cache.",
                "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
                "There are only 10 types of people in the world: those who understand binary, and those who don't."
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            addTerminalLine(`😂 ${randomJoke}`);
            } 
        },
        'ascii': { 
            description: 'Display ASCII art', 
            func: () => { 
            const art = `
        _   _      _    _ _ 
        | | | |    | |  | | |
        | |_| | ___| |  | | |
        |  _  |/ _ \\ |  | | |
        | | | |  __/ |__| | |
        \\_| |_/\\___|\\____/|_|
            `;
            addTerminalLine(art);
            } 
        },
        'matrix': { 
            description: 'Simulate Matrix rain effect', 
            func: () => { 
            addTerminalLine("Initializing Matrix Rain Protocol...");
            const chars = '01XYZ';
            let count = 0;
            const maxLines = 10;
            
            const interval = setInterval(() => {
                if (count >= maxLines) {
                clearInterval(interval);
                addTerminalLine("Matrix Rain stopped.");
                return;
                }
                let line = '';
                for(let i=0; i<30; i++) line += chars[Math.floor(Math.random() * chars.length)] + ' ';
                addTerminalLine(line);
                count++;
            }, 100);
            } 
        },
        'glitch': { 
            description: 'Simulate a system glitch', 
            func: () => { 
            const glitchText = "S_Y_S_T_E_M_ _C_O_R_R_U_P_T_E_D_";
            addTerminalLine(glitchText);
            setTimeout(() => addTerminalLine("R_E_S_T_A_R_T_I_N_G_..."), 1000);
            setTimeout(() => addTerminalLine("System recovered."), 2000);
            } 
        },
        'confetti': { 
            description: 'Release digital confetti', 
            func: () => { 
            const colors = ['🎉', '🎊', '✨', '🎈'];
            let output = '';
            for(let i=0; i<30; i++) {
                output += colors[Math.floor(Math.random() * colors.length)] + ' ';
            }
            addTerminalLine(output);
            } 
        },
        'cheat': { 
            description: 'Activate cheat mode (Unlimited Resources)', 
            func: () => { 
            addTerminalLine("✅ Cheat Mode: UNLIMITED RESOURCES ACTIVATED!");
            addTerminalLine("Money: ∞ | Ammo: ∞ | Health: ∞");
            } 
        },
        'dance': { 
            description: 'Make the terminal dance', 
            func: () => { 
            const moves = ["🕺", "💃", "🤸", "🤸‍♂️", "🤸‍♀️", "🕺", "💃"];
            let i = 0;
            const interval = setInterval(() => {
                addTerminalLine(moves[i % moves.length]);
                i++;
                if (i > 10) {
                clearInterval(interval);
                addTerminalLine("Dance complete!");
                }
            }, 300);
            } 
        },
        'quote': { 
            description: 'Show a random inspirational quote', 
            func: () => { 
            const quotes = [
                "The only way to do great work is to love what you do.",
                "Code is like humor. When you have to explain it, it's bad.",
                "Simplicity is the soul of efficiency.",
                "First, solve the problem. Then, write the code.",
                "Experience is the name everyone gives to their mistakes."
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            addTerminalLine(`💡 Quote: "${randomQuote}"`);
            } 
        },
        'ping': { 
            description: 'Ping a host', 
            func: (args) => { 
            const target = args[0] || '192.168.1.1';
            addTerminalLine(`PING ${target} (192.168.1.1): 56 data bytes`);
            for (let i = 1; i <= 4; i++) {
                setTimeout(() => {
                const time = (Math.random() * 50 + 10).toFixed(2);
                addTerminalLine(`64 bytes from ${target}: icmp_seq=${i} ttl=64 time=${time} ms`);
                if (i === 4) addTerminalLine(`--- ${target} ping statistics ---`);
                }, i * 1000);
            }
            } 
        },
        'dir': { 
            description: 'List directory contents with details', 
            func: () => { 
            const files = [
                { perm: 'drwxr-xr-x', user: 'root', size: '4096', date: 'Oct 12 10:00', name: 'bin' },
                { perm: '-rw-r--r--', user: 'www-data', size: '1024', date: 'Oct 12 10:05', name: 'index.html' },
                { perm: '-rw-------', user: 'root', size: '256', date: 'Oct 12 09:30', name: 'secret_key.pem' },
                { perm: 'drwxr-xr-x', user: 'root', size: '4096', date: 'Oct 12 11:00', name: 'var' },
                { perm: '-rwxr-xr-x', user: 'root', size: '8192', date: 'Oct 12 08:00', name: 'init.sh' }
            ];
            addTerminalLine("Listing directory contents with details...");
            files.forEach((file, index) => {
                setTimeout(() => {
                addTerminalLine(`${file.perm} ${file.user.padEnd(10)} ${file.size.toString().padStart(5)} ${file.date} ${file.name}`);
                if (index === files.length - 1) addTerminalLine("[+] Listing complete.");
                }, index * 600);
            });
            } 
        },
        'whoami': { 
            description: 'Display current user info', 
            func: () => { 
            addTerminalLine("User: guest");
            addTerminalLine("UID: 1000");
            addTerminalLine("GID: 1000");
            addTerminalLine("Groups: www-data, users");
            addTerminalLine("Home: /home/guest");
            addTerminalLine("Shell: /bin/bash");
            } 
        },
        'history': { 
            description: 'Show command history', 
            func: () => { 
            const history = ['ls', 'cd /var', 'ping google.com', 'hackmode', 'status'];
            addTerminalLine("Command History:");
            history.forEach((cmd, i) => {
                setTimeout(() => {
                addTerminalLine(`${i + 1}  ${cmd}`);
                }, i * 300);
            });
            } 
        },
        'network': { 
            description: 'Show network topology', 
            func: () => { 
            addTerminalLine("Scanning local network topology...");
            const devices = [
                { ip: '192.168.1.1', type: 'Gateway', status: 'Online' },
                { ip: '192.168.1.15', type: 'Laptop (Admin)', status: 'Online' },
                { ip: '192.168.1.22', type: 'IoT Camera', status: 'Offline' },
                { ip: '192.168.1.105', type: 'Server (DB)', status: 'Online' }
            ];
            devices.forEach((dev, i) => {
                setTimeout(() => {
                const statusColor = dev.status === 'Online' ? '[OK]' : '[X]';
                addTerminalLine(`${statusColor} ${dev.ip} | ${dev.type} | ${dev.status}`);
                if (i === devices.length - 1) addTerminalLine("[+] Network scan complete.");
                }, i * 800);
            });
            } 
        },

        // ==========================================
        // ☠️ HACKING & DESTRUCTION COMMANDS (پایین)
        // ==========================================

        'hackmode': { 
            description: 'Enable advanced hacking interface', 
            func: () => { activateHackMode(); } 
        },
        'recon': { 
            description: 'Start network reconnaissance simulation', 
            func: () => { startRecon(); } 
        },
        'scan': { 
            description: 'Scan for open ports simulation', 
            func: (args) => { startScan(args); } 
        },
        'exploit': { 
            description: 'Attempt to exploit a vulnerability simulation', 
            func: (args) => { attemptExploit(args); } 
        },
        'enum': { 
            description: 'Enumerate user privileges simulation', 
            func: () => { enumerateUsers(); } 
        },
        'ls': { 
            description: 'List files and directories simulation', 
            func: () => { listFiles(); } 
        },
        'cat': { 
            description: 'Display file content simulation', 
            func: (args) => { displayFileContent(args); } 
        },

        // --- نفوذ و دسترسی (Intrusion & Access) ---
        'connect': { 
            description: 'Connect to a remote server', 
            func: (args) => { 
            const target = args[0] || 'unknown.target';
            addTerminalLine(`Connecting to ${target}...`);
            setTimeout(() => addTerminalLine("Resolving host..."), 800);
            setTimeout(() => addTerminalLine("Handshake initiated..."), 1600);
            setTimeout(() => {
                if (Math.random() > 0.2) {
                addTerminalLine(`[+] Connection established to ${target} (Port 22).`);
                addTerminalLine("Authentication required.");
                } else {
                addTerminalLine("[-] Connection timed out. Target unreachable.");
                }
            }, 2500);
            } 
        },
        'bruteforce': { 
            description: 'Brute-force attack on a user account', 
            func: (args) => { 
            const user = args[0] || "admin";
            addTerminalLine(`Starting brute-force attack on user: ${user}...`);
            const passwords = ["123456", "password", "admin", "qwerty", "letmein", "welcome", "secret", "hacker"];
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                const guess = passwords[Math.floor(Math.random() * passwords.length)];
                addTerminalLine(`Trying: ${guess}... [FAIL]`);
                if (attempts > 6) {
                clearInterval(interval);
                addTerminalLine(`[+] SUCCESS! Password found: "hacker"`);
                addTerminalLine("Session started.");
                }
            }, 600);
            } 
        },
        'inject': { 
            description: 'SQL Injection attack simulation', 
            func: (args) => { 
            const table = args[0] || "users";
            addTerminalLine(`Injecting SQL payload into table: ${table}...`);
            setTimeout(() => addTerminalLine("Payload: ' OR '1'='1' --"), 500);
            setTimeout(() => addTerminalLine("Executing query..."), 1200);
            setTimeout(() => {
                if (Math.random() > 0.3) {
                addTerminalLine("[+] SQL Injection successful!");
                addTerminalLine("Retrieving data...");
                setTimeout(() => addTerminalLine("ID: 1, User: admin, Pass: *****"), 1500);
                setTimeout(() => addTerminalLine("ID: 2, User: guest, Pass: *****"), 1800);
                setTimeout(() => addTerminalLine("[+] Data dump complete."), 2200);
                } else {
                addTerminalLine("[-] SQL Injection failed. WAF detected.");
                }
            }, 2000);
            } 
        },
        'phish': { 
            description: 'Generate a phishing page', 
            func: (args) => { 
            const target = args[0] || "bank-login";
            addTerminalLine(`Generating phishing page for ${target}...`);
            setTimeout(() => addTerminalLine("Creating HTML template..."), 600);
            setTimeout(() => addTerminalLine("Injecting keylogger script..."), 1200);
            setTimeout(() => addTerminalLine("Deploying to server..."), 1800);
            setTimeout(() => {
                addTerminalLine(`[+] Phishing page active at: http://fake-${target}.com`);
                addTerminalLine("Waiting for victim credentials...");
            }, 2500);
            } 
        },
        'backdoor': { 
            description: 'Create a backdoor on a specific port', 
            func: (args) => { 
            const port = args[0] || "4444";
            addTerminalLine(`Creating backdoor on port ${port}...`);
            setTimeout(() => addTerminalLine("Opening socket..."), 600);
            setTimeout(() => addTerminalLine("Binding to process..."), 1200);
            setTimeout(() => {
                addTerminalLine(`[+] Backdoor active on port ${port}.`);
                addTerminalLine("Waiting for reverse shell connection...");
            }, 2000);
            } 
        },
        'rootkit': { 
            description: 'Install a rootkit for stealth', 
            func: () => { 
            addTerminalLine("Installing rootkit...");
            setTimeout(() => addTerminalLine("Modifying kernel modules..."), 800);
            setTimeout(() => addTerminalLine("Hiding processes..."), 1600);
            setTimeout(() => addTerminalLine("Hiding files..."), 2400);
            setTimeout(() => {
                addTerminalLine("[+] Rootkit installed successfully.");
                addTerminalLine("You are now invisible to the system.");
            }, 3200);
            } 
        },
        'geo': { 
            description: 'Spoof IP location to a specific country', 
            func: (args) => { 
            const country = args[0] || "Russia";
            addTerminalLine(`Spoofing IP location to ${country}...`);
            setTimeout(() => addTerminalLine("Routing through proxy chain..."), 600);
            setTimeout(() => addTerminalLine("Bypassing firewall..."), 1200);
            setTimeout(() => {
                addTerminalLine(`[+] Location spoofed to ${country}.`);
                addTerminalLine("IP: 185.220.101.45 (Anonymized)");
            }, 2000);
            } 
        },

        // --- تخریب و نابودی (Destruction & Chaos) ---
        'wipe': { 
            description: 'Wipe all data from the disk (Destructive)', 
            func: () => { 
            addTerminalLine("⚠️ WARNING: This will wipe all data!");
            addTerminalLine("Are you sure? (Type 'yes' to confirm)");
            setTimeout(() => addTerminalLine("Executing wipe command..."), 1000);
            setTimeout(() => addTerminalLine("Deleting /boot..."), 1500);
            setTimeout(() => addTerminalLine("Deleting /home..."), 2000);
            setTimeout(() => addTerminalLine("Deleting /var..."), 2500);
            setTimeout(() => addTerminalLine("Formatting partitions..."), 3000);
            setTimeout(() => addTerminalLine("[!] System wiped. Rebooting..."), 3500);
            } 
        },
        'encrypt': { 
            description: 'Encrypt system files (Ransomware sim)', 
            func: (args) => { 
            const file = args[0] || "system_files";
            addTerminalLine(`Encrypting ${file} with AES-256...`);
            let files = ["doc1.txt", "doc2.txt", "image.jpg", "config.sys"];
            let count = 0;
            const interval = setInterval(() => {
                if (count >= files.length) {
                clearInterval(interval);
                addTerminalLine("[+] Encryption complete. All files locked.");
                addTerminalLine("Ransom note generated.");
                return;
                }
                addTerminalLine(`Encrypting: ${files[count]}...`);
                count++;
            }, 700);
            } 
        },
        'ddos': { 
            description: 'Simulate a DDoS attack', 
            func: (args) => { 
            const target = args[0] || "target.server.com";
            addTerminalLine(`Initiating DDoS attack on ${target}...`);
            addTerminalLine("Spawning botnet nodes...");
            let packets = 0;
            const interval = setInterval(() => {
                packets += Math.floor(Math.random() * 5000);
                addTerminalLine(`Packets sent: ${packets.toLocaleString()} | Target Load: ${Math.min(100, Math.floor(packets/1000))}%`);
                if (packets > 50000) {
                clearInterval(interval);
                addTerminalLine("[+] Target server crashed. Service unavailable.");
                }
            }, 300);
            } 
        },
        'virus': { 
            description: 'Compile a computer virus', 
            func: (args) => { 
            const name = args[0] || "Trojan.Win32";
            addTerminalLine(`Compiling ${name}...`);
            setTimeout(() => addTerminalLine("Injecting payload..."), 500);
            setTimeout(() => addTerminalLine("Obfuscating code..."), 1000);
            setTimeout(() => addTerminalLine("Packaging executable..."), 1500);
            setTimeout(() => {
                addTerminalLine(`[+] ${name}.exe created.`);
                addTerminalLine("Ready to spread.");
            }, 2200);
            } 
        },
        'crypto': { 
            description: 'Start cryptocurrency mining simulation', 
            func: (args) => { 
            const coin = args[0] || "Bitcoin";
            addTerminalLine(`Starting ${coin} mining...`);
            let hashRate = 0;
            const interval = setInterval(() => {
                hashRate += Math.floor(Math.random() * 100);
                addTerminalLine(`Hashrate: ${hashRate} MH/s | Shares: ${Math.floor(hashRate/1000)}`);
                if (hashRate > 5000) {
                clearInterval(interval);
                addTerminalLine(`[+] Block found! +0.05 ${coin}`);
                }
            }, 500);
            } 
        },
        'portscan': { 
            description: 'Scan for open ports on a target', 
            func: (args) => { 
            const target = args[0] || '192.168.1.50';
            addTerminalLine(`Scanning ports on ${target}...`);
            const ports = [21, 22, 23, 80, 443, 3306, 8080, 8443];
            ports.forEach((port, index) => {
                setTimeout(() => {
                const isOpen = Math.random() > 0.5;
                if (isOpen) {
                    addTerminalLine(`[+] Port ${port} is OPEN (Service: ${port === 22 ? 'SSH' : 'HTTP'})`);
                } else {
                    addTerminalLine(`[-] Port ${port} is filtered.`);
                }
                if (index === ports.length - 1) addTerminalLine("[+] Scan complete.");
                }, index * 500);
            });
            } 
        },
        'download': { 
            description: 'Download a file from the server', 
            func: (args) => { 
            const file = args[0] || "database_dump.sql";
            addTerminalLine(`Downloading ${file}...`);
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.floor(Math.random() * 15);
                if (progress > 100) progress = 100;
                addTerminalLine(`Progress: ${progress}%`);
                if (progress === 100) {
                clearInterval(interval);
                addTerminalLine(`[+] Download complete: ${file} (2.4 MB)`);
                }
            }, 400);
            } 
        },
        'log': { 
            description: 'Read system logs', 
            func: () => { 
            addTerminalLine("Reading system logs...");
            const logs = [
                "Oct 12 10:00:01 kernel: System boot",
                "Oct 12 10:05:22 sshd: Accepted password for root",
                "Oct 12 10:10:45 cron: Job started",
                "Oct 12 10:15:00 kernel: Warning: High CPU usage",
                "Oct 12 10:20:11 sshd: Failed password for invalid user"
            ];
            logs.forEach((log, i) => {
                setTimeout(() => addTerminalLine(log), i * 400);
            });
            setTimeout(() => addTerminalLine("[+] Log reading complete."), logs.length * 400);
            } 
        },
        'netstat': { 
            description: 'Show active network connections', 
            func: () => { 
            addTerminalLine("Active connections:");
            const connections = [
                "TCP 0.0.0.0:22 0.0.0.0:0 LISTEN",
                "TCP 192.168.1.5:45000 93.184.216.34:80 ESTABLISHED",
                "UDP 0.0.0.0:53 0.0.0.0:0 *",
                "TCP 192.168.1.5:8080 10.0.0.1:5000 TIME_WAIT"
            ];
            connections.forEach((conn, i) => {
                setTimeout(() => addTerminalLine(conn), i * 600);
            });
            setTimeout(() => addTerminalLine("[+] Netstat complete."), connections.length * 600);
            } 
        },
        'whois': { 
            description: 'Get domain registration info', 
            func: (args) => { 
            const domain = args[0] || "example.com";
            addTerminalLine(`Looking up WHOIS for ${domain}...`);
            setTimeout(() => addTerminalLine("Querying registry..."), 500);
            setTimeout(() => addTerminalLine("Domain: example.com"), 1000);
            setTimeout(() => addTerminalLine("Registrar: Example Registrar Inc."), 1500);
            setTimeout(() => addTerminalLine("Created: 1995-08-14"), 2000);
            setTimeout(() => addTerminalLine("Expires: 2025-08-13"), 2500);
            setTimeout(() => addTerminalLine("[+] WHOIS lookup complete."), 3000);
            } 
        }
    };


    // --- History Management ---
    function addCommandToHistory(cmd) {
        if (cmd && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd)) {
            commandHistory.push(cmd);
        }
        historyIndex = commandHistory.length;
    }

    function navigateHistory(direction) {
        if (commandHistory.length === 0) return;

        historyIndex += direction;

        if (historyIndex < 0) {
            historyIndex = 0;
        } else if (historyIndex >= commandHistory.length) {
            historyIndex = commandHistory.length - 1;
        }

        inputField.value = commandHistory[historyIndex];
        inputField.focus();
    }

    // --- Autocomplete ---
    function autoCompleteCommand() {
        const currentInput = inputField.value.toLowerCase();
        const matchingCommands = Object.keys(availableCommands).filter(cmd => cmd.startsWith(currentInput));

        if (matchingCommands.length === 1) {
            inputField.value = matchingCommands[0];
            inputField.focus();
        } else if (matchingCommands.length > 1) {
            //addTerminalLine("Available commands:");
            //matchingCommands.forEach(cmd => {
            //    addTerminalLine(`- ${cmd}: ${availableCommands[cmd].description}`);
            //});
            //inputField.focus();

            // اگر بیش از یک دستور وجود داشت، اولین دستور را انتخاب کن
             inputField.value = matchingCommands[0];
             inputField.focus();
        }
    }

    // --- Terminal Output ---
    function addTerminalLine(textOrArray, isCommand = false) {
        // اگر ورودی یک رشته بود، آن را به آرایه تبدیل کن تا منطق یکسان باشد
        const lines = Array.isArray(textOrArray) ? textOrArray : [textOrArray];
        
        let currentIndex = 0;

        function typeNextLine() {
            if (currentIndex >= lines.length) return;

            const text = lines[currentIndex];
            const newLine = document.createElement('div');
            newLine.classList.add('terminal-line');

            const textSpan = document.createElement('span');
            
            // تنظیم کلاس‌ها بر اساس نوع خط
            if (isCommand) {
                const promptSpan = document.createElement('span');
                promptSpan.classList.add('prompt');
                promptSpan.textContent = PROMPT + " ";
                newLine.appendChild(promptSpan);
                textSpan.classList.add('command-text');
            } else {
                textSpan.classList.add('output-text');
            }
            
            newLine.appendChild(textSpan);
            terminalOutput.appendChild(newLine);

            // --- افکت تایپ زنده برای خط فعلی ---
            let i = 0;
            const speed = isCommand ? 50 : 30; // سرعت تایپ (میلی‌ثانیه)
            
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    textSpan.textContent += text.charAt(i);
                    i++;
                    // اسکرول خودکار هنگام تایپ
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                } else {
                    // وقتی تایپ خط فعلی تمام شد
                    clearInterval(typeInterval);
                    currentIndex++;
                    // بلافاصله خط بعدی را تایپ کن
                    typeNextLine();
                }
            }, speed);
        }

        // شروع تایپ اولین خط
        typeNextLine();
    }

    function addDynamicText(firstArg, ...restArgs) {
        const newLine = document.createElement('div');
        newLine.classList.add('terminal-line');
        
        const textSpan = document.createElement('span');
        textSpan.classList.add('output-text');
        newLine.appendChild(textSpan);
        terminalOutput.appendChild(newLine);

        // 1. تایپ زنده برای ورودی اول (ثابت)
        let currentText = "";
        let i = 0;
        const typeSpeed = 40; // سرعت تایپ (میلی‌ثانیه)

        const typeInterval = setInterval(() => {
            if (i < firstArg.length) {
                currentText += firstArg.charAt(i);
                textSpan.textContent = currentText;
                i++;
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            } else {
                clearInterval(typeInterval);
                // بعد از تمام شدن تایپ اول، شروع به نمایش و جایگزینی بقیه می‌کنیم
                startAlternating(restArgs);
            }
        }, typeSpeed);

        // 2. تابع جایگزینی ورودی‌های بعدی (بعد از متن ثابت)
        function startAlternating(args) {
            if (args.length === 0) return;

            let index = 0;
            const delay = 500; // فاصله زمانی بین هر تغییر (500 میلی‌ثانیه = 0.5 ثانیه)

            const replaceInterval = setInterval(() => {
                if (index < args.length) {
                    // نمایش متن ثابت + متن جدید
                    textSpan.textContent = `${firstArg}: ${args[index]}`;
                    index++;
                } else {
                    // اگر تمام شد، می‌توانیم دوباره از اول شروع کنیم یا متوقف شویم
                    // اینجا متوقف می‌کنیم (اگر می‌خواهید لوپ شود، این قسمت را تغییر دهید)
                    clearInterval(replaceInterval);
                }
            }, delay);
        }
    }


    // --- Command Execution ---
    function executeCommand(fullCommand) {
        const commandLine = fullCommand.trim();
        if (!commandLine) return;

        addTerminalLine(commandLine, true);
        addCommandToHistory(commandLine);

        const [command, ...args] = commandLine.split(" ");
        const commandExecutor = availableCommands[command.toLowerCase()];

        if (commandExecutor) {
            try {
                commandExecutor.func(args);
            } catch (error) {
                // خطاها هم ساده نمایش داده میشن
                addTerminalLine(`Error executing command "${command}": ${error.message}`);
            }
        } else {
            addTerminalLine(`Command not found: ${command}. Type 'help' for a list of commands.`);
        }
    }

    // --- Specific Command Logic ---
    function displayHelp() {
        // نمایش راهنما به صورت ساده
        addTerminalLine("--- AVAILABLE COMMANDS ---");
        for (const cmd in availableCommands) {
            addTerminalLine(`${cmd}: ${availableCommands[cmd].description}`);
        }
        addTerminalLine("------------------------");
    }

    function activateHackMode() {
        PROMPT = "root@hacked:~#"; // فقط prompt تغییر می‌کنه
        addTerminalLine("[+] HACK MODE ACTIVATED. Welcome, Admin.");
        addTerminalLine("[+] Proceed with caution. All systems are go.");
        // دیگر تغییرات ظاهری مانند پس‌زمینه حذف شد
    }

    // --- شبیه‌سازی دستورات هک (بدون تغییر ظاهری خاص) ---
    function startRecon() {
        addTerminalLine("Starting network reconnaissance...");
        setTimeout(() => addTerminalLine("Target IP: 192.168.1.101"), 500);
        setTimeout(() => addTerminalLine("Open ports: 80, 443, 22"), 2000);
        setTimeout(() => addTerminalLine("Target system: Debian Linux v11"), 3500);
        setTimeout(() => addTerminalLine("[+] Reconnaissance complete."), 5000);
    }

    function startScan(args) {
        const targetIp = args[0] || "192.168.1.101";
        addTerminalLine(`Scanning ${targetIp}...`);
        setTimeout(() => addTerminalLine("Port 80: Open"), 1000);
        setTimeout(() => addTerminalLine("Port 443: Open"), 2000);
        setTimeout(() => addTerminalLine("Port 22: Filtered"), 3000);
        setTimeout(() => addTerminalLine("[+] Scan finished."), 4000);
    }

    function attemptExploit(args) {
        const target = args[0];
        if (!target) {
            addTerminalLine("Usage: exploit <target_ip>");
            return;
        }
        addTerminalLine(`Exploiting ${target}...`);
        const successChance = Math.random();
        setTimeout(() => {
            if (successChance > 0.4) {
                addTerminalLine("[+] Exploit successful! Gained shell access.");
                addTerminalLine("Welcome to the system. You are now root.");
                PROMPT = "root@shell:/#"; // تغییر prompt برای نشان دادن دسترسی شل
            } else {
                addTerminalLine("[-] Exploit failed. Target defenses blocked the attempt.");
            }
        }, 3000);
    }
    
    function enumerateUsers() {
        addTerminalLine("Enumerating user privileges...");
        setTimeout(() => addTerminalLine("Current user: www-data"), 1000);
        setTimeout(() => addTerminalLine("Checking sudo privileges..."), 2000);
        setTimeout(() => addTerminalLine("[-] No sudo privileges found."), 3500);
        setTimeout(() => addTerminalLine("[+] Enumeration complete."), 4000);
    }

    function listFiles() {
        addTerminalLine("Listing directory contents...");
        setTimeout(() => addTerminalLine("etc/"), 500);
        setTimeout(() => addTerminalLine("var/"), 1000);
        setTimeout(() => addTerminalLine("index.html"), 1500);
        setTimeout(() => addTerminalLine("config.php"), 2000);
        setTimeout(() => addTerminalLine("usr/"), 2500);
        setTimeout(() => addTerminalLine("[+] Listing complete."), 3000);
    }

    function displayFileContent(args) {
        const filename = args[0];
        if (!filename) {
            addTerminalLine("Usage: cat <filename>");
            return;
        }
        addTerminalLine(`Displaying content of ${filename}...`);
        setTimeout(() => {
            if (filename === 'index.html') {
                addTerminalLine("<!DOCTYPE html>\n<html>\n<head>\n    <title>Hacked Page</title>\n</head>\n<body>\n    <h1>Welcome!</h1>\n</body>\n</html>");
            } else if (filename === 'config.php') {
                addTerminalLine("<?php\n$db_host = 'localhost';\n$db_pass = 'secret';\n?>");
            } else {
                addTerminalLine(`File not found: ${filename}`);
            }
        }, 1500);
    }


    // --- Event Listeners ---
    inputField.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            executeCommand(inputField.value);
            inputField.value = "";
            event.preventDefault(); // جلوگیری از رفتن به خط بعدی در input
        } else if (event.key === 'ArrowUp') {
            event.preventDefault(); // جلوگیری از حرکت کرسر
            navigateHistory(-1);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault(); // جلوگیری از حرکت کرسر
            navigateHistory(1);
        } else if (event.key === 'Tab') {
            event.preventDefault(); // جلوگیری از رفتار پیش‌فرض Tab
            autoCompleteCommand();
        }
    });

    runBtn.addEventListener('click', () => {
        executeCommand(inputField.value);
        inputField.value = "";
    });

    // Initial setup
    addTerminalLine("Welcome to the Nexus Terminal v2.0.");
    addTerminalLine("Type 'help' for a list of commands.");
    inputField.focus();
});
