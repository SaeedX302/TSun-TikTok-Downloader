import {
  ArrowDownToLine,
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Music2,
  RotateCcw,
  X,
} from 'lucide-react';
import type { AppController } from '../ui/types';
import type { TikTokMedia } from '../lib/types';
import { formatBytes, formatCount, formatDuration, formatRelativeDate } from '../lib/format';
import { MediaFrame } from './MediaFrame';

interface ResultProps {
  media: TikTokMedia;
  controller: AppController;
}

function optionIcon(kind: 'video' | 'audio' | 'image') {
  if (kind === 'audio') return Music2;
  if (kind === 'image') return ImageIcon;
  return ArrowDownToLine;
}

export function ResultDesktop({ media, controller }: ResultProps) {
  const stats = [
    ['Views', media.stats.plays],
    ['Likes', media.stats.likes],
    ['Comments', media.stats.comments],
    ['Saves', media.stats.saves],
  ].filter(([, value]) => Number(value) > 0) as Array<[string, number]>;

  return (
    <article className="desk-result">
      <header className="desk-result-head">
        <span className="desk-result-status">
          <Check aria-hidden="true" />
          Ready to download
        </span>
        <span className="desk-result-id">Post {media.id || '—'}</span>
        <button type="button" onClick={controller.onNewLink}>
          New link <RotateCcw aria-hidden="true" />
        </button>
      </header>

      <div className="desk-result-grid">
        <MediaFrame media={media} className="desk-media" />

        <div className="desk-detail">
          <div className="desk-author">
            <img
              src={media.author.avatar}
              alt=""
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = '/avatar.svg';
              }}
            />
            <div>
              <strong>@{media.author.username}</strong>
              <span>{media.author.nickname}</span>
            </div>
            <span className="desk-type">{media.isPhoto ? 'Photo post' : 'Video'}</span>
          </div>

          <h2 className="desk-media-title">{media.title}</h2>

          <p className="desk-meta">
            {media.duration > 0 && <span>{formatDuration(media.duration)}</span>}
            {media.createdAt && <span>{formatRelativeDate(media.createdAt)}</span>}
            {media.images.length > 0 && <span>{media.images.length} images</span>}
          </p>

          {media.music.title && (
            <p className="desk-music">
              <Music2 aria-hidden="true" />
              <span>{media.music.title}</span>
              <em>{media.music.author}</em>
            </p>
          )}

          {stats.length > 0 && (
            <dl className="desk-stats">
              {stats.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{formatCount(value)}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="desk-result-links">
            <a href={media.sourceUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden="true" /> Open on TikTok
            </a>
            <button type="button" onClick={() => controller.onCopy(media.sourceUrl, 'Link')}>
              <Copy aria-hidden="true" /> Copy link
            </button>
            <button type="button" onClick={() => controller.onCopy(media.title, 'Caption')}>
              <Copy aria-hidden="true" /> Copy caption
            </button>
          </div>
        </div>
      </div>

      <section className="desk-files" aria-label="Download files">
        <div className="desk-files-head">
          <h3>Files</h3>
          <span>{media.downloads.length} available</span>
        </div>

        {media.downloads.map((option) => {
          const Icon = optionIcon(option.kind);
          const active = controller.activeDownload === option.id;
          const busy = Boolean(controller.activeDownload);
          const percent = controller.progress?.percent;

          return (
            <div key={option.id} className={`desk-file ${active ? 'is-active' : ''}`}>
              <button
                type="button"
                className="desk-file-main"
                onClick={() => controller.onDownload(option)}
                disabled={busy && !active}
                aria-label={`Download ${option.label}`}
              >
                <span className="desk-file-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="desk-file-copy">
                  <span className="desk-file-title">
                    {option.label}
                    {option.badge && <em>{option.badge}</em>}
                  </span>
                  <span className="desk-file-sub">
                    {option.description}
                    {option.size ? ` · ${formatBytes(option.size)}` : ''}
                  </span>
                  {active && (
                    <span className="desk-progress" aria-hidden="true">
                      <span
                        className={percent == null ? 'is-indeterminate' : ''}
                        style={percent == null ? undefined : { width: `${percent}%` }}
                      />
                    </span>
                  )}
                </span>
                <span className="desk-file-action">
                  {active ? (
                    percent == null ? 'Preparing…' : `${percent}%`
                  ) : (
                    <>
                      Download <ArrowDownToLine aria-hidden="true" />
                    </>
                  )}
                </span>
              </button>
              {active && (
                <button
                  type="button"
                  className="desk-file-cancel"
                  onClick={controller.onCancelDownload}
                  aria-label="Cancel download"
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </section>
    </article>
  );
}
