import type { ReactNode } from 'react';
import { BookOpen, Clock3, Download, Github, Moon, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';
import type { ShellProps, Tab } from '../ui/types';
import { Brand, BrandMark } from './Brand';

const TABS: Record<Tab, { label: string; icon: typeof Download }> = {
  download: { label: 'Download', icon: Download },
  recent: { label: 'Recent', icon: Clock3 },
  guide: { label: 'Guide', icon: BookOpen },
};

interface ShellComponentProps extends ShellProps {
  children: ReactNode;
}

function ThemeButton({ theme, onToggle, className }: { theme: Theme; onToggle: () => void; className: string }) {
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      className={className}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}

function DesktopShell({
  tab,
  theme,
  onTabChange,
  onToggleTheme,
  children,
}: Omit<ShellComponentProps, 'platform'>) {
  return (
    <div className="desk-shell">
      <aside className="desk-sidebar">
        <button
          type="button"
          className="desk-brand-button"
          onClick={() => onTabChange('download')}
          aria-label="TSun Studio home"
        >
          <Brand />
        </button>

        <nav className="desk-nav" aria-label="Primary">
          <p className="desk-nav-label">Workspace</p>
          {(Object.keys(TABS) as Tab[]).map((id) => {
            const item = TABS[id];
            const Icon = item.icon;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                className="desk-nav-item"
                aria-current={tab === id ? 'page' : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                {id === 'recent' && <span className="desk-nav-hint">History</span>}
              </button>
            );
          })}
        </nav>

        <div className="desk-sidebar-foot">
          <div className="desk-sidebar-rule" />
          <p className="desk-sidebar-note">
            Files come straight from TikTok&apos;s CDN. No account, no watermark.
          </p>
          <div className="desk-sidebar-actions">
            <ThemeButton theme={theme} onToggle={onToggleTheme} className="desk-icon-button" />
            <a
              href="https://github.com/SaeedX302/TSun-TikTok-Downloader-with-Liquid-Glass-UI"
              target="_blank"
              rel="noopener noreferrer"
              className="desk-icon-button"
              aria-label="Open the project on GitHub"
            >
              <Github aria-hidden="true" />
            </a>
          </div>
          <p className="desk-version">TSun Studio 2.1 · MIT</p>
        </div>
      </aside>

      <div className="desk-work">
        <header className="desk-topbar">
          <p className="desk-breadcrumb">
            TSun Studio <span aria-hidden="true">/</span> <strong>{TABS[tab].label}</strong>
          </p>
          <p className="desk-topbar-note">
            <span className="desk-status-dot" aria-hidden="true" />
            Direct TikTok CDN
          </p>
        </header>

        <main className="desk-main">{children}</main>

        <footer className="desk-footer">
          <p>TSun Studio — an independent TikTok utility.</p>
          <nav aria-label="Social links">
            <a href="https://github.com/SaeedX302" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://twitter.com/saeedx300" target="_blank" rel="noopener noreferrer">X</a>
            <a href="https://t.me/saeedxdie" target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href="https://youtube.com/@TsunMusicOfficial" target="_blank" rel="noopener noreferrer">YouTube</a>
          </nav>
        </footer>
      </div>

      <nav className="desk-bottom-nav" aria-label="Primary mobile">
        {(Object.keys(TABS) as Tab[]).map((id) => {
          const item = TABS[id];
          const Icon = item.icon;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={tab === id ? 'page' : undefined}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}


function AndroidShell({
  tab,
  theme,
  onTabChange,
  onToggleTheme,
  children,
}: Omit<ShellComponentProps, 'platform'>) {
  return (
    <div className="m3-shell">
      <header className="m3-topbar">
        <button
          type="button"
          className="m3-topbar-brand"
          onClick={() => onTabChange('download')}
          aria-label="TSun home"
        >
          <BrandMark className="m3-brand-mark" />
          <span>TSun</span>
        </button>
        <ThemeButton theme={theme} onToggle={onToggleTheme} className="m3-icon-button" />
      </header>

      <main className="m3-main">{children}</main>

      <nav className="m3-nav" aria-label="Primary">
        {(Object.keys(TABS) as Tab[]).map((id) => {
          const item = TABS[id];
          const Icon = item.icon;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className="m3-nav-item"
              aria-current={tab === id ? 'page' : undefined}
            >
              <span className="m3-nav-icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="m3-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function IOSShell({
  tab,
  theme,
  onTabChange,
  onToggleTheme,
  children,
}: Omit<ShellComponentProps, 'platform'>) {
  return (
    <div className="ios-shell">
      <header className="ios-navbar">
        <span className="ios-nav-title">TSun</span>
        <ThemeButton theme={theme} onToggle={onToggleTheme} className="ios-nav-button" />
      </header>

      <main className="ios-main">{children}</main>

      <nav className="ios-tabbar" aria-label="Primary">
        {(Object.keys(TABS) as Tab[]).map((id) => {
          const item = TABS[id];
          const Icon = item.icon;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className="ios-tab"
              aria-current={tab === id ? 'page' : undefined}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function Shell(props: ShellComponentProps) {
  const { platform, ...rest } = props;
  if (platform === 'android') return <AndroidShell {...rest} />;
  if (platform === 'ios') return <IOSShell {...rest} />;
  return <DesktopShell {...rest} />;
}
