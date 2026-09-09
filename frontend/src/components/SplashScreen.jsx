import React, { useEffect, useState, useRef } from 'react';

/* ── Random petals generated once ── */
const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: Math.random() * 14 + 8,
  delay: Math.random() * 5,
  duration: Math.random() * 6 + 7,
  rotate: Math.random() * 360,
  drift: (Math.random() - 0.5) * 120,
  opacity: Math.random() * 0.5 + 0.35,
}));

const SPARKLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 4 + 2,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

export const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter');
  const containerRef = useRef(null);

  /* Mouse parallax */
  const handleMouseMove = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX / width - 0.5) * 2;   // -1 to 1
    const yPct = (clientY / height - 0.5) * 2;
    el.style.setProperty('--px', xPct);
    el.style.setProperty('--py', yPct);
  };

  useEffect(() => {
    const exitTimer = setTimeout(() => setPhase('exit'), 3200);
    const doneTimer = setTimeout(() => onFinish(), 4100);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onFinish]);

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        overflow: 'hidden', cursor: 'default',
        animation: phase === 'exit' ? 'splashOut 0.9s ease forwards' : undefined,
      }}
    >
      <style>{`
        /* ─── Exit ─── */
        @keyframes splashOut {
          to { opacity: 0; transform: scale(1.05); }
        }

        /* ─── BG slow zoom ─── */
        @keyframes bgZoom {
          0%   { transform: scale(1.12); }
          100% { transform: scale(1.0); }
        }

        /* ─── Parallax layer ─── */
        .parallax-bg {
          transform: translate(
            calc(var(--px, 0) * -14px),
            calc(var(--py, 0) * -10px)
          ) scale(1.08);
          transition: transform 0.08s linear;
        }

        /* ─── Petal fall ─── */
        @keyframes petalFall {
          0%   { transform: translateY(-60px) rotate(0deg)   translateX(0px);   opacity: 0; }
          10%  { opacity: var(--op); }
          90%  { opacity: var(--op); }
          100% { transform: translateY(110vh) rotate(540deg) translateX(var(--drift)); opacity: 0; }
        }

        /* ─── Sparkle pulse ─── */
        @keyframes sparklePulse {
          0%,100% { transform: scale(0.4); opacity: 0; }
          50%      { transform: scale(1.2); opacity: 0.9; }
        }

        /* ─── Icon drop-in ─── */
        @keyframes iconIn {
          0%   { transform: perspective(600px) rotateX(-70deg) translateY(-30px); opacity: 0; }
          65%  { transform: perspective(600px) rotateX(10deg)  translateY(4px);   opacity: 1; }
          100% { transform: perspective(600px) rotateX(0deg)   translateY(0);     opacity: 1; }
        }

        /* ─── Ring pulse ─── */
        @keyframes ringPulse {
          0%,100% { transform: scale(1);    opacity: 0.35; }
          50%      { transform: scale(1.22); opacity: 0.10; }
        }

        /* ─── Orbit dot ─── */
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(54px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(54px) rotate(-360deg); }
        }

        /* ─── "WELCOME TO" slide up ─── */
        @keyframes subtitleIn {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* ─── Title 3-D flip ─── */
        @keyframes titleFlip {
          0%   { opacity: 0; transform: perspective(1000px) rotateY(-90deg) translateX(-40px); }
          60%  { opacity: 1; transform: perspective(1000px) rotateY(8deg)   translateX(4px); }
          100% { opacity: 1; transform: perspective(1000px) rotateY(0deg)   translateX(0); }
        }

        /* ─── Shimmer sweep ─── */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        /* ─── Tagline fade ─── */
        @keyframes tagIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── Progress bar ─── */
        @keyframes barFill {
          from { width: 0%; }
          to   { width: 100%; }
        }

        /* ─── Gold divider expand ─── */
        @keyframes lineExpand {
          from { width: 0; opacity: 0; }
          to   { width: 160px; opacity: 1; }
        }

        /* ─── Utility classes ─── */
        .s-icon      { animation: iconIn      0.75s cubic-bezier(.34,1.56,.64,1) 0.3s  both; }
        .s-subtitle  { animation: subtitleIn  0.6s  ease                         1.0s  both; }
        .s-title     { animation: titleFlip   1.0s  cubic-bezier(.34,1.56,.64,1) 1.2s  both,
                                  shimmer     2.8s  linear                        2.3s  infinite; }
        .s-divider   { animation: lineExpand  0.6s  ease                         2.1s  both; }
        .s-tagline   { animation: tagIn       0.7s  ease                         2.2s  both; }
        .s-bar       { animation: barFill     2.8s  cubic-bezier(.4,0,.2,1)      0.6s  both; }
        .s-ring1     { animation: ringPulse   2.2s  ease-in-out infinite; }
        .s-ring2     { animation: ringPulse   2.9s  ease-in-out 0.7s infinite; }
        .s-orbit-dot { animation: orbit       2.8s  linear infinite; }
      `}</style>

      {/* ── Layer 1: Photo background with parallax zoom ── */}
      <div
        ref={containerRef}
        className="parallax-bg"
        style={{
          position: 'absolute', inset: '-5%',
          backgroundImage: 'url(/splash_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'bgZoom 4s ease forwards',
          willChange: 'transform',
        }}
      />

      {/* ── Layer 2: Multi-stop dark overlay for readability ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 70% 70% at 50% 50%,
            rgba(0,0,0,0.45) 0%,
            rgba(0,0,0,0.70) 60%,
            rgba(0,0,0,0.88) 100%
          )
        `,
      }} />

      {/* ── Layer 3: Coloured vignette (burgundy tint) ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 100% 100% at 50% 0%,
            rgba(120,0,30,0.22) 0%,
            transparent 60%
          ),
          radial-gradient(ellipse 80% 60% at 50% 110%,
            rgba(80,0,20,0.30) 0%,
            transparent 60%
          )
        `,
      }} />

      {/* ── Layer 4: Falling rose petals ── */}
      {PETALS.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.65,
            borderRadius: '50% 50% 40% 60% / 60% 50% 50% 40%',
            background: `radial-gradient(circle at 35% 35%, #e879a0, #9f1239)`,
            boxShadow: '0 0 6px rgba(232,121,160,0.4)',
            '--op': p.opacity,
            '--drift': `${p.drift}px`,
            opacity: 0,
            animation: `petalFall ${p.duration}s ease-in ${p.delay}s infinite`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}

      {/* ── Layer 5: Gold sparkles ── */}
      {SPARKLES.map(s => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.id % 2 === 0 ? '#fcd34d' : '#fda4af',
            boxShadow: `0 0 ${s.size * 3}px ${s.id % 2 === 0 ? '#fbbf24' : '#fb7185'}`,
            animation: `sparklePulse ${s.duration}s ease-in-out ${s.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}

      {/* ── Layer 6: Centre content ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center',
      }}>

        {/* Camera icon with rings */}
        <div style={{ position: 'relative', marginBottom: 32, display: 'inline-block' }}>
          {/* Outer ring */}
          <div className="s-ring2" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 120, height: 120,
            marginLeft: -60, marginTop: -60,
            border: '1.5px solid rgba(252,211,77,0.35)',
            borderRadius: '50%',
          }} />
          {/* Inner ring */}
          <div className="s-ring1" style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 96, height: 96,
            marginLeft: -48, marginTop: -48,
            border: '2px solid rgba(252,211,77,0.55)',
            borderRadius: '50%',
          }} />
          {/* Orbiting dot */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 0, height: 0,
          }}>
            <div className="s-orbit-dot" style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#fcd34d',
              boxShadow: '0 0 10px #fbbf24',
              marginLeft: -4, marginTop: -4,
            }} />
          </div>

          {/* Icon button */}
          <div className="s-icon" style={{
            width: 78, height: 78,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #9f1239 0%, #be185d 50%, #831843 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(190,24,93,0.7), 0 0 70px rgba(190,24,93,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(252,211,77,0.4)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>

        {/* WELCOME TO */}
        <div className="s-subtitle" style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.5em',
          color: '#fcd34d',
          textTransform: 'uppercase',
          marginBottom: 10,
          fontFamily: 'system-ui, sans-serif',
          textShadow: '0 0 20px rgba(252,211,77,0.6)',
        }}>
          Welcome&nbsp;to
        </div>

        {/* PHOTOSHARE — 3D shimmer */}
        <div className="s-title" style={{
          fontSize: 'clamp(52px, 11vw, 96px)',
          fontWeight: 900,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #fff1f2 0%, #fecdd3 20%, #fcd34d 45%, #fff 60%, #fecdd3 80%, #fff1f2 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 24px rgba(252,211,77,0.45)) drop-shadow(0 2px 40px rgba(190,24,93,0.5))',
        }}>
          PhotoShare
        </div>

        {/* Gold divider */}
        <div className="s-divider" style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent, #fcd34d, #fb7185, #fcd34d, transparent)',
          borderRadius: 99,
          margin: '18px auto 0',
          boxShadow: '0 0 14px rgba(252,211,77,0.5)',
        }} />

        {/* Tagline */}
        <div className="s-tagline" style={{
          marginTop: 16,
          fontSize: 15,
          color: 'rgba(253,224,227,0.85)',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.07em',
          fontStyle: 'italic',
          textShadow: '0 1px 12px rgba(0,0,0,0.8)',
        }}>
          Your moments, beautifully shared.
        </div>

        {/* Progress bar */}
        <div style={{
          width: 220,
          height: 3,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          marginTop: 44,
          border: '1px solid rgba(252,211,77,0.12)',
        }}>
          <div className="s-bar" style={{
            height: '100%',
            background: 'linear-gradient(90deg, #9f1239, #be185d, #fcd34d)',
            borderRadius: 99,
            boxShadow: '0 0 14px rgba(252,211,77,0.7)',
          }} />
        </div>

        {/* Loading text */}
        <div className="s-tagline" style={{
          marginTop: 10,
          fontSize: 10,
          color: 'rgba(252,211,77,0.5)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontFamily: 'system-ui, sans-serif',
        }}>
          Loading…
        </div>
      </div>
    </div>
  );
};
