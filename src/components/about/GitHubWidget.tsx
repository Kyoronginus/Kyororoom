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
          
          if (pushEvent) {
            let message = "Push event (no commit details)";
            
            // Try to get message from payload array first
            if (pushEvent.payload.commits && pushEvent.payload.commits.length > 0) {
              message = pushEvent.payload.commits[pushEvent.payload.commits.length - 1].message;
            } else if (pushEvent.payload.head) {
              // If commits array is missing but we have a head SHA, fetch the commit directly
              try {
                const commitRes = await fetch(`https://api.github.com/repos/${pushEvent.repo.name}/commits/${pushEvent.payload.head}`);
                if (commitRes.ok) {
                  const commitData = await commitRes.json();
                  message = commitData.commit.message;
                }
              } catch (e) {
                console.error("Error fetching specific commit", e);
              }
            }

            setLastCommit({
              message,
              repo: pushEvent.repo.name,
              date: new Date(pushEvent.created_at).toLocaleDateString()
            });
          } else {
            setLastCommit({
              message: "No recent commits",
              repo: "Kyoronginus",
              date: new Date().toLocaleDateString()
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
        <img src="/Assets/icons/pixel-code.svg" alt="Code" className="pixel-icon" />
        <span>LATEST COMMIT</span>
      </div>
      <div className="github-body">
        {lastCommit ? (
          <>
            <div className="commit-message-container">
              <div className="commit-message">"{lastCommit.message}"</div>
            </div>
            <div className="commit-repo">{lastCommit.repo} • {lastCommit.date}</div>
          </>
        ) : (
          <span className="github-loading">Loading...</span>
        )}
      </div>
    </div>
  );
}
