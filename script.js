// ==========================================================================
// EternoDev Studio - Tabbed Navigation & Dynamic Live Itch.io Scraper
// ==========================================================================

let currentCarouselIndex = 0;

// SVG Icons oficiales (Windows, Linux, macOS, Android)
const PLATFORM_SVGS = {
  windows: `<svg class="itch-platform-svg" viewBox="0 0 16 16" width="14" height="14" title="Windows"><path d="M0 2.222L6.47 1.34v6.248H0V2.222zm0 6.012h6.47v6.257L0 13.626V8.234zm7.25-6.993L16 0v7.588H7.25V1.241zm8.75 7H7.25v7.604L16 14.774V8.241z"/></svg>`,
  linux: `<svg class="itch-platform-svg" viewBox="0 0 16 16" width="14" height="14" title="Linux"><path d="M7.994.002C6.14.02 4.67 1.48 4.67 3.33v3.41c-.7.6-1.14 1.48-1.14 2.47 0 1.25.7 2.32 1.73 2.87-.2.66-.33 1.37-.33 2.11 0 .2.02.39.05.58-.93.26-1.61 1.11-1.61 2.12 0 1.22.99 2.21 2.21 2.21.64 0 1.22-.27 1.63-.71.86.37 1.83.58 2.86.58 1.03 0 2-.21 2.86-.58.41.44.99.71 1.63.71 1.22 0 2.21-.99 2.21-2.21 0-1.01-.68-1.86-1.61-2.12.03-.19.05-.38.05-.58 0-.74-.13-1.45-.33-2.11 1.03-.55 1.73-1.62 1.73-2.87 0-.99-.44-1.87-1.14-2.47V3.33c0-1.85-1.47-3.31-3.324-3.328h-.062z"/></svg>`,
  macos: `<svg class="itch-platform-svg" viewBox="0 0 16 16" width="14" height="14" title="macOS"><path d="M11.182.008C11.148-.03 9.67.23 8.76 1.3c-.808.95-1.127 2.37-.96 3.42 1.07.08 2.45-.58 3.25-1.53.76-.9 1.18-2.22.132-3.182zm2.08 4.792c-1.74-.09-3.21 1-4.04 1-.85 0-2.07-.94-3.41-.91-1.75.03-3.37 1.02-4.26 2.59-1.82 3.14-.47 7.78 1.3 10.33.86 1.25 1.89 2.64 3.24 2.59 1.31-.05 1.8-.84 3.39-.84 1.58 0 2.03.84 3.4.81 1.41-.02 2.3-1.25 3.16-2.5 1-1.45 1.41-2.86 1.43-2.93-.03-.02-2.74-1.05-2.77-4.18-.03-2.61 2.14-3.86 2.24-3.93-1.23-1.79-3.13-1.99-3.68-2.03z"/></svg>`,
  android: `<svg class="itch-platform-svg" viewBox="0 0 16 16" width="14" height="14" title="Android"><path d="M2.75 3.08L1.6 1.16a.4.4 0 0 1 .15-.55.4.4 0 0 1 .55.15l1.18 1.98C4.54 2.32 5.74 2 7 2c1.26 0 2.46.32 3.52.74l1.18-1.98a.4.4 0 0 1 .55-.15.4.4 0 0 1 .15.55L11.25 3.08C12.92 4.12 14 5.92 14 8H0c0-2.08 1.08-3.88 2.75-4.92zM4 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM0 9h14v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V9z"/></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  initCarousel();
  fetchLiveItchGames();
});

// Tab Switcher
function switchTab(tabId) {
  const tabs = document.querySelectorAll('.tab-view');
  const buttons = document.querySelectorAll('.nav-tab-btn');

  tabs.forEach(tab => {
    tab.classList.remove('active-tab');
  });

  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-target') === tabId) {
      btn.classList.add('active');
    }
  });

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) {
    targetTab.classList.add('active-tab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, null, `#${tabId}`);
  }

  if (tabId === 'home') {
    setTimeout(initCarousel, 50);
  }
}

window.switchTab = switchTab;

function initTabNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (['home', 'apps', 'about', 'community', 'juegos', 'sobre-mi'].includes(hash)) {
    if (hash === 'juegos') switchTab('home');
    else if (hash === 'sobre-mi') switchTab('about');
    else switchTab(hash);
  }
}

