import type { RefObject } from 'react';
import {
  AlertCircle,
  ArrowRight,
  ClipboardPaste,
  Link2,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import type { ParseResult } from '../lib/tiktokUrl';
import { describeLink } from '../lib/tiktokUrl';

export interface FormError {
  message: string;
  hint?: string;
}

interface UrlFormProps {
  value: string;
  parsed: ParseResult | null;
  error: FormError | null;
  isLoading: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onPaste: () => void;
  onDismissError: () => void;
  onUseSample: () => void;
}

export function UrlForm({
  value,
  parsed,
  error,
  isLoading,
  inputRef,
  onChange,
  onSubmit,
  onPaste,
  onDismissError,
  onUseSample,
}: UrlFormProps) {
  const detected = parsed?.ok ? parsed.link : null;

  return (
    <section className="glass-panel rounded-[1.75rem] p-4 sm:rounded-[2rem] sm:p-6 lg:p-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label
          htmlFor="tiktok-url"
          className="text-sm font-bold text-slate-700 dark:text-slate-200"
        >
          TikTok link or share text
        </label>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          App links supported
        </span>
      </div>

      <div className="rounded-2xl border border-slate-900/10 bg-white/80 p-2 shadow-inner shadow-slate-900/5 transition-colors focus-within:border-sky-500/60 focus-within:ring-4 focus-within:ring-sky-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:focus-within:border-cyan-400/60">
        <div className="flex items-start gap-2">
          <Link2
            className="mt-3 ml-2 h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <textarea
            id="tiktok-url"
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSubmit();
              }
            }}
            rows={2}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            placeholder={'Paste a link, or the whole share message…\nhttps://vm.tiktok.com/ZMabc123/'}
            className="min-h-[3.25rem] w-full resize-none bg-transparent px-1 py-2.5 text-base leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 sm:text-[15px] dark:text-white dark:placeholder:text-slate-500"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'url-error' : undefined}
          />
          <div className="flex shrink-0 items-center gap-1 pt-1.5">
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-900/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Clear input"
                title="Clear"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onPaste}
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-sky-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-cyan-300"
              aria-label="Paste from clipboard"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        {detected ? (
          <p className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="shrink-0">{describeLink(detected)} detected</span>
            <span className="truncate font-normal text-slate-400 dark:text-slate-500">
              {detected.videoId ? `#${detected.videoId}` : detected.apiUrl}
            </span>
          </p>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">
            Tip: paste the entire message from TikTok, not just the URL.
          </p>
        )}

        <button
          type="button"
          onClick={onUseSample}
          className="font-semibold text-sky-600 underline-offset-2 hover:underline dark:text-cyan-300"
        >
          Try a sample
        </button>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isLoading}
        className="group mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-fuchsia-500 px-6 py-3.5 text-base font-extrabold text-white shadow-lg shadow-sky-500/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Reading link…
          </>
        ) : (
          <>
            Fetch video
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      {error && (
        <div
          id="url-error"
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-3.5 text-sm text-rose-700 dark:text-rose-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-bold">{error.message}</p>
            {error.hint && (
              <p className="mt-1 text-rose-600/90 dark:text-rose-200/80">{error.hint}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onDismissError}
            className="shrink-0 rounded-lg p-1 text-rose-500 transition-colors hover:bg-rose-500/10 dark:text-rose-300"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
