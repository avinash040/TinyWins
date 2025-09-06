import { z } from 'zod';

export const ParentSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});
export type Parent = z.infer<typeof ParentSchema>;

export const ChildSchema = z.object({
  id: z.string().uuid(),
  parentId: z.string().uuid(),
  name: z.string().min(1),
  avatarStyle: z.string().min(1),
});
export type Child = z.infer<typeof ChildSchema>;

export const ChallengeDomainSchema = z.enum(['food', 'math', 'behavior']);
export type ChallengeDomain = z.infer<typeof ChallengeDomainSchema>;

export const ChallengeStatusSchema = z.enum(['pending', 'active', 'completed']);
export type ChallengeStatus = z.infer<typeof ChallengeStatusSchema>;

export const ChallengeSchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  domain: ChallengeDomainSchema,
  title: z.string().min(1),
  goal: z.string().min(1),
  status: ChallengeStatusSchema.default('active'),
});
export type Challenge = z.infer<typeof ChallengeSchema>;

export const MicroStepSchema = z.object({
  id: z.string().uuid(),
  challengeId: z.string().uuid(),
  text: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
  completedAt: z.string().datetime().optional(),
});
export type MicroStep = z.infer<typeof MicroStepSchema>;

export const ProgressEventTypeSchema = z.enum([
  'try',
  'win',
  'streak',
  'game_session',
  'video_view',
]);
export type ProgressEventType = z.infer<typeof ProgressEventTypeSchema>;

export const ProgressEventSchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  challengeId: z.string().uuid(),
  type: ProgressEventTypeSchema,
  value: z.number(),
  at: z.string().datetime(),
});
export type ProgressEvent = z.infer<typeof ProgressEventSchema>;

export const ContentKindSchema = z.enum(['image', 'video', 'comic']);
export type ContentKind = z.infer<typeof ContentKindSchema>;

export const ContentAssetSchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  kind: ContentKindSchema,
  prompt: z.string().min(1),
  model: z.string().min(1),
  url: z.string().url(),
});
export type ContentAsset = z.infer<typeof ContentAssetSchema>;

