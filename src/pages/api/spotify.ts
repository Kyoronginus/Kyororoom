import type { APIRoute } from 'astro';

const client_id = import.meta.env.SPOTIFY_CLIENT_ID;
const client_secret = import.meta.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = import.meta.env.SPOTIFY_REFRESH_TOKEN;

const basic = btoa(`${client_id}:${client_secret}`);
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=1`;

let lastPlayedTrack: {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
  timestamp: number;
} | null = null;

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refresh_token || '',
    }),
  });

  return response.json();
};

export const GET: APIRoute = async () => {
  if (!client_id || !client_secret || !refresh_token) {
    return new Response(JSON.stringify({ 
      isPlaying: false, 
      title: "Spotify Not Configured", 
      artist: "Waiting for API keys" 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { access_token } = await getAccessToken();

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (response.status === 200) {
      const song = await response.json();

      if (song && song.item && song.is_playing) {
        const spotifyData = {
          isPlaying: true,
          title: song.item.name,
          artist: song.item.artists.map((_artist: any) => _artist.name).join(', '),
          albumImageUrl: song.item.album.images[0]?.url || '',
          songUrl: song.item.external_urls.spotify,
          timestamp: Math.floor(Date.now() / 1000),
        };

        lastPlayedTrack = spotifyData;

        return new Response(JSON.stringify(spotifyData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5',
          },
        });
      }
    }

    // Not currently playing: Try recently played endpoint
    try {
      const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (recentRes.ok) {
        const recentData = await recentRes.json();
        if (recentData.items && recentData.items.length > 0) {
          const item = recentData.items[0];
          const playedAt = Math.floor(new Date(item.played_at).getTime() / 1000);
          const recentTrack = {
            isPlaying: false,
            title: item.track.name,
            artist: item.track.artists.map((_artist: any) => _artist.name).join(', '),
            albumImageUrl: item.track.album.images[0]?.url || '',
            songUrl: item.track.external_urls.spotify,
            timestamp: playedAt,
          };
          lastPlayedTrack = recentTrack;

          return new Response(JSON.stringify(recentTrack), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=10',
            },
          });
        }
      }
    } catch {
      // Ignore recently-played errors and fallback to lastPlayedTrack
    }

    // Fallback to server memory cached track if available
    if (lastPlayedTrack) {
      return new Response(JSON.stringify({ ...lastPlayedTrack, isPlaying: false }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=10',
        },
      });
    }

    return new Response(JSON.stringify({ isPlaying: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("Spotify API Error:", err);
    return new Response(JSON.stringify({ isPlaying: false, title: "Error loading Spotify", artist: "" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
