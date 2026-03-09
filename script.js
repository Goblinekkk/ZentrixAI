// --- KONFIGURACE ---
const API_KEY = "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"; 

let currentModel = "Qwen/Qwen2.5-72B-Instruct";

// --- TÉMA (DARK/LIGHT) ---
function toggleDarkMode() {
    const body = document.body;
    const btn = document.getElementById('theme-btn');
    if (body.classList.contains('light-mode')) {
        body.classList.replace('light-mode', 'dark-mode');
        btn.innerText = "Light";
    } else {
        body.classList.replace('dark-mode', 'light-mode');
        btn.innerText = "Dark";
    }
}

// --- NAVIGACE ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function setModel(path) {
    currentModel = path;
    appendMsg('ai', `Model přepnut na: ${path.split('/')[1]}`);
    toggleSidebar();
}

function showChat() {
    document.getElementById('chat-container').classList.remove('hidden');
    document.getElementById('crypto-container').classList.add('hidden');
    toggleSidebar();
}

function showCrypto() {
    document.getElementById('chat-container').classList.add('hidden');
    document.getElementById('crypto-container').classList.remove('hidden');
    loadCrypto();
    toggleSidebar();
}

// --- AI LOGIKA ---
async function send() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);
    input.value = '';

    try {
        const res = await fetch(`https://api-inference.huggingface.co/models/${currentModel}`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${API_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                inputs: text,
                parameters: { max_new_tokens: 500, return_full_text: false }
            })
        });

        const data = await res.json();
        if (data.error && data.error.includes("loading")) {
            appendMsg('ai', "Probouzím AI server... Zkus to za 15 sekund.");
        } else {
            const reply = Array.isArray(data) ? data[0].generated_text : data.generated_text;
            appendMsg('ai', reply.trim());
        }
    } catch (e) {
        appendMsg('ai', "Chyba připojení k mozku.");
    }
}

function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerText = (role === 'user' ? '> ' : '') + text;
    document.getElementById('messages').appendChild(div);
    window.scrollTo(0, document.body.scrollHeight);
}

// --- CRYPTO DATA ---
async function loadCrypto() {
    const list = document.getElementById('crypto-list');
    list.innerHTML = 'Načítám trh...';
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        list.innerHTML = '';
        for (const [id, val] of Object.entries(data)) {
            const ch = val.usd_24h_change.toFixed(2);
            list.innerHTML += `
                <div class="crypto-item">
                    <span style="text-transform:uppercase; font-weight:bold;">${id}</span>
                    <span>$${val.usd.toLocaleString()}</span>
                    <span class="${ch >= 0 ? 'up' : 'down'}">${ch}%</span>
                </div>`;
        }
    } catch (e) { list.innerHTML = 'Chyba API.'; }
}

// Enter pro odeslání
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') send();
});

window.onload = () => appendMsg('ai', "Zentrix AI připraven.");
