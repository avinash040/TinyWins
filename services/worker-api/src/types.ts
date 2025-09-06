import type { ContentKind } from '@tinywins/shared';

export type Env = {
  DB: D1Database;
  KV: KVNamespace;
  GOOGLE_API_KEY?: string;
  GEMINI_IMAGE_MODEL?: string;
  VEO_MODEL?: string;
};

export type ComposeRequest = {
  childId: string;
  kind: ContentKind;
  prompt: string;
};

