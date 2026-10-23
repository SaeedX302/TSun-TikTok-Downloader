import type {
  DownloadOption,
  TikTokMedia,
  TikTokMusic,
  TikTokStats,
} from './types';
import type { ParsedTikTokLink } from './tiktokUrl';

const API_ENDPOINTS = [
  'https://tikwm.com/api/',
  'https://www.tikwm.com/api/',
];

const CACHE_PREFIX = 'tsun.media.v2.';
const CACHE_TTL_MS = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 3;

type UnknownRecord = Record<string, unknown>;

interface TikwmEnvelope {
  code?: number;
  msg?: string;
  data?: UnknownRecord;
}

export class TikTokApiError extends Error {
  readonly hint?: string;

  constructor(message: string, hint?: string) {
    super(message);
    this.name = 'TikTokApiError';
    this.hint = hint;
  }
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1';
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    const text = asString(value).trim();
    if (text) return text;
  }
  return '';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isRateLimitMessage(message: string): boolean {
  return /limit|too many|busy|try again|frequency/i.test(message);
}

function cacheKey(link: ParsedTikTokLink): string {
  return `${CACHE_PREFIX}${link.videoId ?? link.apiUrl}`;
}

function readCache(link: ParsedTikTokLink): TikTokMedia | null {
  try {
    const raw = window.sessionStorage.getItem(cacheKey(link));
    if (!raw) return null;

    const entry = JSON.parse(raw) as { savedAt: number; media: TikTokMedia };
    if (!entry?.media || Date.now() - entry.savedAt > CACHE_TTL_MS) {
      window.sessionStorage.removeItem(cacheKey(link));
      return null;
    }

    return entry.media;
  } catch {
    return null;
  }
}

function writeCache(link: ParsedTikTokLink, media: TikTokMedia): void {
  try {
    window.sessionStorage.setItem(
      cacheKey(link),
      JSON.stringify({ savedAt: Date.now(), media }),
    );
  } catch {
    // Storage may be full or blocked (private mode). Caching is best-effort.
  }
}

function uniqueDownloads(options: DownloadOption[]): DownloadOption[] {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (!option.url) return false;
    const key = `${option.kind}:${option.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function browserSafeUrl(value: string): string {
  if (!value) return '';
  if (value.startsWith('//')) return `https:${value}`;
  return value;
}

function buildStats(data: UnknownRecord): TikTokStats {
  return {
    plays: asNumber(data.play_count),
    likes: asNumber(data.digg_count),
    comments: asNumber(data.comment_count),
    shares: asNumber(data.share_count),
    downloads: asNumber(data.download_count),
    saves: asNumber(data.collect_count),
  };
}

function buildMusic(data: UnknownRecord): TikTokMusic {
  const info = asRecord(data.music_info);
  return {
    title: firstString(info.title, data.music_title, 'Original sound'),
    author: firstString(info.author, 'TikTok creator'),
    cover: browserSafeUrl(firstString(info.cover)),
    url: browserSafeUrl(firstString(info.play)),
    duration: asNumber(info.duration) || undefined,
  };
}

function buildDownloads(
  data: UnknownRecord,
  media: { isPhoto: boolean; images: string[]; audio: string; hd: string; noWatermark: string; watermark: string },
): DownloadOption[] {
  const options: DownloadOption[] = [];

  if (media.isPhoto && media.images.length > 0) {
    media.images.forEach((url, index) => {
      const isWebp = /\.webp(\?|$)/i.test(url);
      options.push({
        id: `image-${index + 1}`,
        label: `Photo ${index + 1}`,
        description: isWebp ? 'WEBP · original quality' : 'JPG · original quality',
        url,
        kind: 'image',
        format: isWebp ? 'webp' : 'jpg',
        badge: index === 0 ? 'Cover' : undefined,
      });
    });
  } else {
    if (media.hd) {
      options.push({
        id: 'hd',
        label: 'HD video',
        description: 'MP4 · no watermark',
        url: media.hd,
        kind: 'video',
        format: 'mp4',
        quality: 'HD',
        size: asNumber(data.hd_size) || undefined,
        badge: 'Best quality',
      });
    }

    if (media.noWatermark && media.noWatermark !== media.hd) {
      options.push({
        id: 'no-watermark',
        label: media.isPhoto ? 'Slideshow' : 'Standard video',
        description: 'MP4 · no watermark',
        url: media.noWatermark,
        kind: 'video',
        format: 'mp4',
        quality: 'SD',
        size: asNumber(data.size) || undefined,
      });
    }

    if (media.watermark) {
      options.push({
        id: 'watermark',
        label: 'Original video',
        description: 'MP4 · with TikTok watermark',
        url: media.watermark,
        kind: 'video',
        format: 'mp4',
        quality: 'Original',
        size: asNumber(data.wm_size) || undefined,
      });
    }
  }

  if (media.audio) {
    options.push({
      id: 'audio',
      label: 'Audio only',
      description: 'MP3 · original sound',
      url: media.audio,
      kind: 'audio',
      format: 'mp3',
    });
  }

  return uniqueDownloads(options);
}

/** Convert a TikWM payload into the app's stable media model. */
export function normalizeTikwmResponse(
  data: UnknownRecord,
  link: ParsedTikTokLink,
): TikTokMedia {
  const author = asRecord(data.author);
  const images = Array.isArray(data.images)
    ? data.images.map((image) => browserSafeUrl(asString(image))).filter(Boolean)
    : [];

  const hd = browserSafeUrl(firstString(data.hdplay, data.hd_play));
  const noWatermark = browserSafeUrl(firstString(data.play, data.play_addr));
  const watermark = browserSafeUrl(firstString(data.wmplay, data.wm_play));
  const audio = browserSafeUrl(
    firstString(
      asRecord(data.music_info).play,
      typeof data.music === 'string' ? data.music : '',
      data.music_url,
    ),
  );

  const isPhoto = images.length > 0 || link.kind === 'photo';

  const media: TikTokMedia = {
    id: firstString(data.id, data.aweme_id, link.videoId),
    title: firstString(data.title, 'TikTok post'),
    createdAt: asNumber(data.create_time) || undefined,
    duration: asNumber(data.duration),
    cover: browserSafeUrl(
      firstString(data.cover, data.origin_cover, data.ai_dynamic_cover, images[0]),
    ),
    originCover: browserSafeUrl(firstString(data.origin_cover)) || undefined,
    dynamicCover: browserSafeUrl(firstString(data.ai_dynamic_cover)) || undefined,
    author: {
      id: firstString(author.id, author.sec_uid) || undefined,
      username: firstString(author.unique_id, author.nickname, link.username, 'tiktok'),
      nickname: firstString(author.nickname, author.unique_id, link.username, 'TikTok creator'),
      avatar: browserSafeUrl(firstString(author.avatar, author.avatar_larger)) || '/avatar.svg',
      verified: asBoolean(author.verified),
    },
    music: buildMusic(data),
    stats: buildStats(data),
    isPhoto,
    images,
    video: {
      hd: hd || undefined,
      noWatermark: noWatermark || undefined,
      watermark: watermark || undefined,
      size: asNumber(data.size) || undefined,
      hdSize: asNumber(data.hd_size) || undefined,
      wmSize: asNumber(data.wm_size) || undefined,
    },
    audio: audio || undefined,
    downloads: [],
    sourceUrl: link.canonicalUrl,
    provider: 'tikwm',
  };

  media.downloads = buildDownloads(data, {
    isPhoto,
    images,
    audio: media.audio ?? '',
    hd: media.video.hd ?? '',
    noWatermark: media.video.noWatermark ?? '',
    watermark: media.video.watermark ?? '',
  });

  return media;
}

function getEndpoints(): string[] {
  const custom = import.meta.env.VITE_TIKWM_API_BASE?.trim();
  return custom ? [custom] : API_ENDPOINTS;
}

async function requestEnvelope(
  endpoint: string,
  link: ParsedTikTokLink,
): Promise<TikwmEnvelope> {
  const query = new URLSearchParams({ url: link.apiUrl, hd: '1' });
  let timeoutId: number | undefined;

  try {
    const timeout = new Promise<never>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new DOMException('The request timed out.', 'AbortError'));
      }, REQUEST_TIMEOUT_MS);
    });

    const response = await Promise.race([
      fetch(`${endpoint}?${query.toString()}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      }),
      timeout,
    ]);

    if (!response.ok) {
      throw new TikTokApiError(
        `The download service responded with ${response.status}.`,
        'This is usually temporary. Wait a moment and try again.',
      );
    }

    return (await response.json()) as TikwmEnvelope;
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }
}

