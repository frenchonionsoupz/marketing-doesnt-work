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
  const resumedRef = useRef(false);
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
        // Autoplay blocked — will resume on first user interaction
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

    audio.addEventListener('ended', onEnded);
    playIndexRef.current(0);

    return () => {
      clearTimeout(npTimerRef.current);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  // If browser blocked autoplay, resume on first user interaction
  useEffect(() => {
    const resume = () => {
      if (resumedRef.current || playing) return;
      resumedRef.current = true;
      const audio = audioRef.current;
      if (!audio) return;

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

    document.addEventListener('click', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
    return () => {
      document.removeEventListener('click', resume);
      document.removeEventListener('keydown', resume);
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
