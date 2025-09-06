import { parseTopic, topicRewardUnlocked } from '@tinywins/shared';
import type { Bus } from '../main';

const streaks = new Map<string, number>();

export class AnalyticsAgent {
  constructor(private bus: Bus) {}

  handle(topic: string, data: any) {
    const parsed = parseTopic(topic);
    if (!parsed || parsed.kind !== 'progress/logged') return;
    if (data?.type !== 'win') return;
    const n = (streaks.get(parsed.childId) || 0) + 1;
    streaks.set(parsed.childId, n);
    if (n % 3 === 0) {
      const t = topicRewardUnlocked(parsed.childId);
      this.bus.publish(t, { childId: parsed.childId, streak: n, reward: 'bronze-star' });
    }
  }
}

