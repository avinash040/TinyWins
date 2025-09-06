import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

const API = import.meta.env.VITE_WORKER_API_URL || 'http://localhost:8787';

function App() {
  const [childId, setChildId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [status, setStatus] = useState('');

  async function celebrate() {
    setStatus('Sending…');
    const res = await fetch(`${API}/v1/progress`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ childId, challengeId, type: 'win', value: 1 }),
    });
    if (res.ok) setStatus('Win logged!'); else setStatus('Failed');
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h1>Toy Sim</h1>
      <input placeholder="child-id" value={childId} onChange={(e) => setChildId(e.target.value)} />
      <input placeholder="challenge-id" value={challengeId} onChange={(e) => setChallengeId(e.target.value)} />
      <button onClick={celebrate}>Celebrate 🎉</button>
      <div>{status}</div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

