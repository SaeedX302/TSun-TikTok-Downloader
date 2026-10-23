import { Check, Sparkles } from 'lucide-react';

const CHIPS = [
  'vm.tiktok.com',
  'vt.tiktok.com',
  'tiktok.com/t/',
  'Encoded share text',
  'Android deep links',
];

export function Hero() {
  return (
    <div className="pt-8 text-center sm:pt-12 lg:pt-16">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-sky-700 dark:border-cyan-400/20 dark:bg-cyan-400/10 dark:text-cyan-200">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Now supports links copied from the TikTok app
      </span>

      <h1 className="mx-auto mt-4 max-w-3xl text-balance text-[clamp(2rem,7vw,3.75rem)] font-black leading-[1.05] tracking-tight text-slate-900 dark:text-white">
        Save TikTok videos{' '}
        <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-fuchsia-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-sky-400 dark:to-fuchsia-400">
          in seconds
        </span>
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
        Paste a direct link — or the entire encoded share message from the TikTok app.
        TSun finds the post and gives you HD MP4, original audio and photos with no watermark.
      </p>

      <ul className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-1.5">
        {CHIPS.map((chip) => (
          <li
            key={chip}
            className="inline-flex items-center gap-1 rounded-full border border-slate-900/10 bg-white/60 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 sm:text-[11px]"
          >
            <Check className="h-3 w-3 text-emerald-500" aria-hidden="true" />
            {chip}
          </li>
        ))}
      </ul>
    </div>
  );
}
