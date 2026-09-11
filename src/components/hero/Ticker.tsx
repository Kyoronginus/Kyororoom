import React, { useEffect, useState } from 'react';
import './Ticker.css';

interface TickerData {
  commission: {
    isOpen: boolean;
    statusLabel: string;
  };
  latestPost: {
    id: string;
    title: string;
    url: string;
    date: string;
  } | null;
  announcements: string[];
}

export default function Ticker() {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await fetch('/api/ticker');
        if (res.ok) {
          const data = await res.json();
          setTickerData(data);
        }
      } catch (err) {
        console.error('Failed to fetch ticker data', err);
      }
    };
    fetchTicker();
  }, []);

  const messages: (string | { text: string; url?: string })[] = [];

  // 1. Commission Status
  const commissionStatus = tickerData?.commission.statusLabel || 'OPEN';
  messages.push(`[COMMISSIONS: ${commissionStatus}]`);

  // 2. Latest Blog / Patreon Post
  if (tickerData?.latestPost?.title) {
    messages.push({
      text: `[LATEST POST] ${tickerData.latestPost.title}`,
      url: tickerData.latestPost.url,
    });
  }

  // 3. Announcements
  const announcements = tickerData?.announcements?.length
    ? tickerData.announcements
    : ['Currently editing the portfolio.'];
  announcements.forEach((a) => messages.push(`[UPDATE] ${a}`));

  // Repeat messages multiple times to ensure continuous smooth infinite scrolling
  const tickerItems = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className="ticker-wrapper">
      <div className="ticker-content">
        {tickerItems.map((item, idx) => {
          if (typeof item === 'string') {
            return <span key={idx}>{item}</span>;
          }
          return item.url ? (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ticker-link"
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {item.text}
            </a>
          ) : (
            <span key={idx}>{item.text}</span>
          );
        })}
      </div>
    </div>
  );
}
