import type { Env } from './types';

export type ComposeResult = { url: string; model: string };

export async function composeContent(env: Env, kind: 'image' | 'video', prompt: string): Promise<ComposeResult> {
  const apiKey = env.GOOGLE_API_KEY;
  const model = kind === 'image' ? env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image' : env.VEO_MODEL || 'veo-3-fast';

  if (!apiKey) {
    // Fallback stub URL for local dev without key
    return { url: `https://placehold.co/800x450?text=${encodeURIComponent(kind)}`, model };
  }

  // Minimal placeholder for Google AI Studio call.
  // Replace with real endpoint once available; we return a stub to keep the flow unblocked.
  // In production, you would call the appropriate Generative AI endpoint and upload media to storage.
  return { url: `https://placehold.co/800x450?text=${encodeURIComponent(prompt.slice(0, 24))}`, model };
}

