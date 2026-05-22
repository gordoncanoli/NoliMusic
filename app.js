// ============================================================
// NoliMusic - Complete PWA App
// ============================================================

// --- CONFIGURATION ---
const SPOTIFY_CLIENT_ID = 'ef8275d6f8304dcf9c249ab85ca0a588';
const REDIRECT_URI = 'https://nolimusic.netlify.app';
const SCOPES = 'user-library-read playlist-read-private user-follow-read user-read-private user-read-email';

// --- SONG MANIFEST ---
// TO ADD YOUR MP3s: Replace each "mp3Url" value with your Google Drive direct link
// Google Drive direct link format: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
const SONG_MANIFEST = [
  {
    artist: 'Mike Posner',
    title: 'Cooler Than Me',
    originalKey: 'F major',
    semitonsToG: 2,
    mp3Url: 'audio/cooler-than-me.mp3',
  },
  {
    artist: 'The Killers',
    title: 'Human',
    originalKey: 'A major',
    semitonsToG: -2,
    mp3Url: 'audio/human.mp3',
  },
  {
    artist: 'Drake',
    title: "Marvin's Room",
    originalKey: 'F minor',
    semitonsToG: 2,
    mp3Url: 'audio/marvins-room.mp3',
  },
  {
    artist: 'Tracy Chapman',
    title: 'Fast Car',
    originalKey: 'A major',
    semitonsToG: -2,
    mp3Url: 'audio/fast-car.mp3',
  },
  {
    artist: "Plain White T's",
    title: 'Hey There Delilah',
    originalKey: 'D major',
    semitonsToG: -7,
    mp3Url: 'audio/hey-there-delilah.mp3',
  },
  {
    artist: 'Fleetwood Mac',
    title: 'Landslide',
    originalKey: 'C major',
    semitonsToG: 7,
    mp3Url: 'audio/landslide.mp3',
  },
  {
    artist: 'Fleetwood Mac',
    title: 'Dreams',
    originalKey: 'F major',
    semitonsToG: 2,
    mp3Url: 'audio/dreams.mp3',
  },
  {
    artist: 'James Taylor',
    title: "You've Got a Friend",
    originalKey: 'A major',
    semitonsToG: -2,
    mp3Url: 'audio/youve-got-a-friend.mp3',
  },
  {
    artist: 'The Kid LAROI',
    title: 'Stay',
    artistAlt: 'Justin Bieber',
    originalKey: 'C# major',
    semitonsToG: -5,
    mp3Url: 'audio/stay.mp3',
  },
  {
    artist: 'Fleetwood Mac',
    title: 'Silver Springs',
    originalKey: 'E minor',
    semitonsToG: 1,
    mp3Url: 'audio/silver-springs.mp3',
  },
];

// --- KEY / CHORD DATA ---
const KEY_DATA = {
  'C major':  { chords: ['C', 'Am', 'F', 'G'], warning: null },
  'C# major': { chords: [], warning: 'Advanced key — consider shifting down' },
  'D major':  { chords: ['D', 'G', 'A', 'Bm'], warning: null },
  'D# major': { chords: [], warning: 'Advanced key — consider shifting down' },
  'E major':  { chords: ['E', 'A', 'B', 'C#m'], warning: null },
  'F major':  { chords: [], warning: 'Advanced key — consider shifting down' },
  'F# major': { chords: [], warning: 'Advanced key — consider shifting down' },
  'G major':  { chords: ['G', 'C', 'D', 'Em'], warning: null },
  'G# major': { chords: [], warning: 'Advanced key — consider shifting down' },
  'A major':  { chords: ['A', 'D', 'E', 'F#m'], warning: 'F#m is slightly harder' },
  'A# major': { chords: [], warning: 'Advanced key — consider shifting down' },
  'B major':  { chords: [], warning: 'Advanced key — consider shifting down' },
  'A minor':  { chords: ['Am', 'G', 'F', 'E'], warning: null },
  'E minor':  { chords: ['Em', 'G', 'D', 'Am'], warning: null },
  'D minor':  { chords: ['Dm', 'Am', 'C', 'Gm'], warning: 'Gm is slightly harder' },
};

const CHROMATIC_MAJOR = ['C major','C# major','D major','D# major','E major','F major','F# major','G major','G# major','A major','A# major','B major'];

function semitoneToKey(originalKey, semitones) {
  const idx = CHROMATIC_MAJOR.indexOf(originalKey);
  if (idx === -1) {
    // handle minor keys
    if (originalKey === 'E minor') {
      const minors = ['A minor','A# minor','B minor','C minor','C# minor','D minor','D# minor','E minor','F minor','F# minor','G minor','G# minor'];
      const mi = minors.indexOf(originalKey);
      const newIdx = ((mi + semitones) % 12 + 12) % 12;
      const result = minors[newIdx];
      return KEY_DATA[result] ? result : 'G major';
    }
    return 'G major';
  }
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return CHROMATIC_MAJOR[newIdx];
}

// --- SPOTIFY AUTH ---
function generateCodeVerifier(length = 128) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  array.forEach(x => result += chars[x % chars.length]);
  return result;
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function loginWithSpotify() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  localStorage.setItem('code_verifier', verifier);
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem('code_verifier');
  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000);
    return data.access_token;
  }
  throw new Error('Token exchange failed');
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return null;
  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000);
    return data.access_token;
  }
  return null;
}

async function getToken() {
  const expiry = parseInt(localStorage.getItem('token_expiry') || '0');
  if (Date.now() > expiry - 60000) {
    return await refreshAccessToken();
  }
  return localStorage.getItem('access_token');
}

async function spotifyFetch(endpoint) {
  const token = await getToken();
  if (!token) throw new Error('No token');
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) { logout(); return null; }
    const res2 = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: { Authorization: `Bearer ${newToken}` },
    });
    return res2.json();
  }
  return res.json();
}

function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
  localStorage.removeItem('code_verifier');
  renderApp();
}

