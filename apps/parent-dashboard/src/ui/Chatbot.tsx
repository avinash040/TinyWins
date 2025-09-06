import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store';

type Msg =
  | { id: string; role: 'assistant' | 'user'; type: 'text'; text: string }
  | { id: string; role: 'assistant'; type: 'form'; childId?: string; domain: 'food' | 'math' | 'behavior'; title: string; goal: string }
  | { id: string; role: 'assistant'; type: 'tips'; tips: string[] };

function rid() {
  return (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? // @ts-expect-error
      crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`) as string;
}

export function Chatbot({ childId }: { childId: string | null }) {
  const { children, challenges, createChallenge } = useStore();
  const [messages, setMessages] = useState<Msg[]>([
    { id: rid(), role: 'assistant', type: 'text', text: 'Hi! I can create a new challenge or share support tips.' },
    { id: rid(), role: 'assistant', type: 'text', text: 'Try: "new challenge" or "support for math"' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const currentChild = useMemo(() => children.find((c) => c.id === childId) || children[0], [children, childId]);

  function add(m: Msg) {
    setMessages((prev) => [...prev, m]);
  }

  function onSuggest(kind: 'new' | 'support') {
    if (kind === 'new') {
      add({ id: rid(), role: 'assistant', type: 'form', childId: currentChild?.id, domain: 'math', title: '', goal: '' });
    } else {
      const cList = challenges.filter((c) => !childId || c.childId === childId);
      const tips: string[] = cList.length
        ? [
            'Break tasks into tiny, winnable steps.',
            'Celebrate attempts as much as wins.',
            `For ${cList[0].title}: try a 2-minute timer and one hint.`,
          ]
        : [
            'Start by creating a small, specific challenge.',
            'Use a fun theme and small rewards.',
          ];
      add({ id: rid(), role: 'assistant', type: 'tips', tips });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    add({ id: rid(), role: 'user', type: 'text', text });
    setInput('');

    const lower = text.toLowerCase();
    const wantNew = lower.includes('new') || lower.includes('create');
    const wantChallenge = lower.includes('challenge');
    const wantSupport = lower.includes('support') || lower.includes('help');

    if (wantNew && wantChallenge) {
      add({ id: rid(), role: 'assistant', type: 'form', childId: currentChild?.id, domain: 'math', title: '', goal: '' });
      return;
    }
    if (wantSupport) {
      onSuggest('support');
      return;
    }
    add({ id: rid(), role: 'assistant', type: 'text', text: 'I can help with new challenges or support tips. Try: "new challenge".' });
  }

  async function handleCreateFromForm(msg: Extract<Msg, { type: 'form' }>) {
    const cid = msg.childId || children[0]?.id;
    if (!cid || !msg.title || !msg.goal) {
      add({ id: rid(), role: 'assistant', type: 'text', text: 'Please choose a child and fill title + goal.' });
      return;
    }
    await createChallenge(cid, msg.domain, msg.title, msg.goal);
    add({ id: rid(), role: 'assistant', type: 'text', text: `Created “${msg.title}” for ${children.find((c) => c.id === cid)?.name || 'child'}.` });
  }

  return (
    <aside style={{ width: 360, borderLeft: '1px solid #eee', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
        <strong>Assistant</strong>
        <button onClick={() => onSuggest('new')}>New Challenge</button>
        <button onClick={() => onSuggest('support')}>Support Tips</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ margin: '8px 0' }}>
            {m.type === 'text' && (
              <Bubble role={m.role}>{m.text}</Bubble>
            )}
            {m.type === 'tips' && (
              <Bubble role={m.role}>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {m.tips.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </Bubble>
            )}
            {m.type === 'form' && (
              <Bubble role={m.role}>
                <FormCard
                  initial={m}
                  onChange={(next) => setMessages((prev) => prev.map((x) => (x.id === m.id ? next : x)))}
                  onCreate={() => handleCreateFromForm(m)}
                />
              </Bubble>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Send</button>
      </form>
    </aside>
  );
}

function Bubble({ role, children }: { role: 'assistant' | 'user'; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <div
      style={{
        display: 'inline-block',
        background: isUser ? '#2563eb' : '#f3f4f6',
        color: isUser ? '#fff' : '#111827',
        padding: '8px 10px',
        borderRadius: 10,
        maxWidth: 280,
      }}
    >
      {children}
    </div>
  );
}

function FormCard({ initial, onChange, onCreate }: { initial: Extract<Msg, { type: 'form' }>; onChange: (next: Extract<Msg, { type: 'form' }>) => void; onCreate: () => void }) {
  const { children } = useStore();
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontWeight: 600 }}>Create a New Challenge</div>
      <select
        value={initial.childId || ''}
        onChange={(e) => onChange({ ...initial, childId: e.target.value })}
      >
        <option value="">Select child…</option>
        {children.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div style={{ display: 'flex', gap: 8 }}>
        <select
          value={initial.domain}
          onChange={(e) => onChange({ ...initial, domain: e.target.value as any })}
        >
          <option value="food">food</option>
          <option value="math">math</option>
          <option value="behavior">behavior</option>
        </select>
        <input
          placeholder="Title"
          value={initial.title}
          onChange={(e) => onChange({ ...initial, title: e.target.value })}
        />
      </div>
      <input
        placeholder="Goal"
        value={initial.goal}
        onChange={(e) => onChange({ ...initial, goal: e.target.value })}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onCreate} type="button">Create</button>
      </div>
    </div>
  );
}

