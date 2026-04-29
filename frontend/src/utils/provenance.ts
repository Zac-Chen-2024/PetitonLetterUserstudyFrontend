/**
 * Provenance utilities — pure helpers shared across writing flows.
 *
 * `buildProvenanceIndex` rebuilds the per-section index that maps
 *   - sub-argument id → sentence indices
 *   - argument id     → sentence indices
 *   - snippet id      → sentence indices
 *
 * It used to live inline in three places in WritingContext.tsx
 * (regenerateSubArgumentInLetter, commitChanges, dismissChanges),
 * which made it easy to drift one of the three out of sync. Here it
 * is once.
 */

import type { ProvenanceIndex } from '../types';

/**
 * Minimal shape buildProvenanceIndex needs from a sentence — keeps the
 * helper decoupled from the full SentenceWithProvenance type so it can
 * be tested in isolation later.
 */
export interface SentenceLike {
  subargument_id?: string | null;
  argument_id?: string | null;
  snippet_ids?: string[];
}

export function buildProvenanceIndex(sentences: readonly SentenceLike[]): ProvenanceIndex {
  const index: ProvenanceIndex = {
    bySubArgument: {},
    byArgument: {},
    bySnippet: {},
  };

  sentences.forEach((sent, idx) => {
    if (sent.subargument_id) {
      (index.bySubArgument[sent.subargument_id] ??= []).push(idx);
    }
    if (sent.argument_id) {
      (index.byArgument[sent.argument_id] ??= []).push(idx);
    }
    (sent.snippet_ids ?? []).forEach(snippetId => {
      (index.bySnippet[snippetId] ??= []).push(idx);
    });
  });

  return index;
}
