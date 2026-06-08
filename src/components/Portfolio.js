import React, { useState, useCallback } from 'react';
import Loader from './Loader';
import Navbar from './Navbar';
import Home from './Home';
import Experience from './Experience';
import Projects from './Projects';
import Contact from './Contact';
import Footer from './Footer';

const WaveDivider = ({ flip, color1 = '#4F46E5', color2 = '#7C3AED' }) => (
  <div className={`wave-divider ${flip ? 'rotate-180' : ''}`}>
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`wg-${flip ? 'f' : 'n'}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color1} stopOpacity="0.06" />
          <stop offset="50%" stopColor={color2} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color1} stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <path
        d="M0,30 C120,50 240,10 360,30 C480,50 600,10 720,30 C840,50 960,10 1080,30 C1200,50 1320,10 1440,30 L1440,60 L0,60Z"
        fill={`url(#wg-${flip ? 'f' : 'n'})`}
      />
      <path
        d="M0,35 C160,55 320,15 480,35 C640,55 800,15 960,35 C1120,55 1280,15 1440,35"
        fill="none"
        stroke={color1}
        strokeWidth="0.5"
        strokeOpacity="0.15"
      />
    </svg>
  </div>
);

function Portfolio() {
  const [loading, setLoading] = useState(true);
  const handleLoaded = useCallback(() => setLoading(false), []);

  return (
    <>
      {loading && <Loader onComplete={handleLoaded} />}

      <div
        className={`min-h-screen page-gradient transition-opacity duration-700 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Navbar />

        <main className="relative">
          <section id="home-section">
            <Home />
          </section>

          <WaveDivider />

          <section id="experience-section" className="section-warm dot-pattern">
            <Experience />
          </section>

          <WaveDivider flip color1="#7C3AED" color2="#E11D48" />

          <section id="projects-section" className="section-rose">
            <Projects />
          </section>

          <WaveDivider color1="#0284C7" color2="#4F46E5" />

          <section id="contact-section" className="section-cool dot-pattern">
            <Contact />
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default Portfolio;
