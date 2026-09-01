// ==========================================================================
// EternoDev Studio - Tabbed Navigation, Mobile Dropdown & Dual Carousels
// ==========================================================================

let currentGameIndex = 0;
let currentVideoIndex = 0;

// Iconos vectoriales personalizados del usuario (Windows, Linux, macOS)
const PLATFORM_SVGS = {
  windows: `<svg class="itch-platform-svg" viewBox="0 0 90 90" width="18" height="18" preserveAspectRatio="xMidYMid meet" title="Windows"><g transform="translate(0,90) scale(0.1,-0.1)" fill="currentColor"><path d="M675 785 c-44 -7 -119 -18 -167 -25 l-88 -12 0 -134 0 -134 185 0 186 0 -3 157 c-3 132 -5 158 -18 159 -8 1 -51 -4 -95 -11z"/><path d="M220 721 l-115 -16 -3 -112 -3 -113 136 0 135 0 0 130 c0 118 -2 130 -17 129 -10 -1 -70 -9 -133 -18z"/><path d="M100 325 c0 -132 -14 -117 125 -135 44 -6 95 -13 113 -16 l32 -5 0 136 0 135 -135 0 -135 0 0 -115z"/><path d="M420 302 l0 -139 178 -24 c97 -14 180 -22 185 -19 4 4 6 76 5 161 l-3 154 -182 3 -183 2 0 -138z"/></g></svg>`,
  linux: `<svg class="itch-platform-svg" viewBox="0 0 90 90" width="18" height="18" preserveAspectRatio="xMidYMid meet" title="Linux"><g transform="translate(0,90) scale(0.1,-0.1)" fill="currentColor"><path d="M350 837 c-170 -40 -225 -148 -213 -419 4 -112 3 -131 -21 -211 -14 -48 -26 -90 -26 -93 0 -3 21 -4 47 -2 l47 3 11 48 10 48 36 -31 c42 -34 79 -50 118 -50 28 0 184 70 213 97 15 13 17 12 23 -9 4 -13 14 -42 22 -65 l16 -43 97 0 98 0 -42 83 -43 82 -6 156 c-8 189 -27 264 -87 331 -22 25 -58 53 -81 62 -57 23 -152 28 -219 13z m199 -293 c19 -18 25 -36 28 -81 4 -67 -4 -85 -36 -76 -18 5 -21 10 -16 31 7 28 -10 78 -30 86 -19 7 -55 -22 -55 -45 0 -34 -44 -21 -48 14 -4 36 18 69 60 90 38 19 63 14 97 -19z m-265 -15 c28 -33 36 -89 12 -89 -7 0 -16 9 -19 20 -3 11 -13 23 -22 27 -27 10 -48 -25 -41 -69 7 -41 -6 -51 -24 -19 -23 43 -2 140 32 154 26 11 37 6 62 -24z m172 -153 c98 -44 109 -51 112 -69 5 -27 -15 -45 -100 -88 -109 -55 -139 -53 -218 12 -35 30 -60 58 -58 67 2 8 32 37 67 65 75 57 95 58 197 13z"/><path d="M223 315 c-20 -53 139 -84 255 -50 41 13 52 20 52 37 0 17 -4 19 -27 13 -64 -16 -199 -17 -237 -1 -32 13 -38 14 -43 1z"/></g></svg>`,
  macos: `<svg class="itch-platform-svg" viewBox="0 0 90 90" width="18" height="18" preserveAspectRatio="xMidYMid meet" title="macOS"><g transform="translate(0,90) scale(0.1,-0.1)" fill="currentColor"><path d="M556 829 c-58 -16 -129 -112 -112 -154 4 -11 12 -12 37 -5 61 18 114 89 107 142 -3 22 -6 24 -32 17z"/><path d="M265 641 c-78 -36 -115 -102 -115 -205 0 -88 31 -182 84 -253 56 -76 90 -92 149 -69 54 20 104 20 152 1 69 -29 134 18 191 137 l17 37 -41 40 c-47 46 -56 72 -50 142 4 39 12 57 38 84 29 30 32 36 19 51 -20 25 -89 54 -127 54 -18 0 -49 -7 -69 -15 -19 -8 -48 -15 -63 -15 -15 0 -44 7 -63 15 -47 19 -73 19 -122 -4z"/></g></svg>`
};

const KNOWN_GAME_METADATA = {
  "oonga-bunga": { genre: "Fighting", p_windows: true },
  "verdades-incompletas": { genre: "Visual Novel", p_windows: true, p_linux: true, p_osx: true, p_browser: true },
  "soap-dodger": { genre: "Action / Bullet Hell", p_windows: true, p_linux: true, p_osx: true, p_browser: true },
  "castlecat-rpg": { genre: "Adventure", p_browser: true },
  "space-blitz": { genre: "Shooter", p_browser: true },
  "just-an-idiot-dev": { genre: "Adventure", p_windows: true, p_browser: true }
};

