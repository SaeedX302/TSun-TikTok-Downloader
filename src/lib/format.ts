/** Small pure formatting helpers shared by the UI. */

export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0';

  if (value >= 1_000_000_000) {
    return `${trimZero(value / 1_000_000_000)}B`;
  }
  if (value >= 1_000_000) {
    return `${trimZero(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    if (thousands >= 999.95) return `${trimZero(value / 1_000_000)}M`;
    return `${trimZero(thousands)}K`;
  }

  return String(Math.round(value));
}

function trimZero(value: number): string {
  return value >= 100 ? String(Math.round(value)) : value.toFixed(1).replace(/\.0$/, '');
}

export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0:00';

  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
  }

  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || !Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatRelativeDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Create a filesystem-safe name with a sensible fallback. */
export function safeFileName(value: string, fallback = 'tiktok'): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80);

  return cleaned || fallback;
}
