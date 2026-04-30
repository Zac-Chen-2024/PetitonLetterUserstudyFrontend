import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./api', () => ({
  apiClient: { post: vi.fn() },
}));

import { apiClient } from './api';
import { writingService } from './writingService';

const mockedPost = apiClient.post as ReturnType<typeof vi.fn>;

describe('writingService.analyzeImpact', () => {
  beforeEach(() => {
    mockedPost.mockReset();
  });

  it('maps snake_case backend fields to camelCase', async () => {
    mockedPost.mockResolvedValueOnce({
      success: true,
      suggestions: [
        {
          sentence_index: 2,
          original_text: 'old',
          suggested_text: 'new',
          reason: 'because',
          change_status: 'modified',
          change_reason: 'context shifted',
        },
      ],
    });

    const result = await writingService.analyzeImpact('proj-1', {
      standard_key: 'EB1A',
      change_type: 'edit',
      affected_subargument_id: 'sa-1',
    });

    expect(mockedPost).toHaveBeenCalledWith(
      '/writing/proj-1/analyze-impact',
      expect.objectContaining({ standard_key: 'EB1A' })
    );
    expect(result).toEqual({
      success: true,
      suggestions: [
        {
          sentenceIndex: 2,
          originalText: 'old',
          suggestedText: 'new',
          reason: 'because',
          changeStatus: 'modified',
          changeReason: 'context shifted',
        },
      ],
    });
  });

  it('falls back to change_reason when reason is missing', async () => {
    mockedPost.mockResolvedValueOnce({
      success: true,
      suggestions: [
        {
          sentence_index: 0,
          change_reason: 'fallback explanation',
        },
      ],
    });

    const result = await writingService.analyzeImpact('proj-1', {
      standard_key: 'EB1A',
      change_type: 'edit',
      affected_subargument_id: 'sa-1',
    });

    expect(result.suggestions[0].reason).toBe('fallback explanation');
    expect(result.suggestions[0].originalText).toBe('');
    expect(result.suggestions[0].suggestedText).toBe('');
  });

  it('returns an empty list when suggestions is missing', async () => {
    mockedPost.mockResolvedValueOnce({ success: true });

    const result = await writingService.analyzeImpact('proj-1', {
      standard_key: 'EB1A',
      change_type: 'edit',
      affected_subargument_id: 'sa-1',
    });

    expect(result).toEqual({ success: true, suggestions: [] });
  });
});
