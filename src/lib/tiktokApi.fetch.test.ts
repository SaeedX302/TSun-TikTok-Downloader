// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchTikTokMedia, TikTokApiError } from './tiktokApi';
import { parseTikTokLink } from './tiktokUrl';

function postLink(kind: 'photo' | 'video') {
  const result = parseTikTokLink(`https://www.tiktok.com/@creator/${kind}/123`);
  if (!result.ok) throw new Error(result.error);
  return result.link;
}

function apiResponse(data: Record<string, unknown>) {
  return new Response(JSON.stringify({ code: 0, data }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('fetchTikTokMedia', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.sessionStorage.clear();
  });

  it.each(['photo', 'video'] as const)(
    'rejects an empty %s result without caching it, allowing a later retry',
    async (kind) => {
      const fetchMock = vi.fn()
        .mockResolvedValueOnce(apiResponse({ id: '123', images: [] }))
        .mockResolvedValueOnce(apiResponse({
          id: '123',
          images: ['https://cdn.example.com/photo.jpg'],
        }));
      vi.stubGlobal('fetch', fetchMock);
      const link = postLink(kind);

      await expect(fetchTikTokMedia(link)).rejects.toBeInstanceOf(TikTokApiError);
      expect(window.sessionStorage.length).toBe(0);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const media = await fetchTikTokMedia(link);
      expect(media.downloads).toHaveLength(1);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    },
  );

  it('still returns and caches a photo post with downloadable images', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(apiResponse({
      id: '123',
      images: ['https://cdn.example.com/photo.jpg'],
    }));
    vi.stubGlobal('fetch', fetchMock);
    const link = postLink('photo');

    const media = await fetchTikTokMedia(link);
    expect(media.isPhoto).toBe(true);
    expect(media.downloads).toEqual([
      expect.objectContaining({ kind: 'image', url: 'https://cdn.example.com/photo.jpg' }),
    ]);
    await expect(fetchTikTokMedia(link)).resolves.toEqual(media);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
