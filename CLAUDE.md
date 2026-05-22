# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Instructions

Always push changes to `main` after every change is made.

## Running Locally

No build step required — this is a zero-dependency vanilla JS PWA.

```bash
npx serve -l 8000 .
# Open http://localhost:8000
```

Deployment is via Netlify (`netlify.toml`).

## Architecture

**Single-file app**: All logic lives in `app.js` (~1585 lines). `index.html` loads it and calls `renderApp()` at startup. No framework, no bundler, no npm.

### State

A single mutable `state` object drives the entire UI. Screens: `login`, `library`, `search`, `nowplaying`. Key fields: `token`, `songs`, `playlists`, `artists`, `currentTrack`, `currentManifest`, `pitchOffset`, `nowPlayingMode`, `manualSemitone`.

### UI

Uses a custom `el()` hyperscript helper (like `React.createElement` but plain DOM). All screen renderers call `el()` and replace `document.body` content — there is no virtual DOM or diffing.

### Audio

Web Audio API with pitch shifting via `playbackRate` (affects tempo slightly). `loadAudio()` fetches and decodes an MP3; `playAudio()` creates a source node and starts it. `pitchSemitonesToRate()` converts semitone offsets to rate values.

### Song Manifest

`SONG_MANIFEST` (top of `app.js`) is a hardcoded list of 10 playable songs with metadata: artist, title, original key, semitone shift to G major, and local MP3 path (`/audio/`). Spotify integration is for *browsing* the user's library only — `findManifestMatch()` checks if a Spotify track matches a manifest entry to enable playback.

### Auth

Spotify OAuth 2.0 PKCE flow — no backend. Tokens stored in `localStorage`. `getToken()` auto-refreshes if expired. `spotifyFetch()` wraps all Spotify API calls with token refresh handling.

### Key/Chord Data

`KEY_DATA` maps each key to its set of guitar-friendly chords and a difficulty rating. `semitoneToKey()` computes the transposed key from an offset. The Now Playing screen renders a chord chart that updates live as the user adjusts pitch.
