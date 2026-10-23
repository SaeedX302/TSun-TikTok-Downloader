# 🌊 TSun Studio — TikTok Downloader

> A modern, responsive TikTok downloader built with React, TypeScript, Vite and Tailwind CSS.
> Paste a direct URL — or the **entire encoded share message copied from the TikTok app** — and save HD video, original audio or photo posts.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-tiktokvideodownloder.vercel.app-0ea5e9?style=flat-square)](https://tiktokvideodownloder.vercel.app/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)

---

## ✨ What changed in v2

- 📱 **Rebuilt UI** — responsive aurora-glass design for Android, iPhone, tablet, desktop and ultrawide screens.
- 🔗 **App share links now work** — `vm.tiktok.com`, `vt.tiktok.com`, `tiktok.com/t/` and full share messages.
- 🧼 **Share-text decoder** — removes emoji, zero-width characters, HTML entities and up to three layers of URL encoding.
- 🎞️ **HD / SD / watermark / MP3** — every available format is listed with size and quality.
- 🖼️ **Photo posts** — download each image from a TikTok carousel.
- ⚡ **Smart caching + retries** — handles the free API's one-request-per-second limit and caches results for 15 minutes.
- ⬇️ **Real downloads with progress** — streams the file into a Blob and falls back to a direct download when needed.
- 🕘 **Local history** — reopen recent posts without fetching again.
- 🌗 **Dark / light theme** — follows the system theme and remembers your choice.
- 🔐 **No hardcoded API keys** — the old RapidAPI key was removed from the bundle.

---

## 🔗 Supported link formats

| Format | Example |
| --- | --- |
| Direct video | `https://www.tiktok.com/@ladygaga/video/7376784960625085742` |
| Direct photo | `https://www.tiktok.com/@creator/photo/7504460423278742792` |
| App short link | `https://vm.tiktok.com/ZMabc123/` |
| App short link | `https://vt.tiktok.com/ZSabc123/` |
| Web short link | `https://www.tiktok.com/t/ZTabc123/` |

---

## 🚀 Getting started

```bash
git clone https://github.com/SaeedX302/TSun-TikTok-Downloader-with-Liquid-Glass-UI.git
cd TSun-TikTok-Downloader-with-Liquid-Glass-UI
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and create a production build in `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite (unit + component tests) |

### Configuration

No API key is required. The app talks directly to the free [TikWM](https://tikwm.com/) API, which resolves short links server-side and sends CORS headers for browser use.

To point the app at a self-hosted TikWM-compatible proxy, copy `.env.example` to `.env`:

```env
VITE_TIKWM_API_BASE=https://your-proxy.example.com/api/
```

The endpoint must accept `?url=<tiktok-url>&hd=1` and return a TikWM-style `{ code: 0, data: { ... } }` payload.

---

## 🧱 Project structure

```
src/
├── components/          # Header, Hero, form, result card, history, footer, toast
├── hooks/useTheme.ts    # Persisted dark/light theme
├── lib/
│   ├── tiktokUrl.ts     # Share-text decoder + link parser (all formats)
│   ├── tiktokApi.ts     # TikWM client, retries, normalisation, 15-min cache
│   ├── download.ts      # Streaming download + progress + fallback
│   ├── storage.ts       # Local history
│   ├── format.ts        # Counts, durations, sizes, file names
│   └── types.ts         # Shared media model
├── App.tsx
└── index.css            # Tailwind layers and glass utilities
```

---

## 🧠 How app links are handled

1. The paste is normalised (NFKC, zero-width characters, HTML entities, percent-decoding up to three times).
2. The first TikTok URL is extracted from the surrounding share message.
3. The path is parsed into a video/photo id, username or short-link code.
4. Tracking parameters are removed and a stable canonical URL is built when an id is known.
5. Short links are sent to TikWM, which follows the TikTok redirect and resolves the real post.
6. The response is normalised into a single media model with all download formats.

---

## 🔒 Privacy

- No accounts, analytics or tracking pixels.
- History and theme are stored only in your browser (`localStorage`).
- Media is downloaded directly from TikTok's CDN; TSun does not host or store videos.
- Only download content you own or have permission to use.

| Legacy mobile | `https://m.tiktok.com/v/7376784960625085742.html` |
| Embed | `https://www.tiktok.com/embed/v2/7376784960625085742` |
| With tracking | `https://www.tiktok.com/@user/video/123?is_from_webapp=1&sender_device=pc` |
| Full share message | `Check out @user! #TikTok > https://vm.tiktok.com/ZMabc123/ 😍` |
| URL-encoded text | `Check%20out%20https%3A%2F%2Fvm.tiktok.com%2FZMabc123%2F` |
| Android deep link | `snssdk1233://aweme/detail/7376784960625085742` |

Paste the whole message — TSun extracts the link itself. Profile, hashtag and music links are rejected with a helpful message.


---

## ▲ Deploy to Vercel

1. Import the repository into Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build` — output directory: `dist`.
4. Deploy. No environment variables are required.

The app is a static SPA, so it also works on Netlify, Cloudflare Pages or GitHub Pages.

---

## ✅ Testing

```bash
npm test
```

The suite covers:

- 15 link-parsing cases (direct, short, encoded, deep links, photo links, invalid input).
- TikWM payload normalisation (HD/SD/watermark/audio, photo carousels, fallbacks).
- Formatting utilities.
- A full component test that pastes an encoded app share link, mocks the API and verifies the result UI.

---

## 📜 License

MIT © 2025 [SaeedX302](https://github.com/SaeedX302)

## 🌟 Credits

- [TikWM](https://tikwm.com/) for the download API.
- [Lucide](https://lucide.dev/) for icons.
- [Tailwind CSS](https://tailwindcss.com/) and [Vite](https://vitejs.dev/) for the toolchain.
- UI inspired by futuristic glassmorphism and aurora gradients.

## 🤝 Contributing

Pull requests are welcome. Fork the repo, create a feature branch, run `npm test` and open a PR.

## 📲 Connect

[GitHub](https://github.com/SaeedX302) · [X](https://twitter.com/saeedx300) · [Instagram](https://instagram.com/saeedxdie) · [Telegram](https://t.me/saeedxdie) · [TikTok](https://tiktok.com/@saeedxdie) · [YouTube](https://youtube.com/@TsunMusicOfficial)
