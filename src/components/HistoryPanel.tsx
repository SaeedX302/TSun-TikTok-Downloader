import { useState } from 'react';
import { ChevronDown, Clock3, History, X } from 'lucide-react';
import type { HistoryEntry } from '../lib/storage';

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistoryPanel({ entries, onSelect, onRemove, onClear }: HistoryPanelProps) {
  const [open, setOpen] = useState(true);

  if (entries.length === 0) return null;

  return (
    <section className="glass-panel mt-5 rounded-[1.5rem] p-4 sm:mt-6 sm:rounded-[1.75rem] sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 items-center gap-2 text-left"
          aria-expanded={open}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-500/15 text-sky-600 dark:text-cyan-300">
            <History className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-extrabold text-slate-900 dark:text-white">
              Recent downloads
            </span>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {entries.length} saved on this device
            </span>
          </span>
          <ChevronDown
            className={`ml-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-400"
        >
          Clear all
        </button>
      </div>

      {open && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {entries.map((entry) => (
            <li key={entry.id} className="relative">
              <button
                type="button"
                onClick={() => onSelect(entry)}
                className="group flex w-full items-center gap-2.5 rounded-2xl border border-slate-900/[0.07] bg-white/60 p-2 pr-9 text-left transition-all hover:border-sky-500/40 hover:bg-white dark:border-white/[0.07] dark:bg-white/[0.04] dark:hover:border-cyan-400/40 dark:hover:bg-white/[0.07]"
              >
                <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                  {entry.cover ? (
                    <img
                      src={entry.cover}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {entry.kind === 'photo' && (
                    <span className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[8px] font-bold text-white">
                      PHOTO
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-xs font-bold leading-snug text-slate-800 dark:text-slate-100">
                    {entry.title}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    @{entry.username} · {new Date(entry.savedAt).toLocaleDateString()}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(entry)}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                aria-label={`Remove ${entry.title} from history`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
