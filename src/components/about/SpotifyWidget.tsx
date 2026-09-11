import React, { useEffect, useState } from 'react';
import './SpotifyWidget.css';

type SpotifyData = {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
  timestamp?: number;
};

const CACHE_KEY = 'kyororoom_spotify_last_track';

function formatRelativeTime(epochSeconds: number): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const diffSeconds = Math.max(0, nowSeconds - epochSeconds);
  const ONE_DAY_SECONDS = 86400;

  if (diffSeconds < ONE_DAY_SECONDS) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else {
    const days = Math.floor(diffSeconds / ONE_DAY_SECONDS);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}

export default function SpotifyWidget() {
  const [data, setData] = useState<SpotifyData | null>(null);

  useEffect(() => {
    // 1. Initial state check from localStorage
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: SpotifyData = JSON.parse(cached);
        setData(parsed);
      }
    } catch {
      // Ignore localStorage errors
    }

    // 2. Poll the spotify API every 15 seconds
    const fetchSpotify = async () => {
      try {
        const res = await fetch('/api/spotify');
        if (res.ok) {
          const json: SpotifyData = await res.json();
          if (json.title) {
            setData(json);
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(json));
            } catch {
              // Ignore
            }
          } else if (json.isPlaying === false) {
            // If API has no track info, mark current state as not playing but retain cached track info
            setData((prev) => {
              if (prev && prev.title) {
                return { ...prev, isPlaying: false };
              }
              return json;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching Spotify data", err);
      }
    };

    fetchSpotify();
    const interval = setInterval(fetchSpotify, 15000);
    return () => clearInterval(interval);
  }, []);

  const headerText = data?.isPlaying
    ? 'Now Playing'
    : data?.timestamp
    ? `Last Song • ${formatRelativeTime(data.timestamp)}`
    : 'Last Song';

  return (
    <div className="spotify-widget">
      <div className="spotify-header">
        <span className="spotify-icon">♪</span>
        <span>{headerText}</span>
      </div>
      {data && data.title ? (
        <a href={data.songUrl} target="_blank" rel="noreferrer" className="spotify-track">
          {data.albumImageUrl && <img src={data.albumImageUrl} alt="Album" className="album-art" />}
          <div className="track-info">
            <div className="track-title-container">
              <div className="track-title">{data.title}</div>
            </div>
            <div className="track-artist">{data.artist}</div>
          </div>
        </a>
      ) : (
        <div className="spotify-loading">Loading...</div>
      )}
    </div>
  );
}
