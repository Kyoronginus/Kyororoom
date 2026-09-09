import React, { useEffect, useState } from 'react';
import './PatreonBlog.css';

type PatreonPost = {
  id: string;
  title: string;
  date: string;
  url: string;
  thumbnail: string | null;
  is_public: boolean;
};

export default function PatreonBlog({ initialPosts }: { initialPosts?: PatreonPost[] }) {
  const [posts, setPosts] = useState<PatreonPost[]>(initialPosts && initialPosts.length > 0 ? initialPosts : []);
  const [loading, setLoading] = useState(initialPosts && initialPosts.length > 0 ? false : true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Purge legacy client localStorage caches
    try {
      [
        'kyororoom_patreon_posts_cache',
        'kyororoom_patreon_posts_v2',
        'kyororoom_patreon_posts_v3',
        'kyororoom_patreon_posts_v4',
        'kyororoom_patreon_posts_v5',
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }

    // If initialPosts was provided via SSR, do not re-fetch
    if (initialPosts && initialPosts.length > 0) {
      return;
    }

    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/patreon/posts');
        if (res.ok) {
          const data: PatreonPost[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPosts(data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load Patreon posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [initialPosts]);

  if (loading && posts.length === 0) {
    return (
      <div className="blog-list">
        {[1, 2, 3].map((n) => (
          <div key={n} className="blog-item" style={{ opacity: 0.5 }}>
            <span className="blog-date">Loading...</span>
            <div className="blog-thumb">
              <div className="blog-thumb-placeholder" />
            </div>
            <span className="blog-title">Loading post information...</span>
            <span className="blog-arrow">-&gt;</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="blog-list">
      {posts.map((post) => {
        const hasValidThumbnail = Boolean(post.thumbnail && !imgErrors[post.id]);

        return (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="blog-item"
          >
            <span className="blog-date">{post.date}</span>
            <div className="blog-thumb">
              {hasValidThumbnail ? (
                <img
                  src={post.thumbnail!}
                  alt=""
                  className="blog-thumb-img"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={() => setImgErrors((prev) => ({ ...prev, [post.id]: true }))}
                />
              ) : (
                <div className="blog-thumb-placeholder">
                  <span className="blog-thumb-icon">P</span>
                </div>
              )}
            </div>
            <span className="blog-title">{post.title}</span>
            <span className="blog-arrow">-&gt;</span>
          </a>
        );
      })}
      <div className="view-more">
        <a href="https://www.patreon.com/c/Kyoronginus" target="_blank" rel="noopener noreferrer">
          VIEW MORE
        </a>
      </div>
    </div>
  );
}
