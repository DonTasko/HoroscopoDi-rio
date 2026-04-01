let APP_DATA = null;

const signGrid = document.getElementById("signGrid");
const modal = document.getElementById("signModal");
const modalClose = document.getElementById("modalClose");
const toast = document.getElementById("toast");

// Elementos do Modal
const modalTitle = document.getElementById("modalTitle");
const modalSymbol = document.getElementById("modalSymbol");
const modalDates = document.getElementById("modalDates");
const modalSummary = document.getElementById("modalSummary");
const modalLove = document.getElementById("modalLove");
const modalWork = document.getElementById("modalWork");
const modalWellness = document.getElementById("modalWellness");
const modalAdvice = document.getElementById("modalAdvice");
const modalLuckyColor = document.getElementById("modalLuckyColor");

const featuredSignTitle = document.getElementById("featuredSignTitle");
const featuredSignText = document.getElementById("featuredSignText");
const dailyQuote = document.getElementById("dailyQuote");

// FUNÇÃO PARA CARREGAR DADOS SEM CACHE
async function loadData() {
  try {
    // Adicionamos um timestamp (?t=...) para garantir que o ficheiro é sempre novo
    const cacheBuster = new Date().getTime();
    const response = await fetch(`./signos.json?t=${cacheBuster}`, { 
      cache: "reload", // Força o browser a buscar a versão mais recente
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) throw new Error("Falha ao carregar signos.json");
    APP_DATA = await response.json();

    renderSigns();
    pickDailyContent();
    setupScrollReveal();
    setupActiveNav();
    setupButtons();
    setupModal();
    initAdHooks();
  } catch (error) {
    console.error(error);
    if (signGrid) {
      signGrid.innerHTML = `<div class="error-state">Erro ao carregar dados.</div>`;
    }
  }
}

function pickDailyContent() {
  if (!APP_DATA) return;
  const day = new Date().getDate();
  const signs = APP_DATA.signs || [];
  const quotes = APP_DATA.quotes || [];

  if (!signs.length) return;

  const featured = signs[day % signs.length];
  const quote = quotes.length ? quotes[day % quotes.length] : "Energia positiva hoje.";

  if (featuredSignTitle) featuredSignTitle.textContent = `${featured.name} — ${featured.vibe}`;
  if (featuredSignText) featuredSignText.textContent = featured.summary;
  if (dailyQuote) dailyQuote.textContent = quote;
}

function renderSigns() {
  if (!APP_DATA || !signGrid) return;
  const signs = APP_DATA.signs || [];

  signGrid.innerHTML = signs.map((sign, index) => `
    <button class="sign-card" data-index="${index}" aria-label="Abrir ${sign.name}">
      <div class="sign-symbol">${sign.symbol}</div>
      <strong>${sign.name}</strong>
      <span>${sign.vibe}</span>
    </button>
  `).join("");

  signGrid.querySelectorAll(".sign-card").forEach(card => {
    card.addEventListener("click", () => {
      openSignModal(Number(card.dataset.index));
    });
  });
}

function openSignModal(index) {
  if (!APP_DATA) return;
  const sign = APP_DATA.signs[index];
  if (!sign) return;

  modalTitle.textContent = sign.name;
  modalSymbol.textContent = sign.symbol;
  modalDates.textContent = sign.dates;
  modalSummary.textContent = sign.summary;
  modalLove.textContent = sign.love;
  modalWork.textContent = sign.work;
  modalWellness.textContent = sign.wellness;
  modalAdvice.textContent = sign.advice;
  modalLuckyColor.textContent = `Cor do dia: ${sign.color}`;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  
  // Botão Voltar Nativo
  history.pushState({ modalOpen: true }, "");
}

function closeModal(updateHistory = true) {
  modal.classList.remove("open");
  document.body.style.overflow = "";
  if (updateHistory && window.history.state?.modalOpen) {
    history.back();
  }
}

// Escuta o botão "Voltar" do Android
window.addEventListener("popstate", () => {
  if (modal.classList.contains("open")) closeModal(false);
});

function setupModal() {
  modalClose?.addEventListener("click", () => closeModal(true));
  modal?.addEventListener("click", (e) => { if (e.target === modal) closeModal(true); });
}

function setupButtons() {
  const btnTheme = document.getElementById("btnTheme");
  btnTheme?.addEventListener("click", () => {
    document.body.classList.toggle("alt-theme");
    localStorage.setItem("astro_alt_theme", document.body.classList.contains("alt-theme") ? "1" : "0");
  });
  
  // Outros botões (Share, etc) mantêm a lógica anterior...
}

function setupActiveNav() {
  const navLinks = document.querySelectorAll(".bottom-nav a");
  window.addEventListener("scroll", () => {
    let current = "home";
    document.querySelectorAll("section[id]").forEach(s => {
      if (s.getBoundingClientRect().top <= 150) current = s.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
    });
  }, { passive: true });
}

function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(item => observer.observe(item));
}

function initAdHooks() {
  console.log("Ads Ready");
}

// INÍCIO
loadData();
