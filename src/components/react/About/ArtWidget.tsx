import React, { useEffect, useState } from 'react';
import './ArtWidget.css';

type ArtCommit = {
  id: string;
  date?: string;
  timestamp: number;
  thumbnail_small_url?: string;
  thumbnail_url?: string;
  storage_small_path?: string;
  storage_path?: string;
};

const CACHE_KEY = 'kyororoom_art_commit';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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

function getArtTitle(storagePath?: string): string {
  if (!storagePath) return '';
  const filename = storagePath.split('/').pop() || '';
  const match = filename.match(/\d+_(.+?)_\d+_(?:thumb|full)\.png$/);
  return match && match[1] ? match[1] : '';
}

export default function ArtWidget() {
  const [art, setArt] = useState<ArtCommit | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check local storage cache first
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (Date.now() - cached.cachedAt < CACHE_TTL_MS && cached.data) {
          setArt(cached.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    // 2. Fetch from cached server proxy endpoint
    const fetchArt = async () => {
      try {
        let res = await fetch('/api/art');
        if (!res.ok) {
          // Direct fallback if proxy has an issue
          res = await fetch('https://us-central1-oekakusa.cloudfunctions.net/api/users/NC9InoxB7HdZY6zSiKkNjaOc5Lc2/commits/latest');
        }

        if (res.ok) {
          const data: ArtCommit = await res.json();
          setArt(data);
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data, cachedAt: Date.now() })
            );
          } catch {
            // Ignore localStorage quota errors
          }
        }
      } catch (err) {
        console.error('Error fetching latest art commit:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArt();
  }, []);

  const imageUrl = art?.thumbnail_small_url || art?.thumbnail_url;
  const linkUrl = art?.thumbnail_small_url || art?.thumbnail_url;
  const title = getArtTitle(art?.storage_small_path || art?.storage_path);

  return (
    <div className="art-widget widget">
      <div className="art-header">
        <img src="/Assets/icons/pixel-art.svg" alt="Art" className="pixel-icon" />
        <span>LATEST ART</span>
      </div>
      <div className="art-body">
        {loading ? (
          <span className="art-loading">Loading...</span>
        ) : art && imageUrl ? (
          <>
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="art-image-link"
              title="Click to view artwork"
            >
              <img
                src={imageUrl}
                alt="Latest art commit"
                className="art-image"
                loading="lazy"
              />
            </a>
            <div className="art-footer">
              {title && <span className="art-title">{title}</span>}
              <span className="art-time">
                {art.timestamp ? formatRelativeTime(art.timestamp) : ''}
              </span>
            </div>
          </>
        ) : (
          <span className="art-loading">No art commits found</span>
        )}
      </div>
    </div>
  );
}
