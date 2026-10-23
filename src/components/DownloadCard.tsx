import { Download, Image as ImageIcon, Loader2, Music2, Video, X } from 'lucide-react';
import type { DownloadOption } from '../lib/types';
import type { DownloadProgress } from '../lib/download';
import { formatBytes } from '../lib/format';

interface DownloadCardProps {
  option: DownloadOption;
  active: boolean;
  disabled: boolean;
  progress: DownloadProgress | null;
  onDownload: () => void;
  onCancel: () => void;
}

export function DownloadCard({
  option,
  active,
  disabled,
  progress,
  onDownload,
  onCancel,
}: DownloadCardProps) {
  const Icon = option.kind === 'audio' ? Music2 : option.kind === 'image' ? ImageIcon : Video;
  const percent = progress?.percent ?? 0;
  const size = formatBytes(option.size);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        active
          ? 'border-sky-500/50 bg-sky-500/[0.08] dark:border-cyan-400/50 dark:bg-cyan-400/[0.06]'
          : 'border-slate-900/10 bg-white/70 hover:border-sky-500/40 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-cyan-400/40 dark:hover:bg-white/[0.07]'
      }`}
    >
      {option.kind === 'image' && (
        <img
          src={option.url}
          alt=""
          className="h-24 w-full object-cover opacity-90"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      )}

      <div className="flex items-center gap-3 p-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            option.kind === 'audio'
              ? 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300'
              : option.kind === 'image'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                : 'bg-sky-500/15 text-sky-600 dark:text-cyan-300'
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
              {option.label}
            </p>
            {option.badge && (
              <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                {option.badge}
              </span>
            )}
          </div>
          <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {option.description}
            {size ? ` · ${size}` : ''}
          </p>
        </div>

        {active ? (
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900/5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-500 dark:bg-white/10 dark:text-slate-300"
            aria-label="Cancel download"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onDownload}
            disabled={disabled}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-900/5 text-slate-600 transition-all hover:scale-105 hover:bg-sky-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-cyan-400 dark:hover:text-slate-950"
            aria-label={`Download ${option.label}`}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {active && (
        <div className="px-3 pb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-sky-400 to-fuchsia-500 transition-[width] duration-200 ${
                progress?.percent == null ? 'w-1/3 animate-pulse' : ''
              }`}
              style={progress?.percent != null ? { width: `${percent}%` } : undefined}
            />
          </div>
          <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {progress?.percent != null ? (
              <>
                {progress.percent}% · {formatBytes(progress.loaded)}
                {progress.total > 0 ? ` of ${formatBytes(progress.total)}` : ''}
              </>
            ) : (
              <>
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Preparing file…
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
