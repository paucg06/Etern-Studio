// ==========================================================================
// Etern Studio - Interactive Controller & Itch.io Dynamic Loader
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initGamesCarousel();
  initDynamicItchLoader();
});

// ==========================================================================
// 1. Interactive Games Carousel (GDevelop Style)
// ==========================================================================
function initGamesCarousel() {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');

  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let cardsPerView = getCardsPerView();
  let totalCards = track.children.length;

  function getCardsPerView() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function renderDots() {
    dotsContainer.innerHTML = '';
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    const numDots = maxIndex + 1;

    for (let i = 0; i < numDots; i++) {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        currentIndex = i;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateCarousel() {
    cardsPerView = getCardsPerView();
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    if (currentIndex > maxIndex) currentIndex = maxIndex;

    const cardWidth = track.children[0] ? track.children[0].offsetWidth : 300;
    const gap = 24;
    const offset = currentIndex * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    // Update active dot
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
    nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
  }

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  nextBtn.addEventListener('click', () => {
    const maxIndex = Math.max(0, totalCards - cardsPerView);
    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  });

  window.addEventListener('resize', () => {
    cardsPerView = getCardsPerView();
    renderDots();
    updateCarousel();
  });

  renderDots();
  updateCarousel();
}

// ==========================================================================
// 2. Dynamic Itch.io Games Fetcher
// ==========================================================================
async function initDynamicItchLoader() {
  const username = "eternodev";
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  try {
    // Intento de conexión al feed RSS público de Itch.io mediante CORS proxy seguro
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https://${username}.itch.io/feed.xml`);
    if (!response.ok) return;
    
    const data = await response.json();
    if (data.status === 'ok' && data.items && data.items.length > 0) {
      // Limpiar datos estáticos y renderizar los juegos públicos de Itch.io
      track.innerHTML = '';
      data.items.forEach(item => {
        const card = document.createElement('a');
        card.href = item.link;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'game-card';

        // Extraer imagen si existe
        const thumbnail = item.thumbnail || (item.enclosure ? item.enclosure.link : 'https://img.itch.zone/aW1nLzE2NTg1MTY1LnBuZw==/315x250%23c/default.png');
        
        card.innerHTML = `
          <div class="game-cover-wrapper">
            <img src="${thumbnail}" alt="${item.title}" class="game-cover-img" onerror="this.src='assets/game_placeholder.png'" />
          </div>
          <div class="game-body">
            <div class="game-tags-row">
              <span class="game-tag highlight">Itch.io</span>
              <span class="game-tag">Unity</span>
            </div>
            <h3 class="game-title">${item.title}</h3>
            <p class="game-desc">${item.description.replace(/<[^>]*>?/gm, '').substring(0, 95)}...</p>
            <div class="game-card-footer">
              <span>Jugar Ahora</span>
              <span>↗</span>
            </div>
          </div>
        `;
        track.appendChild(card);
      });

      // Reinicializar carrusel
      initGamesCarousel();
    }
  } catch (err) {
    console.log("Usando proyectos preconfigurados de Itch.io:", err);
  }
}
