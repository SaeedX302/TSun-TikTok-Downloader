import type { DownloadOption, TikTokMedia } from './types';
import { safeFileName } from './format';

export interface DownloadProgress {
  loaded: number;
  total: number;
  percent: number | null;
}

export interface DownloadResult {
  method: 'blob' | 'direct';
  bytes: number;
}

export class DownloadCancelledError extends Error {
  constructor() {
    super('Download cancelled');
    this.name = 'DownloadCancelledError';
  }
}

export function buildDownloadName(media: TikTokMedia, option: DownloadOption): string {
  const username = safeFileName(media.author.username, 'creator');
  const id = safeFileName(media.id || 'post', 'post');
  return `tsun-${username}-${id}-${option.id}.${option.format}`;
}

function triggerAnchor(url: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

/** Last-resort download that lets the browser handle the file itself. */
export function openDirectDownload(url: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function saveBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  triggerAnchor(objectUrl, filename);
  // Give Safari enough time to start the download before revoking.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
}

/**
 * Download a media file with progress. TikTok CDNs send
 * `Access-Control-Allow-Origin: *`, so we can stream the response into a Blob
 * and force a real file download on desktop as well as Android.
 *
 * If a CDN blocks the CORS request we fall back to a normal anchor download
 * (which still works on mobile and in most browsers).
 */
export async function downloadFile(
  url: string,
  filename: string,
  options: {
    onProgress?: (progress: DownloadProgress) => void;
    signal?: AbortSignal;
  } = {},
): Promise<DownloadResult> {
  const { onProgress, signal } = options;

  try {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      signal,
    });

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const total = Number(response.headers.get('content-length')) || 0;

    if (!response.body) {
      const blob = await response.blob();
      saveBlob(blob, filename);
      onProgress?.({ loaded: blob.size, total: blob.size, percent: 100 });
      return { method: 'blob', bytes: blob.size };
    }

    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];
    let loaded = 0;
    let lastUpdate = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      chunks.push(value);
      loaded += value.byteLength;

      const now = performance.now();
      if (now - lastUpdate > 120 || loaded === total) {
        lastUpdate = now;
        onProgress?.({
          loaded,
          total,
          percent: total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : null,
        });
      }
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = new Blob(chunks, { type: contentType });
    saveBlob(blob, filename);
    onProgress?.({ loaded: blob.size, total: total || blob.size, percent: 100 });

    return { method: 'blob', bytes: blob.size };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new DownloadCancelledError();
    }

    // CORS/network failure: let the browser open the CDN URL directly.
    openDirectDownload(url, filename);
    return { method: 'direct', bytes: 0 };
  }
}
