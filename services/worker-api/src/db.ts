import type { Env } from './types';

let schemaEnsured = false;

export async function ensureSchema(env: Env) {
  if (schemaEnsured) return;
  const stmts = [
    `CREATE TABLE IF NOT EXISTS children (id TEXT PRIMARY KEY, parent_id TEXT NOT NULL, name TEXT NOT NULL, avatar_style TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS challenges (id TEXT PRIMARY KEY, child_id TEXT NOT NULL, domain TEXT NOT NULL, title TEXT NOT NULL, goal TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active');`,
    `CREATE TABLE IF NOT EXISTS microsteps (id TEXT PRIMARY KEY, challenge_id TEXT NOT NULL, text TEXT NOT NULL, difficulty INTEGER NOT NULL, completed_at TEXT);`,
    `CREATE TABLE IF NOT EXISTS progress_events (id TEXT PRIMARY KEY, child_id TEXT NOT NULL, challenge_id TEXT NOT NULL, type TEXT NOT NULL, value REAL NOT NULL, at TEXT NOT NULL);`,
    `CREATE TABLE IF NOT EXISTS content_assets (id TEXT PRIMARY KEY, child_id TEXT NOT NULL, kind TEXT NOT NULL, prompt TEXT NOT NULL, model TEXT NOT NULL, url TEXT NOT NULL);`
  ];
  const db = env.DB;
  for (const sql of stmts) {
    await db.prepare(sql).run();
  }
  schemaEnsured = true;
}

export function id() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-expect-error - workers runtime
    return crypto.randomUUID();
  }
  // Fallback: simple random string (not for production uniqueness)
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function insertChild(env: Env, parentId: string, name: string, avatarStyle: string) {
  const childId = id();
  await env.DB.prepare(
    `INSERT INTO children (id, parent_id, name, avatar_style) VALUES (?1, ?2, ?3, ?4)`
  ).bind(childId, parentId, name, avatarStyle).run();
  return childId;
}

export async function insertChallenge(env: Env, childId: string, domain: string, title: string, goal: string, status: string = 'active') {
  const challengeId = id();
  await env.DB.prepare(
    `INSERT INTO challenges (id, child_id, domain, title, goal, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  ).bind(challengeId, childId, domain, title, goal, status).run();
  return challengeId;
}

export async function seedMicroSteps(env: Env, challengeId: string) {
  const seeds = [
    { text: 'Try a tiny step', difficulty: 1 },
    { text: 'Do it again with a twist', difficulty: 2 },
    { text: 'Celebrate the win!', difficulty: 1 },
  ];
  for (const s of seeds) {
    await env.DB.prepare(
      `INSERT INTO microsteps (id, challenge_id, text, difficulty) VALUES (?1, ?2, ?3, ?4)`
    ).bind(id(), challengeId, s.text, s.difficulty).run();
  }
}

export async function insertProgressEvent(env: Env, childId: string, challengeId: string, type: string, value: number, at: string) {
  const evId = id();
  await env.DB.prepare(
    `INSERT INTO progress_events (id, child_id, challenge_id, type, value, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  ).bind(evId, childId, challengeId, type, value, at).run();
  return evId;
}

export async function insertContentAsset(env: Env, childId: string, kind: string, prompt: string, model: string, url: string) {
  const assetId = id();
  await env.DB.prepare(
    `INSERT INTO content_assets (id, child_id, kind, prompt, model, url) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
  ).bind(assetId, childId, kind, prompt, model, url).run();
  return assetId;
}
