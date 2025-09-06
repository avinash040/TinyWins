import React, { useState } from 'react';
import { useStore } from '../store';

export function Chatbot({ childId }: { childId: string | null }) {
  const { createChallenge } = useStore();
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [domain, setDomain] = useState<'food' | 'math' | 'behavior'>('math');
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    setInput('');
    if (text.toLowerCase().includes('create') && text.toLowerCase().includes('challenge')) {
      if (!childId) {
        setMessages((m) => [...m, { from: 'bot', text: 'Select a child first.' }]);
        return;
      }
      setCreating(true);
      setMessages((m) => [...m, { from: 'bot', text: 'Enter challenge details below.' }]);
    } else if (text.toLowerCase().includes('support')) {
      setMessages((m) => [...m, { from: 'bot', text: 'Support is on the way!' }]);
    } else {
      setMessages((m) => [...m, { from: 'bot', text: "I'm here to help." }]);
    }
  };

  const submitChallenge = async () => {
    if (!childId) return;
    await createChallenge(childId, domain, title || 'New Challenge', goal || 'Give it a try');
    setCreating(false);
    setTitle('');
    setGoal('');
    setMessages((m) => [...m, { from: 'bot', text: 'Challenge created!' }]);
  };

  return (
    <div
      style={{
        width: 300,
        borderLeft: '1px solid #ccc',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <h2>Chat</h2>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.from === 'user' ? 'right' : 'left' }}>
            <p>
              <b>{m.from === 'user' ? 'You' : 'Bot'}:</b> {m.text}
            </p>
          </div>
        ))}
        {creating && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <select value={domain} onChange={(e) => setDomain(e.target.value as any)}>
              <option value="food">food</option>
              <option value="math">math</option>
              <option value="behavior">behavior</option>
            </select>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input placeholder="Goal" value={goal} onChange={(e) => setGoal(e.target.value)} />
            <button onClick={submitChallenge}>Create</button>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <input
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

