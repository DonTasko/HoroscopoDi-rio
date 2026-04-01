let APP_DATA = null;

// Frases para rotatividade (interesse)
const dailyQuotes = [
    "O universo não conspira contra ti, ele conspira a teu favor.",
    "A tua intuição é o teu superpoder. Ouve-a hoje.",
    "Grandes mudanças começam com pequenos passos.",
    "O que buscas também te está a buscar.",
    "A tua energia atrai a tua realidade."
];

async function loadData() {
    try {
        const t = new Date().getTime();
        const resp = await fetch(`./signos.json?t=${t}`);
        APP_DATA = await resp.json();
        
        // Data atual formatada
        document.getElementById("currentDate").textContent = new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
        
        // Frase do dia aleatória (baseada no dia do mês)
        document.getElementById("dailyQuote").textContent = dailyQuotes[new Date().getDate() % dailyQuotes.length];

        renderGrid();
    } catch (e) {
        console.error("Erro:", e);
    }
}

function renderGrid() {
    const grid = document.getElementById("signGrid");
    grid.innerHTML = APP_DATA.signs.map((s, i) => `
        <div class="sign-card" onclick="openSign(${i})">
            <span class="sign-symbol">${s.symbol}</span>
            <strong>${s.name}</strong>
        </div>
    `).join('');
}

function openSign(i) {
    const s = APP_DATA.signs[i];
    
    // Preencher dados básicos
    document.getElementById("modalTitle").textContent = s.name;
    document.getElementById("modalSymbol").textContent = s.symbol;
    document.getElementById("modalDates").textContent = s.dates;
    document.getElementById("modalSummary").textContent = s.summary;
    document.getElementById("modalLove").textContent = s.love;
    document.getElementById("modalWork").textContent = s.work;
    document.getElementById("modalWellness").textContent = s.wellness;
    document.getElementById("modalAdvice").textContent = s.advice;
    document.getElementById("modalLuckyColor").textContent = "🎨 Cor do Dia: " + s.color;

    // Gerar Números da Sorte (Lógica: fixa por signo/dia)
    const seed = new Date().getDate() + i;
    const nums = [];
    while(nums.length < 3) {
        let n = ((seed * (nums.length + 1)) % 99) + 1;
        if(!nums.includes(n)) nums.push(n);
    }
    document.getElementById("luckyBalls").innerHTML = nums.map(n => `<span class="ball">${n}</span>`).join('');

    document.getElementById("signModal").classList.add("open");
    
    // Adicionar ao histórico para o botão "Voltar" do Android funcionar
    window.history.pushState({modal: true}, "");
}

// Fechar Modal
const closeM = () => {
    document.getElementById("signModal").classList.remove("open");
    if(window.history.state?.modal) window.history.back();
};

document.getElementById("modalClose").onclick = closeM;
window.onpopstate = () => document.getElementById("signModal").classList.remove("open");

loadData();
