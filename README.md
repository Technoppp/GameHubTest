# GameHub

A gaming portal built with React, Vite, and Tailwind CSS. Browse games, view tournament details, and stay updated with gaming news.

## Tech Stack

- React 18 for the UI
- Vite for the build tool and dev server
- Tailwind CSS for styling
- Lucide React for icons

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

- `npm run dev` starts the development server
- `npm run build` builds the app for production
- `npm run preview` previews the production build

## Auto News Sync

This project includes an automated news sync job that imports gaming news into the Firestore `news` collection without changing the website UI.

Files:

- `.github/workflows/sync-news.yml`
- `scripts/sync-news.mjs`

How it works:

1. GitHub Actions runs every 3 hours, or manually through `workflow_dispatch`.
2. The job fetches RSS feeds from gaming news sources.
3. It removes duplicates, matches known games by keyword, and writes formatted documents to Firestore.
4. The existing News page can keep reading from the `news` collection as before.

Required GitHub secret:

- `FIREBASE_SERVICE_ACCOUNT_JSON`

Setup steps:

1. In Firebase Console, create a service account with Firestore access.
2. Generate a JSON key for that service account.
3. In GitHub, open `Settings > Secrets and variables > Actions`.
4. Add a new repository secret named `FIREBASE_SERVICE_ACCOUNT_JSON`.
5. Paste the full Firebase service account JSON into that secret.

Notes:

- The sync job currently reads from PC Gamer, GamesRadar, and VGC RSS feeds.
- Only recent articles are imported.
- Duplicate articles are skipped based on source URL and title.
- Imported documents are marked with `autoImported: true`.
