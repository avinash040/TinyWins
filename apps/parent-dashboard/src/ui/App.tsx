import React, { useState } from 'react';
import { useStore } from '../store';
import { Chatbot } from './Chatbot';

export function App() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', fontFamily: 'system-ui' }}>
      <div style={{ flex: 1, padding: 16 }}>
        <h1>TinyWins — Parent Dashboard</h1>
        <Home onSelectChild={setSelectedChildId} selectedChildId={selectedChildId} />
        {selectedChildId && (
          <>
            <CurrentChallenges childId={selectedChildId} />
            <PastWins childId={selectedChildId} />
          </>
        )}
      </div>
      <Chatbot childId={selectedChildId} />
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
  const { challenges, progress } = useStore();
  const list = challenges.filter((ch) => ch.childId === childId && ch.status === 'completed');
  return (
    <section style={{ marginTop: 32 }}>
      <h2>Past Wins</h2>
      {list.length === 0 && <p>No wins yet.</p>}
      <ul>
        {list.map((ch) => (
          <li key={ch.id}>
            <b>{ch.title}</b> — {progress[ch.id] || 0} wins
          </li>
        ))}
      </ul>
    </section>
  );
}

