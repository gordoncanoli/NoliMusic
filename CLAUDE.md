# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Purpose

NoliMusic is a web app for beginner guitarists and musicians who want to build intuition for chord progressions through ear training.

**The problem it solves:** Learning which chords belong together — and recognizing that the same chord progression appears across many songs in different keys — is hard to grasp abstractly. NoliMusic makes this intuitive by shifting popular songs (pulled from the user's Spotify library) into G major/minor, the easiest key for guitar and piano (open chords, minimal finger movement). As users play along to songs they already know and love, they begin to internalize chord relationships organically over time, without formal theory instruction.

**Why G major:** It's the most beginner-friendly guitar key. The primary open chords (G, C, D, Em) are simple to finger and widely used, making it the natural home base for new players.

**Noli** is the app's brand name.

---

## Audio Architecture & Scale Strategy

### Current State (POC)
The current implementation uses 10 local MP3 files bundled in the repo. This is a proof of concept only and is not the intended long-term architecture.

### Target Scale
The goal is a catalog of ~7,000 songs. Expanding the current local-file model to that scale is not viable — it would require manual downloads and significant storage costs.

### Audio Source Decision: Original Covers
The audio for the catalog will be **original cover recordings** made by the app's creator (a professional musician), not masters from streaming services.

**Why not Spotify/Apple Music streams:** This was thoroughly investigated. No streaming service (Spotify, Apple Music) exposes raw audio data for real-time pitch shifting — DRM is enforced at the browser and OS level. Apps like Moises.ai and Stemz that offer pitch shifting also require users to import their own local files. There is no legal public API that allows pitch shifting of streamed catalog audio. This is a hard industry-wide constraint, not a solvable engineering problem.

**Why original covers work well:**
- Covers recorded directly in G major eliminate the need for pitch shifting entirely in Noli mode
- Stripped-back, guitar-forward arrangements are purpose-built for the learning use case
- The creator's musicianship is a product differentiator, not a compromise
- Sound recordings are owned by the creator; only mechanical licenses are needed for the underlying compositions

### Licensing Model for Covers
To legally distribute cover recordings:
- **Mechanical license** per song — required to record and distribute a cover of a copyrighted composition. Compulsory under US law (publishers cannot refuse). Statutory rate ~$0.091/stream. Handled via services like Songfile (Harry Fox Agency) or Easy Song Licensing.
- **Public performance license** — required to stream music to app users. Annual blanket licenses from ASCAP, BMI, and/or SESAC. Typically a few hundred dollars/year for a small app.

AI-assisted production is acceptable as a tool; AI that mimics a specific original artist's voice or style is not.

### Key Detection at Scale
The current `semitonsToG` field in `SONG_MANIFEST` is manually hardcoded. At scale, this should be replaced with automatic key detection using **Spotify's Audio Features API** (`GET /audio-features/{id}`), which returns the key and mode of any track in Spotify's catalog. This eliminates manual key entry entirely and scales to any matched song.

### Future Architecture (Planned)
- Audio files hosted on a CDN (e.g. Cloudflare R2 — ~$0–3/month for 7k songs at ~4MB each)
- Server-side pitch shifting for manual/fine-tune modes (lightweight backend, ~$20–50/month)
- Spotify integration remains for library matching and key auto-detection
- Apple Music integration is a future goal
- Demo mode (unauthenticated) using a small set of royalty-free or owned songs

### Platform
The current PWA architecture is the starting point. A native iOS app is a long-term consideration, particularly for Apple Music integration.

---

## Development Instructions

Always push changes to `main` after every change is made.

## Running Locally

No build step required — this is a zero-dependency vanilla JS PWA.

```bash
npx serve -l 8000 .
# Open http://localhost:8000
```

Deployment is via Netlify (`netlify.toml`). The live URL is `https://nolimusic.netlify.app`.

---

## Repository Structure

```
NoliMusic/
├── app.js          # Entire application (~1638 lines) — only JS file
├── index.html      # Shell: loads app.js, sets meta tags, minimal CSS reset
├── manifest.json   # PWA manifest (icons, display: standalone, dark theme)
├── netlify.toml    # Deployment config + CSP headers
├── README.md       # Setup instructions
├── CLAUDE.md       # This file
├── audio/          # 10 local MP3 files (same-origin, no CORS needed)
│   ├── cooler-than-me.mp3
│   ├── dreams.mp3
│   ├── fast-car.mp3
│   ├── hey-there-delilah.mp3
│   ├── human.mp3
│   ├── landslide.mp3
│   ├── marvins-room.mp3
│   ├── silver-springs.mp3
│   ├── stay.mp3
│   └── youves-got-a-friend.mp3
└── .claude/
    └── launch.json
```

**There is no build step, no bundler, no npm, no node_modules.** `app.js` is loaded as a plain `<script>` tag and calls `renderApp()` on startup.

---

## Architecture

### Single-File Application

All application logic lives in `app.js`. Key sections (in order):

| Section | Lines | Purpose |
|---------|-------|---------|
| Configuration | 5–8 | `SPOTIFY_CLIENT_ID`, `REDIRECT_URI`, `SCOPES` |
| Song Manifest | 10–85 | Hardcoded list of 10 playable songs |
| Key/Chord Data | 87–107 | `KEY_DATA`, `CHROMATIC_MAJOR/MINOR` arrays |
| Key utilities | 109–123 | `semitoneToKey()` |
| Auth | 125–234 | PKCE OAuth flow, token management |
| Manifest utilities | 236–275 | `enrichManifestArtwork()`, `findManifestMatch()` |
| Audio engine | 275–391 | Web Audio API — load, play, seek, pause, volume |
| Helpers | 389–425 | `formatTime()` |
| `el()` hyperscript | 426–440 | DOM element factory |
| Login screen | 459–557 | `renderLogin()` |
| Bottom nav | 560–614 | `renderBottomNav()` |
| Mini player | 617–694 | `renderMiniPlayer()` |
| Library screen | 697–1076 | `renderLibrary()`, songs/playlists/artists |
| Search screen | 1078–1177 | `renderSearch()` |
| `playSong()` | 1180–1289 | Load audio + navigate to Now Playing |
| Now Playing | 1291–1610 | `renderNowPlaying()`, controls, pitch shifting |
| `renderApp()` | 1613–1638 | Entry point, OAuth callback handling |

---

### State Management

A single mutable `state` object (initialized around line 396) drives the entire UI. **Never mutate state during a render call.**

```javascript
{
  // Navigation
  screen: 'login' | 'library' | 'search' | 'nowplaying',
  tab: 'songs' | 'playlists' | 'artists',

  // Auth
  token: string | null,
  profile: Object | null,           // Spotify user profile

  // Library data (fetched from Spotify)
  songs: Track[],                   // raw Spotify track objects
  songItems: SongItem[],            // Spotify library items with added_at
  playlists: Playlist[],
  artists: Artist[],

  // Pagination & sorting
  songsOffset: number,
  songsTotal: number,
  sortOrder: 'recent' | 'song' | 'artist',

  // Search
  searchQuery: string,
  searchResults: { songs, playlists, artists },

  // Playback
  currentTrack: Track | null,       // Spotify track object
  currentManifest: ManifestEntry | null,
  nowPlayingMode: 'noli' | 'original' | 'manual',
  pitchOffset: number,              // user fine-tune in noli mode (-6 to +6)
  manualSemitone: number,           // (-6 to +6) for manual mode slider
  manualTargetKey: string | null,   // e.g. "G major" when set via key picker

  // UI flags
  audioLoading: boolean,
  loading: boolean,
  volume: number,                   // 0.0 to 1.0
  showPlayableOnly: boolean,
  playlistTracks: Track[] | null,
  currentPlaylistId: string | null,
}
```

Updating state and re-rendering: mutate the field directly on `state`, then call the appropriate `render*()` function which replaces the root element's content entirely.

---

### UI Rendering (`el()` Hyperscript)

```javascript
el(tag, attrs = {}, ...children)  // line 426
```

Works like `React.createElement` but produces real DOM nodes directly. **No virtual DOM, no diffing** — each screen function replaces `document.body` (or a root container) content wholesale.

Key conventions:
- `attrs.style` accepts an object (converted to inline styles)
- Event handlers: `onClick`, `onInput`, `onChange`, etc. (camelCase, mapped to lowercase)
- `class` / `className` — both work
- Children can be strings, DOM nodes, or arrays

Screen renderers and their entry points:

| Function | Screen | Notes |
|----------|--------|-------|
| `renderLogin()` | `/` login | Green-branded entry, Spotify button |
| `renderLibrary()` | Library | Async; fetches Spotify data on first load |
| `renderSearch()` | Search | Async; real-time search with 250ms debounce |
| `renderNowPlaying()` | Now Playing | Pitch controls, chord grid, progress bar |
| `renderBottomNav()` | All | Fixed 72px, 3 tabs, safe-area inset support |
| `renderMiniPlayer()` | Library/Search | Floating bar above nav when track loaded |

---

### Audio Engine

All audio state is held in module-scope variables (not in `state`):

```javascript
audioCtx      // AudioContext (lazy init)
sourceNode    // AudioBufferSourceNode
audioBuffer   // decoded AudioBuffer
gainNode      // GainNode for volume
startTime     // audioCtx.currentTime when playback began
pauseOffset   // seconds into buffer when paused
isPlaying     // boolean
currentPitch  // active semitone offset
animFrame     // requestAnimationFrame ID for progress tracking
```

Key audio functions:

| Function | Purpose |
|----------|---------|
| `loadAudio(url)` | Fetch MP3, decode, store in `audioBuffer` |
| `playAudio(semitones, offset)` | Create source node, apply pitch, start |
| `pauseAudio()` | Stop source, save `pauseOffset` |
| `resumeAudio(semitones)` | Resume from `pauseOffset` |
| `seekAudio(semitones, pct)` | Seek to % of duration |
| `stopAudio()` | Full stop, clear state |
| `getCurrentTime()` | Current playback position in seconds |
| `getDuration()` | Total duration from `audioBuffer` |
| `trackProgress()` | RAF loop calling `onTimeUpdate` callback |

**Pitch shifting**: Uses Web Audio's `detune` property (cents). 100 cents = 1 semitone. Formula: `detune = semitones * 100`. This slightly affects tempo as a side effect — for production, Tone.js would eliminate this.

**Volume**: Controlled by a `GainNode` — `gainNode.gain.value = state.volume` (0.0–1.0).

---

### Song Manifest

`SONG_MANIFEST` (lines 13–85) is the authoritative list of songs with local MP3s:

| Title | Artist | Original Key | `semitonsToG` | File |
|-------|--------|-------------|--------------|------|
| Cooler Than Me | Mike Posner | F major | +2 | `cooler-than-me.mp3` |
| Human | The Killers | A major | -2 | `human.mp3` |
| Marvin's Room | Drake | F minor | +2 | `marvins-room.mp3` |
| Fast Car | Tracy Chapman | A major | -2 | `fast-car.mp3` |
| Hey There Delilah | Plain White T's | D major | -7 | `hey-there-delilah.mp3` |
| Landslide | Fleetwood Mac | C major | +7 | `landslide.mp3` |
| Dreams | Fleetwood Mac | F major | +2 | `dreams.mp3` |
| You've Got a Friend | James Taylor | A major | -2 | `youve-got-a-friend.mp3` |
| Stay | The Kid LAROI (feat. Justin Bieber) | C# major | -5 | `stay.mp3` |
| Silver Springs | Fleetwood Mac | E minor | +1 | `silver-springs.mp3` |

**Manifest entry schema:**
```javascript
{
  artist: string,
  title: string,
  artistAlt?: string,    // alternate artist for matching (e.g. "Justin Bieber")
  originalKey: string,   // e.g. "F major", "E minor"
  semitonsToG: number,   // semitones to shift to reach G major/minor
  mp3Url: string,        // relative path, e.g. "audio/cooler-than-me.mp3"
}
```

**To add a new song:**
1. Add the MP3 to `/audio/`
2. Add an entry to `SONG_MANIFEST` with accurate `semitonsToG` value
3. No other changes needed — the app will auto-detect it via `findManifestMatch()`

**MP3 URLs**: Can also be Google Drive direct-download links (`https://drive.google.com/uc?export=download&id=FILE_ID`). The CSP in `netlify.toml` may need updating for external domains.

---

### Manifest Matching

Spotify's library shows all saved tracks; only `SONG_MANIFEST` entries have playable audio.

`findManifestMatch(track)` (line 261):
- Calls `cleanTitle()` to normalize both sides (lowercase, strip remix/live/explicit/feature annotations)
- Checks partial string match on title AND artist (supports `artistAlt`)
- Returns the manifest entry or `null`

`enrichManifestArtwork(container)` (line 236):
- For manifest songs not in the Spotify library, fetches album art via Spotify search
- Looks for DOM elements with `data-search-stub` attribute
- Replaces placeholder divs with actual `<img>` tags

---

### Playback Modes (Now Playing)

Three mutually exclusive modes controlled by `state.nowPlayingMode`:

| Mode | Shift Applied | Description |
|------|--------------|-------------|
| `noli` | `manifest.semitonsToG + state.pitchOffset` | Auto-shifts to G; user can fine-tune ±6 semitones |
| `original` | `0` | Plays in the song's original key, no shift |
| `manual` | `state.manualSemitone` OR computed from `state.manualTargetKey` | User picks exact key or semitone offset |

`getActiveShift()` (line 1208) — returns the integer semitone shift to apply.
`getDisplayKey()` (line 1219) — returns the human-readable current key string.
`applyCurrentShift()` (line 1269) — computes shift and calls `resumeAudio()` / `seekAudio()` to apply.

---

### Key/Chord Data

`KEY_DATA` (lines 88–104) maps key strings to chord suggestions and warnings:

```javascript
KEY_DATA['G major'] = { chords: ['G', 'C', 'D', 'Em'], warning: null }
KEY_DATA['C# major'] = { chords: [], warning: 'Advanced key — consider shifting down' }
```

Beginner-friendly keys (have chords): C, D, E, G, A major; A, E, D minor.
Advanced keys (empty chord array + warning): C#, D#, F, F#, G#, A#, B major.

`semitoneToKey(originalKey, semitones)` (line 109):
- Looks up `originalKey` in `CHROMATIC_MAJOR` or `CHROMATIC_MINOR`
- Applies modular arithmetic to find the transposed key
- Returns the key string (e.g. `"G major"`)

---

### Spotify Authentication (PKCE)

Full OAuth 2.0 PKCE flow — **no backend required**.

```
User clicks Login
  → generateCodeVerifier()        # 128-char random string stored in localStorage
  → generateCodeChallenge()       # SHA-256 → base64url
  → redirect to accounts.spotify.com/authorize
  → Spotify redirects back with ?code=...
  → exchangeCodeForToken()        # POST to accounts.spotify.com/api/token
  → stores access_token, refresh_token, token_expiry in localStorage
  → renderApp() resumes normal flow
```

Key functions:

| Function | Line | Purpose |
|----------|------|---------|
| `generateCodeVerifier()` | 125 | Create PKCE verifier string |
| `generateCodeChallenge()` | 134 | Hash verifier for auth request |
| `loginWithSpotify()` | 141 | Build auth URL + redirect |
| `exchangeCodeForToken()` | 156 | Trade code for tokens |
| `refreshAccessToken()` | 180 | Refresh expired token (60s buffer) |
| `getToken()` | 202 | Smart getter — auto-refreshes if needed |
| `spotifyFetch(url, opts)` | 210 | Fetch wrapper — retries once on 401 |

**localStorage keys**: `access_token`, `refresh_token`, `token_expiry`, `code_verifier`

**Scopes**: `user-library-read playlist-read-private user-follow-read user-read-private user-read-email`

**Client ID**: Hardcoded at line 6 (`79aec5760952452f877b9d1fcb3ff9a6`). Redirect URI: `https://nolimusic.netlify.app`.

---

### Library Screen

`renderLibrary()` (line 697) — async, fetches data on first load.

Three tabs:

**Songs tab** (`renderSongsList`, ~line 833):
- Sort: Recently Added | Song A-Z | Artist A-Z
- "Playable only" toggle (`state.showPlayableOnly`) — filters to manifest songs
- Unavailable songs shown at 45% opacity with no play button
- Green "G♮" badge on playable songs
- Album art fetched from Spotify; manifest-only songs use `enrichManifestArtwork()`

**Playlists tab** (~line 949):
- 2-column grid, album art + name + track count
- Tapping opens playlist detail via `openPlaylist()`

**Artists tab** (~line 982):
- 3-column grid, circular artist images
- Tap currently does nothing (stub)

**Playlist detail** (`openPlaylist()`, ~line 1012):
- Back button + header (image, name, track count)
- Loads tracks via `GET /playlists/{id}/tracks`
- Track list with manifest matching

---

### Search Screen

`renderSearch()` (line 1078):
- Text input with 250ms debounce on `input` events
- Calls `GET /search?q=...&type=track,playlist&limit=10`
- Shows Song results and Playlist results sections
- Track rows have same G♮ badge + tap-to-play behavior as library

---

### Now Playing Screen

`renderNowPlaying()` (line 1305) — the most complex screen.

Layout (top to bottom):
1. Blurred album art background + dark gradient overlay
2. Header bar: back button + "NOW PLAYING" label
3. Album art (max 180px, centered, drop shadow)
4. Track title + artist name
5. Mode toggle pill: Noli | Original | Manual
6. Key display: large green key letter + modulation info
7. Warning text (if key has no chord data)
8. Chord grid: up to 4 chord buttons for the current key
9. Key picker: scrollable list of all 15 keys (visible in Noli/Manual modes)
10. Progress bar: draggable with current/total time display
11. Playback controls: ⏮ (stub) | ▶/⏸ | ⏭ (stub)
12. Volume control: speaker icon + draggable slider

Touch/drag support:
- Progress bar: mouse and touch events, `_seekDrag` flag prevents conflicting updates
- Volume slider: same drag pattern
- Cleanup registered via `window._seekCleanup()` to prevent listener leaks

---

### PWA Configuration

**`manifest.json`**: App name "NoliMusic", `display: standalone`, background `#0a0a0a`, portrait orientation, two icon sizes (192×192, 512×512).

**`index.html`**:
- `viewport-fit=cover` for edge-to-edge on notched phones
- `apple-mobile-web-app-capable` + status bar style for iOS home screen installs
- Loads Google Fonts: DM Sans (weights 300–700) + DM Mono (time display)
- Minimal CSS reset (margins, overflow, tap highlight)
- Global error display: red box with stack trace

**No service worker** — no offline support currently.

---

### Deployment

**`netlify.toml`** configures these HTTP headers for all routes:

- **CSP**: Allows `accounts.spotify.com`, `api.spotify.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, Spotify image CDNs (`i.scdn.co`, `mosaic.scdn.co`, `image-cdn-*.spotifycdn.com`, `lineup-images.scdn.co`)
- **X-Frame-Options**: `SAMEORIGIN`
- **Access-Control-Allow-Origin**: `*`

**If adding external audio URLs** (e.g. Google Drive or S3), update the `Content-Security-Policy` `media-src` directive in `netlify.toml`.

---

### Coding Conventions

- **No imports/exports** — everything is a global function or variable in one file
- **No classes** — plain functions and objects throughout
- **No comments on "what"** — only add comments to explain non-obvious "why" (workarounds, constraints)
- **el() over innerHTML** — build DOM with the `el()` helper, not string concatenation
- **State before render** — always mutate `state` before calling a render function
- **Full re-renders are fine** — the app doesn't optimize for partial updates; replacing the DOM is acceptable
- **Async render functions** — `renderLibrary()` and `renderSearch()` are async; `playSong()` is also async
- **Event listener cleanup** — register cleanup for window-level listeners (e.g., drag handlers) to avoid leaks across renders
- **Touch + mouse parity** — interactive controls (sliders, seek bar) must support both touch and mouse events

---

### Common Tasks

**Add a new song:**
1. Place MP3 in `/audio/filename.mp3`
2. Add entry to `SONG_MANIFEST` at top of `app.js` with correct `semitonsToG`
3. Push to `main`

**Change the app's color scheme:**
- Primary green: `#1DB954` (Spotify green, used as accent)
- Background: `#0a0a0a`
- Surface: `#1a1a1a`, `#242424`
- These are inline in `el()` style objects — use find-replace across `app.js`

**Add a new screen:**
1. Add a new value to `screen` in `state`
2. Write a `renderScreenName()` function following the existing pattern
3. Add a navigation trigger and update `renderBottomNav()` if it needs a tab

**Debug audio issues:**
- Check browser console for `AudioContext` errors (often suspended on mobile until user gesture)
- `getAudioContext()` is called lazily — first call creates the context
- `audioBuffer` being null means `loadAudio()` hasn't completed

**Debug auth issues:**
- Check `localStorage` for `access_token`, `token_expiry`
- `getToken()` logs refresh attempts; watch the console
- Clearing `localStorage` forces re-login
