import { Loader2 } from 'lucide-react';

export function LoadingCard() {
  return (
    <section className="glass-panel animate-rise mt-5 rounded-[1.75rem] p-4 sm:mt-6 sm:rounded-[2rem] sm:p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sky-500/15 text-sky-600 dark:text-cyan-300">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            Reading your link…
          </p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Resolving the share link and fetching the best quality
          </p>
        </div>
      </div>

      <div className="mt-5 grid animate-pulse gap-4 sm:grid-cols-[minmax(0,180px)_1fr]">
        <div className="mx-auto aspect-[9/16] w-full max-w-[180px] rounded-2xl bg-slate-900/10 dark:bg-white/10" />
        <div className="space-y-3">
          <div className="h-4 w-2/3 rounded-full bg-slate-900/10 dark:bg-white/10" />
          <div className="h-3 w-1/2 rounded-full bg-slate-900/[0.07] dark:bg-white/[0.07]" />
          <div className="h-16 rounded-2xl bg-slate-900/[0.05] dark:bg-white/[0.05]" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 rounded-2xl bg-slate-900/10 dark:bg-white/10" />
            <div className="h-14 rounded-2xl bg-slate-900/10 dark:bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
