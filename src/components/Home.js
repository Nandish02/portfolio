import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaGithub, FaEnvelope, FaLinkedin, FaFileAlt, FaArrowRight } from 'react-icons/fa';
import useParallax from '../useParallax';
import profilePhoto from '../Images/profile.jpg';

const FloatingShapes = () => {
  const shapes = [
    { type: 'circle', size: 6, x: '12%', y: '20%', delay: 0, duration: 10, color: '#4F46E5' },
    { type: 'square', size: 8, x: '85%', y: '15%', delay: 2, duration: 12, color: '#7C3AED' },
    { type: 'triangle', size: 10, x: '8%', y: '70%', delay: 4, duration: 14, color: '#818CF8' },
    { type: 'circle', size: 4, x: '90%', y: '65%', delay: 1, duration: 11, color: '#4F46E5' },
    { type: 'square', size: 5, x: '25%', y: '85%', delay: 3, duration: 13, color: '#7C3AED' },
    { type: 'circle', size: 7, x: '70%', y: '80%', delay: 5, duration: 9, color: '#818CF8' },
    { type: 'triangle', size: 6, x: '55%', y: '10%', delay: 2, duration: 15, color: '#4F46E5' },
    { type: 'square', size: 4, x: '40%', y: '90%', delay: 6, duration: 10, color: '#7C3AED' },
  ];

  return (
    <>
      {shapes.map((s, i) => (
        <div
          key={i}
          className="geo-shape"
          style={{
            left: s.x,
            top: s.y,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            width: s.type === 'triangle' ? 0 : s.size,
            height: s.type === 'triangle' ? 0 : s.size,
            ...(s.type === 'circle' && {
              borderRadius: '50%',
              backgroundColor: s.color,
            }),
            ...(s.type === 'square' && {
              borderRadius: '2px',
              backgroundColor: s.color,
              transform: 'rotate(45deg)',
            }),
            ...(s.type === 'triangle' && {
              borderLeft: `${s.size / 2}px solid transparent`,
              borderRight: `${s.size / 2}px solid transparent`,
              borderBottom: `${s.size}px solid ${s.color}`,
              backgroundColor: 'transparent',
            }),
          }}
        />
      ))}
    </>
  );
};

