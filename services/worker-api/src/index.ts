import { Hono } from 'hono';
import { z } from 'zod';
import type { Env, ComposeRequest } from './types';
import { ensureSchema, insertChild, insertChallenge, seedMicroSteps, insertProgressEvent, insertContentAsset } from './db';
import { composeContent } from './googleClient';
import { ContentKindSchema, ProgressEventTypeSchema } from '@tinywins/shared';

const app = new Hono<{ Bindings: Env }>();

// Ensure DB schema exists before each request (lightweight once)
app.use('*', async (c, next) => {
  await ensureSchema(c.env);
  await next();
});

// POST /v1/children → insert child.
app.post('/v1/children', async (c) => {
  const Body = z.object({ parentId: z.string().uuid(), name: z.string().min(1), avatarStyle: z.string().min(1) });
  const body = Body.parse(await c.req.json());
  const childId = await insertChild(c.env, body.parentId, body.name, body.avatarStyle);
  return c.json({ id: childId }, 200);
});

// POST /v1/challenges → insert challenge + seed 3 MicroSteps.
app.post('/v1/challenges', async (c) => {
  const Body = z.object({
    childId: z.string().uuid(),
    domain: z.enum(['food', 'math', 'behavior']),
    title: z.string().min(1),
    goal: z.string().min(1),
    status: z.enum(['pending', 'active', 'completed']).optional(),
  });
  const body = Body.parse(await c.req.json());
  const challengeId = await insertChallenge(c.env, body.childId, body.domain, body.title, body.goal, body.status || 'active');
  await seedMicroSteps(c.env, challengeId);
  return c.json({ id: challengeId, microstepsSeeded: 3 }, 200);
});

// POST /v1/progress → insert ProgressEvent; (optional) POST webhook to agent-mesh.
app.post('/v1/progress', async (c) => {
  const Body = z.object({
    childId: z.string().uuid(),
    challengeId: z.string().uuid(),
    type: ProgressEventTypeSchema,
    value: z.number().default(1),
    at: z.string().datetime().default(new Date().toISOString()),
  });
  const body = Body.parse(await c.req.json());
  const id = await insertProgressEvent(c.env, body.childId, body.challengeId, body.type, body.value, body.at);

  // Optional webhook to agent mesh (placeholder: no URL configured here)
  // You can wire this later to publish to Solace or call a webhook.

  // Update streak in KV as a simple counter for 'win'
  if (body.type === 'win') {
    const key = `streak:${body.childId}`;
    const current = Number((await c.env.KV.get(key)) || '0');
    await c.env.KV.put(key, String(current + 1));
  }

  return c.json({ id }, 200);
});

// POST /v1/content/compose → call Google AI Studio (stub) → return ContentAsset{url}.
app.post('/v1/content/compose', async (c) => {
  const body = (await c.req.json()) as ComposeRequest;
  const parsed = z
    .object({ childId: z.string().uuid(), kind: ContentKindSchema, prompt: z.string().min(1) })
    .parse(body);

  const result = await composeContent(c.env, parsed.kind, parsed.prompt);
  const assetId = await insertContentAsset(c.env, parsed.childId, parsed.kind, parsed.prompt, result.model, result.url);
  return c.json({ id: assetId, url: result.url, model: result.model }, 200);
});

export default app;

