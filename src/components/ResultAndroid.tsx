import {
  ArrowDownToLine,
  Check,
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

export function ResultAndroid({ media, controller }: ResultProps) {
  const metrics = [
    ['Views', media.stats.plays],
    ['Likes', media.stats.likes],
    ['Comments', media.stats.comments],
    ['Saves', media.stats.saves],
  ].filter(([, value]) => Number(value) > 0) as Array<[string, number]>;

  return (
    <article className="m3-result">
      <div className="m3-result-head">
        <p className="m3-status">
          <Check aria-hidden="true" /> Ready to download
        </p>
        <button type="button" className="m3-text-button" onClick={controller.onNewLink}>
          New link
        </button>
      </div>

      <MediaFrame media={media} className="m3-media" />

      <div className="m3-result-body">
        <div className="m3-author">
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

        <div className="m3-chips">
          {media.duration > 0 && <span>{formatDuration(media.duration)}</span>}
          <span>{media.isPhoto ? 'Photo post' : 'Video'}</span>
          {media.createdAt && <span>{formatRelativeDate(media.createdAt)}</span>}
        </div>

        {metrics.length > 0 && (
          <dl className="m3-stats">
            {metrics.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{formatCount(value)}</dd>
              </div>
            ))}
          </dl>
        )}

        {media.music.title && (
          <div className="m3-music">
            <span className="m3-music-icon"><Music2 aria-hidden="true" /></span>
            <div>
              <strong>{media.music.title}</strong>
              <span>{media.music.author}</span>
            </div>
          </div>
        )}

        <div className="m3-result-actions">
          <a href={media.sourceUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden="true" /> Open
          </a>
          <button type="button" onClick={() => controller.onCopy(media.sourceUrl, 'Link')}>
            <Copy aria-hidden="true" /> Copy link
          </button>
          <button type="button" onClick={() => controller.onCopy(media.title, 'Caption')}>
            <Copy aria-hidden="true" /> Caption
          </button>
        </div>
      </div>

      <div className="m3-files-head">
        <h3>Downloads</h3>
        <span>{media.downloads.length} files</span>
      </div>

      <div className="m3-file-list">
        {media.downloads.map((option) => {
          const active = controller.activeDownload === option.id;
          const busy = Boolean(controller.activeDownload);
          const percent = controller.progress?.percent;

          return (
            <div key={option.id} className={`m3-file ${active ? 'is-active' : ''}`}>
              <button
                type="button"
                className="m3-file-main"
                onClick={() => controller.onDownload(option)}
                disabled={busy && !active}
                aria-label={`Download ${option.label}`}
              >
                <span className="m3-file-icon">
                  <OptionIcon kind={option.kind} />
                </span>
                <span className="m3-file-copy">
                  <span className="m3-file-title">
                    {option.label}
                    {option.badge && <em>{option.badge}</em>}
                  </span>
                  <span className="m3-file-sub">
                    {option.size ? `${formatBytes(option.size)} · ` : ''}
                    {option.description}
                  </span>
                </span>
                {active ? (
                  <span className="m3-file-percent">
                    {percent == null ? '…' : `${percent}%`}
                  </span>
                ) : (
                  <span className="m3-file-download">
                    <ArrowDownToLine aria-hidden="true" />
                  </span>
                )}
              </button>
              {active && (
                <>
                  <span className="m3-file-progress" aria-hidden="true">
                    <span
                      className={percent == null ? 'is-indeterminate' : ''}
                      style={percent == null ? undefined : { width: `${percent}%` }}
                    />
                  </span>
                  <button
                    type="button"
                    className="m3-file-cancel"
                    onClick={controller.onCancelDownload}
                    aria-label="Cancel download"
                  >
                    <X aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p className="m3-note">
        Files download from TikTok&apos;s servers. If a file opens instead, long-press it and choose Save.
      </p>
    </article>
  );
}
