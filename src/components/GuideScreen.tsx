import { ChevronRight, ExternalLink, ShieldCheck } from 'lucide-react';
import type { Platform } from '../ui/types';

const LINKS = [
  ['Direct post links', 'tiktok.com/@creator/video/… and /photo/…'],
  ['Share messages', 'The entire text copied from TikTok, including emoji and encoding.'],
  ['Short links', 'vm.tiktok.com, vt.tiktok.com and tiktok.com/t/…'],
  ['Deep links', 'Android snssdk…://aweme/detail/… links.'],
];

const STEPS = [
  ['Copy the link', 'In TikTok, tap Share, then Copy link. Copying the whole message is fine.'],
  ['Paste it here', 'TSun reads the message, resolves the short URL and asks TikTok for the post.'],
  ['Choose a file', 'Download HD video, the original file, MP3 audio or each photo in a carousel.'],
];

const FAQS = [
  [
    'Why do app links look strange?',
    'TikTok often copies a share sentence rather than a plain URL. It can contain emoji, hidden characters, percent-encoding and a short vm. or vt. link. TSun normalises all of that before fetching.',
  ],
  [
    'Why did a link fail?',
    'Private, deleted, region-locked or live posts cannot be downloaded, and old share links expire. Copy a fresh link from the post and try again. The free service also allows one request per second; retries are automatic.',
  ],
  [
    'Where are files saved?',
    'Your browser decides. On Android they usually go to Downloads; on iPhone to Files or Photos, depending on the browser. TSun never stores media on a server.',
  ],
  [
    'Can I download photos and sound?',
    'Yes. Carousel posts list every image, and the original sound appears as an MP3 when TikTok exposes it. Some licensed sounds do not have a separate audio file.',
  ],
  [
    'Is there a charge or account?',
    'No. TSun is a static web app. There is no sign-up, no analytics and no server-side copy of your links.',
  ],
];

interface GuideProps {
  platform: Platform;
}

function GuideDesktop() {
  return (
    <div className="desk-screen desk-guide">
      <header className="desk-page-head">
        <div>
          <p className="desk-kicker">Reference</p>
          <h1>A short field guide.</h1>
          <p className="desk-lede">
            Everything TSun reads, how a download works, and what to do when TikTok says no.
          </p>
        </div>
      </header>

      <div className="desk-guide-grid">
        <div>
          <section className="desk-guide-section">
            <h2>Supported links</h2>
            <dl className="desk-link-table">
              {LINKS.map(([title, body]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="desk-guide-section">
            <h2>How a download works</h2>
            <ol className="desk-steps">
              {STEPS.map(([title, body], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div>
          <section className="desk-guide-section">
            <h2>Questions</h2>
            <div className="desk-faq">
              {FAQS.map(([question, answer]) => (
                <details key={question}>
                  <summary>{question}<span aria-hidden="true">+</span></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="desk-guide-section desk-privacy">
            <h2><ShieldCheck aria-hidden="true" /> Privacy</h2>
            <p>
              History and theme live in localStorage. Links are sent only to the download service
              and media is fetched from TikTok&apos;s CDN. Download only content you have the right to use.
            </p>
            <a href="https://github.com/SaeedX302/TSun-TikTok-Downloader-with-Liquid-Glass-UI" target="_blank" rel="noopener noreferrer">
              Read the source on GitHub <ExternalLink aria-hidden="true" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}


function GuideAndroid() {
  return (
    <div className="m3-screen m3-guide">
      <header className="m3-screen-head">
        <h1>Guide</h1>
        <p>What works, how it works, what to do when it doesn&apos;t.</p>
      </header>

      <section className="m3-card">
        <h2>Supported links</h2>
        <ul className="m3-guide-list">
          {LINKS.map(([title, body]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{body}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="m3-card">
        <h2>How a download works</h2>
        <ol className="m3-steps">
          {STEPS.map(([title, body], index) => (
            <li key={title}>
              <span>{index + 1}</span>
              <div><strong>{title}</strong><p>{body}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="m3-card">
        <h2>Questions</h2>
        <div className="m3-faq">
          {FAQS.map(([question, answer]) => (
            <details key={question}>
              <summary>{question}<span aria-hidden="true">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="m3-privacy">
        <ShieldCheck aria-hidden="true" />
        <p>History stays on this device. Files come from TikTok&apos;s CDN. Download only content you have the right to use.</p>
      </div>
    </div>
  );
}

function GuideIOS() {
  return (
    <div className="ios-screen ios-guide">
      <header className="ios-large-head">
        <h1>Guide</h1>
      </header>
      <p className="ios-screen-sub">What works, and what to do when it doesn&apos;t.</p>

      <p className="ios-section-header">Supported links</p>
      <div className="ios-list">
        {LINKS.map(([title, body]) => (
          <div key={title} className="ios-guide-row">
            <strong>{title}</strong>
            <span>{body}</span>
          </div>
        ))}
      </div>

      <p className="ios-section-header">How a download works</p>
      <div className="ios-list">
        {STEPS.map(([title, body], index) => (
          <div key={title} className="ios-guide-row ios-step-row">
            <span className="ios-step-number">{index + 1}</span>
            <div><strong>{title}</strong><span>{body}</span></div>
          </div>
        ))}
      </div>

      <p className="ios-section-header">Questions</p>
      <div className="ios-list ios-faq">
        {FAQS.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}<ChevronRight className="ios-faq-chevron" aria-hidden="true" /></summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>

      <p className="ios-section-header">About</p>
      <div className="ios-list">
        <div className="ios-value-row"><span>Version</span><strong>2.1</strong></div>
        <a className="ios-action-row" href="https://github.com/SaeedX302/TSun-TikTok-Downloader-with-Liquid-Glass-UI" target="_blank" rel="noopener noreferrer">
          <ExternalLink aria-hidden="true" /> Source code <ChevronRight aria-hidden="true" />
        </a>
      </div>

      <p className="ios-privacy">
        History stays on this device. Files come from TikTok&apos;s CDN. Download only content you have the right to use.
      </p>
    </div>
  );
}

export function GuideScreen({ platform }: GuideProps) {
  if (platform === 'android') return <GuideAndroid />;
  if (platform === 'ios') return <GuideIOS />;
  return <GuideDesktop />;
}
