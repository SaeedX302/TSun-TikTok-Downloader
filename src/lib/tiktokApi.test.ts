import { describe, expect, it } from 'vitest';
import { normalizeTikwmResponse } from './tiktokApi';
import { parseTikTokLink } from './tiktokUrl';

function parseOrThrow(url: string) {
  const result = parseTikTokLink(url);
  if (!result.ok) throw new Error(result.error);
  return result.link;
}

const baseData = {
  id: '7376784960625085742',
  title: 'A test video',
  duration: 42,
  create_time: 1717541595,
  cover: 'https://cdn.example.com/cover.jpg',
  origin_cover: 'https://cdn.example.com/origin.jpg',
  ai_dynamic_cover: 'https://cdn.example.com/dynamic.webp',
  hdplay: 'https://cdn.example.com/hd.mp4',
  play: 'https://cdn.example.com/sd.mp4',
  wmplay: 'https://cdn.example.com/wm.mp4',
  size: 1_000_000,
  hd_size: 2_500_000,
  wm_size: 1_200_000,
  music: '',
  music_info: {
    id: '1',
    title: 'Test sound',
    author: 'Test artist',
    cover: 'https://cdn.example.com/music.jpg',
    play: 'https://cdn.example.com/music.mp3',
    duration: 42,
  },
  play_count: 1500,
  digg_count: 2_000_000,
  comment_count: 30,
  share_count: 4,
  collect_count: 5,
  download_count: 6,
  author: {
    id: '99',
    unique_id: 'ladygaga',
    nickname: 'Lady Gaga',
    avatar: 'https://cdn.example.com/avatar.jpg',
    verified: true,
  },
};

describe('normalizeTikwmResponse', () => {
  it('maps a video payload to download options', () => {
    const link = parseOrThrow(
      'https://www.tiktok.com/@ladygaga/video/7376784960625085742',
    );
    const media = normalizeTikwmResponse(baseData, link);

    expect(media.id).toBe('7376784960625085742');
    expect(media.isPhoto).toBe(false);
    expect(media.duration).toBe(42);
    expect(media.author.username).toBe('ladygaga');
    expect(media.author.verified).toBe(true);
    expect(media.music.title).toBe('Test sound');
    expect(media.stats.likes).toBe(2_000_000);
    expect(media.downloads.map((option) => option.id)).toEqual([
      'hd',
      'no-watermark',
      'watermark',
      'audio',
    ]);
    expect(media.downloads[0].url).toBe('https://cdn.example.com/hd.mp4');
    expect(media.downloads[0].size).toBe(2_500_000);
    expect(media.video.hd).toBe('https://cdn.example.com/hd.mp4');
    expect(media.audio).toBe('https://cdn.example.com/music.mp3');
    expect(media.sourceUrl).toBe(link.canonicalUrl);
  });

  it('does not duplicate the standard download when it equals the HD file', () => {
    const link = parseOrThrow(
      'https://www.tiktok.com/@ladygaga/video/7376784960625085742',
    );
    const media = normalizeTikwmResponse(
      { ...baseData, hdplay: '', play: 'https://cdn.example.com/only.mp4' },
      link,
    );

    expect(media.downloads.map((option) => option.id)).toEqual([
      'no-watermark',
      'watermark',
      'audio',
    ]);
    expect(media.downloads[0].url).toBe('https://cdn.example.com/only.mp4');
  });

  it('maps photo carousels to per-image downloads', () => {
    const link = parseOrThrow(
      'https://www.tiktok.com/@creator/photo/7504460423278742792',
    );
    const media = normalizeTikwmResponse(
      {
        ...baseData,
        id: '7504460423278742792',
        images: [
          'https://cdn.example.com/one.jpg',
          'https://cdn.example.com/two.webp',
        ],
        play: '',
        wmplay: '',
        hdplay: '',
      },
      link,
    );

    expect(media.isPhoto).toBe(true);
    expect(media.images).toHaveLength(2);
    expect(media.downloads.map((option) => option.id)).toEqual([
      'image-1',
      'image-2',
      'audio',
    ]);
    expect(media.downloads[1].format).toBe('webp');
    expect(media.downloads[0].kind).toBe('image');
  });

  it('falls back to local placeholder assets', () => {
    const link = parseOrThrow(
      'https://www.tiktok.com/@ladygaga/video/7376784960625085742',
    );
    const media = normalizeTikwmResponse(
      { id: '1', play: 'https://cdn.example.com/video.mp4', author: {} },
      link,
    );

    expect(media.author.avatar).toBe('/avatar.svg');
    expect(media.author.username).toBe('ladygaga');
    expect(media.cover).toBe('');
    expect(media.downloads).toHaveLength(1);
  });

  it('normalises protocol-relative URLs', () => {
    const link = parseOrThrow(
      'https://www.tiktok.com/@ladygaga/video/7376784960625085742',
    );
    const media = normalizeTikwmResponse(
      {
        ...baseData,
        cover: '//cdn.example.com/cover.jpg',
        hdplay: '//cdn.example.com/hd.mp4',
      },
      link,
    );

    expect(media.cover).toBe('https://cdn.example.com/cover.jpg');
    expect(media.video.hd).toBe('https://cdn.example.com/hd.mp4');
  });
});
