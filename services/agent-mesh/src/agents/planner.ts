import { parseTopic } from '@tinywins/shared';
import type { Bus } from '../main';

export class PlannerAgent {
  constructor(private bus: Bus) {}

  handle(topic: string, data: any) {
    const parsed = parseTopic(topic);
    if (!parsed || parsed.kind !== 'challenge/created') return;
    // Stub: In a full impl, emit 3 microsteps for this challenge
    console.log('[PlannerAgent] Challenge created → plan microsteps', {
      childId: parsed.childId,
      challengeId: data?.id,
    });
  }
}
