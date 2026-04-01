let APP_DATA = null;

async function loadData() {
    try {
        const t = new Date().getTime();
        const resp = await fetch(`./signos.json?t=${t}`);
        if (!resp.ok) throw new Error("Não encontrei o arquivo signos.json");
        APP_DATA = await resp.json();
        render();
    } catch (e) {
        alert("Erro crítico: " + e.message);
    }
}

function render() {
    const grid = document.getElementById("signGrid");
    grid.innerHTML = APP_DATA.signs.map((s, i) => `
        <div class="sign-card" onclick="openModal(${i})">
            <span class="sign-symbol">${s.symbol}</span>
            <strong>${s.name}</strong>
        </div>
    `).join('');
    
    // Conteúdo destaque
    document.getElementById("featuredSignTitle").textContent = APP_DATA.signs[0].name;
    document.getElementById("featuredSignText").textContent = APP_DATA.signs[0].summary;
}

function openModal(i) {
    const s = APP_DATA.signs[i];
    document.getElementById("modalTitle").textContent = s.name;
    document.getElementById("modalSymbol").textContent = s.symbol;
    document.getElementById("modalDates").textContent = s.dates;
    document.getElementById("modalSummary").textContent = s.summary;
    document.getElementById("modalLove").textContent = s.love;
    document.getElementById("modalWork").textContent = s.work;
    document.getElementById("modalWellness").textContent = s.wellness;
    document.getElementById("modalAdvice").textContent = s.advice;
    document.getElementById("modalLuckyColor").textContent = "Cor: " + s.color;

    document.getElementById("signModal").classList.add("open");
}

document.getElementById("modalClose").onclick = () => {
    document.getElementById("signModal").classList.remove("open");
};

loadData();
