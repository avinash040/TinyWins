import React, { useEffect, useMemo, useState } from 'react';

const API = import.meta.env.VITE_WORKER_API_URL || 'http://localhost:8787';

function usePath() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

export function App() {
  const path = usePath();
  const match = useMemo(() => path.match(/^\/story\/(.+)$/), [path]);
  if (match) return <Story childId={match[1]} />;
  return (
    <div className="full">
      <div style={{ display: 'grid', gap: 12 }}>
        <h1>TinyWins TV</h1>
        <p>Enter a Child ID to view latest story:</p>
        <ChildLauncher />
      </div>
    </div>
  );
}

function ChildLauncher() {
  const [id, setId] = useState('');
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input placeholder="child-id" value={id} onChange={(e) => setId(e.target.value)} />
      <button onClick={() => (window.location.pathname = `/story/${id}`)}>Open</button>
    </div>
  );
}

function Story({ childId }: { childId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      // For now compose an image on-demand; a future version would query latest ContentAsset.
      const res = await fetch(`${API}/v1/content/compose`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ childId, kind: 'image', prompt: `Sticker for ${childId}` }),
      });
      const data = await res.json();
      setUrl(data.url);
    })();
  }, [childId]);
  if (!url) return <div className="full">Loading…</div>;
  const isVideo = url.endsWith('.mp4') || url.includes('video');
  return (
    <div className="full">
      {isVideo ? (
        <video src={url} autoPlay playsInline controls />
      ) : (
        <img src={url} alt="Story" />
      )}
    </div>
  );
}

