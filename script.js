// ==========================================================================
// EternoDev Studio - Tabbed Navigation & Real-time Live Sync Engine
// ==========================================================================

let currentCarouselIndex = 0;

// Iconos vectoriales personalizados del usuario (Windows, Linux, macOS)
const PLATFORM_SVGS = {
  windows: `<svg class="itch-platform-svg" viewBox="0 0 90 90" width="18" height="18" preserveAspectRatio="xMidYMid meet" title="Windows"><g transform="translate(0,90) scale(0.1,-0.1)" fill="currentColor"><path d="M675 785 c-44 -7 -119 -18 -167 -25 l-88 -12 0 -134 0 -134 185 0 186 0 -3 157 c-3 132 -5 158 -18 159 -8 1 -51 -4 -95 -11z"/><path d="M220 721 l-115 -16 -3 -112 -3 -113 136 0 135 0 0 130 c0 118 -2 130 -17 129 -10 -1 -70 -9 -133 -18z"/><path d="M100 325 c0 -132 -14 -117 125 -135 44 -6 95 -13 113 -16 l32 -5 0 136 0 135 -135 0 -135 0 0 -115z"/><path d="M420 302 l0 -139 178 -24 c97 -14 180 -22 185 -19 4 4 6 76 5 161 l-3 154 -182 3 -183 2 0 -138z"/></g></svg>`,
  linux: `<svg class="itch-platform-svg" viewBox="0 0 90 90" width="18" height="18" preserveAspectRatio="xMidYMid meet" title="Linux"><g transform="translate(0,90) scale(0.1,-0.1)" fill="currentColor"><path d="M350 837 c-170 -40 -225 -148 -213 -419 4 -112 3 -131 -21 -211 -14 -48 -26 -90 -26 -93 0 -3 21 -4 47 -2 l47 3 11 48 10 48 36 -31 c42 -34 79 -50 118 -50 28 0 184 70 213 97 15 13 17 12 23 -9 4 -13 14 -42 22 -65 l16 -43 97 0 98 0 -42 83 -43 82 -6 156 c-8 189 -27 264 -87 331 -22 25 -58 53 -81 62 -57 23 -152 28 -219 13z m199 -293 c19 -18 25 -36 28 -81 4 -67 -4 -85 -36 -76 -18 5 -21 10 -16 31 7 28 -10 78 -30 86 -19 7 -55 -22 -55 -45 0 -34 -44 -21 -48 14 -4 36 18 69 60 90 38 19 63 14 97 -19z m-265 -15 c28 -33 36 -89 12 -89 -7 0 -16 9 -19 20 -3 11 -13 23 -22 27 -27 10 -48 -25 -41 -69 7 -41 -6 -51 -24 -19 -23 43 -2 140 32 154 26 11 37 6 62 -24z m172 -153 c98 -44 109 -51 112 -69 5 -27 -15 -45 -100 -88 -109 -55 -139 -53 -218 12 -35 30 -60 58 -58 67 2 8 32 37 67 65 75 57 95 58 197 13z"/><path d="M223 315 c-20 -53 139 -84 255 -50 41 13 52 20 52 37 0 17 -4 19 -27 13 -64 -16 -199 -17 -237 -1 -32 13 -38 14 -43 1z"/></g></svg>`,
  macos: `<svg class="itch-platform-svg" viewBox="0 0 90 90" width="18" height="18" preserveAspectRatio="xMidYMid meet" title="macOS"><g transform="translate(0,90) scale(0.1,-0.1)" fill="currentColor"><path d="M556 829 c-58 -16 -129 -112 -112 -154 4 -11 12 -12 37 -5 61 18 114 89 107 142 -3 22 -6 24 -32 17z"/><path d="M265 641 c-78 -36 -115 -102 -115 -205 0 -88 31 -182 84 -253 56 -76 90 -92 149 -69 54 20 104 20 152 1 69 -29 134 18 191 137 l17 37 -41 40 c-47 46 -56 72 -50 142 4 39 12 57 38 84 29 30 32 36 19 51 -20 25 -89 54 -127 54 -18 0 -49 -7 -69 -15 -19 -8 -48 -15 -63 -15 -15 0 -44 7 -63 15 -47 19 -73 19 -122 -4z"/></g></svg>`
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
  if (['home', 'apps', 'devlogs', 'about', 'community', 'juegos', 'videos'].includes(hash)) {
    if (hash === 'juegos') switchTab('home');
    else if (hash === 'videos') switchTab('devlogs');
    else switchTab(hash);
  }
}

// Carousel Calculations
function getCardsPerView() {
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth <= 1024) return 2;
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
    if (!firstCard) return;

    const cardRect = firstCard.getBoundingClientRect();
    const cardWidth = cardRect.width;
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

// Scraper en Vivo de Itch.io
async function fetchLiveItchGames() {
  const username = "eternodev";
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  const timestamp = Date.now();
  const targetUrl = `https://${username}.itch.io/?_t=${timestamp}`;

  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&disableCache=true`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
    `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`
  ];

  let rawHtml = null;

  for (const proxy of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const res = await fetch(proxy, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await res.json();
        rawHtml = json.contents || json.data || json;
      } else {
        rawHtml = await res.text();
      }

      if (rawHtml && typeof rawHtml === 'string' && rawHtml.includes('game_cell')) {
        break;
      }
    } catch (e) {}
  }

  if (!rawHtml || typeof rawHtml !== 'string' || !rawHtml.includes('game_cell')) {
    return;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const gameCells = doc.querySelectorAll('.game_cell');

    if (gameCells && gameCells.length > 0) {
      track.innerHTML = '';

      gameCells.forEach(cell => {
        const titleLink = cell.querySelector('.game_title a.title, .game_title a');
        const imgEl = cell.querySelector('img');
        const textEl = cell.querySelector('.game_text');
        const genreEl = cell.querySelector('.game_genre');
        const platformEl = cell.querySelector('.game_platform');

        if (!titleLink) return;

        const title = titleLink.textContent.trim();
        const link = titleLink.href;
        
        let thumb = (imgEl && (imgEl.getAttribute('data-lazy_src') || imgEl.src)) || 'https://img.itch.zone/aW1nLzI1Mzc4NjQzLnBuZw==/315x250%23c/XJshJJ.png';
        if (thumb.startsWith('http://')) thumb = thumb.replace('http://', 'https://');

        const desc = textEl ? textEl.textContent.trim() : 'Videojuego disponible en Itch.io';
        const genre = genreEl ? genreEl.textContent.trim() : 'Game';

        let hasBrowser = false;
        let hasWindows = false;
        let hasLinux = false;
        let hasMac = false;

        if (platformEl) {
          const platText = platformEl.textContent.toLowerCase();
          const platHtml = platformEl.innerHTML.toLowerCase();

          if (platformEl.querySelector('.web_flag') || platText.includes('browser') || platHtml.includes('web_flag')) {
            hasBrowser = true;
          }
          if (platformEl.querySelector('.icon-windows8') || platHtml.includes('windows') || platHtml.includes('win8')) {
            hasWindows = true;
          }
          if (platformEl.querySelector('.icon-tux') || platHtml.includes('linux') || platHtml.includes('tux')) {
            hasLinux = true;
          }
          if (platformEl.querySelector('.icon-apple') || platHtml.includes('macos') || platHtml.includes('apple') || platHtml.includes('mac')) {
            hasMac = true;
          }
        }

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
    console.log("Itch.io Live Error:", e);
  }
}
