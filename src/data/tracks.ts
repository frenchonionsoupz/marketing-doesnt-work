export interface Track {
  file: string; // filename inside public/audio/
  name: string; // displayed in "Now Playing"
}

// ─────────────────────────────────────────────
// Drop your .wav files into public/audio/ then
// list them here. Paste your filenames and I'll
// fill this in for you.
// ─────────────────────────────────────────────
export const TRACKS: Track[] = [
  // { file: 'my-track.wav', name: 'My Track' },
];
