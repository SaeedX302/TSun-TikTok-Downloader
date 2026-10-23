import { Image as ImageIcon, Play } from 'lucide-react';
import type { TikTokMedia } from '../lib/types';

interface MediaPreviewProps {
  media: TikTokMedia;
}

export function MediaPreview({ media }: MediaPreviewProps) {
  const previewImage = media.cover || media.images[0] || '/cover.svg';

  return (
    <div className="mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-none">
      <div className="relative aspect-[9/16] max-h-[65vh] w-full overflow-hidden rounded-3xl border border-slate-900/10 bg-slate-950 shadow-xl shadow-slate-950/20 dark:border-white/10">
        {media.isPhoto ? (
          <img
            src={previewImage}
            alt={media.title ? `Preview of ${media.title}` : 'TikTok photo post'}
            className="h-full w-full object-cover"
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
            className="h-full w-full bg-black object-contain"
          >
            Your browser does not support the video element.
          </video>
        ) : (
          <img
            src={previewImage}
            alt={media.title || 'TikTok video preview'}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.src = '/cover.svg';
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-gradient-to-b from-black/60 to-transparent p-3">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur-md">
            {media.isPhoto ? `${media.images.length} photos` : 'HD preview'}
          </span>
          <span className="rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white backdrop-blur-md">
            No watermark
          </span>
        </div>

        {!media.isPhoto && !media.video.noWatermark && (
          <span className="absolute inset-0 grid place-items-center bg-black/25">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white/20 backdrop-blur-md">
              <Play className="h-6 w-6 fill-white text-white" aria-hidden="true" />
            </span>
          </span>
        )}

        {media.isPhoto && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-3 text-[11px] font-bold text-white">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Swipe through all photos below
          </span>
        )}
      </div>
    </div>
  );
}
