// --- KONFIGURACE ---
const GROQ_API_KEY = "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";

// --- NAVIGACE ---
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function navAction(section, resetChat = false) {
    const sections = ['chat', 'crypto', 'history'];
    sections.forEach(s => {
        document.getElementById(`${s}-section`).classList.add('hidden');
        document.getElementById(`${s}-section`).classList.remove('active');
    });

    const activeSec = document.getElementById(`${section}-section`);
    activeSec.classList.remove('hidden');
    activeSec.classList.add('active');

    if (resetChat && section === 'chat') {
        document.getElementById('chat-display').innerHTML = '';
        addMessage('ai', 'Systém resetován. Zentrix AI připraven k analýze.');
    }

    if (section === 'crypto') fetchCrypto();
    toggleSidebar();
}

// --- CRYPTO LOGIKA ---
async function fetchCrypto() {
    const container = document.getElementById('crypto-list');
    container.innerHTML = '<p style="text-align:center">Skenuji blockchain...</p>';
    
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        
        const coins = [
            { id: 'bitcoin', symbol: 'BTC' },
            { id: 'ethereum', symbol: 'ETH' },
            { id: 'solana', symbol: 'SOL' }
        ];

        container.innerHTML = '';
        coins.forEach(coin => {
            const info = data[coin.id];
            const change = info.usd_24h_change.toFixed(2);
            container.innerHTML += `
                <div class="crypto-card">
                    <div style="font-weight:bold; letter-spacing:1px">${coin.symbol}</div>
                    <div class="price">$${info.usd.toLocaleString()}</div>
                    <div class="${change >= 0 ? 'up' : 'down'}">${change}% (24h)</div>
                </div>
            `;
        });
    } catch (e) {
        container.innerHTML = '<p>Chyba při stahování dat. CoinGecko má limit požadavků.</p>';
    }
}

// --- AI CHAT LOGIKA ---
function checkEnter(e) { if (e.key === 'Enter') handleSendMessage(); }

function addMessage(type, text) {
    const display = document.getElementById('chat-display');
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.innerText = text;
    display.appendChild(div);
    display.scrollTop = display.scrollHeight;
}

async function handleSendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    addMessage('user', text);
    input.value = '';

    if (GROQ_API_KEY === "SEM_VLOŽ_SVŮJ_GROQ_API_KLÍČ") {
        setTimeout(() => addMessage('ai', 'Chyba: Není vložen API klíč.'), 500);
        return;
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: text }]
            })
        });
        const data = await response.json();
        addMessage('ai', data.choices[0].message.content);
    } catch (e) {
        addMessage('ai', 'Spojení se Zentrix jádrem selhalo.');
    }
}

// Inicializace
window.onload = () => addMessage('ai', 'Terminál Zentrix AI aktivován. Čekám na příkaz.');
