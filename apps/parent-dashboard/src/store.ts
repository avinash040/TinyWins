import { create } from 'zustand';

const API = import.meta.env.VITE_WORKER_API_URL || 'http://localhost:8787';
const USE_DUMMY = true; // in-memory dummy UI for GitHub Pages

export type Child = { id: string; parentId: string; name: string; avatarStyle: string };
export type Challenge = { id: string; childId: string; domain: 'food' | 'math' | 'behavior'; title: string; goal: string; status: 'pending' | 'active' | 'completed' };
export type ProgressEvent = { id: string; childId: string; challengeId: string; type: 'try' | 'win' | 'streak' | 'game_session' | 'video_view'; value: number; at: string };

type State = {
  children: Child[];
  challenges: Challenge[];
  progress: Record<string, number>;
  events: ProgressEvent[];
  loading: boolean;
  createChild: (parentId: string, name: string, avatarStyle: string) => Promise<void>;
  createChallenge: (childId: string, domain: Challenge['domain'], title: string, goal: string) => Promise<void>;
  logProgress: (childId: string, challengeId: string, type: 'try' | 'win' | 'streak' | 'game_session' | 'video_view', value?: number) => Promise<void>;
};

function rid() {
  return (typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? // @ts-expect-error
      crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`) as string;
}

export const useStore = create<State>((set, get) => {
  // seed dummy data
  const seedChildId = rid();
  const ch1 = rid();
  const ch2 = rid();
  const now = Date.now();
  return {
    children: [
      { id: seedChildId, parentId: rid(), name: 'Ada', avatarStyle: 'broccoli-hero' },
    ],
    challenges: [
      { id: ch1, childId: seedChildId, domain: 'math', title: 'Subtraction Starter', goal: 'Do one subtraction problem', status: 'active' },
      { id: ch2, childId: seedChildId, domain: 'food', title: 'Try one veggie bite', goal: 'One small bite of broccoli', status: 'active' },
    ],
    progress: { [ch1]: 1, [ch2]: 1 },
    events: [
      { id: rid(), childId: seedChildId, challengeId: ch1, type: 'try', value: 1, at: new Date(now - 1000 * 60 * 45).toISOString() },
      { id: rid(), childId: seedChildId, challengeId: ch1, type: 'win', value: 1, at: new Date(now - 1000 * 60 * 30).toISOString() },
      { id: rid(), childId: seedChildId, challengeId: ch2, type: 'win', value: 1, at: new Date(now - 1000 * 60 * 10).toISOString() },
    ],
    loading: false,
  async createChild(parentId, name, avatarStyle) {
    if (USE_DUMMY) {
      const id = rid();
      set({ children: [...get().children, { id, parentId, name, avatarStyle }] });
      return;
    }
    set({ loading: true });
    const res = await fetch(`${API}/v1/children`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ parentId, name, avatarStyle }),
    });
    const { id } = await res.json();
    set({ children: [...get().children, { id, parentId, name, avatarStyle }], loading: false });
  },
  async createChallenge(childId, domain, title, goal) {
    if (USE_DUMMY) {
      const id = rid();
      set({ challenges: [...get().challenges, { id, childId, domain, title, goal, status: 'active' }] });
      return;
    }
    set({ loading: true });
    const res = await fetch(`${API}/v1/challenges`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ childId, domain, title, goal }),
    });
    const { id } = await res.json();
    set({ challenges: [...get().challenges, { id, childId, domain, title, goal, status: 'active' }], loading: false });
  },
  async logProgress(childId, challengeId, type, value = 1) {
    if (!USE_DUMMY) {
      await fetch(`${API}/v1/progress`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ childId, challengeId, type, value }),
      });
    }
    set((state) => {
      const current = state.progress[challengeId] || 0;
      const progress = { ...state.progress, [challengeId]: current + value };
      const ev: ProgressEvent = { id: rid(), childId, challengeId, type, value, at: new Date().toISOString() };
      let challenges = state.challenges;
      if (type === 'win') {
        challenges = state.challenges.map((ch) => (ch.id === challengeId ? { ...ch, status: 'completed' } : ch));
      }
      return { progress, challenges, events: [...state.events, ev] };
    });
  },
  };
});
