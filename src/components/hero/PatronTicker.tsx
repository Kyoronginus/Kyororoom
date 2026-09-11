import React, { useEffect, useState } from 'react';
import './PatronTicker.css';
import type { PatronMember } from '../../../lib/patreon';

type TickerItem =
  | { type: 'badge'; label: string }
  | { type: 'member'; name: string; isPaid: boolean };

export default function PatronTicker({ initialMembers }: { initialMembers?: PatronMember[] }) {
  const [members, setMembers] = useState<PatronMember[]>(
    initialMembers && initialMembers.length > 0 ? initialMembers : []
  );

  useEffect(() => {
    // Purge legacy mock caches
    try {
      [
        'kyororoom_patreon_members_cache',
        'kyororoom_patreon_members_v2',
        'kyororoom_patreon_members_v3',
        'kyororoom_patreon_members_v4',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }

    // If initialMembers was provided via SSR, do not re-fetch
    if (initialMembers && initialMembers.length > 0) {
      return;
    }

    const fetchMembers = async () => {
      try {
        const res = await fetch('/api/patreon/members');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.members) && data.members.length > 0) {
            setMembers(data.members);
          }
        }
      } catch (err) {
        console.error('Failed to load Patreon members for ticker:', err);
      }
    };

    fetchMembers();
  }, [initialMembers]);

  if (members.length === 0) {
    return null;
  }

  const singleLoop: TickerItem[] = [
    { type: 'badge', label: 'THANK YOU MY PATRONS:' },
    ...members.map((m) => ({ type: 'member' as const, name: m.name, isPaid: m.isPaid })),
  ];
  const tickerItems = [...singleLoop, ...singleLoop, ...singleLoop, ...singleLoop];

  return (
    <div className="patron-ticker-wrapper">
      <div className="patron-ticker-content">
        {tickerItems.map((item, idx) => (
          <span key={idx} className="patron-ticker-item">
            {item.type === 'badge' ? (
              <span className="patron-badge">{item.label}</span>
            ) : (
              <span className={item.isPaid ? 'patron-paid' : 'patron-free'}>
                {item.name}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