// Carousel Calculations
function getCardsPerView() {
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const pillsContainer = document.getElementById('carouselPills');

  if (!track || !prevBtn || !nextBtn || !pillsContainer) return;

  const totalCards = track.children.length;
  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(0, totalCards - cardsPerView);

  pillsContainer.innerHTML = '';
  const numPills = maxIndex + 1;

  for (let i = 0; i < numPills; i++) {
    const pill = document.createElement('div');
    pill.className = `carousel-pill ${i === currentCarouselIndex ? 'active' : ''}`;
    pill.addEventListener('click', () => {
      currentCarouselIndex = i;
      updateCarousel();
    });
    pillsContainer.appendChild(pill);
  }

  function updateCarousel() {
    const currentCardsPerView = getCardsPerView();
    const currentMax = Math.max(0, track.children.length - currentCardsPerView);
    if (currentCarouselIndex > currentMax) currentCarouselIndex = currentMax;

    const firstCard = track.children[0];
    const cardWidth = firstCard ? firstCard.offsetWidth : 340;
    const gap = 20;
    const offset = currentCarouselIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    const pills = pillsContainer.querySelectorAll('.carousel-pill');
    pills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === currentCarouselIndex);
    });

    prevBtn.style.opacity = currentCarouselIndex === 0 ? '0.35' : '1';
    nextBtn.style.opacity = currentCarouselIndex >= currentMax ? '0.35' : '1';
  }

  prevBtn.onclick = () => {
    if (currentCarouselIndex > 0) {
      currentCarouselIndex--;
      updateCarousel();
    }
  };

  nextBtn.onclick = () => {
    const currentCardsPerView = getCardsPerView();
    const currentMax = Math.max(0, track.children.length - currentCardsPerView);
    if (currentCarouselIndex < currentMax) {
      currentCarouselIndex++;
      updateCarousel();
    }
  };

  window.onresize = () => {
    initCarousel();
  };

  updateCarousel();
}

// Scraper en Vivo de Itch.io con extraccion de Generos y Plataformas
async function fetchLiveItchGames() {
  const username = "eternodev";
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://${username}.itch.io/`)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return;

    const data = await res.json();
    if (!data.contents) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    const gameCells = doc.querySelectorAll('.game_cell');

    if (gameCells && gameCells.length > 0) {
      track.innerHTML = '';

      gameCells.forEach(cell => {
        const titleLink = cell.querySelector('.game_title a.title');
        const imgEl = cell.querySelector('img');
        const textEl = cell.querySelector('.game_text');
        const genreEl = cell.querySelector('.game_genre');
        const platformEl = cell.querySelector('.game_platform');

        if (!titleLink) return;

        const title = titleLink.textContent.trim();
        const link = titleLink.href;
        const thumb = (imgEl && (imgEl.getAttribute('data-lazy_src') || imgEl.src)) || 'https://img.itch.zone/aW1nLzI1Mzc4NjQzLnBuZw==/315x250%23c/XJshJJ.png';
        const desc = textEl ? textEl.textContent.trim() : 'Videojuego disponible en Itch.io';
        const genre = genreEl ? genreEl.textContent.trim() : 'Game';

        // Determinar plataformas e iconos
        let hasBrowser = false;
        let hasWindows = false;
        let hasLinux = false;
        let hasMac = false;

        if (platformEl) {
          if (platformEl.querySelector('.web_flag') || platformEl.textContent.includes('browser')) {
            hasBrowser = true;
          }
          if (platformEl.querySelector('.icon-windows8') || platformEl.querySelector('[title*="Windows"]')) {
            hasWindows = true;
          }
          if (platformEl.querySelector('.icon-tux') || platformEl.querySelector('[title*="Linux"]')) {
            hasLinux = true;
          }
          if (platformEl.querySelector('.icon-apple') || platformEl.querySelector('[title*="macOS"]') || platformEl.querySelector('[title*="Mac"]')) {
            hasMac = true;
          }
        }

        // Construir fila de plataformas
        let platformsHtml = '';
        if (hasBrowser) {
          platformsHtml += `<span class="badge-play-browser">Play in browser</span>`;
        }
        if (hasWindows) {
          platformsHtml += PLATFORM_SVGS.windows;
        }
        if (hasLinux) {
          platformsHtml += PLATFORM_SVGS.linux;
        }
        if (hasMac) {
          platformsHtml += PLATFORM_SVGS.macos;
        }

        const card = document.createElement('a');
        card.href = link;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'game-card-item';

        card.innerHTML = `
          <div class="game-thumb-box">
            <img src="${thumb}" alt="${title}" class="game-thumb-img" loading="lazy" />
          </div>
          <div class="game-content-box">
            <h3 class="game-item-title">${title}</h3>
            <p class="game-item-desc">${desc}</p>
            <div class="itch-meta-container">
              <span class="itch-genre-label">${genre}</span>
              <div class="itch-platforms-row">
                ${platformsHtml}
              </div>
            </div>
          </div>
        `;
        track.appendChild(card);
      });

      initCarousel();
    }
  } catch (e) {
    console.log("Itch.io live update status: Usando datos estaticos cargados.", e);
  }
}
