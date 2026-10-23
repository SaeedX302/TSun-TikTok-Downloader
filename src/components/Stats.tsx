import { Bookmark, Heart, MessageCircle, Play, Share2 } from 'lucide-react';
import type { TikTokMedia } from '../lib/types';
import { formatCount } from '../lib/format';

interface StatsProps {
  media: TikTokMedia;
}

export function Stats({ media }: StatsProps) {
  const items = [
    { label: 'Views', value: media.stats.plays, icon: Play },
    { label: 'Likes', value: media.stats.likes, icon: Heart },
    { label: 'Comments', value: media.stats.comments, icon: MessageCircle },
    { label: 'Shares', value: media.stats.shares, icon: Share2 },
    { label: 'Saves', value: media.stats.saves, icon: Bookmark },
  ].filter((item) => item.value > 0);

  if (items.length === 0) return null;

  return (
    <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-900/[0.06] bg-slate-900/[0.02] px-3 py-2 dark:border-white/[0.06] dark:bg-white/[0.03]"
        >
          <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <item.icon className="h-3 w-3" aria-hidden="true" />
            {item.label}
          </dt>
          <dd className="mt-0.5 text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">
            {formatCount(item.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
