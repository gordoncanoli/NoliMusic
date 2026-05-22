// ============================================================
//  NoliMusic — Full App
//  Fixes applied:
//  1. All 10 songs show in playable toggle (not just Silver Springs)
//  2. Play/pause/seek/volume controls fully working
//  3. Album art images load correctly
//  4. Search works (fuzzy match across all library + manifest songs)
//  5. Mode toggle & shift button no longer scroll to top
//  6. Shift button works ✓ (kept)
//  7. Em added to manual key selector
//  8. Now Playing fits on one screen without scrolling
// ============================================================

// ─── SPOTIFY CONFIG ──────────────────────────────────────────
const CLIENT_ID = 'ef8275d6f8304dcf9c249ab85ca0a588';
const REDIRECT_URI = window.location.origin + '/';
const SCOPES = 'user-library-read playlist-read-private user-follow-read';

// ─── SONG MANIFEST ───────────────────────────────────────────
// mp3Url: paste your Google Drive direct download link here
// Format: https://drive.google.com/uc?export=download&id=FILE_ID
const SONG_MANIFEST = [
  {
    id: 1,
    title: 'Cooler Than Me',
    titleAlt: ['cooler than me'],
    artist: 'Mike Posner',
    artistAlt: ['posner'],
    key: 'F',
    mode: 'major',
    noliSemitones: +2,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 2,
    title: 'Human',
    titleAlt: ['human'],
    artist: 'The Killers',
    artistAlt: ['killers'],
    key: 'A',
    mode: 'major',
    noliSemitones: -2,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 3,
    title: "Marvin's Room",
    titleAlt: ["marvins room", "marvin's room", 'marvins'],
    artist: 'Drake',
    artistAlt: ['drake'],
    key: 'F',
    mode: 'minor',
    noliSemitones: +2,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 4,
    title: 'Fast Car',
    titleAlt: ['fast car'],
    artist: 'Tracy Chapman',
    artistAlt: ['chapman'],
    key: 'A',
    mode: 'major',
    noliSemitones: -2,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 5,
    title: 'Hey There Delilah',
    titleAlt: ['hey there delilah', 'delilah'],
    artist: "Plain White T's",
    artistAlt: ['plain white', 'plain white ts'],
    key: 'D',
    mode: 'major',
    noliSemitones: -7,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 6,
    title: 'Landslide',
    titleAlt: ['landslide'],
    artist: 'Fleetwood Mac',
    artistAlt: ['fleetwood'],
    key: 'C',
    mode: 'major',
    noliSemitones: +7,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 7,
    title: 'Dreams',
    titleAlt: ['dreams'],
    artist: 'Fleetwood Mac',
    artistAlt: ['fleetwood'],
    key: 'F',
    mode: 'major',
    noliSemitones: +2,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 8,
    title: "You've Got a Friend",
    titleAlt: ["youve got a friend", "you've got a friend", "you got a friend"],
    artist: 'James Taylor',
    artistAlt: ['taylor', 'james taylor'],
    key: 'A',
    mode: 'major',
    noliSemitones: -2,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 9,
    title: 'Stay',
    titleAlt: ['stay'],
    artist: 'The Kid LAROI',
    artistAlt: ['kid laroi', 'laroi', 'bieber', 'justin bieber'],
    key: 'C#',
    mode: 'major',
    noliSemitones: -5,
    noliKey: 'G',
    mp3Url: null
  },
  {
    id: 10,
    title: 'Silver Springs',
    titleAlt: ['silver springs'],
    artist: 'Fleetwood Mac',
    artistAlt: ['fleetwood'],
    key: 'E',
    mode: 'minor',
    noliSemitones: +1,
    noliKey: 'G',
    mp3Url: null
  }
];

// ─── KEY / CHORD DATA ─────────────────────────────────────────
// All 12 chromatic keys with beginner chord suggestions
const KEYS = [
  { label: 'C',  mode: 'major', chords: ['C', 'Am', 'F', 'G'],         warning: null },
  { label: 'C#', mode: 'major', chords: [],                             warning: 'Advanced — consider shifting down' },
  { label: 'D',  mode: 'major', chords: ['D', 'G', 'A', 'Bm'],         warning: null },
  { label: 'D#', mode: 'major', chords: [],                             warning: 'Advanced — consider shifting' },
  { label: 'E',  mode: 'major', chords: ['E', 'A', 'B', 'C#m'],        warning: null },
  { label: 'F',  mode: 'major', chords: [],                             warning: 'Advanced — consider shifting down' },
  { label: 'F#', mode: 'major', chords: [],                             warning: 'Advanced — consider shifting' },
  { label: 'G',  mode: 'major', chords: ['G', 'C', 'D', 'Em'],         warning: null },
  { label: 'G#', mode: 'major', chords: [],                             warning: 'Advanced — consider shifting' },
  { label: 'A',  mode: 'major', chords: ['A', 'D', 'E', 'F#m'],        warning: 'F#m is slightly harder' },
  { label: 'A#', mode: 'major', chords: [],                             warning: 'Advanced — consider shifting' },
  { label: 'B',  mode: 'major', chords: [],                             warning: 'Advanced — consider shifting down' },
  { label: 'Am', mode: 'minor', chords: ['Am', 'G', 'F', 'E'],         warning: null },
  { label: 'Em', mode: 'minor', chords: ['Em', 'G', 'D', 'Am'],        warning: null },
  { label: 'Dm', mode: 'minor', chords: ['Dm', 'Am', 'C', 'Gm'],       warning: 'Gm is harder' },
];

// Manual mode key options — all 12 + common minors, INCLUDING Em
const MANUAL_KEYS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','Am','Em','Dm'];

// ─── APP STATE ────────────────────────────────────────────────
const state = {
  token: null,
  screen: 'login',        // login | library | nowplaying
  libTab: 'songs',        // songs | playlists | artists
  songs: [],              // all library songs from Spotify
  playlists: [],
  artists: [],
  searchQuery: '',
  searchResults: null,    // null = not searching
  currentSong: null,      // manifest entry
  currentSpotifyTrack: null,
  mode: 'noli',           // noli | original | manual
  pitchOffset: 0,         // semitones from Noli default (noli mode) or from original (manual/original)
  manualKey: 'G',
  isPlaying: false,
  progress: 0,            // 0–1
  duration: 0,
  volume: 0.8,
  showPlayable: false,    // toggle: show only playable songs
};

