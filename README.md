# CourtNotes

Welcome to my personal blogging website! Here, I share my thoughts, ideas, and experiences on a variety of topics. This site is built with [Eleventy (11ty)](https://www.11ty.dev/) and serves as a space for me to write and experiment with web development. The project serves as a learning exercise while I explore 11ty's features and functionalities, with the goal of later implementing it in my portfolio.

## ✨ Features

- 🏗️ Static site generation with **Eleventy**
- 🧩 Templating with **Nunjucks**
- 📝 **Netlify CMS** for easy content management
- 🎨 Minimal and responsive design
- ⚡ Fast and optimized for performance
- 🎵 Apple Music playlists on the About page — recently played + the auto-generated "Heavy Rotation" (build-time, no client-side tokens)

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v18+, for the global `fetch` used by the Apple Music data file)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/courtneyfradreck/courtnotes.git
   cd courtnotes
   ```
2. Install dependencies:
   ```sh
   npm install
   ```

### Running the Development Server

To start the development server, run:

```sh
npm run start
```

This will launch the app at `http://localhost:8080/`.

### Building for Production

To generate a production-ready build, run:

```sh
npm run build
```

The output will be in the `public` directory.

## Folder Structure

```
courtnotes/
├── src/
│   ├── admin/        # Netlify CMS configuration and admin files
│   ├── _includes/    # Nunjucks reusable templates and partials
│   ├── _data/        # Global + build-time data (metadata.js, music.mjs)
│   ├── blogs/        # Personal Markdown blog posts
│   ├── assets/       # Images and static assets
│   ├── about.njk     # About page (hosts the Apple Music widget)
│   ├── index.njk     # Homepage template
│   ├── style.css     # Homepage/base styles
│   └── ...           # Other source files
├── scripts/          # Local one-time helpers (Apple Music token tooling)
├── netlify/
│   └── functions/    # Scheduled function that triggers periodic rebuilds
├── .eleventy.js      # Eleventy configuration file
├── package.json      # Project metadata and scripts
├── package-lock.json # Dependency lock file
├── README.md         # Project documentation (this file)
└── ...               # Additional config or root files
```

## Customization

- Modify `src/_data/` for global site data.
- Update `src/_includes/` to change the UI components.
- Add new Markdown files in `src/blogs/` to create new posts.
- Customize styles in `src/style.css` to match your preferred design.

## 🎵 Apple Music Playlists

The About page (`/about/`) shows two Apple Music playlists: my **recently played** tracks and my **Heavy Rotation** playlist (an auto-generated personalized playlist that Apple Music maintains). Both are fetched **at build time** — there are no tokens in the browser, and a missing/expired token or any API failure **never breaks the build** (the data file returns empty data and each section renders a fallback or is omitted).

### How it works

| Piece | File | Role |
|-------|------|------|
| Build-time data | `src/_data/music.mjs` | Mints a fresh developer JWT from the base64'd `.p8`, then fetches recently played tracks and the Heavy Rotation playlist. Heavy Rotation isn't a library playlist, so it's discovered from `/me/recommendations` (resilient to Apple rotating the playlist id) and its tracks pulled from the catalog. Returns `{ recent, heavyRotation }`; any failure path degrades to empty data and the function never throws. |
| Widget markup | `src/about.njk` | Renders `music.recent` and `music.heavyRotation.tracks` as `.apple-music-tracklist` playlists; shows a fallback note when recent is empty and omits Heavy Rotation when unavailable. |
| Dev-token helper | `scripts/generate-dev-token.mjs` | One-time local: prints a signed developer token. |
| Authorize page | `scripts/authorize.html` | One-time local: sign in once to obtain the long-lived **Music User Token**. |
| Auto-refresh | `netlify/functions/refresh-music.mjs` | Scheduled function (`0 */6 * * *`) that POSTs a Netlify build hook every 6 hours so the data stays current. |

### Environment variables

`.p8` and `.env` are git-ignored — **never commit them**. The real secrets live only in `.env` (local) and Netlify environment variables (production).

