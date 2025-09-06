import React, { useState } from 'react';
import { useStore } from '../store';
import { Chatbot } from './Chatbot';
import './App.css';

export function App() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          <Stats childId={selectedChildId} />
          <div className="card">
            <Home onSelectChild={setSelectedChildId} selectedChildId={selectedChildId} />
          </div>
          {selectedChildId && (
            <>
              <div className="card" style={{ marginTop: 16 }}>
                <CurrentChallenges childId={selectedChildId} />
              </div>
              <div className="card" style={{ marginTop: 16 }}>
                <PastWins childId={selectedChildId} />
              </div>
            </>
          )}
        </div>
      </div>
      <Chatbot childId={selectedChildId} />
    </div>
  );
}

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="logo">✨</div>
      <a href="#">🏠</a>
      <a href="#">👩‍💻</a>
      <a href="#">⚙️</a>
    </nav>
  );
}

function Topbar() {
  return (
    <header className="topbar">
      <h1>TinyWins</h1>
      <div className="avatar" />
    </header>
  );
}

function Stats({ childId }: { childId: string | null }) {
  const { events, challenges } = useStore();
  const wins = events.filter((e) => (!childId || e.childId === childId) && e.type === 'win').length;
  const activeChallenges = challenges.filter(
    (c) => (!childId || c.childId === childId) && c.status !== 'completed'
  ).length;
  return (
    <div className="stats-grid">
      <div className="card">
        <div className="metric">{wins}</div>
        <div className="muted">Wins</div>
      </div>
      <div className="card">
        <div className="metric">{activeChallenges}</div>
        <div className="muted">Active Challenges</div>
      </div>
    </div>
  );
}

function Home({
  onSelectChild,
  selectedChildId,
}: {
  onSelectChild: (id: string) => void;
  selectedChildId: string | null;
}) {
  const { children, createChild, loading } = useStore();
  const [name, setName] = useState('Ada');
  const [parentId, setParentId] = useState(crypto.randomUUID());
  const [avatar, setAvatar] = useState('broccoli-hero');
  return (
    <div>
      <h2>Children</h2>
      <ul>
        {children.map((c) => (
          <li key={c.id}>
            <button
              style={{ fontWeight: selectedChildId === c.id ? 'bold' : undefined }}
              onClick={() => onSelectChild(c.id)}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
      <h3>Add Child</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Parent ID" value={parentId} onChange={(e) => setParentId(e.target.value)} />
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        <button disabled={loading} onClick={() => createChild(parentId, name, avatar)}>
          Create
        </button>
      </div>
    </div>
  );
}

function CurrentChallenges({ childId }: { childId: string }) {
  const { challenges, progress, logProgress } = useStore();
  const list = challenges.filter((ch) => ch.childId === childId && ch.status !== 'completed');
  return (
    <section>
      <h2>Current Challenges</h2>
      {list.length === 0 && <p>No current challenges.</p>}
      <ul>
        {list.map((ch) => (
          <li key={ch.id}>
            <b>{ch.title}</b> — {progress[ch.id] || 0} wins{' '}
            <button onClick={() => logProgress(childId, ch.id, 'win')}>Log Win</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PastWins({ childId }: { childId: string }) {
  const { events, challenges } = useStore();
  const wins = events
    .filter((e) => e.childId === childId && e.type === 'win')
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);
  const lookup = new Map(challenges.map((c) => [c.id, c.title] as const));
  return (
    <section style={{ marginTop: 32 }}>
      <h2>Past Wins</h2>
      {wins.length === 0 && <p>No wins yet.</p>}
      <ul>
        {wins.map((w) => (
          <li key={w.id}>
            <b>{lookup.get(w.challengeId) || 'Challenge'}</b> — {new Date(w.at).toLocaleString()}
          </li>
        ))}
      </ul>
    </section>
  );
}
