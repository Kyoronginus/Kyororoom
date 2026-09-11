import React, { useEffect, useState } from 'react';
import './DiscordWidget.css';

type LanyardData = {
  data?: {
    discord_status: string;
    activities: any[];
  };
};

export default function DiscordWidget({ discordId }: { discordId: string }) {
  const [data, setData] = useState<LanyardData['data'] | null>(null);

  useEffect(() => {
    if (!discordId) return;
    
    const fetchLanyard = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        }
      } catch (err) {
        console.error("Error fetching Discord status", err);
      }
    };

    fetchLanyard();
    const interval = setInterval(fetchLanyard, 30000);
    return () => clearInterval(interval);
  }, [discordId]);

  const statusColor = {
    online: '#43b581',
    idle: '#faa61a',
    dnd: '#f04747',
    offline: '#747f8d'
  }[data?.discord_status || 'offline'];

  return (
    <div className="discord-widget widget">
      <div className="discord-header">
        <span className="status-dot" style={{ backgroundColor: statusColor }}></span>
        <span>DISCORD STATUS</span>
      </div>
      <div className="discord-body">
        <span className="status-text">{data?.discord_status ? data.discord_status.toUpperCase() : 'LOADING...'}</span>
        {data?.activities && data.activities.length > 0 && (
          <div className="activity-text">
            {data.activities[0].name === "Custom Status" && data.activities[0].state 
              ? `"${data.activities[0].state}"`
              : `Playing: ${data.activities[0].name}`}
          </div>
        )}
      </div>
    </div>
  );
}
