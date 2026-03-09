// --- KONFIGURACE ---
const API_KEY = "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"; // <-- SEM VLOŽ SVŮJ TOKEN

// --- STAV APLIKACE ---
let currentModel = "Qwen/Qwen2.5-72B-Instruct"; // Výchozí model

// --- NAVIGACE A MENU ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function showChat() {
    document.getElementById('chat-wrapper').classList.remove('hidden');
    document.getElementById('crypto-wrapper').classList.add('hidden');
    document.getElementById('messages').innerHTML = '';
    appendMsg('ai', `Zentrix AI připraven. Model: ${currentModel.split('/')[1]}`);
    toggleSidebar();
}

function showCrypto() {
    document.getElementById('chat-wrapper').classList.add('hidden');
    document.getElementById('crypto-wrapper').classList.remove('hidden');
    loadCrypto();
    toggleSidebar();
}

// --- VÝBĚR MODELU ---
function setModel(modelPath) {
    currentModel = modelPath;
    const modelName = modelPath.split('/')[1];
    appendMsg('system', `Přepnuto na model: ${modelName}`);
    toggleSidebar();
}

// --- AI CHAT LOGIKA ---
async function send() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);
    input.value = '';

    if (API_KEY.includes("SEM_VLOZ")) {
        appendMsg('ai', "Chyba: V souboru script.js chybí tvůj Hugging Face token.");
        return;
    }

    try {
        const res = await fetch(`https://api-inference.huggingface.co/models/${currentModel}`, {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${API_KEY}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                inputs: text,
                parameters: { 
                    max_new_tokens: 500,
                    return_full_text: false 
                }
            })
        });

        const data = await res.json();

        if (data.error && data.error.includes("currently loading")) {
            appendMsg('ai', "Model se startuje na serveru. Zkus to znovu za 15-20 sekund.");
        } else if (data.error) {
            appendMsg('ai', "Chyba: " + data.error);
        } else {
            const aiResponse = Array.isArray(data) ? data[0].generated_text : data.generated_text;
            appendMsg('ai', aiResponse.trim());
        }
    } catch (e) {
        appendMsg('ai', "Selhalo spojení se serverem Hugging Face.");
    }
}

function appendMsg(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    
    if (role === 'system') {
        msgDiv.style.color = "#999";
        msgDiv.style.fontSize = "12px";
        msgDiv.style.textAlign = "center";
        msgDiv.innerText = text;
    } else {
        msgDiv.innerText = (role === 'user' ? '> ' : '') + text;
    }
    
    document.getElementById('messages').appendChild(msgDiv);
    window.scrollTo(0, document.body.scrollHeight);
}

// --- CRYPTO LOGIKA ---
async function loadCrypto() {
    const container = document.getElementById('crypto-data');
    container.innerHTML = 'Aktualizuji trh...';
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        let html = '';
        for (const [id, val] of Object.entries(data)) {
            const change = val.usd_24h_change.toFixed(2);
            html += `
                <div class="crypto-item" style="border-bottom: 1px solid #eee; color: #000;">
                    <span style="font-weight:bold">${id.toUpperCase()}</span>
                    <span>$${val.usd.toLocaleString()}</span>
                    <span style="color: ${change >= 0 ? '#00aa66' : '#ff4444'}">${change}%</span>
                </div>`;
        }
        container.innerHTML = html;
    } catch (e) { container.innerHTML = 'Chyba načítání cen.'; }
}

// --- EVENT LISTENERS ---
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') send();
});

window.onload = () => {
    appendMsg('ai', "Zentrix AI Online. Vyber si model v menu a napiš zprávu.");
};
