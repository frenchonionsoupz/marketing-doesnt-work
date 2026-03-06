interface OracleSvgProps {
  width?: number;
  height?: number;
}

export function OracleSvg({ width = 80, height = 100 }: OracleSvgProps) {
  return (
    <svg width={width} height={height} viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      {/* Robe */}
      <rect x="20" y="44" width="40" height="50" fill="#2a1a6e"/>
      <rect x="16" y="50" width="8" height="36" fill="#2a1a6e"/>
      <rect x="56" y="50" width="8" height="36" fill="#2a1a6e"/>
      <rect x="36" y="44" width="8" height="50" fill="#3a2a8e" opacity="0.5"/>
      {/* Body */}
      <rect x="24" y="28" width="32" height="20" fill="#c4a882"/>
      {/* Head */}
      <rect x="24" y="8" width="32" height="28" fill="#c4a882"/>
      {/* Hood */}
      <rect x="16" y="4" width="48" height="20" fill="#1a0a5e"/>
      <rect x="20" y="0" width="40" height="12" fill="#1a0a5e"/>
      {/* Glowing eyes */}
      <rect x="30" y="16" width="8" height="8" fill="#57f7ff"/>
      <rect x="42" y="16" width="8" height="8" fill="#57f7ff"/>
      <rect x="32" y="18" width="4" height="4" fill="#fff"/>
      <rect x="44" y="18" width="4" height="4" fill="#fff"/>
      {/* Staff */}
      <rect x="64" y="20" width="4" height="76" fill="#8b6914"/>
      <rect x="60" y="16" width="12" height="4" fill="#8b6914"/>
      {/* Orb */}
      <rect x="62" y="8" width="8" height="8" fill="#57f7ff"/>
      <rect x="64" y="10" width="4" height="4" fill="#fff" opacity="0.6"/>
      {/* Stars on robe */}
      <rect x="28" y="56" width="4" height="4" fill="#ffdd57" opacity="0.7"/>
      <rect x="44" y="64" width="4" height="4" fill="#ffdd57" opacity="0.7"/>
      <rect x="32" y="72" width="4" height="4" fill="#57f7ff" opacity="0.7"/>
    </svg>
  );
}
