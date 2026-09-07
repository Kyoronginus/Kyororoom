import React, { useEffect, useState } from 'react';
import './Ticker.css';

type PatreonPost = {
  id: number;
  title: string;
  type: string;
};

export default function Ticker() {
  const [patreonPosts, setPatreonPosts] = useState<PatreonPost[]>([]);

  useEffect(() => {
    const fetchPatreon = async () => {
      try {
        const res = await fetch('/api/patreon');
        if (res.ok) {
          const data = await res.json();
          setPatreonPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch Patreon updates", err);
      }
    };
    fetchPatreon();
  }, []);

  const defaultMessages = [
    "Currently editing the portfolio.",
    "Commissions are OPEN!",
  ];

  const allMessages = [
    ...defaultMessages,
    ...patreonPosts.map(p => `[Patreon Update] ${p.title} (${p.type})`)
  ];

  // Repeat messages multiple times to ensure smooth scrolling
  const tickerItems = [...allMessages, ...allMessages, ...allMessages, ...allMessages];

  return (
    <div className="ticker-wrapper">
      <div className="ticker-content">
        {tickerItems.map((msg, idx) => (
          <span key={idx}>{msg}</span>
        ))}
      </div>
    </div>
  );
}
