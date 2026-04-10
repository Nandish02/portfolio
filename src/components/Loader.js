import React, { useEffect, useState } from 'react';

const Loader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 900;

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
        }, 350);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-navy-900 flex flex-col items-center justify-center transition-opacity duration-300 ${
        phase === 'revealing' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="mb-8">
        <span className="font-heading text-4xl font-bold">
          <span className="gradient-text">NC</span>
          <span className="text-gray-600">.dev</span>
        </span>
      </div>

      <div className="w-48 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6)',
            transition: 'width 60ms linear',
          }}
        />
      </div>
    </div>
  );
};

export default Loader;