| Variable | Where | Notes |
|----------|-------|-------|
| `APPLE_TEAM_ID` | local + Netlify | Apple Developer Team ID. |
| `APPLE_KEY_ID` | local + Netlify | The Key ID of your MusicKit AuthKey. |
| `APPLE_AUTHKEY_PATH` | local only | Filesystem path to `AuthKey_XXXX.p8` (used by the local helper). |
| `APPLE_AUTHKEY_BASE64` | Netlify only | The `.p8` file, base64-encoded (used by the build). |
| `APPLE_MUSIC_USER_TOKEN` | Netlify only | Long-lived (~6 months) user token; rotate manually. |
| `NETLIFY_BUILD_HOOK_URL` | Netlify only | Build hook the scheduled function POSTs to. |

### Redo / rotation process

The **Music User Token expires roughly every 6 months** — when the widget goes empty, redo steps 2–4 below. A full from-scratch setup is steps 1–7.

1. **Apple Developer setup (one-time).** Create a **MusicKit identifier** and a **Media Services key** in the Apple Developer portal, and download the `AuthKey_XXXX.p8` (you only get to download it once). Note your Team ID and the Key ID.

2. **Local `.env`:**
   ```env
   APPLE_TEAM_ID=YOUR_TEAM_ID
   APPLE_KEY_ID=YOUR_KEY_ID
   APPLE_AUTHKEY_PATH=./AuthKey_YOUR_KEY_ID.p8
   ```

3. **Mint a developer token** (used only to authorize in the next step):
   ```sh
   node scripts/generate-dev-token.mjs
   ```
   Copy the printed token.

4. **Get the Music User Token:**
   - Paste the token from step 3 into `scripts/authorize.html` (replace `PASTE_DEV_TOKEN_HERE`).
   - Serve the folder (MusicKit needs a real http origin, not `file://`):
     ```sh
     npx serve scripts
     ```
   - Open the printed URL + `/authorize.html`, click **Authorize Apple Music**, sign in, and copy the **Music User Token** shown on the page.
   - **⚠️ Scrub the token back to `PASTE_DEV_TOKEN_HERE` before committing** — `scripts/authorize.html` is committed as a template and this repo is public. (`git checkout scripts/authorize.html` discards the local edit.)

5. **Base64-encode the `.p8`** for the build:
   ```sh
   # macOS (copies to clipboard):
   base64 -i AuthKey_YOUR_KEY_ID.p8 | pbcopy
   # Linux (single line):
   base64 -w 0 AuthKey_YOUR_KEY_ID.p8
   ```

6. **Set Netlify environment variables** (Site configuration → Environment variables):
   `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_AUTHKEY_BASE64` (from step 5), `APPLE_MUSIC_USER_TOKEN` (from step 4), and `NETLIFY_BUILD_HOOK_URL` (from step 7).

7. **Create the build hook** (Site configuration → Build & deploy → Continuous deployment → Build hooks → **Add build hook**), point it at your production branch, and paste the generated URL into `NETLIFY_BUILD_HOOK_URL`. The scheduled function then rebuilds the site every 6 hours. Trigger a deploy and the latest tracks appear on `/about/`.

> **Secrets scanning:** if a Netlify deploy fails on secrets scanning, add
> `SECRETS_SCAN_OMIT_KEYS = APPLE_AUTHKEY_BASE64,APPLE_MUSIC_USER_TOKEN`.

> **Note:** with no Apple env vars set (e.g. local dev), `src/_data/music.mjs` returns empty data (`{ recent: [], heavyRotation: null }`), so `npm run build` succeeds and the About page renders its fallback message instead of tracks.

## Roadmap

- Implement search functionality
- Add tagging and categorization for notes
- Support for dark mode
- Improve accessibility and performance

## License

This project is open-source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Eleventy](https://www.11ty.dev/) for the static site generator
- Open-source community for inspiration and guidance

## Author

[Courtney Fradreck](https://courtney.codes)