document.addEventListener('DOMContentLoaded', () => {
  initTabNavigation();
  initGamesCarousel();
  initVideosCarousel();
  loadDynamicData();
});

// Toggle del Menú Hamburguesa Móvil
function toggleMobileMenu() {
  const dropdown = document.getElementById('mobileNavDropdown');
  const btn = document.getElementById('mobileMenuBtn');
  if (!dropdown) return;

  const isOpen = dropdown.classList.toggle('open');
  if (btn) {
    btn.innerHTML = isOpen
      ? `<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
      : `<svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  }
}

window.toggleMobileMenu = toggleMobileMenu;

function switchTabMobile(tabId) {
  switchTab(tabId);
  const dropdown = document.getElementById('mobileNavDropdown');
  if (dropdown && dropdown.classList.contains('open')) {
    toggleMobileMenu();
  }
}

window.switchTabMobile = switchTabMobile;

// Tab Switcher
function switchTab(tabId) {
  const tabs = document.querySelectorAll('.tab-view');
  const desktopButtons = document.querySelectorAll('.nav-tab-btn');
  const mobileButtons = document.querySelectorAll('.mobile-dropdown-btn');

  tabs.forEach(tab => tab.classList.remove('active-tab'));

  desktopButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === tabId);
  });

  mobileButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-target') === tabId);
  });

  const targetTab = document.getElementById(`tab-${tabId}`);
  if (targetTab) {
    targetTab.classList.add('active-tab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, null, `#${tabId}`);
  }

  if (tabId === 'home') {
    setTimeout(initGamesCarousel, 50);
  } else if (tabId === 'videos') {
    setTimeout(initVideosCarousel, 50);
  }
}

window.switchTab = switchTab;

function initTabNavigation() {
  const hash = window.location.hash.replace('#', '');
  if (['home', 'apps', 'videos', 'about', 'community', 'juegos', 'sobre-mi'].includes(hash)) {
    if (hash === 'juegos') switchTab('home');
    else if (hash === 'sobre-mi') switchTab('about');
    else switchTab(hash);
  }
}

function getCardsPerView() {
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

// 1. Carrusel de Juegos
function initGamesCarousel() {
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
    pill.className = `carousel-pill ${i === currentGameIndex ? 'active' : ''}`;
    pill.addEventListener('click', () => {
      currentGameIndex = i;
      updateCarousel();
    });
    pillsContainer.appendChild(pill);
  }

  function updateCarousel() {
    const currentCardsPerView = getCardsPerView();
    const currentMax = Math.max(0, track.children.length - currentCardsPerView);
    if (currentGameIndex > currentMax) currentGameIndex = currentMax;

    const firstCard = track.children[0];
    if (!firstCard) return;

    const cardRect = firstCard.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const gap = 20;
    const offset = currentGameIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    const pills = pillsContainer.querySelectorAll('.carousel-pill');
    pills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === currentGameIndex);
    });

    prevBtn.style.opacity = currentGameIndex === 0 ? '0.35' : '1';
    nextBtn.style.opacity = currentGameIndex >= currentMax ? '0.35' : '1';
  }

  prevBtn.onclick = () => {
    if (currentGameIndex > 0) {
      currentGameIndex--;
      updateCarousel();
    }
  };

  nextBtn.onclick = () => {
    const currentCardsPerView = getCardsPerView();
    const currentMax = Math.max(0, track.children.length - currentCardsPerView);
    if (currentGameIndex < currentMax) {
      currentGameIndex++;
      updateCarousel();
    }
  };

  updateCarousel();
}

// 2. Carrusel de Vídeos de YouTube
function initVideosCarousel() {
  const track = document.getElementById('videoTrack');
  const prevBtn = document.getElementById('videoPrev');
  const nextBtn = document.getElementById('videoNext');
  const pillsContainer = document.getElementById('videoPills');

  if (!track || !prevBtn || !nextBtn || !pillsContainer) return;

  const totalCards = track.children.length;
  const cardsPerView = getCardsPerView();
  const maxIndex = Math.max(0, totalCards - cardsPerView);

  pillsContainer.innerHTML = '';
  const numPills = maxIndex + 1;

  for (let i = 0; i < numPills; i++) {
    const pill = document.createElement('div');
    pill.className = `carousel-pill ${i === currentVideoIndex ? 'active' : ''}`;
    pill.addEventListener('click', () => {
      currentVideoIndex = i;
      updateVideoCarousel();
    });
    pillsContainer.appendChild(pill);
  }

  function updateVideoCarousel() {
    const currentCardsPerView = getCardsPerView();
    const currentMax = Math.max(0, track.children.length - currentCardsPerView);
    if (currentVideoIndex > currentMax) currentVideoIndex = currentMax;

    const firstCard = track.children[0];
    if (!firstCard) return;

    const cardRect = firstCard.getBoundingClientRect();
    const cardWidth = cardRect.width;
    const gap = 20;
    const offset = currentVideoIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    const pills = pillsContainer.querySelectorAll('.carousel-pill');
    pills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === currentVideoIndex);
    });

    prevBtn.style.opacity = currentVideoIndex === 0 ? '0.35' : '1';
    nextBtn.style.opacity = currentVideoIndex >= currentMax ? '0.35' : '1';
  }

  prevBtn.onclick = () => {
    if (currentVideoIndex > 0) {
      currentVideoIndex--;
      updateVideoCarousel();
    }
  };

  nextBtn.onclick = () => {
    const currentCardsPerView = getCardsPerView();
    const currentMax = Math.max(0, track.children.length - currentCardsPerView);
    if (currentVideoIndex < currentMax) {
      currentVideoIndex++;
      updateVideoCarousel();
    }
  };

  updateVideoCarousel();
}

