const API_KEY = "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"; 
let currentModel = "Qwen/Qwen2.5-72B-Instruct";

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function toggleDarkMode() {
    const b = document.body;
    const btn = document.getElementById('theme-btn');
    if (b.classList.contains('light-mode')) {
        b.classList.replace('light-mode', 'dark-mode');
        btn.innerText = "LIGHT";
    } else {
        b.classList.replace('dark-mode', 'light-mode');
        btn.innerText = "DARK";
    }
}

function setModel(path) {
    currentModel = path;
    appendMsg('ai', `Přepnuto na mozek: ${path.split('/')[1]}`);
    toggleSidebar();
}

function showChat() {
    document.getElementById('chat-view').classList.remove('hidden');
    document.getElementById('crypto-view').classList.add('hidden');
    toggleSidebar();
}

function showCrypto() {
    document.getElementById('chat-view').classList.add('hidden');
    document.getElementById('crypto-view').classList.remove('hidden');
    loadCrypto();
    toggleSidebar();
}

async function send() {
    const input = document.getElementById('userInput');
    const val = input.value.trim();
    if (!val) return;

    appendMsg('user', val);
    input.value = '';

    try {
        const res = await fetch(`https://api-inference.huggingface.co/models/${currentModel}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: val, parameters: { max_new_tokens: 500, return_full_text: false } })
        });
        const data = await res.json();
        const reply = Array.isArray(data) ? data[0].generated_text : (data.generated_text || data.error);
        appendMsg('ai', reply);
    } catch (e) {
        appendMsg('ai', "Chyba připojení. Zkontroluj klíč.");
    }
}

function appendMsg(role, text) {
    const d = document.createElement('div');
    d.className = `msg ${role}`;
    d.innerText = (role === 'user' ? '> ' : '') + text;
    document.getElementById('messages').appendChild(d);
    window.scrollTo(0, document.body.scrollHeight);
}

async function loadCrypto() {
    const list = document.getElementById('crypto-list');
    list.innerHTML = 'Načítám ceny...';
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        list.innerHTML = '<h2 style="margin-bottom:20px">Market Pulse</h2>';
        for (const [id, val] of Object.entries(data)) {
            const change = val.usd_24h_change.toFixed(2);
            list.innerHTML += `
                <div class="crypto-card">
                    <span style="text-transform:uppercase; font-weight:bold">${id}</span>
                    <span>$${val.usd.toLocaleString()}</span>
                    <span class="${change >= 0 ? 'up' : 'down'}">${change}%</span>
                </div>`;
        }
    } catch (e) { list.innerHTML = 'Chyba API. Zkus to později.'; }
}

document.getElementById('userInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') send(); });
window.onload = () => appendMsg('ai', "Zentrix AI Online. Menu vlevo.");
