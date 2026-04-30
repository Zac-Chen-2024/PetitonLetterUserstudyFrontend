import { describe, it, expect } from 'vitest';
import { buildProvenanceIndex, type SentenceLike } from './provenance';

describe('buildProvenanceIndex', () => {
  it('returns empty index for empty input', () => {
    const idx = buildProvenanceIndex([]);
    expect(idx).toEqual({ bySubArgument: {}, byArgument: {}, bySnippet: {} });
  });

  it('skips falsy ids and missing snippet_ids gracefully', () => {
    const sentences: SentenceLike[] = [
      { subargument_id: null, argument_id: undefined, snippet_ids: undefined },
      { subargument_id: '', argument_id: '', snippet_ids: [] },
    ];
    const idx = buildProvenanceIndex(sentences);
    expect(idx).toEqual({ bySubArgument: {}, byArgument: {}, bySnippet: {} });
  });

  it('groups indices by subargument_id, argument_id, and snippet_id', () => {
    const sentences: SentenceLike[] = [
      { subargument_id: 'sa1', argument_id: 'a1', snippet_ids: ['s1', 's2'] },
      { subargument_id: 'sa1', argument_id: 'a1', snippet_ids: ['s2'] },
      { subargument_id: 'sa2', argument_id: 'a2', snippet_ids: ['s3'] },
    ];
    const idx = buildProvenanceIndex(sentences);
    expect(idx.bySubArgument).toEqual({ sa1: [0, 1], sa2: [2] });
    expect(idx.byArgument).toEqual({ a1: [0, 1], a2: [2] });
    expect(idx.bySnippet).toEqual({ s1: [0], s2: [0, 1], s3: [2] });
  });

  it('preserves sentence order in the index arrays', () => {
    const sentences: SentenceLike[] = [
      { subargument_id: 'x', snippet_ids: ['z'] },
      { subargument_id: 'x', snippet_ids: ['z'] },
      { subargument_id: 'x', snippet_ids: ['z'] },
    ];
    const idx = buildProvenanceIndex(sentences);
    expect(idx.bySubArgument.x).toEqual([0, 1, 2]);
    expect(idx.bySnippet.z).toEqual([0, 1, 2]);
  });

  it('does not crash when a sentence has only some fields populated', () => {
    const sentences: SentenceLike[] = [
      { snippet_ids: ['only-snippet'] },
      { subargument_id: 'only-subarg' },
      { argument_id: 'only-arg' },
    ];
    const idx = buildProvenanceIndex(sentences);
    expect(idx.bySnippet).toEqual({ 'only-snippet': [0] });
    expect(idx.bySubArgument).toEqual({ 'only-subarg': [1] });
    expect(idx.byArgument).toEqual({ 'only-arg': [2] });
  });
});
