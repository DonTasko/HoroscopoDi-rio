
let APP_DATA = null;

const signGrid = document.getElementById("signGrid");
const modal = document.getElementById("signModal");
const modalClose = document.getElementById("modalClose");
const toast = document.getElementById("toast");

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

async function loadData() {
  try {
    const response = await fetch("./signos.json", { cache: "no-store" });
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
      signGrid.innerHTML = `
        <div class="error-state">
          Não foi possível carregar os dados do app.<br>
          Verifique se o ficheiro <strong>signos.json</strong> está na raiz do projeto.
        </div>
      `;
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
  const quote = quotes.length ? quotes[day % quotes.length] : "A tua energia encontra o caminho certo.";

  if (featuredSignTitle) {
    featuredSignTitle.textContent = `${featured.name} — ${featured.vibe}`;
  }

  if (featuredSignText) {
    featuredSignText.textContent = featured.summary;
  }

  if (dailyQuote) {
    dailyQuote.textContent = quote;
  }
}

function renderSigns() {
  if (!APP_DATA || !signGrid) return;

  const signs = APP_DATA.signs || [];

  signGrid.innerHTML = signs.map((sign, index) => `
    <button
      class="sign-card"
      data-index="${index}"
      aria-label="Abrir previsão de ${sign.name}"
    >
      <div class="sign-symbol">${sign.symbol}</div>
      <strong>${sign.name}</strong>
      <span>${sign.vibe}</span>
    </button>
  `).join("");

  signGrid.querySelectorAll(".sign-card").forEach(card => {
    card.addEventListener("click", () => {
      const index = Number(card.dataset.index);
      openSignModal(index);
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
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (window.AstroApp && typeof window.AstroApp.onSignOpen === "function") {
    window.AstroApp.onSignOpen(sign.name);
  }

  if (window.AstroAds && typeof window.AstroAds.track === "function") {
    window.AstroAds.track("sign_open", { sign: sign.name });
  }
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function setupModal() {
  if (!modal || !modalClose) return;

  modalClose.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

function setupButtons() {
  const btnExploreSigns = document.getElementById("btnExploreSigns");
  const btnFavorite = document.getElementById("btnFavorite");
  const btnShareSign = document.getElementById("btnShareSign");
  const btnShare = document.getElementById("btnShare");
  const btnTheme = document.getElementById("btnTheme");

  btnExploreSigns?.addEventListener("click", () => {
    document.getElementById("horoscopo")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  btnFavorite?.addEventListener("click", () => {
    const currentSign = modalTitle?.textContent?.trim();
    if (!currentSign) return;

    localStorage.setItem("astro_favorite_sign", currentSign);
    showToast(`Favorito salvo: ${currentSign} ✨`);
  });

  btnShareSign?.addEventListener("click", async () => {
    const title = modalTitle?.textContent || "Astro Diário";
    const summary = modalSummary?.textContent || "";
    const text = `${title} — ${summary}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Astro Diário - ${title}`,
          text
        });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Texto copiado para compartilhar ✨");
      } catch (_) {
        showToast("Compartilhe manualmente este conteúdo ✨");
      }
    }
  });

  btnShare?.addEventListener("click", async () => {
    const text = "Astro Diário ✨ Descubra sua previsão, frases cósmicas e wallpapers.";
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Astro Diário",
          text,
          url
        });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copiado com sucesso 🔗");
      } catch (_) {
        showToast("Não foi possível copiar o link");
      }
    }
  });

  btnTheme?.addEventListener("click", () => {
    document.body.classList.toggle("alt-theme");
    const active = document.body.classList.contains("alt-theme");
    localStorage.setItem("astro_alt_theme", active ? "1" : "0");
    showToast(active ? "Tema alternativo ativado 🌙" : "Tema original restaurado ✨");
  });

  const themeSaved = localStorage.getItem("astro_alt_theme");
  if (themeSaved === "1") {
    document.body.classList.add("alt-theme");
  }
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function setupActiveNav() {
  const navLinks = document.querySelectorAll(".bottom-nav a");
  const sections = [...document.querySelectorAll("main section[id]")];

  function setActiveNav() {
    let current = "home";

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 140) current = section.id;
    });

    navLinks.forEach(link => {
      const active = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("active", active);
    });
  }

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();
}

function setupScrollReveal() {
  const revealItems = document.querySelectorAll(".reveal");
  if (!revealItems.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => observer.observe(item));
}

function initAdHooks() {
  window.AstroAds = {
    slots: [
      { id: "ad-slot-top", type: "banner", unit: "top-banner" },
      { id: "ad-slot-bottom", type: "native", unit: "feed-native" }
    ],
    init() {
      console.log("AstroAds pronto para integração nativa.");
    },
    renderFallback(slotId, label = "Anúncio") {
      const el = document.getElementById(slotId);
      if (!el) return;
      el.innerHTML = `
        <div>
          <strong>${label}</strong>
          <div>Área pronta para anúncio AdMob via camada nativa.</div>
          <div class="ad-meta">slot: ${slotId}</div>
        </div>
      `;
    },
    track(eventName, payload = {}) {
      console.log("Ad event:", eventName, payload);
    }
  };

  window.AstroAds.init();

  document.addEventListener("DOMContentLoaded", () => {
    requestNativeAds();
  });

  requestNativeAds();
}

function requestNativeAds() {
  try {
    if (window.Android && typeof window.Android.showBanner === "function") {
      window.Android.showBanner("ad-slot-top");
    }

    if (window.webkit?.messageHandlers?.ads) {
      window.webkit.messageHandlers.ads.postMessage({
        action: "loadAds",
        slots: window.AstroAds?.slots || []
      });
    }
  } catch (error) {
    console.log("Native ads bridge not available.");
  }
}

loadData();