// --- MANIFEST MATCHING ---
function cleanTitle(str) {
  return str
    .toLowerCase()
    .replace(/\s*[-–—]\s*(\d{4}\s*)?(remaster(ed)?|deluxe|radio edit|single version|album version|live|acoustic|explicit|feat\.?.*|ft\.?.*).*$/i, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .trim();
}

function findManifestMatch(track) {
  const trackTitle = cleanTitle(track.name);
  const trackArtist = track.artists.map(a => a.name.toLowerCase()).join(' ');
  return SONG_MANIFEST.find(m => {
    const mTitle = cleanTitle(m.title);
    const mArtist = m.artist.toLowerCase();
    const mArtistAlt = m.artistAlt ? m.artistAlt.toLowerCase() : '';
    const titleMatch = trackTitle.includes(mTitle) || mTitle.includes(trackTitle);
    const artistMatch = trackArtist.includes(mArtist) || (mArtistAlt && trackArtist.includes(mArtistAlt));
    return titleMatch && artistMatch;
  });
}

// --- AUDIO ENGINE ---
let audioCtx = null;
let sourceNode = null;
let audioBuffer = null;
let startTime = 0;
let pauseOffset = 0;
let isPlaying = false;
let currentPitch = 0; // semitones relative to default G shift
let currentManifestEntry = null;
let onTimeUpdate = null;
let animFrame = null;

function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Simple pitch shift using playbackRate — preserves rough pitch relationship
// For production, Tone.js would be used, but for pure PWA no-npm we use Web Audio API
async function loadAudio(url) {
  const ctx = getAudioContext();
  // Files are served from same origin — no CORS issues
  window._fallbackAudio = null;
  window._fallbackSource = null;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Could not load: ' + url);
  const arrayBuffer = await res.arrayBuffer();
  audioBuffer = await ctx.decodeAudioData(arrayBuffer);
}

function pitchSemitonesToRate(semitones) {
  return Math.pow(2, semitones / 12);
}

function playAudio(semitones, offset = 0) {
  stopAudio();
  const ctx = getAudioContext();
  // Create gain node for volume
  if (!window._gainNode) {
    window._gainNode = ctx.createGain();
    window._gainNode.connect(ctx.destination);
  }
  window._gainNode.gain.value = state.volume;
  if (audioBuffer) {
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.detune.value = semitones * 100;
    sourceNode.connect(window._gainNode);
    sourceNode.start(0, offset);
    startTime = ctx.currentTime - offset;
    isPlaying = true;
    sourceNode.onended = () => {
      if (isPlaying) { isPlaying = false; pauseOffset = 0; renderNowPlayingControls(); }
    };
  }
  trackProgress();
}

function stopAudio() {
  if (sourceNode) {
    try { sourceNode.stop(); } catch(e) {}
    sourceNode = null;
  }
  if (window._fallbackAudio) {
    try { window._fallbackAudio.pause(); } catch(e) {}
  }
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  isPlaying = false;
}

function pauseAudio() {
  if (!isPlaying) return;
  const ctx = getAudioContext();
  pauseOffset = ctx.currentTime - startTime;
  stopAudio();
  isPlaying = false;
}

function resumeAudio(semitones) {
  playAudio(semitones, pauseOffset);
}

function seekAudio(semitones, pct) {
  if (!audioBuffer) return;
  const offset = pct * audioBuffer.duration;
  pauseOffset = offset;
  if (isPlaying) playAudio(semitones, offset);
}

function getCurrentTime() {
  if (window._fallbackAudio && !audioBuffer) {
    return window._fallbackAudio.currentTime;
  }
  if (!audioBuffer) return 0;
  if (isPlaying && audioCtx) {
    return audioCtx.currentTime - startTime;
  }
  return pauseOffset;
}

function getDuration() {
  if (audioBuffer) return audioBuffer.duration;
  if (window._fallbackAudio) return window._fallbackAudio.duration || 0;
  return 0;
}

function trackProgress() {
  if (animFrame) cancelAnimationFrame(animFrame);
  function loop() {
    if (onTimeUpdate) onTimeUpdate();
    if (isPlaying) animFrame = requestAnimationFrame(loop);
  }
  animFrame = requestAnimationFrame(loop);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// --- STATE ---
let state = {
  screen: 'login', // login | library | search | nowplaying
  tab: 'songs',    // songs | playlists | artists
  token: null,
  profile: null,
  songs: [],
  playlists: [],
  artists: [],
  songsOffset: 0,
  songsTotal: 0,
  loading: false,
  searchQuery: '',
  searchResults: { songs: [], playlists: [], artists: [] },
  currentTrack: null,
  currentManifest: null,
  pitchOffset: 0, // user's manual offset from the G default
  audioLoading: false,
  playlistTracks: null,
  currentPlaylistId: null,
  sortOrder: 'recent', // recent | song | artist
  showPlayableOnly: false,
  nowPlayingMode: 'noli', // noli | original | manual
  manualSemitone: 0, // -6 to +6 for manual mode
  volume: 1.0,
};

// --- RENDER ENGINE ---
const root = document.getElementById('root');

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'className') e.className = v;
    else e.setAttribute(k, v);
  }
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === 'string' || typeof child === 'number') e.appendChild(document.createTextNode(child));
    else e.appendChild(child);
  }
  return e;
}

// --- STYLES ---
const S = {
  bg: '#0a0a0a',
  surface: '#161616',
  surface2: '#1f1f1f',
  green: '#1DB954',
  greenDim: '#158a3e',
  text: '#ffffff',
  textMuted: '#a0a0a0',
  textDim: '#606060',
  border: '#2a2a2a',
};

function css(obj) { return obj; }

// --- SCREENS ---