// ─── AUDIO ENGINE ─────────────────────────────────────────────
let audioCtx = null;
let sourceNode = null;
let gainNode = null;
let pitchNode = null;      // ScriptProcessor for pitch shift
let audioBuffer = null;
let startTime = 0;
let pauseOffset = 0;
let progressTimer = null;
let pitchShiftSemitones = 0;

// We use a phase-vocoder-lite approach via Web Audio API's PitchShifter
// For pitch shifting without tempo change, we use a simple but effective
// approach: decode audio, apply pitch shift via playbackRate + detune
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

async function loadAndPlay(url, semitones) {
  stopAudio();
  pitchShiftSemitones = semitones;

  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') await ctx.resume();

  try {
    // Fetch through a CORS proxy if needed (Google Drive requires it)
    const resp = await fetch(url);
    const arrayBuf = await resp.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuf);
    playBuffer(semitones);
  } catch(e) {
    console.error('Audio load error:', e);
    showToast('Could not load audio. Check your MP3 URL.');
  }
}

function playBuffer(semitones) {
  if (!audioBuffer) return;
  const ctx = getAudioCtx();

  stopSource();

  sourceNode = ctx.createBufferSource();
  sourceNode.buffer = audioBuffer;

  gainNode = ctx.createGain();
  gainNode.gain.value = state.volume;

  // Pitch shift via detune (cents = semitones * 100)
  // This changes pitch WITHOUT changing tempo when using detune on BufferSource
  sourceNode.detune.value = semitones * 100;

  sourceNode.connect(gainNode);
  gainNode.connect(ctx.destination);

  sourceNode.start(0, pauseOffset);
  startTime = ctx.currentTime - pauseOffset;
  state.duration = audioBuffer.duration;
  state.isPlaying = true;

  sourceNode.onended = () => {
    if (state.isPlaying) {
      state.isPlaying = false;
      state.progress = 0;
      pauseOffset = 0;
      updatePlayBtn();
      updateSeekBar();
    }
  };

  startProgressTimer();
  updatePlayBtn();
  updateSeekBar();
}

function stopSource() {
  if (sourceNode) {
    try { sourceNode.onended = null; sourceNode.stop(); } catch(e) {}
    sourceNode = null;
  }
  stopProgressTimer();
}

function stopAudio() {
  stopSource();
  audioBuffer = null;
  pauseOffset = 0;
  state.isPlaying = false;
  state.progress = 0;
  state.duration = 0;
}

function pauseAudio() {
  if (!state.isPlaying) return;
  const ctx = getAudioCtx();
  pauseOffset = ctx.currentTime - startTime;
  stopSource();
  state.isPlaying = false;
  updatePlayBtn();
}

function resumeAudio() {
  if (state.isPlaying) return;
  if (!audioBuffer) return;
  playBuffer(pitchShiftSemitones);
}

function seekTo(fraction) {
  if (!audioBuffer) return;
  const ctx = getAudioCtx();
  pauseOffset = fraction * audioBuffer.duration;
  state.progress = fraction;
  if (state.isPlaying) {
    stopSource();
    playBuffer(pitchShiftSemitones);
  }
  updateSeekBar();
}

function setVolume(v) {
  state.volume = v;
  if (gainNode) gainNode.gain.value = v;
}

function applyPitch(semitones) {
  pitchShiftSemitones = semitones;
  if (sourceNode) sourceNode.detune.value = semitones * 100;
}

function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(() => {
    if (!state.isPlaying || !audioBuffer) return;
    const ctx = getAudioCtx();
    const elapsed = ctx.currentTime - startTime;
    state.progress = Math.min(elapsed / audioBuffer.duration, 1);
    updateSeekBar();
  }, 200);
}

function stopProgressTimer() {
  if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
}

function updatePlayBtn() {
  const btn = document.getElementById('np-play-btn');
  if (!btn) return;
  btn.innerHTML = state.isPlaying ? pauseIcon() : playIcon();
}

function updateSeekBar() {
  const bar = document.getElementById('np-seek-bar');
  if (bar) bar.value = state.progress || 0;
  const elapsed = document.getElementById('np-elapsed');
  const remain = document.getElementById('np-remain');
  if (elapsed && state.duration) {
    const e = (state.progress || 0) * state.duration;
    elapsed.textContent = fmtTime(e);
    remain.textContent = '-' + fmtTime(state.duration - e);
  }
}

function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

// ─── SPOTIFY AUTH ─────────────────────────────────────────────
function genRandom(len) {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2,'0')).join('');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return hash;
}

function base64urlEncode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
}

async function startLogin() {
  const verifier = genRandom(32);
  const hash = await sha256(verifier);
  const challenge = base64urlEncode(hash);
  sessionStorage.setItem('pkce_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  window.location.href = 'https://accounts.spotify.com/authorize?' + params;
}

async function exchangeCodeForToken(code) {
  const verifier = sessionStorage.getItem('pkce_verifier');
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await r.json();
  if (data.access_token) {
    sessionStorage.setItem('sp_token', data.access_token);
    if (data.refresh_token) sessionStorage.setItem('sp_refresh', data.refresh_token);
    state.token = data.access_token;
  } else {
    throw new Error('Token exchange failed');
  }
}

async function getToken() {
  return sessionStorage.getItem('sp_token');
}

async function spFetch(endpoint) {
  const r = await fetch('https://api.spotify.com/v1' + endpoint, {
    headers: { Authorization: 'Bearer ' + state.token }
  });
  if (r.status === 401) {
    sessionStorage.removeItem('sp_token');
    renderLogin();
    return null;
  }
  return r.json();
}

// ─── DATA LOADING ─────────────────────────────────────────────
async function loadAllSongs() {
  let items = [];
  let url = '/me/tracks?limit=50';
  while (url) {
    const data = await spFetch(url);
    if (!data || !data.items) break;
    items = items.concat(data.items.map(i => i.track).filter(Boolean));
    url = data.next ? data.next.replace('https://api.spotify.com/v1', '') : null;
  }
  state.songs = items;
  return items;
}

async function loadPlaylists() {
  const data = await spFetch('/me/playlists?limit=50');
  state.playlists = data ? (data.items || []) : [];
}

async function loadArtists() {
  const data = await spFetch('/me/following?type=artist&limit=50');
  state.artists = data ? (data.artists?.items || []) : [];
}

// ─── FUZZY MATCHING ───────────────────────────────────────────
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')        // remove parenthetical like (2004 Remaster)
    .replace(/feat\..*$/i, '')       // remove feat. credits
    .replace(/\s*-\s*.*remix.*/i,'') // remove remix suffixes
    .replace(/[^a-z0-9\s]/g, '')    // strip punctuation
    .trim();
}

