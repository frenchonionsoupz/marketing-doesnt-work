import { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { TRACKS } from '../data/tracks';

export function AudioPlayer() {
  const { currentTrack, muted, toggleMute, nowPlayingVisible } = useAudio();
  const [hovered, setHovered] = useState(false);

  // Nothing to render if no tracks configured
  if (TRACKS.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9998, // below scanlines overlay (9999), above everything else
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
      pointerEvents: 'none',
    }}>
      {/* Now Playing toast — slides in when a new track starts */}
      <div style={{
        pointerEvents: 'none',
        opacity: nowPlayingVisible && currentTrack ? 1 : 0,
        transform: nowPlayingVisible && currentTrack ? 'translateX(0)' : 'translateX(28px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        background: 'rgba(6,6,30,0.96)',
        border: '2px solid #ffdd57',
        padding: '8px 12px',
        maxWidth: '200px',
        boxShadow: '0 0 20px rgba(255,221,87,0.15)',
      }}>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '5px',
          color: '#8888aa',
          letterSpacing: '2px',
          marginBottom: '5px',
        }}>
          ♫ NOW PLAYING
        </div>
        <div style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          color: '#ffdd57',
          lineHeight: '1.7',
          wordBreak: 'break-word',
        }}>
          {currentTrack?.name ?? ''}
        </div>
      </div>

      {/* Mute/unmute — always visible, fades when not hovered */}
      <button
        onClick={toggleMute}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={muted ? 'Unmute music' : 'Mute music'}
        style={{
          pointerEvents: 'all',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '10px',
          padding: '7px 10px',
          background: 'rgba(6,6,30,0.88)',
          border: `2px solid ${muted ? '#2a2a5a' : '#ffdd57'}`,
          color: muted ? '#2a2a5a' : '#ffdd57',
          cursor: 'pointer',
          letterSpacing: '1px',
          lineHeight: 1,
          // Fades to 30% when not hovered, fully visible on hover
          opacity: hovered ? 1 : 0.3,
          transition: 'opacity 0.35s ease, border-color 0.2s, color 0.2s',
        }}
      >
        {muted ? '✕♫' : '♫'}
      </button>
    </div>
  );
}
