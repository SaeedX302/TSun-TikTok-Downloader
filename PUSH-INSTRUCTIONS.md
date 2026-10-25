# Push these changes to GitHub

The archive contains the complete source at commit `37ae898`. It is 5 commits ahead of
`origin/cline/phvrmcaf`.

## Option A - preserve the commits (recommended)

```bash
cd /path/to/TSun-TikTok-Downloader-with-Liquid-Glass-UI
git fetch origin cline/phvrmcaf
git checkout cline/phvrmcaf
git am /path/to/CHANGES.patch
npm install
npm test
npm run build
git push origin cline/phvrmcaf
```

## Option B - restore the branch from the bundle

```bash
cd /path/to/TSun-TikTok-Downloader-with-Liquid-Glass-UI
git fetch /path/to/repo.bundle 'refs/heads/*:refs/remotes/bundle/*'
git checkout -B cline/phvrmcaf bundle/cline/phvrmcaf
git push origin cline/phvrmcaf
```

## Option C - copy files

Copy everything from this archive except `CHANGES.patch`, `repo.bundle` and this file
into your `cline/phvrmcaf` checkout, then commit and push.

Expected checks: 33 tests, ESLint clean, production build passing.
