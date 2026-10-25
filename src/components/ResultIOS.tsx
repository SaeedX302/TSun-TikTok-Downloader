import {
  ArrowDownToLine,
  ChevronRight,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Music2,
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

function OptionIcon({ kind }: { kind: 'video' | 'audio' | 'image' }) {
  const Icon = kind === 'audio' ? Music2 : kind === 'image' ? ImageIcon : ArrowDownToLine;
  return <Icon aria-hidden="true" />;
}

export function ResultIOS({ media, controller }: ResultProps) {
  return (
    <article className="ios-result">
      <section className="ios-media-group">
        <MediaFrame media={media} className="ios-media" />
        <div className="ios-media-info">
          <div className="ios-author">
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
          </div>

          <h2>{media.title}</h2>

          <p className="ios-media-meta">
            {media.duration > 0 && <span>{formatDuration(media.duration)}</span>}
            <span>{media.isPhoto ? 'Photo post' : 'Video'}</span>
            {media.createdAt && <span>{formatRelativeDate(media.createdAt)}</span>}
          </p>

          {(media.stats.plays > 0 || media.stats.likes > 0) && (
            <div className="ios-metrics">
              {media.stats.plays > 0 && (
                <div>
                  <span>Views</span>
                  <strong>{formatCount(media.stats.plays)}</strong>
                </div>
              )}
              {media.stats.likes > 0 && (
                <div>
                  <span>Likes</span>
                  <strong>{formatCount(media.stats.likes)}</strong>
                </div>
              )}
              {media.stats.comments > 0 && (
                <div>
                  <span>Comments</span>
                  <strong>{formatCount(media.stats.comments)}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <p className="ios-section-header">Download</p>
      <div className="ios-list">
        {media.downloads.map((option) => {
          const active = controller.activeDownload === option.id;
          const busy = Boolean(controller.activeDownload);
          const percent = controller.progress?.percent;

          return (
            <div key={option.id} className={`ios-list-row ios-download-row ${active ? 'is-active' : ''}`}>
              <button
                type="button"
                onClick={() => controller.onDownload(option)}
                disabled={busy && !active}
                aria-label={`Download ${option.label}`}
              >
                <span className={`ios-icon-tile is-${option.kind}`}>
                  <OptionIcon kind={option.kind} />
                </span>
                <span className="ios-row-copy">
                  <span className="ios-row-title">
                    {option.label}
                    {option.badge && <em>{option.badge}</em>}
                  </span>
                  <span className="ios-row-sub">
                    {option.size ? `${formatBytes(option.size)} · ` : ''}
                    {option.description}
                  </span>
                  {active && (
                    <span className="ios-progress" aria-hidden="true">
                      <span
                        className={percent == null ? 'is-indeterminate' : ''}
                        style={percent == null ? undefined : { width: `${percent}%` }}
                      />
                    </span>
                  )}
                </span>
                {active ? (
                  <span className="ios-row-percent">{percent == null ? '' : `${percent}%`}</span>
                ) : (
                  <ArrowDownToLine className="ios-row-chevron" aria-hidden="true" />
                )}
              </button>
              {active && (
                <button
                  type="button"
                  className="ios-row-cancel"
                  onClick={controller.onCancelDownload}
                  aria-label="Cancel download"
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="ios-section-header">Details</p>
      <div className="ios-list">
        {media.duration > 0 && (
          <div className="ios-value-row">
            <span>Duration</span>
            <strong>{formatDuration(media.duration)}</strong>
          </div>
        )}
        {media.createdAt && media.createdAt > 0 && (
          <div className="ios-value-row">
            <span>Posted</span>
            <strong>{formatRelativeDate(media.createdAt)}</strong>
          </div>
        )}
        {media.music.title && (
          <div className="ios-value-row">
            <span>Sound</span>
            <strong className="is-truncate">{media.music.title}</strong>
          </div>
        )}
        <div className="ios-value-row">
          <span>Post ID</span>
          <strong className="is-mono">{media.id || '—'}</strong>
        </div>
      </div>

      <div className="ios-list ios-action-list">
        <a href={media.sourceUrl} target="_blank" rel="noopener noreferrer" className="ios-action-row">
          <ExternalLink aria-hidden="true" /> Open on TikTok <ChevronRight aria-hidden="true" />
        </a>
        <button
          type="button"
          className="ios-action-row"
          onClick={() => controller.onCopy(media.sourceUrl, 'Link')}
        >
          <Copy aria-hidden="true" /> Copy link <ChevronRight aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ios-action-row"
          onClick={() => controller.onCopy(media.title, 'Caption')}
        >
          <Copy aria-hidden="true" /> Copy caption <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <button type="button" className="ios-new-link" onClick={controller.onNewLink}>
        Use a new link
      </button>
    </article>
  );
}
