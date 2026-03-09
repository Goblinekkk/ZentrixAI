const API_KEY = "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";

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function showChat() {
    document.getElementById('chat-wrapper').classList.remove('hidden');
    document.getElementById('crypto-wrapper').classList.add('hidden');
    document.getElementById('messages').innerHTML = '';
    toggleSidebar();
}

function showCrypto() {
    document.getElementById('chat-wrapper').classList.add('hidden');
    document.getElementById('crypto-wrapper').classList.remove('hidden');
    loadCrypto();
    toggleSidebar();
}

function showHistory() {
    alert("Historie je ukládána pouze lokálně v této relaci.");
    toggleSidebar();
}

// Odesílání zpráv
async function send() {
    const input = document.getElementById('userInput');
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);
    input.value = '';

    if (API_KEY.includes("SEM VLOŽ")) {
        appendMsg('ai', "Chyba: Chybí API klíč v script.js.");
        return;
    }

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama3-8b-8192", messages: [{role: "user", content: text}] })
        });
        const data = await res.json();
        appendMsg('ai', data.choices[0].message.content);
    } catch (e) {
        appendMsg('ai', "Chyba připojení k jádru.");
    }
}

function appendMsg(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${role}`;
    msgDiv.innerText = (role === 'user' ? '> ' : '') + text;
    document.getElementById('messages').appendChild(msgDiv);
    window.scrollTo(0, document.body.scrollHeight);
}

// Crypto Fetch
async function loadCrypto() {
    const container = document.getElementById('crypto-data');
    container.innerHTML = 'Načítám...';
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        let html = '';
        for (const [id, val] of Object.entries(data)) {
            const change = val.usd_24h_change.toFixed(2);
            html += `<div class="crypto-item">
                <span>${id.toUpperCase()}</span>
                <span>$${val.usd.toLocaleString()}</span>
                <span class="${change >= 0 ? 'up' : 'down'}">${change}%</span>
            </div>`;
        }
        container.innerHTML = html;
    } catch (e) { container.innerHTML = 'Chyba API.'; }
}

// Enter pro odeslání
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') send();
});
