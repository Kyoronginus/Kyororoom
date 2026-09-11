import React, { useEffect, useState } from 'react';
import './VisitorCounter.css';

export default function VisitorCounter() {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const res = await fetch('/api/views');
        if (res.ok) {
          const data = await res.json();
          setViews(data.views);
        }
      } catch (err) {
        console.error('Failed to fetch views', err);
      }
    };
    fetchViews();
  }, []);

  return (
    <div className="visitor-counter widget">
      <img
        src="/assets/contacts/venna_pixel.png"
        alt="Venna"
        className="counter-pixel-art"
        width={32}
        height={32}
      />
      <div className="counter-content">
        <div className="counter-label">Visits</div>
        <div className="counter-display">
          {views !== null ? String(views).padStart(6, '0') : '------'}
        </div>
      </div>
    </div>
  );
}
