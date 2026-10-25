import { Image as ImageIcon } from 'lucide-react';
import type { TikTokMedia } from '../lib/types';

interface MediaFrameProps {
  media: TikTokMedia;
  className?: string;
}

/** Solid media surface shared by all three interface languages. */
export function MediaFrame({ media, className = '' }: MediaFrameProps) {
  const fallback = media.cover || media.images[0] || '/cover.svg';

  return (
    <div className={`media-frame ${className}`}>
      {media.isPhoto ? (
        <img
          src={fallback}
          alt={media.title ? `Preview of ${media.title}` : 'TikTok photo post'}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/cover.svg';
          }}
        />
      ) : media.video.noWatermark ? (
        <video
          key={media.id}
          src={media.video.noWatermark}
          poster={media.cover || undefined}
          controls
          playsInline
          preload="metadata"
        >
          Your browser does not support the video element.
        </video>
      ) : (
        <img
          src={fallback}
          alt={media.title || 'TikTok video preview'}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = '/cover.svg';
          }}
        />
      )}

      {media.isPhoto && (
        <span className="media-badge">
          <ImageIcon aria-hidden="true" />
          {media.images.length} photos
        </span>
      )}
    </div>
  );
}