// 3. Cargar datos sincronizados por GitHub Actions si existen
async function loadDynamicData() {
  try {
    // A) Cargar videos desde videos.json
    const vRes = await fetch(`videos.json?_t=${Date.now()}`);
    if (vRes.ok) {
      const videos = await vRes.json();
      if (Array.isArray(videos) && videos.length > 0) {
        const vTrack = document.getElementById('videoTrack');
        if (vTrack) {
          vTrack.innerHTML = '';
          videos.forEach(v => {
            const card = document.createElement('a');
            card.href = v.url;
            card.target = '_blank';
            card.rel = 'noopener';
            card.className = 'video-card-item';

            let statsHtml = '';
            if (v.views || v.likes) {
              statsHtml = `
                <div class="video-stats-group">
                  ${v.views ? `
                    <span class="video-stat-item" title="Visualizaciones">
                      <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                      <span>${v.views}</span>
                    </span>` : ''}
                  ${v.likes ? `
                    <span class="video-stat-item" title="Me gusta">
                      <svg viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                      <span>${v.likes}</span>
                    </span>` : ''}
                  ${v.comments ? `
                    <span class="video-stat-item" title="Comentarios">
                      <svg viewBox="0 0 24 24"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                      <span>${v.comments}</span>
                    </span>` : ''}
                </div>
              `;
            }

            card.innerHTML = `
              <div class="video-thumb-box">
                <img src="${v.cover_url}" alt="${v.title}" class="video-thumb-img" loading="lazy" />
                <div class="video-play-overlay">
                  <div class="video-play-btn">
                    <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                </div>
              </div>
              <div class="video-content-box">
                <h3 class="video-item-title">${v.title}</h3>
                <p class="video-item-desc">${v.desc || ''}</p>
                <div class="video-meta-row">
                  <span class="video-author-badge">EternoDev</span>
                  ${statsHtml}
                  <span class="video-cta-text">Ver Vídeo &rarr;</span>
                </div>
              </div>
            `;
            vTrack.appendChild(card);
          });
          initVideosCarousel();
        }
      }
    }

    // B) Cargar juegos desde games.json
    const gRes = await fetch(`games.json?_t=${Date.now()}`);
    if (gRes.ok) {
      const games = await gRes.json();
      if (Array.isArray(games) && games.length > 0) {
        const gTrack = document.getElementById('carouselTrack');
        if (gTrack) {
          gTrack.innerHTML = '';
          games.forEach(g => {
            const slug = (g.url || '').split('/').filter(Boolean).pop();
            const known = KNOWN_GAME_METADATA[slug] || {};

            const genre = g.genre || known.genre || 'Game';
            const isBrowser = g.p_browser || (g.type === 'html') || known.p_browser;
            const isWin = g.p_windows || known.p_windows;
            const isLin = g.p_linux || known.p_linux;
            const isMac = g.p_osx || known.p_osx;

            let platformsHtml = '';
            if (isBrowser) platformsHtml += `<span class="badge-play-browser">Play in browser</span>`;
            if (isWin) platformsHtml += PLATFORM_SVGS.windows;
            if (isLin) platformsHtml += PLATFORM_SVGS.linux;
            if (isMac) platformsHtml += PLATFORM_SVGS.macos;

            const card = document.createElement('a');
            card.href = g.url;
            card.target = '_blank';
            card.rel = 'noopener';
            card.className = 'game-card-item';
            card.innerHTML = `
              <div class="game-thumb-box">
                <img src="${g.cover_url}" alt="${g.title}" class="game-thumb-img" loading="lazy" />
              </div>
              <div class="game-content-box">
                <h3 class="game-item-title">${g.title}</h3>
                <p class="game-item-desc">${g.desc || g.short_text || ''}</p>
                <div class="itch-meta-container">
                  <span class="itch-genre-label">${genre}</span>
                  <div class="itch-platforms-row">
                    ${platformsHtml}
                  </div>
                </div>
              </div>
            `;
            gTrack.appendChild(card);
          });
          initGamesCarousel();
        }
      }
    }
  } catch (e) {
    console.warn("Carga dinámica completada.");
  }
}

window.addEventListener('resize', () => {
  initGamesCarousel();
  initVideosCarousel();
});
