import { describe, expect, it } from 'vitest';
import { parseTikTokLink } from './tiktokUrl';

const VIDEO_ID = '7376784960625085742';

describe('parseTikTokLink', () => {
  it('parses a direct video link and removes tracking parameters', () => {
    const result = parseTikTokLink(
      'https://www.tiktok.com/@ladygaga/video/7376784960625085742?is_from_webapp=1&sender_device=pc&web_id=123',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.link.kind).toBe('video');
    expect(result.link.videoId).toBe(VIDEO_ID);
    expect(result.link.username).toBe('ladygaga');
    expect(result.link.canonicalUrl).toBe(
      `https://www.tiktok.com/@ladygaga/video/${VIDEO_ID}`,
    );
    expect(result.link.apiUrl).toBe(result.link.canonicalUrl);
  });

  it('extracts a vm.tiktok.com short link from a full share message', () => {
    const result = parseTikTokLink(
      "Check out @ladygaga's video! #TikTok > https://vm.tiktok.com/ZMabc123/ 😍",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.link.kind).toBe('short');
    expect(result.link.isShort).toBe(true);
    expect(result.link.apiUrl).toBe('https://vm.tiktok.com/ZMabc123/');
  });

  it('decodes a URL-encoded share message', () => {
    const share =
      'Check out this video! https://www.tiktok.com/@ladygaga/video/7376784960625085742?is_from_webapp=1';
    const result = parseTikTokLink(encodeURIComponent(share));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.videoId).toBe(VIDEO_ID);
  });

  it('decodes double-encoded share text', () => {
    const share = 'https://vt.tiktok.com/ZSabc123/';
    const result = parseTikTokLink(encodeURIComponent(encodeURIComponent(share)));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.kind).toBe('short');
    expect(result.link.apiUrl).toBe('https://vt.tiktok.com/ZSabc123/');
  });

  it('handles zero-width characters and HTML entities', () => {
    const result = parseTikTokLink(
      'Look at this\u200b\u200d &amp; enjoy https://www.tiktok.com/t/ZTabc123/',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.kind).toBe('short');
    expect(result.link.apiUrl).toBe('https://www.tiktok.com/t/ZTabc123/');
  });

  it('accepts links without a protocol', () => {
    const result = parseTikTokLink('vm.tiktok.com/ZMabc123/');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.apiUrl).toBe('https://vm.tiktok.com/ZMabc123/');
  });

  it('parses photo posts', () => {
    const result = parseTikTokLink('https://www.tiktok.com/@creator/photo/7504460423278742792');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.kind).toBe('photo');
    expect(result.link.videoId).toBe('7504460423278742792');
  });

  it('parses legacy mobile links', () => {
    const result = parseTikTokLink('https://m.tiktok.com/v/7376784960625085742.html');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.kind).toBe('video');
    expect(result.link.videoId).toBe(VIDEO_ID);
  });

  it('parses Android deep links', () => {
    const result = parseTikTokLink(
      'snssdk1233://aweme/detail/7376784960625085742?refer=web',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.videoId).toBe(VIDEO_ID);
    expect(result.link.apiUrl).toBe(`https://www.tiktok.com/video/${VIDEO_ID}`);
  });

  it('reads the post id from a share_item_id query parameter', () => {
    const result = parseTikTokLink(
      'https://www.tiktok.com/@/video/?share_item_id=7376784960625085742',
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.videoId).toBe(VIDEO_ID);
    expect(result.link.kind).toBe('video');
  });

  it('strips punctuation and emoji around a direct link', () => {
    const result = parseTikTokLink(
      `Watch this (https://www.tiktok.com/@user/video/${VIDEO_ID}).`,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.videoId).toBe(VIDEO_ID);
  });

  it('supports username-less links produced by the share fallback', () => {
    const result = parseTikTokLink(
      `https://www.tiktok.com/@/video/${VIDEO_ID}?share_item_id=${VIDEO_ID}`,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.canonicalUrl).toBe(`https://www.tiktok.com/video/${VIDEO_ID}`);
  });

  it('rejects profile links with a helpful message', () => {
    const result = parseTikTokLink('https://www.tiktok.com/@ladygaga');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('profile link');
  });

  it('rejects non-TikTok links', () => {
    const result = parseTikTokLink('https://not-tiktok.com/watch?v=123');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toContain('does not look like a TikTok link');
  });

  it('rejects empty input', () => {
    const result = parseTikTokLink('   ');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('Paste a TikTok link first.');
  });
});
