let currentModel = "Qwen/Qwen2.5-72B-Instruct";

// Uložení klíče do paměti prohlížeče
function saveKey() {
    const key = document.getElementById('keyInput').value.trim();
    if (key.startsWith('hf_')) {
        localStorage.setItem('hf_token', key);
        alert("Klíč uložen! Teď můžeš psát AI.");
        toggleSidebar();
    } else {
        alert("Neplatný formát klíče (musí začínat hf_)");
    }
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    document.getElementById('theme-btn').innerText = body.classList.contains('dark-mode') ? "LIGHT" : "DARK";
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }

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

function setModel(m) { 
    currentModel = m; 
    appendMsg('ai', `Aktivován mozek: ${m.split('/')[1]}`); 
    toggleSidebar();
}

async function send() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    const token = localStorage.getItem('hf_token');

    if (!token) {
        appendMsg('ai', "Chyba: Nejdříve vlož svůj Hugging Face klíč v Menu!");
        toggleSidebar();
        return;
    }

    if (!text) return;
    appendMsg('user', text);
    input.value = '';

    try {
        const res = await fetch(`https://api-inference.huggingface.co/models/${currentModel}`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ inputs: text, parameters: { max_new_tokens: 500, return_full_text: false } })
        });
        const data = await res.json();
        const reply = Array.isArray(data) ? data[0].generated_text : (data.generated_text || "Chyba modelu.");
        appendMsg('ai', reply);
    } catch (e) { appendMsg('ai', "Chyba spojení."); }
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
    list.innerHTML = 'Aktualizuji...';
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        list.innerHTML = '<h2 style="margin:20px 0">Trh</h2>';
        for (const [id, val] of Object.entries(data)) {
            list.innerHTML += `<div class="crypto-card"><b>${id.toUpperCase()}</b> <span>$${val.usd.toLocaleString()}</span> <span style="color:${val.usd_24h_change >= 0 ? '#00c853':'#ff3d00'}">${val.usd_24h_change.toFixed(2)}%</span></div>`;
        }
    } catch (e) { list.innerHTML = 'Chyba načítání dat.'; }
}

document.getElementById('userInput').addEventListener('keypress', (e) => { if(e.key === 'Enter') send(); });
window.onload = () => appendMsg('ai', "Vítej v Zentrixu. Pokud AI neodpovídá, vlož klíč v Menu.");