function renderLogin() {
  root.innerHTML = '';
  const screen = el('div', {
    style: css({
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `radial-gradient(ellipse at 50% 30%, #1a3a2a 0%, ${S.bg} 70%)`,
      padding: '40px 32px',
      gap: '0',
    })
  });

  // Logo mark
  const logoWrap = el('div', { style: { marginBottom: '16px' } },
    el('svg', { width: '64', height: '64', viewBox: '0 0 64 64', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }, )
  );
  // SVG guitar pick icon inline
  logoWrap.innerHTML = `
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="36" cy="36" r="36" fill="#1DB954" opacity="0.15"/>
      <path d="M36 14C27 14 20 22 20 30C20 38 28 44 32 48L36 58L40 48C44 44 52 38 52 30C52 22 45 14 36 14Z" fill="#1DB954"/>
      <circle cx="36" cy="30" r="5" fill="#0a0a0a"/>
    </svg>
  `;

  const title = el('h1', {
    style: css({
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '42px',
      fontWeight: '700',
      letterSpacing: '-1.5px',
      color: S.text,
      marginBottom: '8px',
    })
  }, 'NoliMusic');

  const subtitle = el('p', {
    style: css({
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '16px',
      color: S.textMuted,
      textAlign: 'center',
      lineHeight: '1.5',
      marginBottom: '60px',
      maxWidth: '260px',
    })
  }, 'Play any song on guitar — no capo needed.');

  const loginBtn = el('button', {
    style: css({
      background: S.green,
      color: '#000',
      border: 'none',
      borderRadius: '50px',
      padding: '18px 48px',
      fontSize: '16px',
      fontWeight: '700',
      fontFamily: "'DM Sans', sans-serif",
      letterSpacing: '0.3px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      justifyContent: 'center',
      maxWidth: '320px',
      transition: 'transform 0.1s, opacity 0.1s',
    }),
    onClick: loginWithSpotify,
  });
  loginBtn.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 01-.277-1.215c3.809-.87 7.076-.495 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.973-.519.781.781 0 01.52-.972c3.632-1.102 8.147-.568 11.234 1.328a.78.78 0 01.256 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 11-.543-1.794c3.532-1.072 9.404-.865 13.115 1.338a.937.937 0 01-.955 1.613z"/>
    </svg>
    Login with Spotify
  `;
  loginBtn.addEventListener('touchstart', () => loginBtn.style.opacity = '0.8');
  loginBtn.addEventListener('touchend', () => loginBtn.style.opacity = '1');

  const footer = el('p', {
    style: css({
      position: 'absolute',
      bottom: '40px',
      fontSize: '12px',
      color: S.textDim,
      textAlign: 'center',
    })
  }, 'Your library. Your key. Your music.');

  screen.appendChild(logoWrap);
  screen.appendChild(title);
  screen.appendChild(subtitle);
  screen.appendChild(loginBtn);
  screen.appendChild(footer);
  root.appendChild(screen);
}

// --- BOTTOM NAV ---
function renderBottomNav() {
  const nav = el('div', {
    style: css({
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      height: '72px',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: S.surface,
      borderTop: `1px solid ${S.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: '100',
    })
  });

  const tabs = [
    { id: 'library', label: 'Library', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>` },
    { id: 'search', label: 'Search', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>` },
    { id: 'nowplaying', label: 'Now Playing', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>` },
  ];

  tabs.forEach(tab => {
    const isActive = (tab.id === 'nowplaying' ? state.screen === 'nowplaying' : 
                     tab.id === 'library' ? state.screen === 'library' :
                     state.screen === 'search');
    const btn = el('button', {
      style: css({
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 16px',
        color: isActive ? S.green : S.textDim,
        cursor: 'pointer',
        minWidth: '64px',
      }),
      onClick: () => {
        if (tab.id === 'library') { state.screen = 'library'; renderLibrary(); }
        else if (tab.id === 'search') { state.screen = 'search'; renderSearch(); }
        else if (tab.id === 'nowplaying') {
          if (state.currentTrack) { state.screen = 'nowplaying'; renderNowPlaying(); }
        }
      }
    });
    btn.innerHTML = tab.icon + `<span style="font-size:10px;font-family:'DM Sans',sans-serif;font-weight:500">${tab.label}</span>`;
    nav.appendChild(btn);
  });

  return nav;
}

// --- MINI PLAYER ---
function renderMiniPlayer() {
  if (!state.currentTrack) return null;
  const track = state.currentTrack;
  const mini = el('div', {
    style: css({
      position: 'fixed',
      bottom: '72px',
      left: '8px',
      right: '8px',
      background: '#232323',
      borderRadius: '12px',
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: '99',
      cursor: 'pointer',
      border: `1px solid ${S.border}`,
    }),
    onClick: () => { state.screen = 'nowplaying'; renderNowPlaying(); }
  });

  const img = track.album?.images?.[0]?.url;
  const art = el('div', {
    style: css({
      width: '40px', height: '40px', borderRadius: '6px',
      background: S.surface2, flexShrink: '0', overflow: 'hidden',
    })
  });
  if (img) art.innerHTML = `<img src="${img}" width="40" height="40" style="border-radius:6px" />`;

  const info = el('div', { style: { flex: '1', overflow: 'hidden' } },
    el('div', { style: { fontSize: '13px', fontWeight: '600', color: S.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, track.name),
    el('div', { style: { fontSize: '11px', color: S.textMuted, marginTop: '2px' } }, track.artists?.[0]?.name || '')
  );

  const manifest = state.currentManifest;
  const totalShift = manifest ? manifest.semitonsToG + state.pitchOffset : 0;
  const keyLabel = el('div', {
    style: css({
      fontSize: '10px', fontWeight: '700', color: S.green,
      background: 'rgba(29,185,84,0.12)', borderRadius: '6px',
      padding: '3px 7px', flexShrink: '0',
    })
  }, 'G Maj');

  const playBtn = el('button', {
    style: css({
      background: 'none', border: 'none', color: S.text,
      fontSize: '22px', cursor: 'pointer', padding: '4px',
      display: 'flex', alignItems: 'center', flexShrink: '0',
    }),
    onClick: (e) => {
      e.stopPropagation();
      if (isPlaying) { pauseAudio(); }
      else {
        const shift = manifest ? manifest.semitonsToG + state.pitchOffset : 0;
        resumeAudio(shift);
      }
      renderMiniPlayerOnly();
    }
  });
  playBtn.innerHTML = isPlaying
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>`;

  mini.appendChild(art);
  mini.appendChild(info);
  mini.appendChild(keyLabel);
  mini.appendChild(playBtn);
  return mini;
}

function renderMiniPlayerOnly() {
  const existing = document.getElementById('mini-player');
  if (existing) existing.remove();
  if (state.currentTrack && state.screen !== 'nowplaying') {
    const mini = renderMiniPlayer();
    if (mini) { mini.id = 'mini-player'; root.appendChild(mini); }
  }
}

// --- LIBRARY ---
async function renderLibrary() {
  root.innerHTML = '';
  state.screen = 'library';

  const wrap = el('div', {
    style: css({
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: S.bg,
      overflow: 'hidden',
    })
  });

  // Header
  const header = el('div', {
    style: css({
      padding: '56px 20px 0',
      background: S.bg,
      flexShrink: '0',
    })
  });

  const profileRow = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' } });
  const titleEl = el('h1', { style: { fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px' } }, 'Your Library');
  const logoutBtn = el('button', {
    style: css({ background: 'none', border: 'none', color: S.textMuted, fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }),
    onClick: logout
  }, 'Log out');
  profileRow.appendChild(titleEl);
  profileRow.appendChild(logoutBtn);
  header.appendChild(profileRow);

  // Tabs
  const tabBar = el('div', {
    style: css({
      display: 'flex',
      gap: '8px',
      paddingBottom: '16px',
    })
  });
  ['Songs', 'Playlists', 'Artists'].forEach(t => {
    const id = t.toLowerCase();
    const active = state.tab === id;
    const tab = el('button', {
      style: css({
        background: active ? S.green : S.surface2,
        color: active ? '#000' : S.textMuted,
        border: 'none',
        borderRadius: '20px',
        padding: '8px 18px',
        fontSize: '13px',
        fontWeight: '600',
        fontFamily: "'DM Sans',sans-serif",
        cursor: 'pointer',
      }),
      onClick: () => { state.tab = id; renderLibrary(); }
    }, t);
    tabBar.appendChild(tab);
  });
  header.appendChild(tabBar);
  wrap.appendChild(header);

  // Content
  const content = el('div', {
    style: css({
      flex: '1',
      overflowY: 'auto',
      padding: '0 0 144px',
      WebkitOverflowScrolling: 'touch',
    })
  });

  if (state.loading) {
    content.appendChild(el('div', { style: { textAlign: 'center', padding: '60px', color: S.textMuted } }, 'Loading...'));
  } else if (state.tab === 'songs') {
    await ensureSongs();
    renderSongsList(content);
  } else if (state.tab === 'playlists') {
    await ensurePlaylists();
    renderPlaylistsGrid(content);
  } else if (state.tab === 'artists') {
    await ensureArtists();
    renderArtistsGrid(content);
  }

  wrap.appendChild(content);
  wrap.appendChild(renderBottomNav());
  root.appendChild(wrap);
  renderMiniPlayerOnly();
}

async function ensureSongs() {
  if (state.songs.length > 0) return;
  state.loading = true;
  try {
    const data = await spotifyFetch('/me/tracks?limit=50');
    state.songItems = data.items.filter(i => i.track);
    state.songs = state.songItems.map(i => i.track);
    state.songsTotal = data.total;
    state.loading = false;
  } catch(e) { state.loading = false; }
}

async function ensurePlaylists() {
  if (state.playlists.length > 0) return;
  try {
    const data = await spotifyFetch('/me/playlists?limit=50');
    state.playlists = data.items || [];
  } catch(e) {}
}

async function ensureArtists() {
  if (state.artists.length > 0) return;
  try {
    const data = await spotifyFetch('/me/following?type=artist&limit=50');
    state.artists = data.artists?.items || [];
  } catch(e) {}
}

function getSortedSongs() {
  const items = state.songItems || state.songs.map(t => ({ track: t, added_at: '' }));
  let sorted = [...items];
  if (state.sortOrder === 'song') {
    sorted.sort((a, b) => a.track.name.localeCompare(b.track.name));
  } else if (state.sortOrder === 'artist') {
    sorted.sort((a, b) => {
      const aA = a.track.artists?.[0]?.name || '';
      const bA = b.track.artists?.[0]?.name || '';
      return aA.localeCompare(bA);
    });
  }
  // 'recent' keeps default order (most recently added first)
  return sorted.map(i => i.track);
}

function renderSongsList(container) {
  // Controls bar
  const controlsBar = el('div', { style: { padding: '4px 20px 12px', display: 'flex', flexDirection: 'column', gap: '10px' } });

  // Sort row
  const sortRow = el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' } });
  sortRow.appendChild(el('span', { style: { fontSize: '12px', color: S.textDim, flexShrink: '0', marginRight: '2px' } }, 'Sort:'));
  [
    { id: 'recent', label: 'Recently Added' },
    { id: 'song',   label: 'Song A-Z' },
    { id: 'artist', label: 'Artist A-Z' },
  ].forEach(opt => {
    const active = state.sortOrder === opt.id;
    const btn = el('button', {
      style: {
        background: active ? S.green : S.surface2,
        color: active ? '#000' : S.textMuted,
        border: 'none', borderRadius: '20px',
        padding: '6px 14px', fontSize: '12px', fontWeight: '600',
        fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', flexShrink: '0', whiteSpace: 'nowrap',
      },
      onClick: () => { state.sortOrder = opt.id; container.innerHTML = ''; renderSongsList(container); }
    }, opt.label);
    sortRow.appendChild(btn);
  });
  controlsBar.appendChild(sortRow);

  // Playable toggle row
  const toggleRow = el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } });
  const toggleTrack = el('div', {
    style: {
      width: '44px', height: '26px', borderRadius: '13px',
      background: state.showPlayableOnly ? S.green : S.surface2,
      position: 'relative', cursor: 'pointer', flexShrink: '0',
      border: '1px solid ' + (state.showPlayableOnly ? S.green : S.border),
    },
    onClick: () => { state.showPlayableOnly = !state.showPlayableOnly; container.innerHTML = ''; renderSongsList(container); }
  });
  const toggleThumb = el('div', {
    style: {
      position: 'absolute', top: '3px',
      left: state.showPlayableOnly ? '21px' : '3px',
      width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
    }
  });
  toggleTrack.appendChild(toggleThumb);
  toggleRow.appendChild(toggleTrack);
  toggleRow.appendChild(el('span', { style: { fontSize: '12px', color: S.textMuted, fontFamily: "'DM Sans',sans-serif" } }, 'Playable songs only'));
  if (state.showPlayableOnly) {
    const playableCount = getSortedSongs().filter(t => { const m = findManifestMatch(t); return m && m.mp3Url; }).length;
    toggleRow.appendChild(el('span', { style: { fontSize: '11px', color: S.green, fontWeight: '700' } }, playableCount + ' songs'));
  }
  controlsBar.appendChild(toggleRow);
  container.appendChild(controlsBar);

  const allTracks = getSortedSongs();
  const tracks = state.showPlayableOnly
    ? allTracks.filter(t => { const m = findManifestMatch(t); return m && m.mp3Url; })
    : allTracks;

  tracks.forEach((track, i) => {
    const manifest = findManifestMatch(track);
    const available = manifest && manifest.mp3Url;
    const row = el('div', {
      style: css({
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '10px 20px',
        cursor: available ? 'pointer' : 'default',
        opacity: available ? '1' : '0.45',
      }),
      onClick: available ? () => playSong(track, manifest) : null,
    });
    const imgUrl = track.album?.images?.[2]?.url || track.album?.images?.[0]?.url;
    const art = el('div', {
      style: css({ width: '46px', height: '46px', borderRadius: '6px', background: S.surface2, flexShrink: '0', overflow: 'hidden' })
    });
    if (imgUrl) art.innerHTML = `<img src="${imgUrl}" width="46" height="46" style="border-radius:6px" loading="lazy" />`;
    const info = el('div', { style: { flex: '1', overflow: 'hidden' } },
      el('div', { style: { fontSize: '14px', fontWeight: '500', color: S.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, track.name),
      el('div', { style: { fontSize: '12px', color: S.textMuted, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
        track.artists?.map(a => a.name).join(', ') || ''
      )
    );
    if (available) {
      const badge = el('div', {
        style: css({ fontSize: '10px', fontWeight: '700', color: S.green, background: 'rgba(29,185,84,0.1)', borderRadius: '5px', padding: '3px 7px', flexShrink: '0' })
      }, 'G♮');
      row.appendChild(art); row.appendChild(info); row.appendChild(badge);
    } else {
      row.appendChild(art); row.appendChild(info);
    }
    container.appendChild(row);
    if (i < tracks.length - 1) {
      container.appendChild(el('div', { style: { height: '1px', background: S.border, margin: '0 20px 0 78px' } }));
    }
  });
}

function renderPlaylistsGrid(container) {
  const grid = el('div', {
    style: css({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      padding: '16px 20px',
    })
  });

  state.playlists.forEach(pl => {
    const card = el('div', {
      style: css({ cursor: 'pointer' }),
      onClick: () => openPlaylist(pl),
    });
    const imgUrl = pl.images?.[0]?.url;
    const art = el('div', {
      style: css({
        width: '100%', aspectRatio: '1', borderRadius: '10px',
        background: S.surface2, overflow: 'hidden', marginBottom: '8px',
      })
    });
    if (imgUrl) art.innerHTML = `<img src="${imgUrl}" width="100%" height="100%" style="object-fit:cover" loading="lazy" />`;

    card.appendChild(art);
    card.appendChild(el('div', { style: { fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, pl.name));
    card.appendChild(el('div', { style: { fontSize: '11px', color: S.textMuted, marginTop: '2px' } }, `${pl.tracks?.total || 0} songs`));
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function renderArtistsGrid(container) {
  const grid = el('div', {
    style: css({
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '16px',
      padding: '16px 20px',
    })
  });

  state.artists.forEach(artist => {
    const card = el('div', { style: { textAlign: 'center', cursor: 'pointer' } });
    const imgUrl = artist.images?.[2]?.url || artist.images?.[0]?.url;
    const art = el('div', {
      style: css({
        width: '100%', aspectRatio: '1', borderRadius: '50%',
        background: S.surface2, overflow: 'hidden', marginBottom: '8px',
      })
    });
    if (imgUrl) art.innerHTML = `<img src="${imgUrl}" width="100%" height="100%" style="object-fit:cover" loading="lazy" />`;

    card.appendChild(art);
    card.appendChild(el('div', { style: { fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, artist.name));
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// --- OPEN PLAYLIST ---
async function openPlaylist(pl) {
  state.currentPlaylistId = pl.id;
  root.innerHTML = '';

  const wrap = el('div', { style: { height: '100dvh', display: 'flex', flexDirection: 'column', background: S.bg } });

  const header = el('div', { style: { padding: '56px 20px 16px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: '0' } });
  const back = el('button', {
    style: { background: 'none', border: 'none', color: S.text, cursor: 'pointer', padding: '4px' },
    onClick: renderLibrary,
  });
  back.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>`;

  const imgUrl = pl.images?.[0]?.url;
  const art = el('div', { style: { width: '56px', height: '56px', borderRadius: '8px', background: S.surface2, overflow: 'hidden', flexShrink: '0' } });
  if (imgUrl) art.innerHTML = `<img src="${imgUrl}" width="56" height="56" style="object-fit:cover" />`;

  const titleWrap = el('div', { style: { flex: '1' } },
    el('div', { style: { fontSize: '17px', fontWeight: '700' } }, pl.name),
    el('div', { style: { fontSize: '12px', color: S.textMuted, marginTop: '2px' } }, `${pl.tracks?.total || 0} songs`)
  );

  header.appendChild(back);
  header.appendChild(art);
  header.appendChild(titleWrap);
  wrap.appendChild(header);

  const content = el('div', { style: { flex: '1', overflowY: 'auto', padding: '0 0 144px', WebkitOverflowScrolling: 'touch' } });
  content.appendChild(el('div', { style: { textAlign: 'center', padding: '40px', color: S.textMuted, fontSize: '14px' } }, 'Loading tracks...'));

  wrap.appendChild(content);
  wrap.appendChild(renderBottomNav());
  root.appendChild(wrap);
  renderMiniPlayerOnly();

  try {
    const data = await spotifyFetch(`/playlists/${pl.id}/tracks?limit=50`);
    const tracks = data.items.map(i => i.track).filter(Boolean);
    content.innerHTML = '';
    tracks.forEach((track, i) => {
      const manifest = findManifestMatch(track);
      const available = manifest && manifest.mp3Url;
      const row = el('div', {
        style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', opacity: available ? '1' : '0.45', cursor: available ? 'pointer' : 'default' },
        onClick: available ? () => playSong(track, manifest) : null,
      });
      const imgUrl2 = track.album?.images?.[2]?.url;
      const art2 = el('div', { style: { width: '46px', height: '46px', borderRadius: '6px', background: S.surface2, flexShrink: '0', overflow: 'hidden' } });
      if (imgUrl2) art2.innerHTML = `<img src="${imgUrl2}" width="46" height="46" loading="lazy" />`;
      row.appendChild(art2);
      row.appendChild(el('div', { style: { flex: '1', overflow: 'hidden' } },
        el('div', { style: { fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, track.name),
        el('div', { style: { fontSize: '12px', color: S.textMuted, marginTop: '2px' } }, track.artists?.map(a=>a.name).join(', '))
      ));
      if (available) {
        const badge = el('div', { style: { fontSize: '10px', fontWeight: '700', color: S.green, background: 'rgba(29,185,84,0.1)', borderRadius: '5px', padding: '3px 7px' } }, 'G♮');
        row.appendChild(badge);
      }
      content.appendChild(row);
    });
  } catch(e) {
    content.innerHTML = '<div style="text-align:center;padding:40px;color:#606060">Could not load tracks</div>';
  }
}

// --- SEARCH ---
async function renderSearch() {
  root.innerHTML = '';
  state.screen = 'search';

  const wrap = el('div', { style: { height: '100dvh', display: 'flex', flexDirection: 'column', background: S.bg } });

  const header = el('div', { style: { padding: '56px 20px 12px', flexShrink: '0' } });
  header.appendChild(el('h1', { style: { fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '16px' } }, 'Search'));

  const searchWrap = el('div', { style: { position: 'relative' } });
  searchWrap.innerHTML = `<svg style="position:absolute;left:14px;top:50%;transform:translateY(-50%);opacity:0.5" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;
  const input = el('input', {
    style: css({
      width: '100%', padding: '14px 14px 14px 44px',
      background: S.surface2, border: `1px solid ${S.border}`,
      borderRadius: '12px', color: S.text, fontSize: '15px',
      fontFamily: "'DM Sans',sans-serif", outline: 'none',
    }),
    placeholder: 'Songs, artists, playlists...',
  });
  input.value = state.searchQuery;
  searchWrap.appendChild(input);
  header.appendChild(searchWrap);
  wrap.appendChild(header);

  const content = el('div', { style: { flex: '1', overflowY: 'auto', padding: '8px 0 144px', WebkitOverflowScrolling: 'touch' } });
  wrap.appendChild(content);
  wrap.appendChild(renderBottomNav());
  root.appendChild(wrap);
  renderMiniPlayerOnly();

  async function doSearch(q) {
    state.searchQuery = q;
    content.innerHTML = '';
    if (!q.trim()) return;
    content.appendChild(el('div', { style: { textAlign: 'center', padding: '40px', color: S.textMuted, fontSize: '14px' } }, 'Searching...'));
    // Use Spotify search API directly for full library coverage
    try {
      const encoded = encodeURIComponent(q);
      const data = await spotifyFetch(`/search?q=${encoded}&type=track,playlist,artist&limit=20`);
      content.innerHTML = '';
      const songs = (data.tracks?.items || []).filter(Boolean);
      const playlists = (data.playlists?.items || []).filter(Boolean);
      const artists = (data.artists?.items || []).filter(Boolean);

    if (songs.length) {
      content.appendChild(el('div', { style: { padding: '12px 20px 6px', fontSize: '13px', fontWeight: '700', color: S.textMuted, letterSpacing: '0.5px' } }, 'SONGS'));
      songs.forEach((track, i) => {
        const manifest = findManifestMatch(track);
        const available = manifest && manifest.mp3Url;
        const row = el('div', {
          style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', opacity: available ? '1' : '0.5', cursor: available ? 'pointer' : 'default' },
          onClick: available ? () => playSong(track, manifest) : null,
        });
        const imgUrl = track.album?.images?.[2]?.url;
        const art = el('div', { style: { width: '46px', height: '46px', borderRadius: '6px', background: S.surface2, flexShrink: '0', overflow: 'hidden' } });
        if (imgUrl) art.innerHTML = `<img src="${imgUrl}" width="46" height="46" loading="lazy" />`;
        row.appendChild(art);
        row.appendChild(el('div', { style: { flex: '1', overflow: 'hidden' } },
          el('div', { style: { fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, track.name),
          el('div', { style: { fontSize: '12px', color: S.textMuted, marginTop: '2px' } }, track.artists?.map(a=>a.name).join(', '))
        ));
        if (available) row.appendChild(el('div', { style: { fontSize: '10px', fontWeight: '700', color: S.green, background: 'rgba(29,185,84,0.1)', borderRadius: '5px', padding: '3px 7px' } }, 'G♮'));
        content.appendChild(row);
      });
    }

    if (playlists.length) {
      content.appendChild(el('div', { style: { padding: '16px 20px 6px', fontSize: '13px', fontWeight: '700', color: S.textMuted, letterSpacing: '0.5px' } }, 'PLAYLISTS'));
      playlists.forEach(pl => {
        const row = el('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', cursor: 'pointer' }, onClick: () => openPlaylist(pl) });
        const imgUrl = pl.images?.[0]?.url;
        const art = el('div', { style: { width: '46px', height: '46px', borderRadius: '6px', background: S.surface2, flexShrink: '0', overflow: 'hidden' } });
        if (imgUrl) art.innerHTML = `<img src="${imgUrl}" width="46" height="46" />`;
        row.appendChild(art);
        row.appendChild(el('div', { style: { flex: '1' } },
          el('div', { style: { fontSize: '14px', fontWeight: '500' } }, pl.name),
          el('div', { style: { fontSize: '12px', color: S.textMuted } }, `${pl.tracks?.total} songs`)
        ));
        content.appendChild(row);
      });
    }
    } catch(e) {
      content.innerHTML = '';
      content.appendChild(el('div', { style: { textAlign: 'center', padding: '40px', color: S.textMuted, fontSize: '14px' } }, 'Search failed. Try again.'));
    }
  }


  let debounce;
  input.addEventListener('input', e => {
    clearTimeout(debounce);
    debounce = setTimeout(() => doSearch(e.target.value), 250);
  });
  if (state.searchQuery) doSearch(state.searchQuery);
  setTimeout(() => input.focus(), 100);
}

// --- PLAY SONG ---
async function playSong(track, manifest) {
  state.currentTrack = track;
  state.currentManifest = manifest;
  state.pitchOffset = 0;
  state.nowPlayingMode = 'noli';
  state.manualSemitone = 0;
  state.audioLoading = true;
  state.screen = 'nowplaying';
  stopAudio();
  audioBuffer = null;
  renderNowPlaying();
  try {
    await loadAudio(manifest.mp3Url);
    state.audioLoading = false;
    const loadingEl = document.getElementById('np-loading');
    if (loadingEl) loadingEl.style.display = 'none';
    playAudio(getActiveShift(), 0);
    updateNowPlayingAudioState();
  } catch(e) {
    state.audioLoading = false;
    const loadingEl = document.getElementById('np-loading');
    if (loadingEl) { loadingEl.style.display = 'flex'; loadingEl.textContent = 'Could not load audio'; }
  }
}

// ── NOW PLAYING ──────────────────────────────────────────────────────────────

function getActiveShift() {
  const manifest = state.currentManifest;
  if (!manifest) return 0;
  if (state.nowPlayingMode === 'original') return 0;
  if (state.nowPlayingMode === 'manual') return state.manualSemitone;
  return manifest.semitonsToG + state.pitchOffset; // noli
}

function getDisplayKey() {
  const manifest = state.currentManifest;
  if (!manifest || state.nowPlayingMode === 'original') return null;
  const shift = getActiveShift();
  return semitoneToKey(manifest.originalKey, shift);
}

function formatKeyShort(key) {
  if (!key) return '';
  return key
    .replace(' major', '')
    .replace(' minor', 'm')
    .replace('# ', '#');
}

const ALL_KEYS_DISPLAY = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const ALL_KEYS_FULL = ['C major','C# major','D major','D# major','E major','F major','F# major','G major','G# major','A major','A# major','B major'];

function applyCurrentShift() {
  const shift = getActiveShift();
  if (isPlaying || pauseOffset > 0) {
    const offset = isPlaying ? getCurrentTime() : pauseOffset;
    const wasPlaying = isPlaying;
    stopAudio();
    pauseOffset = offset;
    if (wasPlaying) playAudio(shift, offset);
  }
  // Apply volume
  if (window._gainNode) window._gainNode.gain.value = state.volume;
}

function updateNowPlayingAudioState() {
  const playBtn = document.getElementById('np-play-btn');
  if (playBtn) {
    playBtn.innerHTML = isPlaying
      ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
      : `<svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>`;
  }
}

function renderNowPlayingControls() {
  updateNowPlayingAudioState();
}

function renderNowPlaying() {
  root.innerHTML = '';
  state.screen = 'nowplaying';
  onTimeUpdate = null;

  const track = state.currentTrack;
  const manifest = state.currentManifest;
  if (!track) { renderLibrary(); return; }

  const imgUrl = track.album?.images?.[0]?.url;

  // Outer wrapper — full screen, dark gradient bg with album art blur
  const wrap = el('div', {
    style: {
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: S.bg, position: 'relative', overflow: 'hidden',
    }
  });

  // Blurred album art background
  if (imgUrl) {
    const bgArt = el('div', {
      style: {
        position: 'absolute', inset: '0', zIndex: '0',
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(60px) saturate(1.4)',
        opacity: '0.25', transform: 'scale(1.1)',
      }
    });
    wrap.appendChild(bgArt);
  }

  // Dark overlay
  wrap.appendChild(el('div', {
    style: { position: 'absolute', inset: '0', zIndex: '1', background: 'linear-gradient(180deg, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.92) 55%, #0a0a0a 100%)' }
  }));

  // Scrollable content layer
  const scroll = el('div', {
    style: {
      position: 'relative', zIndex: '2', flex: '1',
      overflowY: 'auto', WebkitOverflowScrolling: 'touch',
      paddingBottom: '96px', display: 'flex', flexDirection: 'column',
    }
  });

  // ── Top bar ──
  const topBar = el('div', {
    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 24px 0' }
  });
  const downBtn = el('button', {
    style: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '8px', display: 'flex' },
    onClick: () => { state.screen = 'library'; renderLibrary(); }
  });
  downBtn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z"/></svg>`;
  topBar.appendChild(downBtn);
  topBar.appendChild(el('div', { style: { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' } }, 'NOW PLAYING'));
  topBar.appendChild(el('div', { style: { width: '38px' } }));
  scroll.appendChild(topBar);

  // ── Album Art ──
  const artSize = 'min(calc(100vw - 64px), 300px)';
  const artWrap = el('div', {
    style: {
      margin: '28px auto 0', width: artSize, height: artSize,
      borderRadius: '18px', overflow: 'hidden', flexShrink: '0',
      boxShadow: '0 32px 64px rgba(0,0,0,0.7)',
      background: S.surface2,
    }
  });
  if (imgUrl) {
    artWrap.innerHTML = `<img src="${imgUrl}" width="100%" height="100%" style="object-fit:cover;display:block" crossorigin="anonymous" />`;
  } else {
    artWrap.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#1f1f1f"><svg width="48" height="48" viewBox="0 0 24 24" fill="#404040"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`;
  }
  scroll.appendChild(artWrap);

  // ── Track Info ──
  const infoWrap = el('div', { style: { padding: '20px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } });
  const infoLeft = el('div', { style: { flex: '1', overflow: 'hidden', marginRight: '16px' } });
  infoLeft.appendChild(el('div', { style: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#fff' } }, track.name));
  infoLeft.appendChild(el('div', { style: { fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, track.artists?.map(a => a.name).join(', ')));
  infoWrap.appendChild(infoLeft);
  scroll.appendChild(infoWrap);

  // ── Noli / Original / Manual toggle ──
  const modeWrap = el('div', { style: { margin: '20px 24px 0' } });
  const modePill = el('div', {
    style: {
      display: 'flex', background: 'rgba(255,255,255,0.08)',
      borderRadius: '12px', padding: '3px', gap: '2px',
    }
  });
  ['noli', 'original', 'manual'].forEach(mode => {
    const labels = { noli: 'Noli', original: 'Original', manual: 'Manual' };
    const active = state.nowPlayingMode === mode;
    const btn = el('button', {
      style: {
        flex: '1', padding: '9px 4px', borderRadius: '9px', border: 'none',
        background: active ? '#fff' : 'none',
        color: active ? '#000' : 'rgba(255,255,255,0.55)',
        fontSize: '13px', fontWeight: '700', fontFamily: "'DM Sans',sans-serif",
        cursor: 'pointer', transition: 'all 0.15s',
      },
      onClick: () => {
        state.nowPlayingMode = mode;
        applyCurrentShift();
        renderNowPlaying();
      }
    }, labels[mode]);
    modePill.appendChild(btn);
  });
  modeWrap.appendChild(modePill);
  scroll.appendChild(modeWrap);

  // ── Key Display (hidden in Original) ──
  if (state.nowPlayingMode !== 'original') {
    const displayKey = getDisplayKey();
    const keyInfo = KEY_DATA[displayKey] || { chords: [], warning: null };
    const shift = getActiveShift();

    const keyBlock = el('div', {
      style: { margin: '18px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
    });
    const keyLeft = el('div');
    keyLeft.appendChild(el('div', { style: { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', marginBottom: '4px' } }, 'KEY'));
    keyLeft.appendChild(el('div', { id: 'np-key-display', style: { fontSize: '36px', fontWeight: '800', color: S.green, letterSpacing: '-1px', lineHeight: '1' } }, formatKeyShort(displayKey)));
    const keyRight = el('div', { style: { textAlign: 'right' } });
    keyRight.appendChild(el('div', { style: { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', marginBottom: '4px' } }, 'SHIFT'));
    keyRight.appendChild(el('div', { id: 'np-shift-display', style: { fontSize: '36px', fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: '-1px', lineHeight: '1', fontFamily: "'DM Mono',monospace" } }, shift === 0 ? '0' : shift > 0 ? `+${shift}` : `${shift}`));
    keyBlock.appendChild(keyLeft);
    keyBlock.appendChild(keyRight);
    scroll.appendChild(keyBlock);

    // Chord badges
    if (keyInfo.chords.length > 0) {
      const chordRow = el('div', { style: { display: 'flex', gap: '8px', margin: '12px 24px 0', flexWrap: 'wrap' } });
      keyInfo.chords.forEach(chord => {
        chordRow.appendChild(el('div', {
          style: {
            padding: '7px 14px', borderRadius: '8px',
            background: 'rgba(29,185,84,0.12)', border: '1px solid rgba(29,185,84,0.3)',
            fontSize: '15px', fontWeight: '700', color: S.green,
          }
        }, chord));
      });
      scroll.appendChild(chordRow);
      if (keyInfo.warning) {
        scroll.appendChild(el('div', { style: { margin: '8px 24px 0', fontSize: '12px', color: '#f0a500' } }, '⚠ ' + keyInfo.warning));
      }
    }

    // ── Manual semitone selector ──
    if (state.nowPlayingMode === 'manual') {
      const manualWrap = el('div', { style: { margin: '16px 24px 0' } });
      manualWrap.appendChild(el('div', { style: { fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', marginBottom: '10px' } }, 'SELECT KEY'));
      const keyGrid = el('div', { style: { display: 'flex', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' } });
      ALL_KEYS_DISPLAY.forEach((k, i) => {
        const semitoneVal = i - 5; // map C=−5 ... G=0 ... B=+6 relative to G
        const targetSemitone = ALL_KEYS_FULL[i];
        const isActive = formatKeyShort(getDisplayKey()) === k || (k === 'G' && state.manualSemitone === 0 && state.nowPlayingMode === 'manual' && !state.manualSemitone);
        const activeKey = formatKeyShort(getDisplayKey());
        const thisActive = (k === activeKey);
        const btn = el('button', {
          style: {
            flexShrink: '0', minWidth: '44px', height: '44px', borderRadius: '10px', border: 'none',
            background: thisActive ? S.green : 'rgba(255,255,255,0.08)',
            color: thisActive ? '#000' : 'rgba(255,255,255,0.7)',
            fontSize: '14px', fontWeight: '700', fontFamily: "'DM Sans',sans-serif", cursor: 'pointer',
          },
          onClick: () => {
            // Calculate semitones needed to reach this key from the song's original key
            const origIdx = ALL_KEYS_FULL.indexOf(manifest.originalKey);
            if (origIdx !== -1) {
              let diff = i - origIdx;
              if (diff > 6) diff -= 12;
              if (diff < -6) diff += 12;
              state.manualSemitone = diff;
            } else {
              state.manualSemitone = semitoneVal;
            }
            applyCurrentShift();
            renderNowPlaying();
          }
        }, k);
        keyGrid.appendChild(btn);
      });
      manualWrap.appendChild(keyGrid);
      scroll.appendChild(manualWrap);
    }

    // ── Noli mode: pitch nudge ──
    if (state.nowPlayingMode === 'noli') {
      const nudgeRow = el('div', { style: { margin: '14px 24px 0', display: 'flex', alignItems: 'center', gap: '12px' } });
      const minusBtn = el('button', {
        style: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' },
        onClick: () => {
          if (state.pitchOffset > -6) { state.pitchOffset--; applyCurrentShift(); renderNowPlaying(); }
        }
      });
      minusBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 13H5v-2h14v2z"/></svg>`;
      const track2 = el('div', { style: { flex: '1', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', position: 'relative' } });
      const fill = el('div', { style: { position: 'absolute', left: '0', top: '0', height: '100%', borderRadius: '2px', background: S.green, width: `${((state.pitchOffset + 6) / 12) * 100}%` } });
      track2.appendChild(fill);
      const plusBtn = el('button', {
        style: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' },
        onClick: () => {
          if (state.pitchOffset < 6) { state.pitchOffset++; applyCurrentShift(); renderNowPlaying(); }
        }
      });
      plusBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`;
      const resetBtn = el('button', {
        style: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: "'DM Sans',sans-serif", cursor: 'pointer', flexShrink: '0' },
        onClick: () => { state.pitchOffset = 0; applyCurrentShift(); renderNowPlaying(); }
      }, 'Reset');
      nudgeRow.appendChild(minusBtn);
      nudgeRow.appendChild(track2);
      nudgeRow.appendChild(plusBtn);
      nudgeRow.appendChild(resetBtn);
      scroll.appendChild(nudgeRow);
    }
  } else {
    // Original mode label
    scroll.appendChild(el('div', { style: { margin: '16px 24px 0', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' } }, 'Playing in original key'));
  }

  // ── Progress bar ──
  const progressWrap = el('div', { style: { margin: '20px 24px 0' } });
  const seekBar = el('div', { style: { height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer' } });
  const seekFill = el('div', { id: 'np-seek-fill', style: { position: 'absolute', left: '0', top: '0', height: '100%', borderRadius: '2px', background: '#fff', width: '0%' } });
  const seekThumb = el('div', { id: 'np-seek-thumb', style: { position: 'absolute', top: '50%', transform: 'translate(-50%,-50%)', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', left: '0%', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', display: 'none' } });
  seekBar.appendChild(seekFill);
  seekBar.appendChild(seekThumb);
  seekBar.addEventListener('click', e => {
    const rect = seekBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekAudio(getActiveShift(), pct);
  });
  seekBar.addEventListener('mouseenter', () => seekThumb.style.display = 'block');
  seekBar.addEventListener('mouseleave', () => seekThumb.style.display = 'none');
  progressWrap.appendChild(seekBar);
  const timeRow = el('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: '8px' } });
  timeRow.appendChild(el('span', { id: 'np-time-cur', style: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono',monospace" } }, '0:00'));
  timeRow.appendChild(el('span', { id: 'np-time-tot', style: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono',monospace" } }, '0:00'));
  progressWrap.appendChild(timeRow);
  scroll.appendChild(progressWrap);

  // Loading indicator
  const loadingEl = el('div', { id: 'np-loading', style: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '13px', display: state.audioLoading ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '8px 0' } });
  loadingEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg> Loading...`;
  scroll.appendChild(loadingEl);

  // ── Playback controls ──
  const controls = el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', margin: '20px 24px 0' } });

  const prevBtn = el('button', {
    style: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'rgba(255,255,255,0.55)', display: 'flex' },
    onClick: () => {}
  });
  prevBtn.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>`;

  const playBtn = el('button', {
    id: 'np-play-btn',
    style: {
      width: '68px', height: '68px', borderRadius: '50%',
      background: '#fff', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      flexShrink: '0',
    },
    onClick: () => {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (isPlaying) { pauseAudio(); }
      else { resumeAudio(getActiveShift()); }
      updateNowPlayingAudioState();
    }
  });
  playBtn.innerHTML = isPlaying
    ? `<svg width="28" height="28" viewBox="0 0 24 24" fill="black"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`
    : `<svg width="28" height="28" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z"/></svg>`;

  const nextBtn = el('button', {
    style: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'rgba(255,255,255,0.55)', display: 'flex' },
    onClick: () => {}
  });
  nextBtn.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>`;

  controls.appendChild(prevBtn);
  controls.appendChild(playBtn);
  controls.appendChild(nextBtn);
  scroll.appendChild(controls);

  // ── Volume slider ──
  const volWrap = el('div', { style: { margin: '20px 24px 0', display: 'flex', alignItems: 'center', gap: '10px' } });
  volWrap.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
  const volTrack = el('div', { style: { flex: '1', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer' } });
  const volFill = el('div', { id: 'np-vol-fill', style: { position: 'absolute', left: '0', top: '0', height: '100%', borderRadius: '2px', background: 'rgba(255,255,255,0.6)', width: `${state.volume * 100}%` } });
  volTrack.appendChild(volFill);
  volTrack.addEventListener('click', e => {
    const rect = volTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    state.volume = pct;
    volFill.style.width = `${pct * 100}%`;
    if (window._gainNode) window._gainNode.gain.value = pct;
  });
  const volHigh = el('div');
  volHigh.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  volWrap.appendChild(volTrack);
  volWrap.appendChild(volHigh);
  scroll.appendChild(volWrap);

  wrap.appendChild(scroll);
  wrap.appendChild(renderBottomNav());
  root.appendChild(wrap);

  // ── Progress update loop ──
  onTimeUpdate = () => {
    const cur = getCurrentTime();
    const dur = getDuration();
    const fill = document.getElementById('np-seek-fill');
    const thumb = document.getElementById('np-seek-thumb');
    const timeCur = document.getElementById('np-time-cur');
    const timeTot = document.getElementById('np-time-tot');
    const pct = dur > 0 ? (cur / dur) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.left = pct + '%';
    if (timeCur) timeCur.textContent = formatTime(cur);
    if (timeTot) timeTot.textContent = formatTime(dur);
    updateNowPlayingAudioState();
  };
  if (isPlaying) trackProgress();
}

// --- APP INIT ---
async function renderApp() {
  // Handle OAuth callback
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

renderApp();
