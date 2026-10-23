import { useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Music2,
  RotateCcw,
} from 'lucide-react';
import type { DownloadOption, TikTokMedia } from '../lib/types';
import type { DownloadProgress } from '../lib/download';
import { formatDuration, formatRelativeDate } from '../lib/format';
import { MediaPreview } from './MediaPreview';
import { Stats } from './Stats';
import { DownloadCard } from './DownloadCard';

interface MediaResultProps {
  media: TikTokMedia;
  activeDownload: string | null;
  progress: DownloadProgress | null;
  onDownload: (option: DownloadOption) => void;
  onCancelDownload: () => void;
  onCopy: (text: string, label: string) => void;
  onUseNewLink: () => void;
}

export function MediaResult({
  media,
  activeDownload,
  progress,
  onDownload,
  onCancelDownload,
  onCopy,
  onUseNewLink,
}: MediaResultProps) {
  const [expanded, setExpanded] = useState(false);
  const isBusy = Boolean(activeDownload);

  return (
    <section className="glass-panel animate-rise mt-5 overflow-hidden rounded-[1.75rem] sm:mt-6 sm:rounded-[2rem]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/[0.07] px-4 py-3.5 dark:border-white/[0.07] sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <Check className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">Ready to download</p>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              No watermark · HD when available
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onUseNewLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-900/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          New link
        </button>
      </div>

      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-7">
        <MediaPreview media={media} />

        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <img
              src={media.author.avatar}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full border border-white/40 bg-slate-200 object-cover shadow-sm dark:border-white/10 dark:bg-slate-800"
              onError={(event) => {
                event.currentTarget.src = '/avatar.svg';
              }}
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-extrabold text-slate-900 dark:text-white">
                <span className="truncate">@{media.author.username}</span>
                {media.author.verified && (
                  <BadgeCheck className="h-4 w-4 shrink-0 text-sky-500" aria-label="Verified" />
                )}
              </p>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {media.author.nickname}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-900/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-300">
              {media.isPhoto ? 'Photo post' : 'Video'}
            </span>
          </div>

          <div className="mt-3">
            <p
              className={`whitespace-pre-line break-words text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {media.title}
            </p>
            {media.title.length > 160 && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-1 text-xs font-bold text-sky-600 hover:underline dark:text-cyan-300"
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {media.duration > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2.5 py-1 dark:bg-white/[0.06]">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {formatDuration(media.duration)}
              </span>
            )}
            {media.createdAt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2.5 py-1 dark:bg-white/[0.06]">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                {formatRelativeDate(media.createdAt)}
              </span>
            )}
            {media.images.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2.5 py-1 dark:bg-white/[0.06]">
                <ImageIcon className="h-3 w-3" aria-hidden="true" />
                {media.images.length} photos
              </span>
            )}
            {media.id && (
              <button
                type="button"
                onClick={() => onCopy(media.id, 'Post ID')}
                className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2.5 py-1 font-mono transition-colors hover:bg-slate-900/10 dark:bg-white/[0.06] dark:hover:bg-white/10"
                title="Copy post ID"
              >
                #{media.id}
                <Copy className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>

          {media.music.title && (
            <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-slate-900/[0.06] bg-slate-900/[0.03] p-2.5 dark:border-white/[0.06] dark:bg-white/[0.04]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300">
                <Music2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {media.music.title}
                </p>
                <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                  {media.music.author}
                </p>
              </div>
              {media.audio && (
                <button
                  type="button"
                  onClick={() => {
                    const audio = media.downloads.find((item) => item.id === 'audio');
                    if (audio) onDownload(audio);
                  }}
                  className="shrink-0 rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-fuchsia-600 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-fuchsia-300"
                  aria-label="Download audio"
                  title="Download audio"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          <Stats media={media} />

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={media.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-900/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Open on TikTok
            </a>
            <button
              type="button"
              onClick={() => onCopy(media.sourceUrl, 'Link')}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-900/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy link
            </button>
            <button
              type="button"
              onClick={() => onCopy(media.title, 'Caption')}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-900/10 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-900/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy caption
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-900/[0.07] px-4 py-4 dark:border-white/[0.07] sm:px-6 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {media.isPhoto ? 'Download photos' : 'Download options'}
          </h3>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {isBusy ? 'Downloading…' : `${media.downloads.length} formats available`}
          </span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {media.downloads.map((option) => (
            <DownloadCard
              key={option.id}
              option={option}
              active={activeDownload === option.id}
              disabled={isBusy && activeDownload !== option.id}
              progress={activeDownload === option.id ? progress : null}
              onDownload={() => onDownload(option)}
              onCancel={onCancelDownload}
            />
          ))}
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
          Files are fetched directly from TikTok&apos;s CDN. If your browser blocks the
          download, the file opens in a new tab — tap and hold to save it.
        </p>
      </div>
    </section>
  );
}
