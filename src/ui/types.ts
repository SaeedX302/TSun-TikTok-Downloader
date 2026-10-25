import type { Theme } from '../hooks/useTheme';
import type { DownloadProgress } from '../lib/download';
import type { HistoryEntry } from '../lib/storage';
import type { DownloadOption, TikTokMedia } from '../lib/types';
import type { ParseResult } from '../lib/tiktokUrl';

export type Platform = 'desktop' | 'android' | 'ios';
export type Tab = 'download' | 'recent' | 'guide';

export interface FormError {
  message: string;
  hint?: string;
}

export interface AppController {
  input: string;
  parsed: ParseResult | null;
  error: FormError | null;
  isLoading: boolean;
  media: TikTokMedia | null;
  activeDownload: string | null;
  progress: DownloadProgress | null;
  history: HistoryEntry[];
  onInput: (value: string) => void;
  onSubmit: () => void;
  onPaste: () => void;
  onUseSample: () => void;
  onDismissError: () => void;
  onDownload: (option: DownloadOption) => void;
  onCancelDownload: () => void;
  onCopy: (text: string, label: string) => void;
  onNewLink: () => void;
  onSelectHistory: (entry: HistoryEntry) => void;
  onRemoveHistory: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
}

export interface ShellProps {
  platform: Platform;
  tab: Tab;
  theme: Theme;
  onTabChange: (tab: Tab) => void;
  onToggleTheme: () => void;
}
