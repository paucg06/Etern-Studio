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

// 1. Sincronización oficial de Itch.io
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
            short_text: g.short_text || 'Videojuego indie en Itch.io',
            type: g.type || 'game',
            p_windows: g.p_windows || false,
            p_linux: g.p_linux || false,
            p_osx: g.p_osx || false,
            published: g.published !== false
          }));
          fs.writeFileSync('games.json', JSON.stringify(games, null, 2), 'utf-8');
          console.log(`Itch.io API: ${games.length} juegos actualizados en games.json`);
          return;
        }
      }
    } catch (e) {
      console.warn("Aviso Itch.io API:", e.message);
    }
  }

  // Lista base oficial de juegos públicos
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
}

// 2. Sincronización oficial de YouTube (YouTube Data API v3 con Uploads Playlist)
async function syncYouTubeVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = "UCewJv1M1YAKfLcbld6iWxWg";
  console.log("Sincronizando YouTube...");

  if (apiKey) {
    try {
      // 1. Obtener ID de la playlist de subidas
      const chanRes = await fetchUrl(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`);
      if (chanRes.statusCode === 200) {
        const chanJson = JSON.parse(chanRes.body);
        const uploadsPlaylistId = chanJson.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (uploadsPlaylistId) {
          // 2. Obtener los vídeos más recientes de la playlist
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

  // Lista base de vídeos oficiales de YouTube con URLs directas de Google CDN (i.ytimg.com)
  const defaultVideos = [
    {
      id: "F1-R5hljGLM",
      title: "¡Creando Mi Propio ROGUELIKE Desde CERO! - DevBlog 1",
      url: "https://youtu.be/F1-R5hljGLM",
      cover_url: "https://i.ytimg.com/vi/F1-R5hljGLM/maxresdefault.jpg",
      desc: "👉 Después de tirarme todo el verano durmiendo hasta las 2 de la tarde, me di cuenta de que tenía que hacer algo productivo. Creando un roguelike con zombies y un pollo.",
      channel: "Eterno - Developer"
    },
    {
      id: "vtuber_48h",
      title: "Hice un VTUBER en 48 HORAS",
      url: "https://www.youtube.com/@eternodev",
      cover_url: "assets/video2_vtuber.png",
      desc: "👉 Después de darme cuenta de que tener un Vtuber es la clave para el éxito, decidí hacerme uno propio en Krita y Unity.",
      channel: "Eterno - Developer"
    },
    {
      id: "gamejam_48h",
      title: "Sobreviví a mi PRIMERA GameJam",
      url: "https://www.youtube.com/@eternodev",
      cover_url: "assets/video3_gamejam.png",
      desc: "👉 Un juego entre seis desarrolladores en 48 Horas sin dormir. ¿Será porque es nuestra primera GameJam?",
      channel: "Eterno - Developer"
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
