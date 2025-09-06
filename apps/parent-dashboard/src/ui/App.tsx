import React, { useState } from 'react';
import { useStore } from '../store';

export function App() {
  const [screen, setScreen] = useState<'home' | 'child' | 'create'>('home');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  return (
    <div style={{ fontFamily: 'system-ui', padding: 16 }}>
      <h1>TinyWins — Parent Dashboard</h1>
      <nav style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setScreen('home')}>Home</button>
        <button onClick={() => setScreen('create')}>Create Challenge</button>
        {selectedChildId && <button onClick={() => setScreen('child')}>Child</button>}
      </nav>
      <hr />
      {screen === 'home' && <Home onSelectChild={(id) => { setSelectedChildId(id); setScreen('child'); }} />}
      {screen === 'child' && selectedChildId && <ChildView childId={selectedChildId} />}
      {screen === 'create' && selectedChildId && <CreateChallenge childId={selectedChildId} onDone={() => setScreen('child')} />}
      {screen === 'create' && !selectedChildId && <p>Select a child from Home first.</p>}
    </div>
  );
}

function Home({ onSelectChild }: { onSelectChild: (id: string) => void }) {
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
            <button onClick={() => onSelectChild(c.id)}>{c.name}</button>
          </li>
        ))}
      </ul>
      <h3>Add Child</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Parent ID" value={parentId} onChange={(e) => setParentId(e.target.value)} />
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} />
        <button disabled={loading} onClick={() => createChild(parentId, name, avatar)}>Create</button>
      </div>
    </div>
  );
}

function ChildView({ childId }: { childId: string }) {
  const { challenges, logProgress } = useStore();
  const list = challenges.filter((ch) => ch.childId === childId);
  return (
    <div>
      <h2>Child</h2>
      {list.length === 0 && <p>No challenges yet.</p>}
      <ul>
        {list.map((ch) => (
          <li key={ch.id}>
            <b>{ch.title}</b> — {ch.goal}{' '}
            <button onClick={() => logProgress(childId, ch.id, 'win')}>Celebrate Win</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreateChallenge({ childId, onDone }: { childId: string; onDone: () => void }) {
  const { createChallenge } = useStore();
  const [domain, setDomain] = useState<'food' | 'math' | 'behavior'>('math');
  const [title, setTitle] = useState('Try subtraction');
  const [goal, setGoal] = useState('Do one problem');
  return (
    <div>
      <h2>Create Challenge</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <select value={domain} onChange={(e) => setDomain(e.target.value as any)}>
          <option value="food">food</option>
          <option value="math">math</option>
          <option value="behavior">behavior</option>
        </select>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
        <button onClick={async () => { await createChallenge(childId, domain, title, goal); onDone(); }}>Create</button>
      </div>
    </div>
  );
}

