import { useEffect, useRef } from 'react';

export function SceneBackground() {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = starsRef.current;
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      const size = Math.random() < 0.7 ? 1 : 2;
      s.style.cssText = `width:${size}px;height:${size}px;top:${Math.random() * 70}%;left:${Math.random() * 100}%;--d:${1.5 + Math.random() * 3}s;--delay:${Math.random() * 4}s;opacity:${0.4 + Math.random() * 0.6}`;
      el.appendChild(s);
    }
  }, []);

  return (
    <>
      <div className="quest-bg" />
      <div className="rainbow-bar" />
      <div className="stars" ref={starsRef} />
      <div className="vignette" />
      <div className="mountains-fixed">
        <svg viewBox="0 0 1200 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="0,160 0,90 80,50 160,90 240,30 340,90 440,60 520,100 600,40 700,90 800,55 900,90 1000,30 1100,80 1200,60 1200,160" fill="#0d0d3b"/>
          <polygon points="0,160 0,110 100,80 200,110 280,70 380,110 480,85 560,120 640,75 740,110 840,80 940,110 1040,70 1140,105 1200,90 1200,160" fill="#12124a"/>
          <rect x="245" y="38" width="6" height="6" fill="#ffdd57" opacity="0.6"/>
          <rect x="605" y="48" width="6" height="6" fill="#57f7ff" opacity="0.4"/>
          <rect x="1005" y="38" width="6" height="6" fill="#ffdd57" opacity="0.5"/>
        </svg>
      </div>
    </>
  );
}
