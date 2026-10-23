/**
 * Parsing helpers for every kind of link the TikTok apps can produce.
 *
 * People rarely paste a clean `https://www.tiktok.com/@user/video/123` URL.
 * They paste share text such as:
 *
 *   Check out @user's video! #TikTok > https://vm.tiktok.com/ZMabc123/
 *   https%3A%2F%2Fwww.tiktok.com%2F%40user%2Fvideo%2F123...
 *   snssdk1233://aweme/detail/123
 *   tiktok.com/t/ZTabc123/
 *
 * Everything below normalises that input before it reaches the API.
 */

export type TikTokLinkKind = 'video' | 'photo' | 'short' | 'unknown';

export interface ParsedTikTokLink {
  /** The raw (but normalised) input the user pasted. */
  input: string;
  /** A clean URL extracted from the input. */
  url: string;
  /** The URL that should be sent to the download API. */
  apiUrl: string;
  /** A stable, tracking-free URL when a numeric post id is known. */
  canonicalUrl: string;
  kind: TikTokLinkKind;
  videoId?: string;
  username?: string;
  isShort: boolean;
}

export type ParseResult =
  | { ok: true; link: ParsedTikTokLink }
  | { ok: false; error: string };

const SHORT_HOSTS = new Set([
  'vm.tiktok.com',
  'vt.tiktok.com',
  't.tiktok.com',
]);

const TRAILING_PUNCTUATION = /[.,;:!?)\]}>'"“”‘’»]+$/;
const INVISIBLE_CHARACTERS = /[\u200B-\u200D\u2060\uFEFF]/g;

/** Decode percent-encoding without throwing on malformed input. */
function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Share-sheet text is frequently URL-encoded (sometimes twice), contains
 * zero-width characters, HTML entities or non-breaking spaces. Normalise all
 * of that before looking for a URL.
 */
export function normalizeShareText(raw: string): string {
  let value = raw
    .normalize('NFKC')
    .replace(INVISIBLE_CHARACTERS, '')
    .replace(/\u00A0/g, ' ')
    .replace(/&amp;/gi, '&')
    .trim();

  // Decode up to three layers (apps sometimes double/triple encode).
  for (let i = 0; i < 3; i += 1) {
    if (!/%[0-9a-f]{2}/i.test(value)) break;
    const decoded = safeDecode(value);
    if (decoded === value) break;
    value = decoded
      .replace(INVISIBLE_CHARACTERS, '')
      .replace(/\u00A0/g, ' ')
      .trim();
  }

  return value;
}

