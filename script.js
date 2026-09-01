// ==========================================================================
// Etern Studio - Tabbed Navigation & Dynamic Games Carousel
// ==========================================================================

let currentCarouselIndex = 0;

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

  // Si volvemos a la pestaña de juegos, refrescar carrusel
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

// Carousel Implementation
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
    const gap = 24;
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

// Dynamic Live Itch.io Scraper (CORS Proxy Seguro)
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

        if (!titleLink) return;

        const title = titleLink.textContent.trim();
        const link = titleLink.href;
        const thumb = (imgEl && (imgEl.getAttribute('data-lazy_src') || imgEl.src)) || 'https://img.itch.zone/aW1nLzI1Mzc4NjQzLnBuZw==/315x250%23c/XJshJJ.png';
        const desc = textEl ? textEl.textContent.trim() : 'Videojuego disponible en Itch.io';
        const genre = genreEl ? genreEl.textContent.trim() : 'Indie Game';

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
            <div class="game-meta-row" style="margin-top:0; padding-top:0; border:none;">
              <span style="color: var(--accent-purple-light);">${genre}</span>
              <span style="color: var(--text-dim);">Itch.io</span>
            </div>
            <h3 class="game-item-title">${title}</h3>
            <p class="game-item-desc">${desc}</p>
            <div class="game-meta-row">
              <span style="color: var(--accent-mint);">Jugar en Itch.io</span>
              <span>&rarr;</span>
            </div>
          </div>
        `;
        track.appendChild(card);
      });

      initCarousel();
    }
  } catch (e) {
    console.log("Usando juegos preconfigurados de Itch.io:", e);
  }
}
