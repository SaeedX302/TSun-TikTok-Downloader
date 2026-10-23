export type DownloadKind = 'video' | 'audio' | 'image';

export interface DownloadOption {
  id: string;
  label: string;
  description: string;
  url: string;
  kind: DownloadKind;
  format: 'mp4' | 'mp3' | 'jpg' | 'webp';
  quality?: string;
  size?: number;
  badge?: string;
}

export interface TikTokAuthor {
  id?: string;
  username: string;
  nickname: string;
  avatar: string;
  verified?: boolean;
}

export interface TikTokStats {
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  downloads: number;
  saves: number;
}

export interface TikTokMusic {
  title: string;
  author: string;
  cover?: string;
  url?: string;
  duration?: number;
}

export interface TikTokMedia {
  id: string;
  title: string;
  createdAt?: number;
  duration: number;
  cover: string;
  originCover?: string;
  dynamicCover?: string;
  author: TikTokAuthor;
  music: TikTokMusic;
  stats: TikTokStats;
  isPhoto: boolean;
  images: string[];
  video: {
    noWatermark?: string;
    watermark?: string;
    hd?: string;
    size?: number;
    hdSize?: number;
    wmSize?: number;
  };
  audio?: string;
  downloads: DownloadOption[];
  sourceUrl: string;
  provider: string;
}
