import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DownloadOption, TikTokMedia } from './lib/types';
import { describeLink, parseTikTokLink } from './lib/tiktokUrl';
import { TikTokApiError, fetchTikTokMedia } from './lib/tiktokApi';
import { DownloadCancelledError, buildDownloadName, downloadFile } from './lib/download';
import type { DownloadProgress } from './lib/download';
import {
  clearHistory,
  historyEntryFromMedia,
  readHistory,
  removeHistoryEntry,
  upsertHistory,
} from './lib/storage';
import type { HistoryEntry } from './lib/storage';
import { useTheme } from './hooks/useTheme';
import { usePlatform } from './hooks/usePlatform';
import type { AppController, FormError, Tab } from './ui/types';
import { Shell } from './components/Shell';
import { DownloadScreen } from './components/DownloadScreen';
import { RecentScreen } from './components/RecentScreen';
import { GuideScreen } from './components/GuideScreen';
import { PlatformToast } from './components/PlatformToast';
import type { ToastState, ToastTone } from './components/PlatformToast';

const SAMPLE_URL = 'https://www.tiktok.com/@ladygaga/video/7376784960625085742';

const THEME_COLORS = {
  desktop: { light: '#F2EFE7', dark: '#131210' },
  android: { light: '#F6F8F4', dark: '#0F1410' },
  ios: { light: '#F2F2F7', dark: '#000000' },
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(area);
      return copied;
    } catch {
      return false;
    }
  }
}

function App() {
  const platform = usePlatform();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>('download');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<TikTokMedia | null>(null);
  const [error, setError] = useState<FormError | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(readHistory);
  const [activeDownload, setActiveDownload] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const toastTimer = useRef<number | null>(null);
  const downloadAbort = useRef<AbortController | null>(null);

  const parsed = useMemo(() => (input.trim() ? parseTikTokLink(input) : null), [input]);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, tone });
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      downloadAbort.current?.abort();
    };
  }, []);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[platform][theme]);
  }, [platform, theme]);

  useEffect(() => {
    document.title =
      tab === 'download'
        ? 'TSun — TikTok downloader'
        : tab === 'recent'
          ? 'Recent — TSun'
          : 'Guide — TSun';
  }, [tab]);

  const changeTab = useCallback((next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleFetch = useCallback(
    async (raw: string, options: { forceRefresh?: boolean } = {}) => {
      const result = parseTikTokLink(raw);

      if (!result.ok) {
        setError({ message: result.error });
        setMedia(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setMedia(null);

      try {
        const fetched = await fetchTikTokMedia(result.link, {
          forceRefresh: options.forceRefresh,
        });

        setMedia(fetched);
        setHistory((current) => upsertHistory(historyEntryFromMedia(fetched), current));
        showToast(
          fetched.isPhoto
            ? `Photo post loaded · ${fetched.images.length} images found`
            : `Video loaded · ${describeLink(result.link)}`,
          'success',
        );
      } catch (caught) {
        if (caught instanceof TikTokApiError) {
          setError({ message: caught.message, hint: caught.hint });
        } else {
          setError({
            message: 'Something went wrong while fetching this video.',
            hint: 'Check your connection and try again.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [showToast],
  );

  const handleSubmit = () => {
    if (isLoading) return;
    if (!input.trim()) {
      setError({ message: 'Paste a TikTok link first.' });
      inputRef.current?.focus();
      return;
    }
    void handleFetch(input);
  };


  const handlePaste = async () => {
    if (!navigator.clipboard || typeof navigator.clipboard.readText !== 'function') {
      inputRef.current?.focus();
      showToast('Clipboard access is unavailable. Press and hold the field, then choose Paste.', 'info');
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        showToast('Your clipboard is empty.', 'info');
        return;
      }

      setInput(text);
      setError(null);

      const result = parseTikTokLink(text);
      if (result.ok) {
        showToast(`${describeLink(result.link)} detected. Tap Get video.`, 'success');
      } else {
        showToast('Pasted. TSun will look for a TikTok link when you continue.', 'info');
      }
    } catch {
      inputRef.current?.focus();
      showToast('Clipboard access is blocked. Press and hold the field, then choose Paste.', 'error');
    }
  };

  const handleUseSample = () => {
    if (isLoading) return;
    setInput(SAMPLE_URL);
    void handleFetch(SAMPLE_URL);
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    if (isLoading) return;
    setInput(entry.sourceUrl);
    changeTab('download');
    void handleFetch(entry.sourceUrl);
  };

  const handleDownload = async (option: DownloadOption) => {
    if (!media || activeDownload) return;

    const controller = new AbortController();
    downloadAbort.current = controller;
    setActiveDownload(option.id);
    setProgress({ loaded: 0, total: 0, percent: null });

    try {
      const result = await downloadFile(option.url, buildDownloadName(media, option), {
        signal: controller.signal,
        onProgress: setProgress,
      });

      if (result.method === 'direct') {
        showToast('Opened in a new tab. Long-press the file and choose Download.', 'info');
      } else {
        showToast(`${option.label} download started.`, 'success');
      }
    } catch (caught) {
      if (caught instanceof DownloadCancelledError) {
        showToast('Download cancelled.', 'info');
      } else {
        showToast('The download failed. Please try again.', 'error');
      }
    } finally {
      downloadAbort.current = null;
      setActiveDownload(null);
      setProgress(null);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    const copied = await copyText(text);
    showToast(
      copied ? `${label} copied.` : 'Could not access the clipboard.',
      copied ? 'success' : 'error',
    );
  };

  const handleNewLink = () => {
    setInput('');
    setMedia(null);
    setError(null);
    changeTab('download');
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  const controller: AppController = {
    input,
    parsed,
    error,
    isLoading,
    media,
    activeDownload,
    progress,
    history,
    onInput: (value) => {
      setInput(value);
      setError(null);
    },
    onSubmit: handleSubmit,
    onPaste: () => {
      void handlePaste();
    },
    onUseSample: handleUseSample,
    onDismissError: () => setError(null),
    onDownload: (option) => {
      void handleDownload(option);
    },
    onCancelDownload: () => downloadAbort.current?.abort(),
    onCopy: (text, label) => {
      void handleCopy(text, label);
    },
    onNewLink: handleNewLink,
    onSelectHistory: handleSelectHistory,
    onRemoveHistory: (entry) => {
      setHistory((current) => removeHistoryEntry(entry.id, current));
    },
    onClearHistory: () => {
      setHistory(clearHistory());
      showToast('History cleared.', 'info');
    },
  };

  return (
    <>
      <Shell
        platform={platform}
        tab={tab}
        theme={theme}
        onTabChange={changeTab}
        onToggleTheme={toggleTheme}
      >
        {tab === 'download' && (
          <DownloadScreen
            platform={platform}
            controller={controller}
            inputRef={inputRef}
            onTabChange={changeTab}
          />
        )}
        {tab === 'recent' && (
          <RecentScreen platform={platform} controller={controller} onTabChange={changeTab} />
        )}
        {tab === 'guide' && <GuideScreen platform={platform} />}
      </Shell>
      <PlatformToast platform={platform} toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}

export default App;