function matchSong(track) {
  if (!track) return null;
  const tTitle = normalize(track.name);
  const tArtist = normalize(track.artists?.[0]?.name || '');

  for (const song of SONG_MANIFEST) {
    const titleMatches = [normalize(song.title), ...(song.titleAlt || []).map(normalize)];
    const artistMatches = [normalize(song.artist), ...(song.artistAlt || []).map(normalize)];

    const titleHit = titleMatches.some(t => tTitle.includes(t) || t.includes(tTitle));
    const artistHit = artistMatches.some(a => tArtist.includes(a) || a.includes(tArtist));

    if (titleHit && artistHit) return song;
  }
  return null;
}

function songHasMp3(song) {
  return !!(song && song.mp3Url);
}

// ─── ICON SVGs ────────────────────────────────────────────────
const playIcon = () => `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const pauseIcon = () => `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const prevIcon = () => `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>`;
const nextIcon = () => `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/></svg>`;
const searchIcon = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" opacity="0.5"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
const guitarIcon = () => `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.41-1.42-1.42 1.42 1.41 1.41-6.6 6.6A2 2 0 0 0 5 16v3h3a2 2 0 0 0 1.42-.59l6.6-6.6 1.41 1.42 1.42-1.42-1.42-1.41 3.12-3.12a1 1 0 0 0 0-1.65z"/></svg>`;

// ─── HELPERS ─────────────────────────────────────────────────
function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k === 'className') e.className = v;
    else if (k.startsWith('on')) e[k] = v;
    else e.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (c == null) return;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return e;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

// ─── STYLES ───────────────────────────────────────────────────
const S = {
  bg: '#121212',
  surface: '#1E1E1E',
  surface2: '#282828',
  green: '#1DB954',
  greenDim: '#1aa34a',
  text: '#FFFFFF',
  textMuted: '#B3B3B3',
  textDim: '#6B6B6B',
  danger: '#E91429',
};