export interface FetchMediaOptions {
  forceRefresh?: boolean;
}

/**
 * Fetch metadata and download URLs for a parsed TikTok link.
 *
 * TikWM is used because it resolves app share links (vm./vt./t/) on the
 * server, needs no API key and sends CORS headers for browser use. Requests
 * are retried around the free tier's 1 request/second limit.
 */
export async function fetchTikTokMedia(
  link: ParsedTikTokLink,
  options: FetchMediaOptions = {},
): Promise<TikTokMedia> {
  if (!options.forceRefresh) {
    const cached = readCache(link);
    if (cached) return cached;
  }

  const endpoints = getEndpoints();
  let lastNetworkError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const endpoint = endpoints[attempt % endpoints.length];

    try {
      const envelope = await requestEnvelope(endpoint, link);
      const message = asString(envelope.msg);
      const data = asRecord(envelope.data);

      if (envelope.code === 0 && Object.keys(data).length > 0) {
        const media = normalizeTikwmResponse(data, link);

        if (media.downloads.length === 0 && !media.isPhoto) {
          throw new TikTokApiError(
            'No downloadable video was found for this post.',
            'The post may be a live stream, private, or region-locked. Try a different link.',
          );
        }

        writeCache(link, media);
        return media;
      }

      if (isRateLimitMessage(message)) {
        if (attempt < MAX_ATTEMPTS - 1) {
          await delay(1_400 * (attempt + 1));
          continue;
        }

        throw new TikTokApiError(
          "TikTok's free service is rate-limiting requests.",
          'It allows one request per second. Wait a few seconds, then try again.',
        );
      }

      if (/parsing is failed|url parsing|invalid url|failed/i.test(message)) {
        if (attempt < MAX_ATTEMPTS - 1) {
          await delay(900 * (attempt + 1));
          continue;
        }

        throw new TikTokApiError(
          'TikTok could not read this link.',
          'The post may be private, deleted, region-locked, or the share link has expired. Open it in TikTok, tap Share then Copy link, and paste the fresh link.',
        );
      }

      throw new TikTokApiError(
        message || 'TikTok did not return any data for this link.',
        'Try a different link or come back in a minute.',
      );
    } catch (error) {
      if (error instanceof TikTokApiError) {
        throw error;
      }

      lastNetworkError = error;

      if (attempt < MAX_ATTEMPTS - 1) {
        await delay(800 * (attempt + 1));
      }
    }
  }

  const timedOut =
    lastNetworkError instanceof DOMException && lastNetworkError.name === 'AbortError';

  throw new TikTokApiError(
    timedOut
      ? 'The request to TikTok timed out.'
      : "We couldn't reach the download service.",
    'Check your internet connection, turn off any VPN/ad-blocker for this site, then try again.',
  );
}
