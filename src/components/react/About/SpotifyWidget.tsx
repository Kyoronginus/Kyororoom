import React, { useEffect, useState } from 'react';
import './SpotifyWidget.css';

type SpotifyData = {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumImageUrl: string;
  songUrl: string;
};

export default function SpotifyWidget() {
  const [data, setData] = useState<SpotifyData | null>(null);

  useEffect(() => {
    // Poll the spotify API every 15 seconds
    const fetchSpotify = async () => {
      try {
        const res = await fetch('/api/spotify');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Error fetching Spotify data", err);
      }
    };

    fetchSpotify();
    const interval = setInterval(fetchSpotify, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="spotify-widget">
      <div className="spotify-header">
        <span className="spotify-icon">♪</span>
        <span>{data?.isPlaying ? 'Now Playing' : 'Last Song'}</span>
      </div>
      {data ? (
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
