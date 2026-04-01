let APP_DATA = null;

async function loadData() {
    try {
        const t = new Date().getTime();
        const resp = await fetch(`./signos.json?t=${t}`);
        APP_DATA = await resp.json();
        render();
        initAds(); // Chama a função de anúncios
    } catch (e) {
        console.error("Erro ao carregar dados", e);
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
    
    const day = new Date().getDate();
    const featured = APP_DATA.signs[day % APP_DATA.signs.length];
    document.getElementById("featuredSignTitle").textContent = featured.name + " em destaque";
    document.getElementById("featuredSignText").textContent = featured.summary;
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
    document.getElementById("modalLuckyColor").textContent = "Cor do dia: " + s.color;

    document.getElementById("signModal").classList.add("open");
    
    // Notificar Android que abrimos um signo (útil para analytics/ads)
    if(window.Android) window.Android.showInterstitial(); 
}

document.getElementById("modalClose").onclick = () => {
    document.getElementById("signModal").classList.remove("open");
};

// INTEGRAÇÃO COM ANDROID STUDIO (ADMOB)
function initAds() {
    try {
        if (window.Android) {
            window.Android.loadBanner("ad-slot-top");
            window.Android.loadBanner("ad-slot-bottom");
        }
    } catch (e) {
        console.log("Interface Android não detectada");
    }
}

loadData();