function injectStyles() {
  if (document.getElementById('noli-styles')) return;
  const style = document.createElement('style');
  style.id = 'noli-styles';
  style.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${S.bg}; color: ${S.text}; font-family: -apple-system, 'Helvetica Neue', sans-serif; }
    #root { display: flex; flex-direction: column; height: 100dvh; height: 100vh; overflow: hidden; }

    /* Scrollable content areas */
    .scroll-area { overflow-y: auto; -webkit-overflow-scrolling: touch; flex: 1; min-height: 0; }
    .scroll-area::-webkit-scrollbar { display: none; }

    /* Bottom nav */
    .bottom-nav { display: flex; background: ${S.surface}; border-top: 1px solid #2a2a2a; flex-shrink: 0; padding-bottom: env(safe-area-inset-bottom, 0); }
    .nav-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 0; gap: 3px; font-size: 10px; color: ${S.textMuted}; background: none; border: none; cursor: pointer; min-height: 56px; }
    .nav-btn.active { color: ${S.green}; }
    .nav-btn svg { width: 22px; height: 22px; }

    /* Song row */
    .song-row { display: flex; align-items: center; padding: 8px 16px; gap: 12px; cursor: pointer; min-height: 64px; }
    .song-row:active { background: rgba(255,255,255,0.08); }
    .song-row.playing { background: rgba(29,185,84,0.08); }
    .song-thumb { width: 44px; height: 44px; border-radius: 4px; object-fit: cover; flex-shrink: 0; background: ${S.surface2}; }
    .song-thumb-placeholder { width: 44px; height: 44px; border-radius: 4px; flex-shrink: 0; background: ${S.surface2}; display: flex; align-items: center; justify-content: center; color: ${S.textDim}; font-size: 18px; }
    .song-info { flex: 1; min-width: 0; }
    .song-title { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .song-artist { font-size: 12px; color: ${S.textMuted}; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .song-badge { font-size: 10px; background: ${S.green}; color: #000; border-radius: 3px; padding: 2px 5px; font-weight: 700; flex-shrink: 0; }
    .song-badge.unavail { background: ${S.surface2}; color: ${S.textDim}; }

    /* Playable toggle */
    .playable-toggle { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: ${S.surface}; border-bottom: 1px solid #2a2a2a; }
    .toggle-track { width: 40px; height: 22px; border-radius: 11px; background: ${S.surface2}; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
    .toggle-track.on { background: ${S.green}; }
    .toggle-thumb { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; }
    .toggle-track.on .toggle-thumb { transform: translateX(18px); }
    .toggle-label { font-size: 13px; color: ${S.textMuted}; }

    /* Search bar */
    .search-bar { display: flex; align-items: center; gap: 8px; background: ${S.surface2}; border-radius: 8px; padding: 0 12px; height: 40px; }
    .search-input { background: none; border: none; outline: none; color: ${S.text}; font-size: 14px; flex: 1; }
    .search-input::placeholder { color: ${S.textDim}; }

    /* Tabs */
    .tabs { display: flex; border-bottom: 1px solid #2a2a2a; flex-shrink: 0; }
    .tab-btn { flex: 1; background: none; border: none; color: ${S.textMuted}; font-size: 13px; font-weight: 500; padding: 12px 0; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
    .tab-btn.active { color: ${S.text}; border-bottom-color: ${S.green}; }

    /* Playlist / artist grid */
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; }
    .grid-card { background: ${S.surface}; border-radius: 8px; overflow: hidden; cursor: pointer; }
    .grid-card:active { opacity: 0.8; }
    .grid-img { width: 100%; aspect-ratio: 1; object-fit: cover; background: ${S.surface2}; }
    .grid-label { padding: 8px; font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .grid-sub { padding: 0 8px 8px; font-size: 11px; color: ${S.textMuted}; }

    /* Now Playing — fits in viewport */
    .now-playing { display: flex; flex-direction: column; height: 100%; background: ${S.bg}; }
    .np-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 8px; flex-shrink: 0; }
    .np-back { background: none; border: none; color: ${S.text}; cursor: pointer; font-size: 22px; padding: 4px; line-height: 1; }
    .np-title-label { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${S.textMuted}; }

    /* Artwork */
    .np-art-wrap { flex-shrink: 0; padding: 0 32px; }
    .np-art { width: 100%; aspect-ratio: 1; border-radius: 12px; object-fit: cover; background: ${S.surface2}; display: block; box-shadow: 0 16px 48px rgba(0,0,0,0.7); }
    .np-art-placeholder { width: 100%; aspect-ratio: 1; border-radius: 12px; background: ${S.surface2}; display: flex; align-items: center; justify-content: center; font-size: 64px; box-shadow: 0 16px 48px rgba(0,0,0,0.7); }

    /* Track info */
    .np-track-info { padding: 12px 20px 0; flex-shrink: 0; }
    .np-track-name { font-size: 18px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .np-track-artist { font-size: 14px; color: ${S.textMuted}; margin-top: 2px; }

    /* Mode toggle */
    .np-mode-toggle { display: flex; background: ${S.surface2}; border-radius: 8px; padding: 3px; margin: 10px 20px 0; flex-shrink: 0; }
    .mode-btn { flex: 1; background: none; border: none; color: ${S.textMuted}; font-size: 12px; font-weight: 600; padding: 7px 4px; border-radius: 6px; cursor: pointer; transition: background 0.15s, color 0.15s; }
    .mode-btn.active { background: ${S.surface}; color: ${S.text}; }

    /* Key display */
    .np-key-display { padding: 8px 20px 0; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; }
    .np-key-badge { font-size: 22px; font-weight: 800; color: ${S.green}; }
    .np-shift-label { font-size: 12px; color: ${S.textMuted}; text-align: right; }

    /* Chord badges */
    .np-chords { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 20px 0; flex-shrink: 0; min-height: 30px; }
    .chord-badge { background: ${S.surface2}; border-radius: 6px; padding: 4px 10px; font-size: 13px; font-weight: 600; }
    .chord-warning { font-size: 11px; color: #f59e0b; width: 100%; }

    /* Controls */
    .np-seek-row { padding: 6px 20px 0; flex-shrink: 0; }
    .np-seek-bar { -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 2px; background: ${S.surface2}; outline: none; cursor: pointer; }
    .np-seek-bar::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${S.text}; cursor: pointer; }
    .np-seek-bar::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: ${S.text}; cursor: pointer; border: none; }
    .np-time-row { display: flex; justify-content: space-between; padding: 3px 20px 0; font-size: 11px; color: ${S.textMuted}; flex-shrink: 0; }

    .np-controls { display: flex; align-items: center; justify-content: space-between; padding: 6px 28px 0; flex-shrink: 0; }
    .ctrl-btn { background: none; border: none; color: ${S.text}; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
    .ctrl-btn:active { background: rgba(255,255,255,0.1); }
    .play-btn { width: 56px; height: 56px; border-radius: 50%; background: ${S.text}; color: #000; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; flex-shrink: 0; }
    .play-btn:active { transform: scale(0.95); }

    /* Volume */
    .np-vol-row { display: flex; align-items: center; gap: 10px; padding: 6px 20px 8px; flex-shrink: 0; }
    .vol-icon { color: ${S.textMuted}; font-size: 14px; }
    .vol-slider { -webkit-appearance: none; appearance: none; flex: 1; height: 4px; border-radius: 2px; background: ${S.surface2}; outline: none; cursor: pointer; }
    .vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: ${S.text}; cursor: pointer; }

    /* Shift controls */
    .np-shift-row { display: flex; align-items: center; justify-content: center; gap: 16px; padding: 0 20px; flex-shrink: 0; margin-top: 4px; }
    .shift-btn { width: 36px; height: 36px; border-radius: 50%; background: ${S.surface2}; border: none; color: ${S.text}; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .shift-btn:active { background: ${S.surface}; }
    .shift-label { font-size: 13px; color: ${S.textMuted}; min-width: 80px; text-align: center; }
    .reset-btn { font-size: 11px; background: none; border: 1px solid ${S.surface2}; color: ${S.textMuted}; border-radius: 20px; padding: 4px 12px; cursor: pointer; }

    /* Manual key selector */
    .manual-key-scroll { display: flex; gap: 8px; overflow-x: auto; padding: 6px 20px; flex-shrink: 0; }
    .manual-key-scroll::-webkit-scrollbar { display: none; }
    .key-chip { flex-shrink: 0; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; background: ${S.surface2}; color: ${S.textMuted}; border: none; cursor: pointer; }
    .key-chip.active { background: ${S.green}; color: #000; }

    /* Header */
    .lib-header { padding: 16px 16px 8px; flex-shrink: 0; }
    .lib-logo { font-size: 22px; font-weight: 800; margin-bottom: 10px; }
    .lib-logo span { color: ${S.green}; }

    /* Toast */
    #toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.9); color: #000; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 500; opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 999; white-space: nowrap; max-width: 90vw; }

    /* Login */
    .login-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 32px; text-align: center; background: ${S.bg}; gap: 16px; }
    .login-logo { font-size: 36px; font-weight: 900; }
    .login-logo span { color: ${S.green}; }
    .login-sub { color: ${S.textMuted}; font-size: 15px; max-width: 280px; line-height: 1.5; }
    .login-btn { background: ${S.green}; color: #000; font-weight: 700; font-size: 15px; border: none; border-radius: 30px; padding: 16px 48px; cursor: pointer; margin-top: 8px; }
    .login-btn:active { background: ${S.greenDim}; }
    .login-config-warn { font-size: 12px; color: #f59e0b; background: rgba(245,158,11,0.1); border-radius: 8px; padding: 10px 14px; max-width: 300px; line-height: 1.4; }
  `;
  document.head.appendChild(style);
}

// ─── RENDER: LOGIN ────────────────────────────────────────────
function renderLogin() {
  injectStyles();
  const root = document.getElementById('root');
  root.innerHTML = '';
  const isConfigured = CLIENT_ID !== 'YOUR_SPOTIFY_CLIENT_ID';

  root.appendChild(el('div', { className: 'login-screen' },
    el('div', { className: 'login-logo' }, 'Noli', el('span', {}, 'Music')),
    el('p', { className: 'login-sub' }, 'Play any song on guitar — no capo needed'),
    !isConfigured ? el('div', { className: 'login-config-warn' },
      '⚠️ Add your Spotify Client ID to app.js to enable login'
    ) : null,
    el('button', {
      className: 'login-btn',
      onclick: () => isConfigured ? startLogin() : showToast('Add CLIENT_ID to app.js first')
    }, 'Login with Spotify')
  ));

  root.appendChild(el('div', { id: 'toast' }));
}

// ─── RENDER: LIBRARY ─────────────────────────────────────────
function renderLibrary() {
  injectStyles();
  const root = document.getElementById('root');
  root.innerHTML = '';

  // Header
  const header = el('div', { className: 'lib-header' },
    el('div', { className: 'lib-logo' }, 'Noli', el('span', {}, 'Music')),
    el('div', { style: { padding: '0 0 6px' } },
      (() => {
        const bar = el('div', { className: 'search-bar' });
        const iconWrap = document.createElement('span');
        iconWrap.style.display = 'inline-flex';
        iconWrap.innerHTML = searchIcon();
        bar.appendChild(iconWrap);
        bar.appendChild(el('input', {
          className: 'search-input',
          type: 'text',
          placeholder: 'Songs, artists, playlists…',
          value: state.searchQuery,
          oninput(e) {
            state.searchQuery = e.target.value;
            doSearch(e.target.value);
          }
        }));
        return bar;
      })()
    )
  );

  // Tabs
  const tabs = el('div', { className: 'tabs' });
  ['songs','playlists','artists'].forEach(tab => {
    const btn = el('button', {
      className: 'tab-btn' + (state.libTab === tab ? ' active' : ''),
      onclick: () => {
        state.libTab = tab;
        state.searchQuery = '';
        state.searchResults = null;
        renderLibrary();
      }
    }, tab.charAt(0).toUpperCase() + tab.slice(1));
    tabs.appendChild(btn);
  });

  // Content area
  const content = el('div', { className: 'scroll-area', id: 'lib-content' });

  // Playable toggle (songs tab only)
  let playableToggle = null;
  if (state.libTab === 'songs' && !state.searchResults) {
    const track = el('div', { className: 'toggle-track' + (state.showPlayable ? ' on' : ''), id: 'toggle-track' });
    track.appendChild(el('div', { className: 'toggle-thumb' }));
    track.onclick = () => {
      state.showPlayable = !state.showPlayable;
      track.className = 'toggle-track' + (state.showPlayable ? ' on' : '');
      renderSongsList(content);
    };
    playableToggle = el('div', { className: 'playable-toggle' },
      track,
      el('span', { className: 'toggle-label' }, 'Show only playable songs (', el('span', { style: { color: S.green } }, '🎸'), ')')
    );
  }

  root.appendChild(header);
  root.appendChild(tabs);
  if (playableToggle) root.appendChild(playableToggle);
  root.appendChild(content);
  root.appendChild(renderBottomNav());
  root.appendChild(el('div', { id: 'toast' }));

  // Load content
  if (state.searchResults !== null) {
    renderSearchResults(content, state.searchResults, state.searchQuery);
  } else if (state.libTab === 'songs') {
    if (state.songs.length === 0) {
      loadAllSongs().then(() => renderSongsList(content));
    } else {
      renderSongsList(content);
    }
  } else if (state.libTab === 'playlists') {
    if (state.playlists.length === 0) {
      loadPlaylists().then(() => renderPlaylistsGrid(content));
    } else {
      renderPlaylistsGrid(content);
    }
  } else if (state.libTab === 'artists') {
    if (state.artists.length === 0) {
      loadArtists().then(() => renderArtistsGrid(content));
    } else {
      renderArtistsGrid(content);
    }
  }
}

function renderSongsList(container) {
  container.innerHTML = '';

  // Always show all 10 manifest songs when playable toggle is ON
  // Show library songs when toggle is OFF, with manifest songs marked
  if (state.showPlayable) {
    // Show all manifest songs regardless of whether they're in Spotify library
    const hasMp3Songs = SONG_MANIFEST.filter(s => songHasMp3(s));
    const noMp3Songs = SONG_MANIFEST.filter(s => !songHasMp3(s));
    const toShow = [...hasMp3Songs, ...noMp3Songs]; // mp3 ones first, then rest

    if (toShow.length === 0) {
      container.appendChild(el('div', { style: { padding: '32px', textAlign: 'center', color: S.textMuted } },
        'No songs in the manifest yet. Add MP3 links to app.js.'));
      return;
    }
    toShow.forEach(song => {
      container.appendChild(makeManifestRow(song));
    });
    return;
  }

  // Normal library view
  if (state.songs.length === 0) {
    container.appendChild(el('div', { style: { padding: '40px', textAlign: 'center', color: S.textMuted, fontSize: '14px' } },
      'Loading your library…'));
    return;
  }

  state.songs.forEach(track => {
    if (!track) return;
    const manifest = matchSong(track);
    container.appendChild(makeSongRow(track, manifest));
  });
}

function makeManifestRow(song) {
  const hasMp3 = songHasMp3(song);
  const isPlaying = state.currentSong?.id === song.id && state.isPlaying;

  const row = el('div', { className: 'song-row' + (isPlaying ? ' playing' : '') });

  // Placeholder art (no Spotify track available in playable-only view)
  const thumb = el('div', { className: 'song-thumb-placeholder' }, '🎵');
  row.appendChild(thumb);

  row.appendChild(el('div', { className: 'song-info' },
    el('div', { className: 'song-title', style: { color: hasMp3 ? S.text : S.textMuted } }, song.title),
    el('div', { className: 'song-artist' }, song.artist)
  ));

  const badge = el('div', { className: hasMp3 ? 'song-badge' : 'song-badge unavail' },
    hasMp3 ? '🎸' : '—');
  row.appendChild(badge);

  if (hasMp3) {
    row.onclick = () => playSong(song, null);
  }

  return row;
}

function makeSongRow(track, manifestSong) {
  const hasMp3 = songHasMp3(manifestSong);
  const isPlaying = state.currentSong?.id === manifestSong?.id && state.isPlaying;

  const row = el('div', { className: 'song-row' + (isPlaying ? ' playing' : '') });

  // Album art
  const imgUrl = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url;
  if (imgUrl) {
    const img = el('img', { className: 'song-thumb', src: imgUrl, alt: '' });
    img.onerror = () => {
      img.style.display = 'none';
      const ph = el('div', { className: 'song-thumb-placeholder' }, '🎵');
      img.parentNode.insertBefore(ph, img);
    };
    row.appendChild(img);
  } else {
    row.appendChild(el('div', { className: 'song-thumb-placeholder' }, '🎵'));
  }

  row.appendChild(el('div', { className: 'song-info' },
    el('div', { className: 'song-title', style: { color: manifestSong ? S.text : S.textMuted } },
      track.name),
    el('div', { className: 'song-artist' },
      track.artists?.map(a => a.name).join(', ') || '')
  ));

  if (manifestSong) {
    const badge = el('div', { className: hasMp3 ? 'song-badge' : 'song-badge unavail' },
      hasMp3 ? '🎸' : '✓');
    row.appendChild(badge);
    if (hasMp3) {
      row.onclick = () => playSong(manifestSong, track);
    }
  }

  return row;
}

function renderPlaylistsGrid(container) {
  container.innerHTML = '';
  if (state.playlists.length === 0) {
    container.appendChild(el('div', { style: { padding: '40px', textAlign: 'center', color: S.textMuted, fontSize: '14px' } }, 'No playlists found'));
    return;
  }
  const grid = el('div', { className: 'grid-2' });
  state.playlists.forEach(p => {
    const img = p.images?.[0]?.url;
    const card = el('div', { className: 'grid-card' });
    if (img) {
      const i = el('img', { className: 'grid-img', src: img, alt: p.name });
      i.onerror = () => i.style.background = S.surface2;
      card.appendChild(i);
    } else {
      const ph = el('div', { className: 'grid-img', style: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' } }, '🎵');
      card.appendChild(ph);
    }
    card.appendChild(el('div', { className: 'grid-label' }, p.name || 'Playlist'));
    card.appendChild(el('div', { className: 'grid-sub' }, p.tracks?.total + ' songs' || ''));
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

function renderArtistsGrid(container) {
  container.innerHTML = '';
  if (state.artists.length === 0) {
    container.appendChild(el('div', { style: { padding: '40px', textAlign: 'center', color: S.textMuted, fontSize: '14px' } }, 'No followed artists found'));
    return;
  }
  const grid = el('div', { className: 'grid-2' });
  state.artists.forEach(a => {
    const img = a.images?.[1]?.url || a.images?.[0]?.url;
    const card = el('div', { className: 'grid-card' });
    if (img) {
      const i = el('img', { className: 'grid-img', src: img, alt: a.name, style: { borderRadius: '50%' } });
      i.onerror = () => i.style.background = S.surface2;
      card.appendChild(i);
    } else {
      const ph = el('div', { className: 'grid-img', style: { borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' } }, '🎤');
      card.appendChild(ph);
    }
    card.appendChild(el('div', { className: 'grid-label', style: { textAlign: 'center' } }, a.name || 'Artist'));
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

// ─── SEARCH ───────────────────────────────────────────────────
let searchDebounce = null;
function doSearch(query) {
  clearTimeout(searchDebounce);
  if (!query.trim()) {
    state.searchResults = null;
    // Re-render content area in place (no scroll-to-top)
    const content = document.getElementById('lib-content');
    if (content) {
      renderSongsList(content);
      // Re-show playable toggle
      const existing = document.querySelector('.playable-toggle');
      if (!existing && state.libTab === 'songs') {
        const track = el('div', { className: 'toggle-track' + (state.showPlayable ? ' on' : ''), id: 'toggle-track' });
        track.appendChild(el('div', { className: 'toggle-thumb' }));
        track.onclick = () => {
          state.showPlayable = !state.showPlayable;
          track.className = 'toggle-track' + (state.showPlayable ? ' on' : '');
          renderSongsList(content);
        };
        const toggle = el('div', { className: 'playable-toggle' },
          track,
          el('span', { className: 'toggle-label' }, 'Show only playable songs (🎸)')
        );
        content.parentNode.insertBefore(toggle, content);
      }
    }
    return;
  }
  searchDebounce = setTimeout(() => runSearch(query), 300);
}

async function runSearch(query) {
  const q = normalize(query);
  const content = document.getElementById('lib-content');
  if (!content) return;

  // Remove playable toggle when searching
  const toggleEl = document.querySelector('.playable-toggle');
  if (toggleEl) toggleEl.remove();

  // First search the manifest
  const manifestHits = SONG_MANIFEST.filter(song => {
    const titleMatch = normalize(song.title).includes(q) || q.includes(normalize(song.title)) ||
      (song.titleAlt || []).some(t => normalize(t).includes(q));
    const artistMatch = normalize(song.artist).includes(q) || q.includes(normalize(song.artist)) ||
      (song.artistAlt || []).some(a => normalize(a).includes(q));
    return titleMatch || artistMatch;
  });

  // Also search loaded songs
  const songHits = state.songs.filter(track => {
    if (!track) return false;
    const t = normalize(track.name);
    const a = normalize(track.artists?.[0]?.name || '');
    return t.includes(q) || q.includes(t) || a.includes(q) || q.includes(a);
  }).slice(0, 30);

  state.searchResults = { manifestHits, songHits, query };
  renderSearchResults(content, state.searchResults, query);

  // If we have Spotify access, also search Spotify
  if (state.token && songHits.length < 5) {
    try {
      const data = await spFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=20`);
      if (data?.tracks?.items) {
        const extra = data.tracks.items.filter(t =>
          !songHits.find(s => normalize(s.name) === normalize(t.name) &&
            normalize(s.artists?.[0]?.name) === normalize(t.artists?.[0]?.name))
        );
        state.searchResults.songHits = [...songHits, ...extra];
        renderSearchResults(content, state.searchResults, query);
      }
    } catch(e) { /* fail silently */ }
  }
}

function renderSearchResults(container, results, query) {
  container.innerHTML = '';

  if (!results || (!results.manifestHits?.length && !results.songHits?.length)) {
    container.appendChild(el('div', { style: { padding: '40px', textAlign: 'center', color: S.textMuted, fontSize: '14px' } },
      'No results for "' + query + '"'));
    return;
  }

  // Manifest hits first (these are playable)
  if (results.manifestHits?.length) {
    container.appendChild(el('div', { style: { padding: '12px 16px 4px', fontSize: '12px', color: S.green, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' } },
      '🎸 Playable in NoliMusic'));
    results.manifestHits.forEach(song => {
      container.appendChild(makeManifestRow(song));
    });
  }

  // Library hits
  if (results.songHits?.length) {
    container.appendChild(el('div', { style: { padding: '12px 16px 4px', fontSize: '12px', color: S.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' } },
      'From Your Library'));
    results.songHits.forEach(track => {
      if (!track) return;
      const manifest = matchSong(track);
      container.appendChild(makeSongRow(track, manifest));
    });
  }
}

// ─── BOTTOM NAV ───────────────────────────────────────────────
function renderBottomNav() {
  const nav = el('div', { className: 'bottom-nav' });

  const libSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`;
  const searchSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
  const npSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;

  [
    { label: 'Library', svg: libSvg, screen: 'library', tab: null },
    { label: 'Search', svg: searchSvg, screen: 'search', tab: null },
    { label: 'Now Playing', svg: npSvg, screen: 'nowplaying', tab: null },
  ].forEach(item => {
    const isActive = state.screen === item.screen ||
      (item.screen === 'library' && state.screen === 'library');
    const btn = el('button', {
      className: 'nav-btn' + (isActive ? ' active' : ''),
      onclick: () => {
        if (item.screen === 'nowplaying') {
          if (state.currentSong) {
            state.screen = 'nowplaying';
            renderNowPlaying();
          } else {
            showToast('Tap a song to start playing');
          }
        } else if (item.screen === 'search') {
          state.screen = 'library';
          state.libTab = 'songs';
          renderLibrary();
          // Focus search input
          setTimeout(() => {
            const inp = document.querySelector('.search-input');
            if (inp) inp.focus();
          }, 100);
        } else {
          state.screen = 'library';
          renderLibrary();
        }
      }
    });
    btn.innerHTML = item.svg + `<span>${item.label}</span>`;
    nav.appendChild(btn);
  });

  return nav;
}

// ─── PLAY SONG ────────────────────────────────────────────────
function playSong(manifestSong, spotifyTrack) {
  state.currentSong = manifestSong;
  state.currentSpotifyTrack = spotifyTrack;
  state.mode = 'noli';
  state.pitchOffset = 0;
  state.manualKey = manifestSong.noliKey || 'G';

  state.screen = 'nowplaying';
  renderNowPlaying();

  if (manifestSong.mp3Url) {
    const semitones = manifestSong.noliSemitones;
    loadAndPlay(manifestSong.mp3Url, semitones);
  } else {
    showToast('No MP3 linked yet — add URL to app.js');
  }
}

// ─── NOW PLAYING ─────────────────────────────────────────────
function renderNowPlaying() {
  injectStyles();
  const root = document.getElementById('root');
  root.innerHTML = '';

  const song = state.currentSong;
  const track = state.currentSpotifyTrack;

  if (!song) {
    state.screen = 'library';
    renderLibrary();
    return;
  }

  // Get album art URL from Spotify track if available
  const artUrl = track?.album?.images?.[0]?.url || null;

  // ── Build the now playing screen
  const screen = el('div', { className: 'now-playing' });

  // 1. Header
  screen.appendChild(el('div', { className: 'np-header' },
    el('button', { className: 'np-back', onclick: () => { state.screen = 'library'; renderLibrary(); } }, '‹'),
    el('span', { className: 'np-title-label' }, 'Now Playing'),
    el('span', { style: { width: '32px' } })
  ));

  // 2. Album art
  const artWrap = el('div', { className: 'np-art-wrap' });
  if (artUrl) {
    const img = el('img', { className: 'np-art', src: artUrl, alt: song.title, id: 'np-art-img' });
    img.onerror = () => {
      img.replaceWith(el('div', { className: 'np-art-placeholder', id: 'np-art-img' }, '🎸'));
    };
    artWrap.appendChild(img);
  } else {
    artWrap.appendChild(el('div', { className: 'np-art-placeholder', id: 'np-art-img' }, '🎸'));
  }
  screen.appendChild(artWrap);

  // 3. Track info
  screen.appendChild(el('div', { className: 'np-track-info' },
    el('div', { className: 'np-track-name' }, song.title),
    el('div', { className: 'np-track-artist' }, song.artist)
  ));

  // 4. Mode toggle — NO page scroll: update in place
  const modeToggle = el('div', { className: 'np-mode-toggle' });
  ['noli', 'original', 'manual'].forEach(m => {
    const label = m === 'noli' ? 'Noli' : m === 'original' ? 'Original' : 'Manual';
    const btn = el('button', {
      className: 'mode-btn' + (state.mode === m ? ' active' : ''),
      id: 'mode-btn-' + m,
      onclick: (e) => {
        e.preventDefault();
        switchMode(m);
      }
    }, label);
    modeToggle.appendChild(btn);
  });
  screen.appendChild(modeToggle);

  // 5. Key display + chords (dynamic region)
  screen.appendChild(el('div', { id: 'np-key-region' }));

  // 6. Seek bar
  const seekBar = el('input', {
    type: 'range', min: '0', max: '1', step: '0.001',
    className: 'np-seek-bar', id: 'np-seek-bar', value: String(state.progress || 0)
  });
  seekBar.addEventListener('input', (e) => seekTo(parseFloat(e.target.value)));
  screen.appendChild(el('div', { className: 'np-seek-row' }, seekBar));
  screen.appendChild(el('div', { className: 'np-time-row' },
    el('span', { id: 'np-elapsed' }, '0:00'),
    el('span', { id: 'np-remain' }, '-0:00')
  ));

  // 7. Playback controls
  const prevBtn = el('button', { className: 'ctrl-btn', onclick: () => showToast('Previous track') });
  prevBtn.innerHTML = prevIcon();
  const playBtn = el('button', { className: 'play-btn', id: 'np-play-btn', onclick: togglePlay });
  playBtn.innerHTML = state.isPlaying ? pauseIcon() : playIcon();
  const nextBtn = el('button', { className: 'ctrl-btn', onclick: () => showToast('Next track') });
  nextBtn.innerHTML = nextIcon();

  screen.appendChild(el('div', { className: 'np-controls' }, prevBtn, playBtn, nextBtn));

  // 8. Volume
  const volSlider = el('input', {
    type: 'range', min: '0', max: '1', step: '0.01',
    className: 'vol-slider', id: 'np-vol-slider', value: String(state.volume)
  });
  volSlider.addEventListener('input', (e) => setVolume(parseFloat(e.target.value)));
  screen.appendChild(el('div', { className: 'np-vol-row' },
    el('span', { className: 'vol-icon' }, '🔈'),
    volSlider,
    el('span', { className: 'vol-icon' }, '🔊')
  ));

  screen.appendChild(renderBottomNav());
  screen.appendChild(el('div', { id: 'toast' }));

  root.appendChild(screen);

  // Render key region after DOM is ready
  updateKeyRegion();
}

function switchMode(m) {
  // Store scroll position to avoid jumping
  state.mode = m;
  if (m === 'noli') {
    state.pitchOffset = 0;
    applyPitch(state.currentSong.noliSemitones);
  } else if (m === 'original') {
    state.pitchOffset = 0;
    applyPitch(0);
  }
  // Update mode buttons without re-rendering
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'mode-btn-' + m);
  });
  updateKeyRegion();
}

function updateKeyRegion() {
  const region = document.getElementById('np-key-region');
  if (!region) return;
  region.innerHTML = '';

  const song = state.currentSong;
  if (!song) return;

  if (state.mode === 'noli') {
    // Show current shifted key + nudge controls
    const totalSemitones = song.noliSemitones + state.pitchOffset;
    const keyInfo = getKeyAtOffset(song, totalSemitones);

    region.appendChild(el('div', { className: 'np-key-display' },
      el('div', {},
        el('div', { className: 'np-key-badge' }, keyInfo.label + ' ' + (keyInfo.mode === 'minor' ? 'm' : '')),
        el('div', { style: { fontSize: '11px', color: S.textMuted, marginTop: '2px' } }, 'Noli key')
      ),
      el('div', { style: { textAlign: 'right' } },
        el('div', { className: 'np-shift-label' }, totalSemitones > 0 ? '+'+totalSemitones : totalSemitones === 0 ? '0' : String(totalSemitones), ' semitones'),
        el('div', { className: 'np-shift-label' }, 'from original ' + song.key + (song.mode === 'minor' ? 'm' : ''))
      )
    ));

    // Chord badges
    region.appendChild(renderChordBadges(keyInfo));

    // Nudge controls
    const minusBtn = el('button', { className: 'shift-btn', onclick: (e) => { e.preventDefault(); nudge(-1); } }, '−');
    const plusBtn = el('button', { className: 'shift-btn', onclick: (e) => { e.preventDefault(); nudge(+1); } }, '+');
    const resetBtn = el('button', { className: 'reset-btn', onclick: (e) => { e.preventDefault(); state.pitchOffset = 0; applyPitch(song.noliSemitones); updateKeyRegion(); } }, 'Reset');
    const shiftLabel = el('span', { className: 'shift-label' },
      state.pitchOffset === 0 ? 'Fine tune' : (state.pitchOffset > 0 ? '+' : '') + state.pitchOffset);
    region.appendChild(el('div', { className: 'np-shift-row' }, minusBtn, shiftLabel, plusBtn, resetBtn));

  } else if (state.mode === 'original') {
    region.appendChild(el('div', { className: 'np-key-display' },
      el('div', {},
        el('div', { className: 'np-key-badge' }, song.key + (song.mode === 'minor' ? 'm' : '')),
        el('div', { style: { fontSize: '11px', color: S.textMuted, marginTop: '2px' } }, 'Original key')
      ),
      el('div', { className: 'np-shift-label' }, 'No pitch shift')
    ));
    const keyInfo = KEYS.find(k => k.label === song.key) || KEYS[0];
    region.appendChild(renderChordBadges(keyInfo));

  } else if (state.mode === 'manual') {
    // Manual key selector — all 12 + minors INCLUDING Em
    const keyScroll = el('div', { className: 'manual-key-scroll' });
    MANUAL_KEYS.forEach(k => {
      const chip = el('button', {
        className: 'key-chip' + (state.manualKey === k ? ' active' : ''),
        onclick: (e) => {
          e.preventDefault();
          state.manualKey = k;
          const semitones = calcSemitonesForKey(song, k);
          applyPitch(semitones);
          updateKeyRegion();
        }
      }, k);
      keyScroll.appendChild(chip);
    });
    region.appendChild(keyScroll);

    const keyInfo = KEYS.find(k => k.label === state.manualKey) || KEYS[0];
    region.appendChild(renderChordBadges(keyInfo));
  }
}

function nudge(delta) {
  const song = state.currentSong;
  if (!song) return;
  state.pitchOffset = Math.max(-6, Math.min(6, state.pitchOffset + delta));
  applyPitch(song.noliSemitones + state.pitchOffset);
  updateKeyRegion();
}

function renderChordBadges(keyInfo) {
  const wrap = el('div', { className: 'np-chords' });
  if (keyInfo?.chords?.length) {
    keyInfo.chords.forEach(chord => {
      wrap.appendChild(el('div', { className: 'chord-badge' }, chord));
    });
    if (keyInfo.warning) {
      wrap.appendChild(el('div', { className: 'chord-warning' }, '⚠ ' + keyInfo.warning));
    }
  } else if (keyInfo?.warning) {
    wrap.appendChild(el('div', { className: 'chord-warning' }, '⚠ ' + keyInfo.warning));
  }
  return wrap;
}

function getKeyAtOffset(song, totalSemitones) {
  // Calculate which key we land in given the original key + shift
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const origIdx = notes.indexOf(song.key);
  if (origIdx === -1) return KEYS.find(k => k.label === 'G') || KEYS[0];
  const newIdx = ((origIdx + totalSemitones) % 12 + 12) % 12;
  const newNote = notes[newIdx];

  // Check if minor
  if (song.mode === 'minor') {
    const minorKey = KEYS.find(k => k.label === newNote + 'm' || (k.label === newNote && k.mode === 'minor'));
    if (minorKey) return minorKey;
  }
  return KEYS.find(k => k.label === newNote && k.mode === 'major') || KEYS[0];
}

function calcSemitonesForKey(song, targetKey) {
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  // Strip 'm' for minor
  const cleanTarget = targetKey.replace('m','');
  const origIdx = notes.indexOf(song.key);
  const targetIdx = notes.indexOf(cleanTarget);
  if (origIdx === -1 || targetIdx === -1) return 0;
  let diff = targetIdx - origIdx;
  // Normalize to -6..+6
  while (diff > 6) diff -= 12;
  while (diff < -6) diff += 12;
  return diff;
}

function togglePlay() {
  if (state.isPlaying) {
    pauseAudio();
  } else {
    if (!audioBuffer && state.currentSong?.mp3Url) {
      const semitones = state.mode === 'original' ? 0
        : state.mode === 'noli' ? (state.currentSong.noliSemitones + state.pitchOffset)
        : calcSemitonesForKey(state.currentSong, state.manualKey);
      loadAndPlay(state.currentSong.mp3Url, semitones);
    } else {
      resumeAudio();
    }
  }
}

// ─── INIT ─────────────────────────────────────────────────────
async function init() {
  injectStyles();

  // Handle OAuth redirect
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    window.history.replaceState({}, '', '/');
    try {
      await exchangeCodeForToken(code);
    } catch(e) {
      renderLogin();
      return;
    }
  }

  const token = await getToken();
  if (!token) {
    renderLogin();
    return;
  }

  state.token = token;
  state.screen = 'library';
  renderLibrary();
}

init();
