import { useState } from 'react';
import { ArrowRight, ChevronRight, Clock3, MinusCircle, Trash2 } from 'lucide-react';
import type { AppController, Platform, Tab } from '../ui/types';

interface RecentScreenProps {
  platform: Platform;
  controller: AppController;
  onTabChange: (tab: Tab) => void;
}

function EmptyState({
  platform,
  onDownload,
}: {
  platform: Platform;
  onDownload: () => void;
}) {
  if (platform === 'android') {
    return (
      <div className="m3-empty">
        <span className="m3-empty-icon"><Clock3 aria-hidden="true" /></span>
        <h2>No downloads yet</h2>
        <p>Links you fetch will appear here, stored only on this device.</p>
        <button type="button" className="m3-button-filled" onClick={onDownload}>
          Download a video
        </button>
      </div>
    );
  }

  if (platform === 'ios') {
    return (
      <div className="ios-empty">
        <span className="ios-empty-icon"><Clock3 aria-hidden="true" /></span>
        <h2>No downloads yet</h2>
        <p>Links you fetch will appear here, stored only on this device.</p>
        <button type="button" className="ios-button-primary" onClick={onDownload}>
          Download a video
        </button>
      </div>
    );
  }

  return (
    <div className="desk-empty">
      <span className="desk-empty-icon"><Clock3 aria-hidden="true" /></span>
      <h2>Nothing here yet</h2>
      <p>Links you fetch are kept on this device so you can reopen them later.</p>
      <button type="button" className="desk-primary" onClick={onDownload}>
        Download a video <ArrowRight aria-hidden="true" />
      </button>
    </div>
  );
}

function IOSRecent({ controller, onTabChange }: Omit<RecentScreenProps, 'platform'>) {
  const [editing, setEditing] = useState(false);
  const { history } = controller;

  return (
    <div className="ios-screen ios-recent">
      <header className="ios-large-head ios-head-with-action">
        <h1>Recent</h1>
        {history.length > 0 && (
          <button type="button" onClick={() => setEditing((value) => !value)}>
            {editing ? 'Done' : 'Edit'}
          </button>
        )}
      </header>
      <p className="ios-screen-sub">Saved on this device only.</p>

      {history.length === 0 ? (
        <EmptyState platform="ios" onDownload={() => onTabChange('download')} />
      ) : (
        <>
          <div className="ios-list">
            {history.map((entry) => (
              <div key={entry.id} className={`ios-history-row ${editing ? 'is-editing' : ''}`}>
                {editing && (
                  <button
                    type="button"
                    className="ios-minus"
                    onClick={() => controller.onRemoveHistory(entry)}
                    aria-label={`Remove ${entry.title} from history`}
                  >
                    <MinusCircle aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className="ios-history-main"
                  onClick={() => controller.onSelectHistory(entry)}
                  disabled={editing}
                >
                  <span className="ios-history-thumb">
                    {entry.cover ? (
                      <img
                        src={entry.cover}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </span>
                  <span className="ios-row-copy">
                    <span className="ios-row-title">{entry.title}</span>
                    <span className="ios-row-sub">
                      @{entry.username} · {new Date(entry.savedAt).toLocaleDateString()}
                    </span>
                  </span>
                  {!editing && <ChevronRight className="ios-row-chevron" aria-hidden="true" />}
                </button>
              </div>
            ))}
          </div>

          {!editing && (
            <button type="button" className="ios-clear-row" onClick={controller.onClearHistory}>
              Clear recent downloads
            </button>
          )}
        </>
      )}
    </div>
  );
}


export function RecentScreen({ platform, controller, onTabChange }: RecentScreenProps) {
  if (platform === 'ios') {
    return <IOSRecent controller={controller} onTabChange={onTabChange} />;
  }

  if (platform === 'android') {
    return (
      <div className="m3-screen m3-recent">
        <header className="m3-screen-head m3-head-with-action">
          <div>
            <h1>Recent</h1>
            <p>Saved on this device only.</p>
          </div>
          {controller.history.length > 0 && (
            <button type="button" className="m3-text-button" onClick={controller.onClearHistory}>
              Clear
            </button>
          )}
        </header>

        {controller.history.length === 0 ? (
          <EmptyState platform="android" onDownload={() => onTabChange('download')} />
        ) : (
          <ul className="m3-history-list">
            {controller.history.map((entry) => (
              <li key={entry.id} className="m3-history-card">
                <button
                  type="button"
                  className="m3-history-main"
                  onClick={() => controller.onSelectHistory(entry)}
                >
                  <span className="m3-history-thumb">
                    {entry.cover ? (
                      <img
                        src={entry.cover}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </span>
                  <span className="m3-history-copy">
                    <strong>{entry.title}</strong>
                    <span>@{entry.username} · {new Date(entry.savedAt).toLocaleDateString()}</span>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="m3-history-delete"
                  onClick={() => controller.onRemoveHistory(entry)}
                  aria-label={`Remove ${entry.title} from history`}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="desk-screen desk-recent">
      <header className="desk-page-head">
        <div>
          <p className="desk-kicker">Library</p>
          <h1>Recent</h1>
          <p className="desk-lede">Saved in this browser. Nothing is stored on a server.</p>
        </div>
        {controller.history.length > 0 && (
          <button type="button" className="desk-quiet-button" onClick={controller.onClearHistory}>
            Clear all
          </button>
        )}
      </header>

      {controller.history.length === 0 ? (
        <EmptyState platform="desktop" onDownload={() => onTabChange('download')} />
      ) : (
        <div className="desk-history">
          <div className="desk-history-head" aria-hidden="true">
            <span>Post</span>
            <span>Creator</span>
            <span>Type</span>
            <span>Saved</span>
            <span />
          </div>
          <ul>
            {controller.history.map((entry) => (
              <li key={entry.id} className="desk-history-row">
                <button
                  type="button"
                  className="desk-history-main"
                  onClick={() => controller.onSelectHistory(entry)}
                >
                  <span className="desk-history-post">
                    <span className="desk-history-thumb">
                      {entry.cover ? (
                      <img
                        src={entry.cover}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    </span>
                    <strong>{entry.title}</strong>
                  </span>
                  <span>@{entry.username}</span>
                  <span>{entry.kind === 'photo' ? 'Photos' : 'Video'}</span>
                  <span>{new Date(entry.savedAt).toLocaleDateString()}</span>
                  <ArrowRight aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="desk-history-remove"
                  onClick={() => controller.onRemoveHistory(entry)}
                  aria-label={`Remove ${entry.title} from history`}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
