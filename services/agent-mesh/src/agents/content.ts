import { parseTopic, topicContentGenerated } from '@tinywins/shared';
import type { Bus } from '../main';

export class ContentAgent {
  constructor(private bus: Bus) {}

  async handle(topic: string, data: any) {
    const parsed = parseTopic(topic);
    if (!parsed || parsed.kind !== 'content/requested') return;

    const baseUrl = process.env.WORKER_API_URL || 'http://localhost:8787';
    try {
      const res = await fetch(`${baseUrl}/v1/content/compose`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          childId: data.childId,
          kind: data.kind,
          prompt: data.prompt,
        }),
      });
      const body = await res.json();
      const replyTopic = topicContentGenerated(parsed.childId);
      this.bus.publish(replyTopic, { ...body, childId: data.childId });
      console.log('[ContentAgent] Generated content', body);
    } catch (e) {
      console.error('[ContentAgent] compose failed', e);
    }
  }
}
