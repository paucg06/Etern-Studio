// ==========================================================================
// EternoDev Studio - Automated Sync Script (Itch.io API + YouTube Data API v3)
// ==========================================================================

const fs = require('fs');
const https = require('https');
const http = require('http');
const { URL } = require('url');

function fetchUrl(urlStr, options = {}, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      return reject(new Error('Demasiados redireccionamientos'));
    }

    const parsedUrl = new URL(urlStr);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      ...options,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        ...(options.headers || {})
      }
    };

    client.get(urlStr, requestOptions, (res) => {
      // Seguir redirecciones (301, 302, 307, 308)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, urlStr).toString();
        return resolve(fetchUrl(nextUrl, options, maxRedirects - 1));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data, headers: res.headers }));
    }).on('error', err => reject(err));
  });
}

function formatCount(num) {
  const n = parseInt(num, 10);
  if (isNaN(n)) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

// Extraer metadatos detallados de cada juego y verificar si es realmente público
async function enrichGameDetails(game) {
  let genre = "Game";
  let p_browser = game.type === 'html';
  let p_windows = Boolean(game.p_windows);
  let p_linux = Boolean(game.p_linux);
  let p_osx = Boolean(game.p_osx);

  try {
    const pageRes = await fetchUrl(game.url);
    
    // Si la página devuelve 404, el juego no existe o ha sido borrado
    if (pageRes.statusCode === 404) {
      console.log(`Juego eliminado o no disponible (${game.title}): HTTP 404`);
      return null;
    }

    const html = pageRes.body || '';

    // Si la página indica que el juego está en borrador o no disponible públicamente
    if (html.includes('This game is unavailable') || html.includes('This game is a draft') || html.includes('Access restricted')) {
      console.log(`Juego no público (${game.title}): Marcado como borrador/privado`);
      return null;
    }

    // Buscar género
    const genreMatch = html.match(/<td[^>]*>Genre<\/td>\s*<td[^>]*><a[^>]*>([^<]+)<\/a>/i) ||
                       html.match(/class="game_genre"[^>]*>([^<]+)<\/div>/i);
    if (genreMatch) genre = genreMatch[1].trim();

    // Buscar plataformas
    if (html.includes('icon-windows8') || html.includes('Download for Windows') || html.includes('.exe')) p_windows = true;
    if (html.includes('icon-tux') || html.includes('Download for Linux') || html.includes('.deb') || html.includes('.zip')) p_linux = true;
    if (html.includes('icon-apple') || html.includes('Download for macOS') || html.includes('.dmg')) p_osx = true;
    if (html.includes('web_flag') || html.includes('Play in browser') || game.type === 'html') p_browser = true;
  } catch (e) {
    console.warn(`Aviso al consultar página de ${game.title}:`, e.message);
  }

  // Diccionario de respaldo para géneros y plataformas conocidas
  const genreDictionary = {
    "oonga-bunga": { genre: "Fighting", p_windows: true },
    "verdades-incompletas": { genre: "Visual Novel", p_windows: true, p_linux: true, p_osx: true, p_browser: true },
    "soap-dodger": { genre: "Action / Bullet Hell", p_windows: true, p_linux: true, p_osx: true, p_browser: true },
    "castlecat-rpg": { genre: "Adventure", p_browser: true },
    "space-blitz": { genre: "Shooter", p_browser: true },
    "just-an-idiot-dev": { genre: "Adventure", p_windows: true, p_browser: true }
  };

  const slug = (game.url || '').split('/').filter(Boolean).pop();
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
          // Filtrar estrictamente solo juegos que no estén marcados como false en published
          const rawGames = json.games.filter(g => g.published !== false && g.published !== null);
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
            if (enriched !== null) {
              enrichedGames.push(enriched);
            }
          }

          if (enrichedGames.length > 0) {
            fs.writeFileSync('games.json', JSON.stringify(enrichedGames, null, 2), 'utf-8');
            console.log(`Itch.io API: ${enrichedGames.length} juegos públicos activos guardados en games.json`);
          } else {
            console.log("No se encontraron juegos públicos activos en Itch.io.");
          }
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
      // 1. Obtener ID de la playlist de subidas
      const chanRes = await fetchUrl(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`);
      if (chanRes.statusCode === 200) {
        const chanJson = JSON.parse(chanRes.body);
        const uploadsPlaylistId = chanJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (uploadsPlaylistId) {
          // 2. Obtener los IDs de los vídeos
          const playlistRes = await fetchUrl(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=12&key=${apiKey}`);
          if (playlistRes.statusCode === 200) {
            const playlistJson = JSON.parse(playlistRes.body);
            const videoIds = (playlistJson.items || [])
              .map(i => i.snippet?.resourceId?.videoId)
              .filter(Boolean);

            if (videoIds.length > 0) {
              // 3. Consultar estadísticas de cada vídeo
              const videosRes = await fetchUrl(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds.join(',')}&key=${apiKey}`);
              if (videosRes.statusCode === 200) {
                const videosJson = JSON.parse(videosRes.body);
                const videos = (videosJson.items || []).map(item => {
                  const s = item.snippet;
                  const stats = item.statistics || {};
                  const thumb = s.thumbnails?.maxres?.url || s.thumbnails?.high?.url || s.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;

                  return {
                    id: item.id,
                    title: s.title,
                    url: `https://www.youtube.com/watch?v=${item.id}`,
                    cover_url: thumb,
                    desc: s.description ? s.description.split('\n')[0] : 'Vídeo oficial en YouTube de EternoDev',
                    published_at: s.publishedAt,
                    channel: s.channelTitle || 'EternoDev',
                    views: formatCount(stats.viewCount || 0),
                    raw_views: parseInt(stats.viewCount || 0, 10),
                    likes: formatCount(stats.likeCount || 0),
                    comments: formatCount(stats.commentCount || 0)
                  };
                });

                if (videos.length > 0) {
                  fs.writeFileSync('videos.json', JSON.stringify(videos, null, 2), 'utf-8');
                  console.log(`YouTube Data API: ${videos.length} vídeos activos guardados en videos.json`);
                  return;
                }
              }
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
