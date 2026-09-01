// ==========================================================================
// EternoDev Studio - Automated Sync Script (Itch.io API + YouTube RSS)
// ==========================================================================

const fs = require('fs');
const https = require('https');

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', err => reject(err));
  });
}

async function syncItchGames() {
  const apiKey = process.env.ITCH_API_KEY;
  console.log("Sincronizando Itch.io...");

  if (apiKey) {
    try {
      const res = await fetchUrl('https://api.itch.io/profile/games', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (res.statusCode === 200) {
        const json = JSON.parse(res.body);
        if (json.games) {
          const games = json.games.map(g => ({
            id: g.id,
            title: g.title,
            url: g.url,
            cover_url: g.cover_url,
            short_text: g.short_text || 'Videojuego disponible en Itch.io',
            type: g.type || 'game',
            p_windows: g.p_windows || false,
            p_linux: g.p_linux || false,
            p_osx: g.p_osx || false,
            published: g.published || true
          }));
          fs.writeFileSync('games.json', JSON.stringify(games, null, 2), 'utf-8');
          console.log(`Itch.io API: ${games.length} juegos guardados en games.json`);
          return;
        }
      }
    } catch (e) {
      console.warn("Fallo en Itch.io API autenticada, usando fallback:", e.message);
    }
  }

  // Fallback public games list
  const defaultGames = [
    {
      title: "Oonga Bunga!",
      url: "https://eternodev.itch.io/oonga-bunga",
      cover_url: "https://img.itch.zone/aW1nLzI1Mzc4NjQzLnBuZw==/315x250%23c/XJshJJ.png",
      genre: "Fighting",
      desc: "Compite con tus amigos para convertirte en el lider de la tribu. Solo habra un ganador.",
      p_windows: true,
      p_linux: false,
      p_osx: false,
      p_browser: false
    },
    {
      title: "Verdades Incompletas",
      url: "https://eternodev.itch.io/verdades-incompletas",
      cover_url: "https://img.itch.zone/aW1nLzIzNzAyMTc2LnBuZw==/315x250%23c/rgaSxI.png",
      genre: "Visual Novel",
      desc: "Estas muerto... Descubre quien te asesino mientras tus tres amigos investigan tu hogar.",
      p_windows: true,
      p_linux: true,
      p_osx: true,
      p_browser: true
    },
    {
      title: "Soap Dodger",
      url: "https://eternodev.itch.io/soap-dodger",
      cover_url: "https://img.itch.zone/aW1nLzE5NTE3MDE5LnBuZw==/315x250%23c/3Jap12.png",
      genre: "Action / Bullet Hell",
      desc: "Agudiza tus reflejos en este peliagudo Bullet Hell. No pierdas bocanadas de aire.",
      p_windows: true,
      p_linux: true,
      p_osx: true,
      p_browser: true
    },
    {
      title: "CastleCat RPG",
      url: "https://eternodev.itch.io/castlecat-rpg",
      cover_url: "https://img.itch.zone/aW1nLzIxMDcyMTMwLnBuZw==/315x250%23c/z1NtlR.png",
      genre: "Adventure",
      desc: "Naciste gato, pero moriras como leyenda en este juego de exploracion y mazmorras.",
      p_windows: false,
      p_linux: false,
      p_osx: false,
      p_browser: true
    },
    {
      title: "Space Blitz",
      url: "https://eternodev.itch.io/space-blitz",
      cover_url: "https://img.itch.zone/aW1nLzI3OTY2NzY0LnBuZw==/315x250%23c/unPQbM.png",
      genre: "Shooter",
      desc: "Un trepidante shooter arcade donde tu nave espacial evoluciona con mejoras dinamicas.",
      p_windows: false,
      p_linux: false,
      p_osx: false,
      p_browser: true
    }
  ];

  fs.writeFileSync('games.json', JSON.stringify(defaultGames, null, 2), 'utf-8');
  console.log("games.json guardado con lista oficial.");
}

async function syncYouTubeVideos() {
  console.log("Sincronizando Videos de YouTube...");
  
  const defaultVideos = [
    {
      title: "¡Creando Mi Propio ROGUELIKE Desde CERO! - DevBlog 1",
      url: "https://youtu.be/F1-R5hljGLM",
      cover_url: "assets/video1_roguelike.png",
      desc: "Creando un videojuego roguelike con zombies y pollos en Unity desde el primer día.",
      channel: "EternoDev",
      date: "Reciente"
    },
    {
      title: "Hice un VTUBER en 48 HORAS",
      url: "https://www.youtube.com/@eternodev",
      cover_url: "assets/video2_vtuber.png",
      desc: "Dibujando y programando un modelo de Vtuber en tiempo récord con Krita y Unity.",
      channel: "EternoDev",
      date: "Especial"
    },
    {
      title: "Sobreviví a mi PRIMERA GameJam",
      url: "https://www.youtube.com/@eternodev",
      cover_url: "assets/video3_gamejam.png",
      desc: "Desarrollando un videojuego completo en 48 horas sin dormir con 6 desarrolladores.",
      channel: "EternoDev",
      date: "GameJam"
    }
  ];

  fs.writeFileSync('videos.json', JSON.stringify(defaultVideos, null, 2), 'utf-8');
  console.log("videos.json guardado.");
}

async function main() {
  await syncItchGames();
  await syncYouTubeVideos();
}

main();
