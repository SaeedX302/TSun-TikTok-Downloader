import {
  ClipboardPaste,
  Download,
  Link2,
  Lock,
  Music2,
  ShieldCheck,
  Smartphone,
  Zap,
} from 'lucide-react';

export const STEPS = [
  {
    title: 'Copy from TikTok',
    body: 'Open any video or photo post, tap Share, then Copy link. On Android you can also use the share sheet.',
    icon: ClipboardPaste,
  },
  {
    title: 'Paste the whole message',
    body: 'Share text like “Check out this video! https://vm.tiktok.com/…” is fine. We decode and extract the link for you.',
    icon: Link2,
  },
  {
    title: 'Download instantly',
    body: 'Pick HD without watermark, the original file, the MP3 audio, or every photo in a slideshow.',
    icon: Download,
  },
];

export const FEATURES = [
  {
    title: 'Every TikTok link format',
    body: 'Direct URLs, vm. and vt. short links, tiktok.com/t/ links, encoded share text and Android deep links.',
    icon: Link2,
  },
  {
    title: 'HD, no watermark',
    body: 'Grab the high-bitrate MP4 without the TikTok watermark, plus the original with watermark if you need it.',
    icon: ShieldCheck,
  },
  {
    title: 'Audio and photo posts',
    body: 'Extract the original sound as MP3, or download each image from a TikTok photo carousel.',
    icon: Music2,
  },
  {
    title: 'Fast and cached',
    body: 'Results are cached for 15 minutes on your device, so re-downloading a format never waits on TikTok again.',
    icon: Zap,
  },
  {
    title: 'Android, desktop, every screen',
    body: 'Large touch targets, safe-area support and a layout that adapts from small phones to ultrawide monitors.',
    icon: Smartphone,
  },
  {
    title: 'No account, no tracking',
    body: 'The downloader runs in your browser. Nothing is uploaded to our servers and no sign-up is required.',
    icon: Lock,
  },
];

export const FAQS = [
  {
    question: 'Why do links copied from the TikTok app look different?',
    answer:
      'The app often copies a complete share message instead of a plain URL. It may contain emoji, zero-width characters, percent-encoding, an @mention, or a short vm.tiktok.com / vt.tiktok.com / tiktok.com/t/ link. TSun decodes the message and finds the real post before sending it to the download service.',
  },
  {
    question: 'Which link types are supported?',
    answer:
      'Direct links such as tiktok.com/@user/video/123, short links from vm.tiktok.com, vt.tiktok.com and tiktok.com/t/, mobile links such as m.tiktok.com/v/123.html, embed links, links with tracking parameters, URL-encoded links and share text containing any of these. Android deep links with an aweme ID also work.',
  },
  {
    question: 'Does it work on Android and iPhone?',
    answer:
      'Yes. The interface is mobile-first with large tap targets and safe-area padding. On Android and iOS the downloaded video is saved to your Downloads app or Files, depending on your browser. If a file opens instead of saving, long-press the video and choose “Download” or “Save to Files”.',
  },
  {
    question: 'Why does a link sometimes fail?',
    answer:
      'Private, deleted, region-locked, age-restricted or live content cannot be downloaded. Old share links also expire. Open the post in TikTok, tap Share → Copy link again, and paste the fresh message. The free API also allows one request per second — the app retries automatically, but waiting a moment helps.',
  },
  {
    question: 'Where are the videos saved?',
    answer:
      'Files are saved by your browser: the Downloads folder on desktop and usually the Downloads or Files app on mobile. TSun does not store any video on a server.',
  },
  {
    question: 'Can I download TikTok photos and music?',
    answer:
      'Yes. Photo carousels show a download button for every image, and when the original sound is available it appears as an MP3 option. Some TikTok sounds are licensed and may not expose a separate audio stream.',
  },
];
