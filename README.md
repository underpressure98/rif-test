# RIFT — Living Game World

Landing page for RIFT — a living game universe populated by AI characters with persistent memory, real motivations, and autonomous behavior.

## Stack

Pure HTML + CSS + JavaScript. Zero dependencies. No build step required.

## Project structure

```
rift-web/
├── index.html   ← full page markup
├── style.css    ← design system + all styles
├── main.js      ← interactivity, animations, live feed
└── README.md
```

## Run locally

Open `index.html` directly in your browser — no server needed.

Or use a static server:

```bash
npx serve .
# or
python3 -m http.server 3000
```

## Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → New Project.
3. Import your repo.
4. Framework preset: **Other** (leave blank).
5. Build command: *(leave empty)*
6. Output directory: *(leave empty)*
7. Click **Deploy** — live URL in under 30 seconds.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
```

## Deploy to GitHub Pages

1. Push to GitHub.
2. Go to repo → **Settings** → **Pages**.
3. Source: `Deploy from a branch` → `main` → `/ (root)`.
4. Save. Live at `https://<username>.github.io/<repo-name>`.

## Customization

| What              | Where                                      |
|-------------------|--------------------------------------------|
| Colors & tokens   | `:root` block at top of `style.css`        |
| Faction names     | `index.html` — factions section            |
| Live feed events  | `events` array in `main.js`                |
| Particle density  | `COUNT` constant in canvas block of `main.js` |
| Fonts             | Google Fonts `<link>` in `index.html` head |
