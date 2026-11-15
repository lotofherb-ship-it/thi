/**
 * Chat opener / Pain-Point Router — script registry + fixtures.
 * Prefer Sanity `chatScript` when wired; fixtures are the runtime fallback.
 */
export type {
  ChatScript,
  ChatNode,
  ChatChip,
  ChatHandoff,
  ChatArtifact,
  ClaimMode,
  IntentClass,
} from './types';

export {
  chipLabel,
  serializeChatScript,
  lintChatScript,
  wordCount,
  MAX_ASSISTANT_WORDS,
  MAX_DEPTH,
  MAX_OPENING_CHIPS,
} from './types';

export { magnesiumChatScript, magnesiumLintErrors } from './magnesium';
export { mattissonChatScript, mattissonLintErrors } from './mattisson';
export {
  getPickStripForSlug,
  magnesiumPickStrip,
  mattissonPickStrip,
} from './pick-strip';
export type { PickStripScript, PickStripFilter, StripPick } from './pick-strip';

import { magnesiumChatScript } from './magnesium';
import { mattissonChatScript } from './mattisson';
import type { ChatScript } from './types';

const FIXTURES: Record<string, ChatScript> = {
  'beste-magnesium-bisglycinaat': magnesiumChatScript,
  'mattisson-magnesium-bisglycinaat-review': mattissonChatScript,
};

/** Legacy chat-tree fixture (kept for lint / future CMS). Prefer getPickStripForSlug. */
export function getChatScriptForSlug(slug: string | undefined | null): ChatScript | null {
  if (!slug) return null;
  return FIXTURES[slug] || null;
}
