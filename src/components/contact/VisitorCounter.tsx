import React, { useEffect, useState } from 'react';
import './VisitorCounter.css';

interface VisitorCounterProps {
  initialViews?: number;
}

export default function VisitorCounter({ initialViews }: VisitorCounterProps) {
  const [views, setViews] = useState<number | null>(
    typeof initialViews === 'number' ? initialViews : null
  );

  useEffect(() => {
    if (typeof initialViews === 'number') {
      return;
    }

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
  }, [initialViews]);

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
