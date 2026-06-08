import React, { useEffect, useState } from 'react';

const Loader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 1100;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const pct = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - pct, 4);
      setProgress(Math.round(eased * 100));

      if (pct < 1) {
        frame = requestAnimationFrame(step);
      } else {
        setPhase('revealing');
        setTimeout(() => {
          setPhase('done');
          onComplete();
        }, 500);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  if (phase === 'done') return null;

  const letters = 'NC.dev'.split('');

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-all duration-500 ${
        phase === 'revealing' ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'
      }`}
      style={{
        background: 'linear-gradient(-134deg, #002025 0%, #3f3251 98%)',
      }}
    >
      {/* Morphing background blob */}
      <div
        className="absolute w-[300px] h-[300px] animate-morph opacity-[0.08]"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #818CF8)' }}
      />

      {/* Logo letters with stagger */}
      <div className="mb-8 flex items-baseline">
        {letters.map((letter, i) => (
          <span
            key={i}
            className="font-heading text-4xl font-bold"
            style={{
              display: 'inline-block',
              animation: `bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms forwards`,
              opacity: 0,
              color: i < 2 ? '#818CF8' : 'rgba(255,255,255,0.5)',
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-48 h-[3px] rounded-full overflow-hidden relative" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #818CF8)',
            transition: 'width 80ms linear',
          }}
        >
          <div className="absolute inset-0 shimmer" />
        </div>
      </div>
    </div>
  );
};

export default Loader;
