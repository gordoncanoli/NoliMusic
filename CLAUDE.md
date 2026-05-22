# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

There is no build step, no package manager, no test runner. The app is three static files served from the repo root:

- `index.html` — shell that loads `app.js`
- `app.js` — entire application (~1400 lines, vanilla JS, no framework)
- `manifest.json` — PWA manifest

To run locally, serve the directory over HTTP (Spotify OAuth + Web Audio APIs require an origin):

```
python3 -m http.server 8000
# then open http://localhost:8000
```

For Spotify login to work, `CLIENT_ID` in `app.js:15` must be set to a real Spotify app client ID whose redirect URI matches `window.location.origin + '/'`. Without it, the login screen shows a config warning and OAuth is disabled — but the rest of the playback path still works if MP3 URLs are populated.

## Architecture

**Single-file SPA with no framework.** All rendering is hand-rolled DOM via the `el(tag, attrs, ...children)` helper at `app.js:502`. Screens (`renderLogin`, `renderLibrary`, `renderNowPlaying`) wipe `#root` and re-mount; styles are injected once via `injectStyles()` into a `<style id="noli-styles">` tag. There is one global `state` object at `app.js:169` — mutate it, then call the matching `render*` function (or a targeted `update*` helper to avoid losing scroll position / input focus).

**Two data sources, joined by fuzzy match.**
1. `SONG_MANIFEST` (`app.js:22`) — a hardcoded list of ~10 songs with `key`, `mode`, `noliSemitones` (shift to land in G), `noliKey`, and a `mp3Url` slot intended to hold a Google Drive direct-download link.
2. The user's Spotify library, fetched via PKCE OAuth (`startLogin`, `exchangeCodeForToken`, `spFetch`).

`matchSong()` (`app.js:472`) joins a Spotify track to a manifest entry using `normalize()` (lowercases, strips parentheticals, "feat.", remix suffixes, punctuation) plus `titleAlt` / `artistAlt` arrays. A song is "playable" only when it both matches the manifest **and** has a non-null `mp3Url` (`songHasMp3`). The 🎸 badge means playable; ✓ means matched but no MP3 yet.

**Audio engine = Web Audio API + `BufferSource.detune`.** `loadAndPlay()` (`app.js:209`) fetches the MP3, decodes to an `AudioBuffer`, and plays via a `BufferSource` whose `detune.value = semitones * 100` shifts pitch. Important: `detune` on a buffer source changes pitch **and** tempo together — the comment at `app.js:241` claiming otherwise is wrong. If true pitch-shift-without-tempo is ever required, the engine needs replacing (phase vocoder, SoundTouch.js, etc.). Seeking re-creates the source node from `pauseOffset`; progress is polled on a 200ms interval.

**Three pitch modes** (`state.mode`), all driven through `applyPitch()`:
- `noli` — auto-shift by `song.noliSemitones` so the song lands in G (or whatever `noliKey` says); user can nudge ±6 semitones via `state.pitchOffset`.
- `original` — no shift.
- `manual` — user picks a target key from `MANUAL_KEYS`; `calcSemitonesForKey()` computes the shortest semitone delta (normalized to ±6).

`getKeyAtOffset()` (`app.js:1332`) maps the current shift back to a key label so the chord-badge UI (`renderChordBadges` + the `KEYS` table at `app.js:147`) can suggest beginner-friendly chord voicings.

## Conventions worth knowing

- **Don't full-`render*` inside event handlers when the user is mid-interaction.** Mode switches, nudge buttons, search input, and the playable toggle all use targeted helpers (`updateKeyRegion`, `updatePlayBtn`, `updateSeekBar`, or direct DOM mutation) specifically to avoid scroll-jump and focus loss. The header comment at `app.js:1-12` lists these as deliberate fixes — preserve the pattern when adding new controls.
- **Adding a song** = append to `SONG_MANIFEST` with `id`, `title`, `artist`, `key`, `mode`, `noliSemitones`, `noliKey`, and ideally `titleAlt` / `artistAlt` aliases to help fuzzy matching against Spotify track names.
- **MP3 URLs** are expected to be Google Drive direct-download links (`https://drive.google.com/uc?export=download&id=FILE_ID`); CORS on that endpoint is fragile — failures surface via the `showToast('Could not load audio…')` path in `loadAndPlay`.
- **Tokens** live in `sessionStorage` (`sp_token`, `sp_refresh`, `pkce_verifier`); a 401 from `spFetch` clears the token and bounces to `renderLogin`. There is no refresh-token flow implemented.
