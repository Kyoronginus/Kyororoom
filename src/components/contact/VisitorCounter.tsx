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
        console.error("Failed to fetch views", err);
      }
    };
    fetchViews();
  }, []);

  return (
    <div className="visitor-counter widget">
      <div className="counter-label">YOU ARE VISITOR NO.</div>
      <div className="counter-display">
        {views !== null ? String(views).padStart(6, '0') : "------"}
      </div>
    </div>
  );
}
