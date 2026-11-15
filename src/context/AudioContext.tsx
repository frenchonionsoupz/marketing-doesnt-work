import { createContext, useContext, useRef, useState, useEffect, type ReactNode } from 'react';
import { TRACKS, type Track } from '../data/tracks';

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface AudioContextValue {
  currentTrack: Track | null;
  muted: boolean;
  playing: boolean;
  nowPlayingVisible: boolean;
  toggleMute: () => void;
  skipTrack: () => void;
}

const AudioCtx = createContext<AudioContextValue>({
  currentTrack: null,
  muted: false,
  playing: false,
  nowPlayingVisible: false,
  toggleMute: () => {},
  skipTrack: () => {},
});

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<Track[]>([]);
  const indexRef = useRef(0);
  const failCountRef = useRef(0);
  const npTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [nowPlayingVisible, setNowPlayingVisible] = useState(false);

  // Stable ref function — avoids stale closures in event listeners
  const playIndexRef = useRef<(idx: number) => void>(() => {});
  playIndexRef.current = (idx: number) => {
    const track = playlistRef.current[idx];
    const audio = audioRef.current;
    if (!track || !audio) return;

    indexRef.current = idx;
    audio.src = `https://wcmbywfvikobgyebxmmx.supabase.co/storage/v1/object/public/audio/${encodeURIComponent(track.file)}`;
    audio.play()
      .then(() => {
        setPlaying(true);
        setCurrentTrack(track);
        setNowPlayingVisible(true);
        clearTimeout(npTimerRef.current);
        npTimerRef.current = setTimeout(() => setNowPlayingVisible(false), 4000);
      })
      .catch(() => {
        // Autoplay blocked (or load failed — the 'error' listener handles that).
        // Will resume on next user interaction.
        setPlaying(false);
        setCurrentTrack(track);
      });
  };

  useEffect(() => {
    if (TRACKS.length === 0) return;

    const shuffled = shuffle(TRACKS);
    playlistRef.current = shuffled;

    const audio = new Audio();
    audio.volume = 0.5;
    audioRef.current = audio;

    const onEnded = () => {
      const next = indexRef.current + 1;
      if (next >= playlistRef.current.length) {
        // Every track played — stop for this session
        setPlaying(false);
        setCurrentTrack(null);
        return;
      }
      playIndexRef.current(next);
    };

    // A track failed to load (missing file, bad name, bucket not public) — skip it
    const onError = () => {
      const track = playlistRef.current[indexRef.current];
      console.error('[audio] failed to load track:', track?.file, audio.error);
      failCountRef.current += 1;
      if (failCountRef.current >= playlistRef.current.length) {
        console.error('[audio] every track failed to load — check the Supabase "audio" bucket is public and filenames match src/data/tracks.ts');
        setPlaying(false);
        return;
      }
      const next = (indexRef.current + 1) % playlistRef.current.length;
      playIndexRef.current(next);
    };
    const onPlaying = () => { failCountRef.current = 0; setPlaying(true); };

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('playing', onPlaying);
    playIndexRef.current(0);

    return () => {
      clearTimeout(npTimerRef.current);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('playing', onPlaying);
      audio.pause();
    };
  }, []);

  // If browser blocked autoplay, keep retrying on user interaction until it plays.
  // Capture phase so buttons that call stopPropagation() still count.
  useEffect(() => {
    if (playing) return;
    const resume = () => {
      const audio = audioRef.current;
      if (!audio || !audio.paused || !audio.src) return;
      audio.play()
        .then(() => {
          setPlaying(true);
          const track = playlistRef.current[indexRef.current];
          if (track) {
            setCurrentTrack(track);
            setNowPlayingVisible(true);
            clearTimeout(npTimerRef.current);
            npTimerRef.current = setTimeout(() => setNowPlayingVisible(false), 4000);
          }
        })
        .catch(() => {});
    };

    const events = ['pointerdown', 'click', 'keydown', 'touchstart'] as const;
    events.forEach(ev => document.addEventListener(ev, resume, { capture: true }));
    return () => {
      events.forEach(ev => document.removeEventListener(ev, resume, { capture: true }));
    };
  }, [playing]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !muted;
    audioRef.current.muted = newMuted;
    setMuted(newMuted);
  };

  const skipTrack = () => {
    const next = indexRef.current + 1;
    if (next < playlistRef.current.length) {
      playIndexRef.current(next);
    }
  };

  return (
    <AudioCtx.Provider value={{ currentTrack, muted, playing, nowPlayingVisible, toggleMute, skipTrack }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
