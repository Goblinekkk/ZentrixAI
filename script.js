// --- GLOBÁLNÍ PROMĚNNÉ ---
let currentModel = "Qwen/Qwen2.5-72B-Instruct";

// --- OPRAVA PAMĚTI (Spustí se jednou při načtení) ---
// Pokud máš potíže, odkomentuj řádek níže, ulož, načti web a pak ho zase smaž.
// localStorage.clear(); 

// --- NASTAVENÍ KLÍČE ---
function saveKey() {
    const keyInput = document.getElementById('keyInput');
    const key = keyInput.value.trim();
    
    if (key.startsWith('hf_')) {
        localStorage.setItem('hf_token', key);
        alert("Klíč byl úspěšně uložen do tvého prohlížeče!");
        keyInput.value = ""; // Vymazat pole pro bezpečnost
        toggleSidebar();
    } else {
        alert("Chyba: Klíč musí začínat písmeny 'hf_'");
    }
}

// --- PŘEPÍNAČE REŽIMŮ ---
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const btn = document.getElementById('theme-btn');
    btn.innerText = body.classList.contains('dark-mode') ? "LIGHT" : "DARK";
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// --- NAVIGACE ---
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

function setModel(modelPath) {
    currentModel = modelPath;
    appendMsg('ai', `Mozek přepnut na: ${modelPath.split('/')[1]}`);
    toggleSidebar();
}

// --- AI LOGIKA (ODESÍLÁNÍ) ---
async function send() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    const token = localStorage.getItem('hf_token');

    if (!text) return;

    // Kontrola, zda je klíč uložen
    if (!token) {
        appendMsg('ai', "Chyba: Nemáš uložený API klíč! Otevři MENU a vlož svůj hf_ kód.");
        return;
    }

    appendMsg('user', text);
    input.value = '';

    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${currentModel}`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                inputs: text,
                parameters: { max_new_tokens: 500, return_full_text: false }
            })
        });

        const data = await response.json();

        if (response.status === 401) {
            appendMsg('ai', "Chyba 401: Tvůj klíč je neplatný nebo zablokovaný. Vytvoř si nový (READ) na Hugging Face.");
        } else if (response.status === 503) {
            appendMsg('ai', "Model se právě načítá na serveru (503). Zkus to znovu za 15 sekund.");
        } else if (data.error) {
            appendMsg('ai', "Server hlásí chybu: " + data.error);
        } else {
            const aiReply = Array.isArray(data) ? data[0].generated_text : data.generated_text;
            appendMsg('ai', aiReply.trim());
        }

    } catch (error) {
        appendMsg('ai', "Technická chyba: Nepodařilo se navázat spojení se serverem.");
        console.error("Detail chyby:", error);
    }
}

// --- POMOCNÉ FUNKCE ---
function appendMsg(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    msgDiv.innerText = (role === 'user' ? '> ' : '') + text;
    document.getElementById('messages').appendChild(msgDiv);
    
    // Automatické scrollování dolů
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// --- CRYPTO DATA ---
async function loadCrypto() {
    const list = document.getElementById('crypto-list');
    list.innerHTML = '<p style="padding:20px">Načítám aktuální data z trhu...</p>';
    
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,binancecoin,ripple&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        
        list.innerHTML = '<h2 style="padding: 20px 0 10px 20px">Market Pulse</h2>';
        
        for (const [id, val] of Object.entries(data)) {
            const change = val.usd_24h_change || 0;
            const color = change >= 0 ? '#00c853' : '#ff3d00';
            
            list.innerHTML += `
                <div class="crypto-card" style="display:flex; justify-content:space-between; padding:15px 20px; border-bottom:1px solid var(--border)">
                    <span style="text-transform:uppercase; font-weight:bold">${id}</span>
                    <span>$${val.usd.toLocaleString()}</span>
                    <span style="color:${color}">${change.toFixed(2)}%</span>
                </div>`;
        }
    } catch (e) {
        list.innerHTML = '<p style="padding:20px; color:red">Chyba: Nepodařilo se načíst data o kryptoměnách.</p>';
    }
}

// --- EVENT LISTENERS ---
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') send();
});

// Startovací zpráva
window.onload = () => {
    if (!localStorage.getItem('hf_token')) {
        appendMsg('ai', "Vítej! Zentrix je připraven. Nejdříve vlož svůj API klíč v MENU.");
    } else {
        appendMsg('ai', "Zentrix AI je online. Jak ti mohu dnes pomoci?");
    }
};
