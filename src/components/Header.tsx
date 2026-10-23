import { Github, Moon, Music2, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#faq', label: 'FAQ' },
];

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-900/[0.06] bg-white/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl transition-colors dark:border-white/[0.06] dark:bg-[#070b18]/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a href="#top" className="group flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500 shadow-lg shadow-sky-500/25 transition-transform duration-300 group-hover:scale-105">
            <Music2 className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              TSun <span className="text-sky-500 dark:text-cyan-300">Studio</span>
            </span>
            <span className="block truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
              TikTok downloader
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-900/10 bg-white/60 text-slate-600 transition-all hover:scale-105 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Moon className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>

          <a
            href="https://github.com/SaeedX302/TSun-TikTok-Downloader-with-Liquid-Glass-UI"
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-900/10 bg-white/60 text-slate-600 transition-all hover:scale-105 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
            aria-label="Open the project on GitHub"
            title="GitHub"
          >
            <Github className="h-[18px] w-[18px]" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}
