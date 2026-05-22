# NoliMusic 🎸

Play any song on guitar — no capo needed.

## Setup Instructions

### 1. Add Your Google Drive MP3 Links

Open `app.js` and find the `SONG_MANIFEST` array near the top.
For each song, replace `mp3Url: null` with your Google Drive direct link.

**How to get a direct Google Drive link:**
1. Upload your MP3 to Google Drive
2. Right-click the file → "Share" → "Anyone with the link"
3. Copy the link — it looks like: `https://drive.google.com/file/d/FILE_ID/view`
4. Convert it to a direct download link: `https://drive.google.com/uc?export=download&id=FILE_ID`
5. Paste that converted URL as the `mp3Url` value

### 2. Deploy to Netlify

1. Go to netlify.com and create a free account
2. Drag and drop your entire `nolimusic` folder onto the Netlify deploy area
3. Netlify will give you a URL — update your Spotify app's Redirect URI to match it
4. Also update `REDIRECT_URI` in `app.js` to match your Netlify URL

### 3. Update Spotify Redirect URI

1. Go to developer.spotify.com/dashboard
2. Open your NoliMusic app
3. Edit settings → add your Netlify URL as a Redirect URI

### 4. Install on iPhone

1. Open your Netlify URL in Safari
2. Tap the Share button (box with arrow)
3. Tap "Add to Home Screen"
4. Tap "Add" — NoliMusic is now on your home screen!

## The 10 Songs

| # | Song | Artist | Original Key | Shift to G |
|---|------|--------|-------------|------------|
| 1 | Cooler Than Me | Mike Posner | F major | +2 |
| 2 | Human | The Killers | A major | -2 |
| 3 | Marvin's Room | Drake | F minor | +2 |
| 4 | Fast Car | Tracy Chapman | A major | -2 |
| 5 | Hey There Delilah | Plain White T's | D major | -7 |
| 6 | Landslide | Fleetwood Mac | C major | +7 |
| 7 | Dreams | Fleetwood Mac | F major | +2 |
| 8 | You've Got a Friend | James Taylor | A major | -2 |
| 9 | Stay | The Kid LAROI & Justin Bieber | C# major | -5 |
| 10 | Silver Springs | Fleetwood Mac | E minor | +3 |

## Notes

- Songs with a green G♮ badge are available for pitch-shifted playback
- Grey songs are in your Spotify library but not yet in the prototype
- Use the +/- buttons on Now Playing to manually shift the key
- "Reset to G Major" returns to the recommended default
- Tempo never changes — only the pitch shifts
