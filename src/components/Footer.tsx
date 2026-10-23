import {
  Github,
  Instagram,
  MessageCircle,
  Music2,
  Send,
  Twitter,
  Youtube,
} from 'lucide-react';

const SOCIALS = [
  { href: 'https://github.com/SaeedX302', label: 'GitHub', icon: Github },
  { href: 'https://twitter.com/saeedx300', label: 'X / Twitter', icon: Twitter },
  { href: 'https://instagram.com/saeedxdie', label: 'Instagram', icon: Instagram },
  { href: 'https://t.me/saeedxdie', label: 'Telegram', icon: Send },
  { href: 'https://tiktok.com/@saeedxdie', label: 'TikTok', icon: Music2 },
  { href: 'https://youtube.com/@TsunMusicOfficial', label: 'YouTube', icon: Youtube },
];

export function Footer() {
  return (
    <footer className="safe-bottom relative z-10 mt-14 border-t border-slate-900/[0.06] bg-white/40 px-4 pt-8 backdrop-blur-xl dark:border-white/[0.06] dark:bg-white/[0.02] sm:mt-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="flex items-center justify-center gap-2 text-base font-extrabold text-slate-900 dark:text-white sm:justify-start">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-fuchsia-500">
                <Music2 className="h-4 w-4 text-white" aria-hidden="true" />
              </span>
              TSun Studio
            </p>
            <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              A fast, free TikTok downloader with app-share-link support. Not affiliated
              with TikTok or ByteDance. Only download content you have the right to use.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-900/10 bg-white/60 text-slate-600 transition-all hover:-translate-y-0.5 hover:border-sky-500/40 hover:text-sky-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-300"
              >
                <social.icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-900/[0.06] py-4 text-center text-[11px] text-slate-500 dark:border-white/[0.06] dark:text-slate-400 sm:flex-row sm:text-left">
          <p>
            Built by <span className="font-bold text-sky-600 dark:text-cyan-300">SaeedX302</span>
            {' · '}MIT licensed
          </p>
          <p className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" aria-hidden="true" />
            Feedback and PRs are welcome
          </p>
        </div>
      </div>
    </footer>
  );
}