/** Strip punctuation that share text tends to glue onto the URL. */
function cleanUrlToken(token: string): string {
  let value = token.trim();
  // Remove matching wrapping characters, e.g. `<https://...>` or "(https://...)"
  value = value.replace(/^[<("'“”‘’]+/, '');
  value = value.replace(TRAILING_PUNCTUATION, '');
  value = value.replace(/\/+$/, (match) => (match.length > 1 ? '/' : match));
  return value;
}

const TIKTOK_URL_PATTERN =
  /(?:^|[^a-z0-9.-])((?:https?:\/\/)?(?:[a-z0-9-]+\.)*tiktok\.com\/[^\s<>"'`]+)/i;

const DEEP_LINK_PATTERN =
  /(?:snssdk(?:1128|1233)|aweme|tiktok|douyin):\/\/[^\s<>"'`]+/i;

const DEEP_LINK_ID_PATTERN = /(?:detail|video|photo)\/(\d{8,})/i;
const DEEP_LINK_ITEM_PATTERN = /(?:item_id|aweme_id|video_id)=(\d{8,})/i;

function isTikTokHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === 'tiktok.com' || host.endsWith('.tiktok.com');
}

function toUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function parsePath(link: ParsedTikTokLink, url: URL): void {
  const segments = url.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return;

  // /@user/video/123 and /@user/photo/123
  if (segments[0].startsWith('@')) {
    const username = safeDecode(segments[0].slice(1)) || undefined;
    const kind = segments[1];
    const id = segments[2];

    if ((kind === 'video' || kind === 'photo') && id && /^\d+$/.test(id)) {
      link.kind = kind;
      link.videoId = id;
      link.username = username;
      link.canonicalUrl = username
        ? `https://www.tiktok.com/@${username}/${kind}/${id}`
        : `https://www.tiktok.com/${kind}/${id}`;
      link.apiUrl = link.canonicalUrl;
      return;
    }

    // A profile link cannot be downloaded.
    link.kind = 'unknown';
    link.username = username;
    return;
  }

  // /video/123 and /photo/123
  if ((segments[0] === 'video' || segments[0] === 'photo') && segments[1]) {
    const id = segments[1];
    if (/^\d+$/.test(id)) {
      link.kind = segments[0];
      link.videoId = id;
      link.canonicalUrl = `https://www.tiktok.com/${segments[0]}/${id}`;
      link.apiUrl = link.canonicalUrl;
    }
    return;
  }

  // /v/123.html (legacy mobile links)
  if (segments[0] === 'v' && segments[1]) {
    const id = segments[1].replace(/\.html$/i, '');
    if (/^\d+$/.test(id)) {
      link.kind = 'video';
      link.videoId = id;
      link.canonicalUrl = `https://www.tiktok.com/video/${id}`;
      link.apiUrl = link.canonicalUrl;
    }
    return;
  }

  // /embed/v2/123 and /embed/123
  if (segments[0] === 'embed') {
    const id = segments[segments.length - 1];
    if (/^\d+$/.test(id)) {
      link.kind = 'video';
      link.videoId = id;
      link.canonicalUrl = `https://www.tiktok.com/video/${id}`;
      link.apiUrl = link.canonicalUrl;
    }
    return;
  }

  // /share/video/123 and /share/photo/123
  if (segments[0] === 'share' && (segments[1] === 'video' || segments[1] === 'photo')) {
    const id = segments[2];
    if (id && /^\d+$/.test(id)) {
      link.kind = segments[1];
      link.videoId = id;
      link.canonicalUrl = `https://www.tiktok.com/${segments[1]}/${id}`;
      link.apiUrl = link.canonicalUrl;
    }
    return;
  }

  // tiktok.com/t/ZTabc123 - the short links created by the mobile apps.
  if (segments[0] === 't' && segments[1]) {
    link.kind = 'short';
    link.isShort = true;
    link.apiUrl = `${url.origin}/t/${segments[1]}/`;
    link.canonicalUrl = link.apiUrl;
    return;
  }

  // vm.tiktok.com/ZMabc123 and vt.tiktok.com/ZSabc123
  if (SHORT_HOSTS.has(url.hostname.toLowerCase()) && segments[0]) {
    link.kind = 'short';
    link.isShort = true;
    link.apiUrl = `${url.origin}/${segments[0]}/`;
    link.canonicalUrl = link.apiUrl;
  }
}

/**
 * Extract and parse the first TikTok link in a chunk of pasted text.
 */
export function parseTikTokLink(rawInput: string): ParseResult {
  const input = normalizeShareText(rawInput);

  if (!input) {
    return { ok: false, error: 'Paste a TikTok link first.' };
  }

  const deepLink = input.match(DEEP_LINK_PATTERN)?.[0];
  if (deepLink) {
    const id =
      deepLink.match(DEEP_LINK_ID_PATTERN)?.[1] ??
      deepLink.match(DEEP_LINK_ITEM_PATTERN)?.[1];

    if (id) {
      const canonicalUrl = `https://www.tiktok.com/video/${id}`;
      return {
        ok: true,
        link: {
          input,
          url: deepLink,
          apiUrl: canonicalUrl,
          canonicalUrl,
          kind: 'video',
          videoId: id,
          isShort: false,
        },
      };
    }
  }

  const urlMatch = input.match(TIKTOK_URL_PATTERN)?.[1];
  let candidate = urlMatch ? cleanUrlToken(urlMatch) : '';

  if (!candidate) {
    return {
      ok: false,
      error:
        'That does not look like a TikTok link. Copy the link from the TikTok app and paste the whole message here.',
    };
  }

  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }

  const url = toUrl(candidate);
  if (!url || !isTikTokHost(url.hostname)) {
    return {
      ok: false,
      error:
        'That does not look like a TikTok link. Copy the link from the TikTok app and paste the whole message here.',
    };
  }

  const link: ParsedTikTokLink = {
    input,
    url: url.toString(),
    apiUrl: url.toString(),
    canonicalUrl: url.toString(),
    kind: 'unknown',
    isShort: false,
  };

  parsePath(link, url);

  // Some share links carry the post id in the query string.
  if (!link.videoId) {
    const queryId =
      url.searchParams.get('share_item_id') ??
      url.searchParams.get('item_id') ??
      url.searchParams.get('video_id') ??
      url.searchParams.get('aweme_id');

    if (queryId && /^\d+$/.test(queryId)) {
      link.videoId = queryId;
      link.kind = 'video';
      link.canonicalUrl = `https://www.tiktok.com/video/${queryId}`;
      link.apiUrl = link.canonicalUrl;
    }
  }

  if (link.kind === 'unknown') {
    if (link.username) {
      return {
        ok: false,
        error: `That is a profile link (https://www.tiktok.com/@${link.username}). Open a video or photo post, tap Share, then Copy link.`,
      };
    }

    return {
      ok: false,
      error:
        'That TikTok link does not point to a video or photo. Open the post, tap Share, then Copy link.',
    };
  }

  // Drop query parameters from normal post links; they are tracking data and
  // can cause the API to reject otherwise valid URLs.
  if (link.kind === 'video' || link.kind === 'photo') {
    link.url = link.canonicalUrl;
  }

  return { ok: true, link };
}

/** Human readable label for a parsed link, used by the UI. */
export function describeLink(link: ParsedTikTokLink): string {
  if (link.kind === 'short') return 'App share link';
  if (link.kind === 'photo') return 'Photo post';
  if (link.kind === 'video') return 'Video link';
  return 'TikTok link';
}

