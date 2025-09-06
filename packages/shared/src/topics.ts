// Topic helpers for Solace-style topics
// Patterns:
// tinywins/{childId}/challenge/created
// tinywins/{childId}/progress/logged
// tinywins/{childId}/content/requested
// tinywins/{childId}/content/generated
// tinywins/{childId}/reward/unlocked

const base = 'tinywins';

export function topicChallengeCreated(childId: string) {
  return `${base}/${childId}/challenge/created`;
}

export function topicProgressLogged(childId: string) {
  return `${base}/${childId}/progress/logged`;
}

export function topicContentRequested(childId: string) {
  return `${base}/${childId}/content/requested`;
}

export function topicContentGenerated(childId: string) {
  return `${base}/${childId}/content/generated`;
}

export function topicRewardUnlocked(childId: string) {
  return `${base}/${childId}/reward/unlocked`;
}

export type TopicKind =
  | 'challenge/created'
  | 'progress/logged'
  | 'content/requested'
  | 'content/generated'
  | 'reward/unlocked';

export function parseTopic(topic: string):
  | { childId: string; kind: TopicKind }
  | null {
  const re = /^tinywins\/(.+?)\/(challenge\/created|progress\/logged|content\/requested|content\/generated|reward\/unlocked)$/;
  const m = topic.match(re);
  if (!m) return null;
  return { childId: m[1], kind: m[2] as TopicKind };
}

