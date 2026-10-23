import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DownloadOption, TikTokMedia } from './lib/types';
import { describeLink, parseTikTokLink } from './lib/tiktokUrl';
import { TikTokApiError, fetchTikTokMedia } from './lib/tiktokApi';
import {
  DownloadCancelledError,
  buildDownloadName,
  downloadFile,
} from './lib/download';
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
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UrlForm } from './components/UrlForm';
import type { FormError } from './components/UrlForm';
import { LoadingCard } from './components/LoadingCard';
import { MediaResult } from './components/MediaResult';
import { HistoryPanel } from './components/HistoryPanel';
import { HowItWorks, Features, Faq } from './components/InfoSections';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import type { ToastState, ToastTone } from './components/Toast';

const SAMPLE_URL = 'https://www.tiktok.com/@ladygaga/video/7376784960625085742';

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
  const { theme, toggleTheme } = useTheme();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [media, setMedia] = useState<TikTokMedia | null>(null);
  const [error, setError] = useState<FormError | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(readHistory);
  const [activeDownload, setActiveDownload] = useState<string | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | null>(null);
  const downloadAbort = useRef<AbortController | null>(null);

  const parsed = useMemo(
    () => (input.trim() ? parseTikTokLink(input) : null),
    [input],
  );

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
    if (!media) return;
    const frame = window.requestAnimationFrame(() => {
      if (window.matchMedia('(max-width: 1023px)').matches) {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [media]);

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
        setHistory((current) =>
          upsertHistory(historyEntryFromMedia(fetched), current),
        );
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
      showToast(
        'Clipboard access is not available. Press and hold the input, then choose Paste.',
        'info',
      );
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
        const target = result.link.videoId
          ? `${describeLink(result.link)} · #${result.link.videoId}`
          : describeLink(result.link);
        showToast(`${target} detected. Tap Fetch video.`, 'success');
      } else {
        showToast('Pasted. We will look for a TikTok link when you tap Fetch.', 'info');
      }
    } catch {
      inputRef.current?.focus();
      showToast(
        'Clipboard access is blocked. Press and hold the input, then choose Paste.',
        'error',
      );
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
        showToast(
          'Opened in a new tab. Long-press the video and choose Download to save it.',
          'info',
        );
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

  const handleCancelDownload = () => {
    downloadAbort.current?.abort();
  };

  const handleCopy = async (text: string, label: string) => {
    const copied = await copyText(text);
    showToast(
      copied ? `${label} copied to clipboard.` : 'Could not access the clipboard.',
      copied ? 'success' : 'error',
    );
  };

  const handleRemoveHistory = (entry: HistoryEntry) => {
    setHistory((current) => removeHistoryEntry(entry.id, current));
  };

  const handleClearHistory = () => {
    setHistory(clearHistory());
    showToast('History cleared.', 'info');
  };

  const handleUseNewLink = () => {
    setInput('');
    setMedia(null);
    setError(null);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div
      id="top"
      className="relative min-h-[100dvh] overflow-x-clip bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#070b18] dark:text-white"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.14),transparent_55%)]" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl dark:bg-cyan-500/10 sm:h-96 sm:w-96" />
        <div className="absolute -right-20 top-1/3 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10 sm:h-80 sm:w-80" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-500/10" />
        <div className="bg-grid absolute inset-0 opacity-[0.35] dark:opacity-20" />
      </div>

      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <Hero />

        <div className="mx-auto mt-6 max-w-3xl sm:mt-8">
          <UrlForm
            value={input}
            parsed={parsed}
            error={error}
            isLoading={isLoading}
            inputRef={inputRef}
            onChange={(value) => {
              setInput(value);
              setError(null);
            }}
            onSubmit={handleSubmit}
            onPaste={() => {
              void handlePaste();
            }}
            onDismissError={() => setError(null)}
            onUseSample={handleUseSample}
          />

          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>✓ No sign-up</span>
            <span>✓ No watermark</span>
            <span>✓ Works on mobile &amp; desktop</span>
          </p>
        </div>

        <div ref={resultRef} className="mx-auto max-w-4xl scroll-mt-24">
          {isLoading && <LoadingCard />}
          {!isLoading && media && (
            <MediaResult
              key={media.id || media.sourceUrl}
              media={media}
              activeDownload={activeDownload}
              progress={progress}
              onDownload={(option) => {
                void handleDownload(option);
              }}
              onCancelDownload={handleCancelDownload}
              onCopy={(text, label) => {
                void handleCopy(text, label);
              }}
              onUseNewLink={handleUseNewLink}
            />
          )}
        </div>

        <div className="mx-auto max-w-4xl">
          <HistoryPanel
            entries={history}
            onSelect={handleSelectHistory}
            onRemove={handleRemoveHistory}
            onClear={handleClearHistory}
          />
        </div>

        <HowItWorks />
        <Features />
        <Faq />
      </main>

      <Footer />
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default App;

