import React, { useEffect, useState } from 'react';
import './GitHubWidget.css';

type GitHubEvent = {
  type: string;
  repo: { name: string };
  payload: { commits?: { message: string }[] };
  created_at: string;
};

export default function GitHubWidget({ username }: { username: string }) {
  const [lastCommit, setLastCommit] = useState<{ message: string, repo: string, date: string } | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchGitHub = async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${username}/events/public`);
        if (res.ok) {
          const events: GitHubEvent[] = await res.json();
          // Find the last PushEvent
          const pushEvent = events.find(e => e.type === 'PushEvent');
          if (pushEvent && pushEvent.payload.commits && pushEvent.payload.commits.length > 0) {
            setLastCommit({
              message: pushEvent.payload.commits[pushEvent.payload.commits.length - 1].message,
              repo: pushEvent.repo.name,
              date: new Date(pushEvent.created_at).toLocaleDateString()
            });
          }
        }
      } catch (err) {
        console.error("Error fetching GitHub events", err);
      }
    };

    fetchGitHub();
  }, [username]);

  return (
    <div className="github-widget widget">
      <div className="github-header">
        <span className="github-icon">GH</span>
        <span>LATEST COMMIT</span>
      </div>
      <div className="github-body">
        {lastCommit ? (
          <>
            <div className="commit-message">"{lastCommit.message}"</div>
            <div className="commit-repo">{lastCommit.repo} • {lastCommit.date}</div>
          </>
        ) : (
          <span className="github-loading">Loading...</span>
        )}
      </div>
    </div>
  );
}
