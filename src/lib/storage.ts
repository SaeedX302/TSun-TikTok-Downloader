import type { TikTokMedia } from './types';

export interface HistoryEntry {
  id: string;
  title: string;
  cover: string;
  username: string;
  nickname: string;
  sourceUrl: string;
  kind: 'video' | 'photo';
  savedAt: number;
}

const HISTORY_KEY = 'tsun.history.v1';
const MAX_HISTORY = 10;

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<HistoryEntry>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.sourceUrl === 'string' &&
    typeof entry.savedAt === 'number'
  );
}

export function readHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, MAX_HISTORY);
  } catch {
    return [];
  }
}

function persist(entries: HistoryEntry[]): HistoryEntry[] {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // Private mode / quota exceeded: history is optional.
  }
  return entries;
}

export function historyEntryFromMedia(media: TikTokMedia): HistoryEntry {
  return {
    id: media.id || media.sourceUrl,
    title: media.title || 'TikTok post',
    cover: media.cover || media.images[0] || '',
    username: media.author.username,
    nickname: media.author.nickname,
    sourceUrl: media.sourceUrl,
    kind: media.isPhoto ? 'photo' : 'video',
    savedAt: Date.now(),
  };
}

export function upsertHistory(entry: HistoryEntry, current: HistoryEntry[]): HistoryEntry[] {
  const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, MAX_HISTORY);
  return persist(next);
}

export function removeHistoryEntry(id: string, current: HistoryEntry[]): HistoryEntry[] {
  return persist(current.filter((entry) => entry.id !== id));
}

export function clearHistory(): HistoryEntry[] {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
  } catch {
    // ignore
  }
  return [];
}
