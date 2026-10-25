import type { RefObject } from 'react';
import { ArrowRight, Clock3 } from 'lucide-react';
import type { AppController, Platform, Tab } from '../ui/types';
import { Composer } from './Composer';
import { ResultDesktop } from './ResultDesktop';
import { ResultAndroid } from './ResultAndroid';
import { ResultIOS } from './ResultIOS';
import { formatRelativeDate } from '../lib/format';

interface DownloadScreenProps {
  platform: Platform;
  controller: AppController;
  inputRef: RefObject<HTMLTextAreaElement>;
  onTabChange: (tab: Tab) => void;
}

function Loading({ platform }: { platform: Platform }) {
  if (platform === 'android') {
    return (
      <div className="m3-loading" role="status">
        <span className="m3-linear" aria-hidden="true" />
        <p>Reading the link…</p>
        <span>Resolving the share URL and checking available files.</span>
      </div>
    );
  }

  if (platform === 'ios') {
    return (
      <div className="ios-loading" role="status">
        <span className="ios-spinner" aria-hidden="true" />
        <p>Reading the link…</p>
        <span>Resolving the share URL and checking available files.</span>
      </div>
    );
  }

  return (
    <div className="desk-loading" role="status">
      <span className="desk-spinner" aria-hidden="true" />
      <div>
        <p>Reading the link…</p>
        <span>Resolving the share URL and checking available files.</span>
      </div>
    </div>
  );
}

function DesktopRail({ controller, onTabChange }: { controller: AppController; onTabChange: (tab: Tab) => void }) {
  const recent = controller.history.slice(0, 3);

  return (
    <aside className="desk-rail" aria-label="Reference">
      <section className="desk-rail-section">
        <h2>What you get</h2>
        <dl className="desk-spec">
          <div><dt>Video</dt><dd>MP4 · HD when available</dd></div>
          <div><dt>Audio</dt><dd>MP3 from the original sound</dd></div>
          <div><dt>Photos</dt><dd>Every image in a carousel</dd></div>
        </dl>
      </section>

      <section className="desk-rail-section">
        <h2>What it reads</h2>
        <ul className="desk-list">
          <li>Direct post links</li>
          <li>Share messages from the app</li>
          <li>vm., vt. and /t/ short links</li>
          <li>Android deep links</li>
        </ul>
      </section>

      {recent.length > 0 && (
        <section className="desk-rail-section">
          <div className="desk-rail-head">
            <h2>Last fetched</h2>
            <button type="button" onClick={() => onTabChange('recent')}>All</button>
          </div>
          <ul className="desk-mini-history">
            {recent.map((entry) => (
              <li key={entry.id}>
                <button type="button" onClick={() => controller.onSelectHistory(entry)}>
                  {entry.cover ? (
                    <img
                      src={entry.cover}
                      alt=""
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="desk-mini-blank" />
                  )}
                  <span>
                    <strong>{entry.title}</strong>
                    <small>@{entry.username} · {formatRelativeDate(entry.savedAt / 1000)}</small>
                  </span>
                  <ArrowRight aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="desk-rail-foot">
        <Clock3 aria-hidden="true" />
        Results stay cached for 15 minutes; downloads come directly from TikTok.
      </p>
    </aside>
  );
}

export function DownloadScreen({ platform, controller, inputRef, onTabChange }: DownloadScreenProps) {
  const result = (() => {
    if (!controller.media) return null;
    if (platform === 'android') return <ResultAndroid media={controller.media} controller={controller} />;
    if (platform === 'ios') return <ResultIOS media={controller.media} controller={controller} />;
    return <ResultDesktop media={controller.media} controller={controller} />;
  })();

  if (platform === 'desktop') {
    return (
      <div className="desk-download">
        <header className="desk-intro">
          <p className="desk-kicker">TikTok downloader</p>
          <h1>
            Download the video.
            <br />
            <em>Not the watermark.</em>
          </h1>
          <p className="desk-lede">
            Paste a link or the entire share message. TSun resolves the post and lists every file
            TikTok exposes — video, original sound and photos.
          </p>
        </header>

        <div className="desk-columns">
          <div className="desk-column-main">
            <Composer platform={platform} controller={controller} inputRef={inputRef} />
            {controller.isLoading && <Loading platform={platform} />}
            {!controller.isLoading && result}
          </div>
          <DesktopRail controller={controller} onTabChange={onTabChange} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${platform === 'android' ? 'm3-screen' : 'ios-screen'} screen-download`}>
      <header className={`${platform === 'android' ? 'm3-screen-head' : 'ios-screen-head'}`}>
        <h1>Download</h1>
        <p>Paste a TikTok link or share text. We&apos;ll find the files.</p>
      </header>

      <Composer platform={platform} controller={controller} inputRef={inputRef} />

      {controller.isLoading && <Loading platform={platform} />}
      {!controller.isLoading && result}
    </div>
  );
}
