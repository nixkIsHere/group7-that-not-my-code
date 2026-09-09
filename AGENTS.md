# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Root component: screen state machine (`home`/`lobby`/`game`/`review`) and Socket.IO event wiring
- `src/types.ts` - Shared frontend types (`Scenario`, `Player`, socket payload shapes)
- `src/lib/i18n.tsx` - EN/TH translations, `LangContext`/`useLang`, `<LangToggle/>`
- `src/lib/socket.ts` - The `socket.io-client` instance used to talk to `server/`
- `src/screens/` - One file per screen (`HomeScreen`, `LobbyScreen`, `GameScreen`, `ReviewScreen`)
- `src/components/` - Shared UI atoms (`VerdictButton`, `StunOverlay`, `ScenarioUIRenderer`, ...)
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm
- `server/` - Node.js + Socket.io + TiDB backend, run as a separate process — see `server/README.md`

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Backend (server/)

The frontend talks to a separate Node.js + Socket.io backend for real multiplayer
(live lobby, server-authoritative scoring/timing, TiDB-backed leaderboard and
scenario bank). It's a standalone npm project under `server/` with its own
`package.json` — it does not run inside Figma Make's dev server and must be
started separately (`cd server && npm run dev`). See `server/README.md` for
setup (TiDB Cloud credentials, schema, seeding). The client connects to it via
`VITE_SERVER_URL` (see root `.env.example`), not through `vite.config.ts`.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
