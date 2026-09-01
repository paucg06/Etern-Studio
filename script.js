// ==========================================================================
// Etern Studio - Interactive Controller & Itch.io Dynamic Scraper
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  fetchLiveItchGames();
});

// Carousel State
let currentIndex = 0;

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

  // Render Pill Indicators
  pillsContainer.innerHTML = '';
  const numPills = maxIndex + 1;

  for (let i = 0; i < numPills; i++) {
    const pill = document.createElement('div');
    pill.className = `carousel-pill ${i === currentIndex ? 'active' : ''}`;
    pill.addEventListener('click', () => {
      currentIndex = i;
      updateCarousel();
    });
    pillsContainer.appendChild(pill);
  }

  function updateCarousel() {
    const currentCardsPerView = getCardsPerView();
    const currentMax = Math.max(0, track.children.length - currentCardsPerView);
    if (currentIndex > currentMax) currentIndex = currentMax;

    const firstCard = track.children[0];
    const cardWidth = firstCard ? firstCard.offsetWidth : 320;
    const gap = 24;
    const offset = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // Update active pill
    const pills = pillsContainer.querySelectorAll('.carousel-pill');
    pills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === currentIndex);
    });

    prevBtn.style.opacity = currentIndex === 0 ? '0.35' : '1';
    nextBtn.style.opacity = currentIndex >= currentMax ? '0.35' : '1';
  }

  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  };

  nextBtn.onclick = () => {
    const currentCardsPerView = getCardsPerView();
    const currentMax = Math.max(0, track.children.length - currentCardsPerView);
    if (currentIndex < currentMax) {
      currentIndex++;
      updateCarousel();
    }
  };

  window.onresize = () => {
    initCarousel();
  };

  updateCarousel();
}

// Dynamic Live Itch.io Scraper
async function fetchLiveItchGames() {
  const username = "eternodev";
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  try {
    // Consulta en vivo al perfil de Itch.io mediante un proxy CORS seguro
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://${username}.itch.io/`)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return;

    const data = await res.json();
    if (!data.contents) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    const gameCells = doc.querySelectorAll('.game_cell');

    if (gameCells && gameCells.length > 0) {
      track.innerHTML = ''; // Limpiar y renderizar juegos en vivo

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
              <span style="color: var(--text-sub);">Itch.io</span>
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

      // Reinicializar carrusel con los datos dinámicos
      initCarousel();
    }
  } catch (e) {
    console.log("Cargando juegos preconfigurados de Itch.io:", e);
  }
}
