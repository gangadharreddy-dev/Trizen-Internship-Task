import React, { useEffect, useState, useRef } from 'react';

/* ── Photography Bokeh / Lens Flare Particles ── */
const BOKEH_LIGHTS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 18 + 8,
  delay: Math.random() * 4,
  duration: Math.random() * 5 + 6,
  driftX: (Math.random() - 0.5) * 60,
  driftY: -Math.random() * 50 - 20,
  opacity: Math.random() * 0.4 + 0.15,
  color: i % 3 === 0 ? '#fcd34d' : i % 3 === 1 ? '#93c5fd' : '#ffffff',
}));

const SPARKLES = Array.from({ length: 26 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 3.5 + 2,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

export const SplashScreen = ({ onFinish }) => {
  const [phase, setPhase] = useState('enter');
  const containerRef = useRef(null);

  /* Mouse parallax 3D effect */
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
        backgroundColor: '#020617',
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
          0%   { transform: scale(1.10); }
          100% { transform: scale(1.0); }
        }

        /* ─── Parallax layer ─── */
        .parallax-bg {
          transform: translate(
            calc(var(--px, 0) * -16px),
            calc(var(--py, 0) * -12px)
          ) scale(1.08);
          transition: transform 0.08s linear;
        }

        /* ─── Bokeh float ─── */
        @keyframes bokehFloat {
          0%   { transform: translateY(0) translateX(0) scale(0.9); opacity: 0; }
          20%  { opacity: var(--op); }
          80%  { opacity: var(--op); }
          100% { transform: translateY(var(--dy)) translateX(var(--dx)) scale(1.3); opacity: 0; }
        }

        /* ─── Sparkle pulse ─── */
        @keyframes sparklePulse {
          0%,100% { transform: scale(0.4); opacity: 0; }
          50%      { transform: scale(1.2); opacity: 0.85; }
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

        /* ─── Gold/Amber divider expand ─── */
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

      {/* ── Layer 1: Camera Photo Background with Parallax Zoom ── */}
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

      {/* ── Layer 2: Multi-stop Dark Vignette for Cinematic Depth ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 75% 75% at 50% 50%,
            rgba(0,0,0,0.40) 0%,
            rgba(0,0,0,0.72) 65%,
            rgba(0,0,0,0.92) 100%
          )
        `,
      }} />

      {/* ── Layer 3: Warm Amber & Cool Indigo Photography Atmosphere ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 90% 70% at 50% 15%,
            rgba(245, 158, 11, 0.14) 0%,
            transparent 60%
          ),
          radial-gradient(ellipse 80% 60% at 50% 85%,
            rgba(37, 99, 235, 0.16) 0%,
            transparent 65%
          )
        `,
      }} />

      {/* ── Layer 4: Floating Camera Bokeh / Lens Flare Particles ── */}
      {BOKEH_LIGHTS.map(b => (
        <div
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
            boxShadow: `0 0 ${b.size * 1.5}px ${b.color}`,
            '--op': b.opacity,
            '--dx': `${b.driftX}px`,
            '--dy': `${b.driftY}px`,
            filter: 'blur(1px)',
            opacity: 0,
            animation: `bokehFloat ${b.duration}s ease-in-out ${b.delay}s infinite`,
          }}
        />
      ))}

      {/* ── Layer 5: Gold & White Shutter Sparkles ── */}
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
            background: s.id % 2 === 0 ? '#fcd34d' : '#e2e8f0',
            boxShadow: `0 0 ${s.size * 3}px ${s.id % 2 === 0 ? '#fbbf24' : '#94a3b8'}`,
            animation: `sparklePulse ${s.duration}s ease-in-out ${s.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}

      {/* ── Layer 6: Centre Content ── */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center',
      }}>

        {/* Camera icon with rotating lens rings */}
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
          {/* Orbiting focus dot */}
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

          {/* Titanium & Blue Camera Emblem */}
          <div className="s-icon" style={{
            width: 78, height: 78,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 45%, #1d4ed8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(37,99,235,0.6), 0 0 70px rgba(252,211,77,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
            border: '1.5px solid rgba(252,211,77,0.5)',
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

        {/* PHOTOSHARE — 3D Metallic & Gold Shimmer Title */}
        <div className="s-title" style={{
          fontSize: 'clamp(52px, 11vw, 96px)',
          fontWeight: 900,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 20%, #fcd34d 45%, #ffffff 60%, #93c5fd 80%, #ffffff 100%)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 24px rgba(252,211,77,0.45)) drop-shadow(0 2px 40px rgba(15,23,42,0.8))',
        }}>
          PhotoShare
        </div>

        {/* Gold & Blue Horizon Divider */}
        <div className="s-divider" style={{
          height: 2,
          background: 'linear-gradient(90deg, transparent, #fcd34d, #60a5fa, #fcd34d, transparent)',
          borderRadius: 99,
          margin: '18px auto 0',
          boxShadow: '0 0 14px rgba(252,211,77,0.5)',
        }} />

        {/* Tagline */}
        <div className="s-tagline" style={{
          marginTop: 16,
          fontSize: 15,
          color: 'rgba(226,232,240,0.9)',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.07em',
          fontStyle: 'italic',
          textShadow: '0 1px 12px rgba(0,0,0,0.9)',
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
          border: '1px solid rgba(252,211,77,0.15)',
        }}>
          <div className="s-bar" style={{
            height: '100%',
            background: 'linear-gradient(90deg, #1d4ed8, #2563eb, #fcd34d)',
            borderRadius: 99,
            boxShadow: '0 0 14px rgba(252,211,77,0.7)',
          }} />
        </div>

        {/* Loading text */}
        <div className="s-tagline" style={{
          marginTop: 10,
          fontSize: 10,
          color: 'rgba(252,211,77,0.6)',
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
