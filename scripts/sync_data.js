// ==========================================================================
// EternoDev Studio - Automated Sync Script (Itch.io API + YouTube Data API v3)
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

// Extraer metadatos detallados de cada juego (plataformas y género)
async function enrichGameDetails(game) {
  let genre = "Game";
  let p_browser = game.type === 'html';
  let p_windows = Boolean(game.p_windows);
  let p_linux = Boolean(game.p_linux);
  let p_osx = Boolean(game.p_osx);

  try {
    const pageRes = await fetchUrl(game.url);
    if (pageRes.statusCode === 200) {
      const html = pageRes.body;
      
      // Buscar género
      const genreMatch = html.match(/<td[^>]*>Genre<\/td>\s*<td[^>]*><a[^>]*>([^<]+)<\/a>/i) ||
                         html.match(/class="game_genre"[^>]*>([^<]+)<\/div>/i);
      if (genreMatch) genre = genreMatch[1].trim();

      // Buscar plataformas
      if (html.includes('icon-windows8') || html.includes('Download for Windows') || html.includes('.exe')) p_windows = true;
      if (html.includes('icon-tux') || html.includes('Download for Linux') || html.includes('.deb') || html.includes('.zip')) p_linux = true;
      if (html.includes('icon-apple') || html.includes('Download for macOS') || html.includes('.dmg')) p_osx = true;
      if (html.includes('web_flag') || html.includes('Play in browser') || game.type === 'html') p_browser = true;
    }
  } catch (e) {
    console.warn(`No se pudo enriquecer ${game.title}:`, e.message);
  }

  // Fallbacks conocidos para géneros si no los encuentra en la página básica
  const genreDictionary = {
    "oonga-bunga": { genre: "Fighting", p_windows: true },
    "verdades-incompletas": { genre: "Visual Novel", p_windows: true, p_linux: true, p_osx: true, p_browser: true },
    "soap-dodger": { genre: "Action / Bullet Hell", p_windows: true, p_linux: true, p_osx: true, p_browser: true },
    "castlecat-rpg": { genre: "Adventure", p_browser: true },
    "space-blitz": { genre: "Shooter", p_browser: true },
    "just-an-idiot-dev": { genre: "Indie", p_windows: true, p_browser: true }
  };

  const slug = game.url.split('/').filter(Boolean).pop();
  if (genreDictionary[slug]) {
    const d = genreDictionary[slug];
    if (genre === "Game" && d.genre) genre = d.genre;
    if (d.p_windows) p_windows = true;
    if (d.p_linux) p_linux = true;
    if (d.p_osx) p_osx = true;
    if (d.p_browser) p_browser = true;
  }

  return {
    ...game,
    genre,
    p_browser,
    p_windows,
    p_linux,
    p_osx
  };
}

// 1. Sincronización oficial de Itch.io
async function syncItchGames() {
  const apiKey = process.env.ITCH_API_KEY;
  console.log("Sincronizando Itch.io con API Key...");

  if (apiKey) {
    try {
      const res = await fetchUrl('https://api.itch.io/profile/games', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (res.statusCode === 200) {
        const json = JSON.parse(res.body);
        if (json.games) {
          const rawGames = json.games.filter(g => g.published !== false);
          const enrichedGames = [];

          for (const g of rawGames) {
            const rawObj = {
              id: g.id,
              title: g.title,
              url: g.url,
              cover_url: g.cover_url,
              short_text: g.short_text || 'Videojuego indie en Itch.io',
              type: g.type || 'game',
              p_windows: Boolean(g.p_windows),
              p_linux: Boolean(g.p_linux),
              p_osx: Boolean(g.p_osx),
              published: true
            };
            const enriched = await enrichGameDetails(rawObj);
            enrichedGames.push(enriched);
          }

          fs.writeFileSync('games.json', JSON.stringify(enrichedGames, null, 2), 'utf-8');
          console.log(`Itch.io API: ${enrichedGames.length} juegos guardados con géneros y plataformas en games.json`);
          return;
        }
      }
    } catch (e) {
      console.warn("Aviso Itch.io API:", e.message);
    }
  }
}

// 2. Sincronización oficial de YouTube (YouTube Data API v3)
async function syncYouTubeVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "UCewJv1M1YAKfLcbld6iWxWg";
  console.log("Sincronizando YouTube con API Key...");

  if (apiKey) {
    try {
      const chanRes = await fetchUrl(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`);
      if (chanRes.statusCode === 200) {
        const chanJson = JSON.parse(chanRes.body);
        const uploadsPlaylistId = chanJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (uploadsPlaylistId) {
          const playlistRes = await fetchUrl(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=12&key=${apiKey}`);
          if (playlistRes.statusCode === 200) {
            const playlistJson = JSON.parse(playlistRes.body);
            const videos = (playlistJson.items || []).map(item => {
              const s = item.snippet;
              const videoId = s.resourceId?.videoId;
              const thumb = s.thumbnails?.maxres?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              return {
                id: videoId,
                title: s.title,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                cover_url: thumb,
                desc: s.description ? s.description.split('\n')[0] : 'Vídeo oficial en YouTube de @eternodev',
                published_at: s.publishedAt,
                channel: s.channelTitle || 'EternoDev'
              };
            });

            if (videos.length > 0) {
              fs.writeFileSync('videos.json', JSON.stringify(videos, null, 2), 'utf-8');
              console.log(`YouTube Data API: ${videos.length} vídeos actualizados en videos.json`);
              return;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Aviso YouTube API:", e.message);
    }
  }
}

async function main() {
  await syncItchGames();
  await syncYouTubeVideos();
}

main();
