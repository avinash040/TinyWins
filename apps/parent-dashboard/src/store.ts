import { create } from 'zustand';

const API = import.meta.env.VITE_WORKER_API_URL || 'http://localhost:8787';

export type Child = { id: string; parentId: string; name: string; avatarStyle: string };
export type Challenge = { id: string; childId: string; domain: 'food' | 'math' | 'behavior'; title: string; goal: string; status: 'pending' | 'active' | 'completed' };

type State = {
  children: Child[];
  challenges: Challenge[];
  progress: Record<string, number>;
  loading: boolean;
  createChild: (parentId: string, name: string, avatarStyle: string) => Promise<void>;
  createChallenge: (childId: string, domain: Challenge['domain'], title: string, goal: string) => Promise<void>;
  logProgress: (childId: string, challengeId: string, type: 'try' | 'win' | 'streak' | 'game_session' | 'video_view', value?: number) => Promise<void>;
};

export const useStore = create<State>((set, get) => ({
  children: [],
  challenges: [],
  progress: {},
  loading: false,
  async createChild(parentId, name, avatarStyle) {
    set({ loading: true });
    const res = await fetch(`${API}/v1/children`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ parentId, name, avatarStyle }),
    });
    const { id } = await res.json();
    set({
      children: [...get().children, { id, parentId, name, avatarStyle }],
      loading: false,
    });
  },
  async createChallenge(childId, domain, title, goal) {
    set({ loading: true });
    const res = await fetch(`${API}/v1/challenges`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ childId, domain, title, goal }),
    });
    const { id } = await res.json();
    set({
      challenges: [...get().challenges, { id, childId, domain, title, goal, status: 'active' }],
      loading: false,
    });
  },
  async logProgress(childId, challengeId, type, value = 1) {
    await fetch(`${API}/v1/progress`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ childId, challengeId, type, value }),
    });
    set((state) => {
      const current = state.progress[challengeId] || 0;
      const progress = { ...state.progress, [challengeId]: current + value };
      let challenges = state.challenges;
      if (type === 'win') {
        challenges = state.challenges.map((ch) =>
          ch.id === challengeId ? { ...ch, status: 'completed' } : ch
        );
      }
      return { progress, challenges };
    });
  },
}));