const useTypewriter = (text, speed = 60, startDelay = 400) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout;
    const startTimeout = setTimeout(() => {
      let idx = 0;
      const type = () => {
        if (idx <= text.length) {
          setDisplayed(text.slice(0, idx));
          idx++;
          timeout = setTimeout(type, speed);
        } else {
          setDone(true);
        }
      };
      type();
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
};

function Home() {
  const [mounted, setMounted] = useState(false);
  const parallaxOffset = useParallax(0.2);
  const { displayed: typedName, done: typingDone } = useTypewriter('Nandish Chokshi', 70, 600);

  useEffect(() => setMounted(true), []);

  const ctaRef = useRef(null);

  const handleMagnetic = useCallback((e) => {
    const btn = ctaRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
  }, []);

  const handleMagneticLeave = useCallback(() => {
    if (ctaRef.current) {
      ctaRef.current.style.transform = 'translate(0, 0) scale(1)';
    }
  }, []);

  const socials = [
    { icon: FaGithub, href: 'https://github.com/Nandish02', label: 'GitHub' },
    { icon: FaLinkedin, href: 'https://www.linkedin.com/in/nandish-chokshi-48435a179', label: 'LinkedIn' },
    { icon: FaEnvelope, href: 'mailto:nandishchokshi02@gmail.com', label: 'Email' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora mesh gradient background with parallax */}
      <div className="aurora-bg" style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}>
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Floating geometric shapes */}
      <FloatingShapes />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Profile photo + intro — side by side on desktop, stacked on mobile */}
        <div
          className={`flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-10 transition-all duration-700 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Photo */}
          <div className={`shrink-0 ${mounted ? 'animate-scale-reveal' : 'opacity-0'}`}>
            <div className="relative inline-block">
              <div
                className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent via-warm-violet to-accent bg-300% animate-gradient-x opacity-70 blur-[2px]"
              />
              <img
                src={profilePhoto}
                alt="Nandish Chokshi"
                className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 rounded-full object-cover border-4 border-card shadow-xl"
              />
            </div>
          </div>

          {/* Text block */}
          <div className="text-center md:text-left">
            <h1
              className="font-heading text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-tight mb-3"
              style={{ transform: `translateY(${parallaxOffset * -0.1}px)` }}
            >
              <span className="text-foreground">Hi, I'm </span>
              <span className="gradient-text whitespace-nowrap">
                {typedName}
              </span>
              {!typingDone && <span className="typewriter-cursor h-[0.85em]">&nbsp;</span>}
            </h1>

            <div
              className={`transition-all duration-700 ${
                mounted ? 'opacity-100 animate-blur-reveal animate-delay-300' : 'opacity-0'
              }`}
            >
              <p className="text-lg sm:text-xl text-muted-foreground">
                Masters in Computer Science @{' '}
                <a
                  href="https://cs.illinois.edu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent font-medium hover:underline underline-offset-2"
                >
                  UIUC
                </a>
              </p>
              <p className="text-sm text-muted-foreground/80 mt-2">
                Passionate about distributed systems, AI/ML, and building scalable software systems.
              </p>
            </div>
          </div>
        </div>

        {/* Descriptor tags */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-10 ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[
            { href: 'https://www.nutanix.com', label: 'Ex-Software Engineer @ Nutanix', color: 'accent', delay: '400ms' },
            { href: 'https://aiisc.ai', label: 'Former Research Intern @ AIISC', color: 'warm-violet', delay: '500ms' },
            { label: 'B.E. Computer Science, BITS Pilani', color: 'muted', delay: '600ms' },
          ].map((tag, i) => {
            const isLink = !!tag.href;
            const classes = `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-500 hover:scale-105 ${
              tag.color === 'muted'
                ? 'bg-muted border border-border text-muted-foreground'
                : tag.color === 'accent'
                ? 'bg-accent/[0.06] border border-accent/15 text-accent-dark hover:bg-accent/[0.1] hover:border-accent/25 hover:shadow-md'
                : 'bg-warm-violet/[0.06] border border-warm-violet/15 text-warm-violet hover:bg-warm-violet/[0.1] hover:border-warm-violet/25 hover:shadow-md'
            }`;

            const animStyle = { animationDelay: tag.delay };

            return (
              <React.Fragment key={i}>
                {i > 0 && <span className="hidden sm:block w-1 h-1 rounded-full bg-accent/30" />}
                {isLink ? (
                  <a
                    href={tag.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${classes} animate-slide-up-spring`}
                    style={animStyle}
                  >
                    {tag.label}
                  </a>
                ) : (
                  <span className={`${classes} animate-slide-up-spring text-center`} style={animStyle}>
                    {tag.label.split('\n').map((line, li) => (
                      <React.Fragment key={li}>
                        {li > 0 && <br />}
                        {line}
                      </React.Fragment>
                    ))}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* CTA buttons + Social links row */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4 mb-10 ${
            mounted ? 'animate-blur-reveal' : 'opacity-0'
          }`}
          style={{ animationDelay: '700ms' }}
        >
          <a
            ref={ctaRef}
            href="https://drive.google.com/file/d/1MVz3KGzX82HHtQgXfrFgfAnE0H6gqm9g/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="magnetic-btn group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white overflow-hidden"
            style={{
              boxShadow: '0 4px 24px -4px rgba(79, 70, 229, 0.4)',
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
            }}
            onMouseMove={handleMagnetic}
            onMouseLeave={handleMagneticLeave}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-accent via-warm-violet to-accent bg-300% animate-gradient-x" />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.2), transparent 60%)' }}
            />
            <FaFileAlt className="relative z-10" size={15} />
            <span className="relative z-10">Resume</span>
            <FaArrowRight size={12} className="relative z-10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </a>
          <button
            onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold border-2 border-border text-foreground hover:border-accent/40 hover:bg-accent/[0.04] transition-all duration-500 hover:scale-105 hover:shadow-lg"
          >
            Let's Talk
            <FaArrowRight size={13} className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>

        {/* Social links */}
        <div
          className={`flex items-center justify-center gap-3 ${mounted ? '' : 'opacity-0'}`}
        >
          {socials.map(({ icon: Icon, href, label }, i) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-11 h-11 rounded-xl border border-border bg-card flex items-center justify-center group animate-bounce-in hover:border-accent/30 hover:shadow-lg hover:scale-110 hover:-translate-y-1`}
              style={{
                animationDelay: `${850 + i * 100}ms`,
                transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              aria-label={label}
            >
              <Icon size={18} className="text-muted-foreground group-hover:text-accent transition-colors duration-300" />
            </a>
          ))}
        </div>
      </div>

      {/* Scroll indicator with morphing shape */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 ${
          mounted ? 'opacity-60' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1.2s' }}
      >
        <div className="w-6 h-9 rounded-full border-2 border-accent/30 flex justify-center pt-2 relative overflow-hidden">
          <div className="w-1 h-2.5 rounded-full bg-accent/60 animate-bounce" />
        </div>
        <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Scroll</span>
      </div>
    </section>
  );
}

export default Home;
