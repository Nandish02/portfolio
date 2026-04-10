import React, { useState, useCallback } from 'react';
import Loader from './components/Loader';
import ParticleCanvas from './components/ParticleCanvas';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  const [loading, setLoading] = useState(true);
  const handleLoaded = useCallback(() => setLoading(false), []);

  return (
    <>
      {loading && <Loader onComplete={handleLoaded} />}

      <div
        className={`min-h-screen bg-navy-900 transition-opacity duration-700 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <ParticleCanvas />
        <Navbar />

        <main className="relative z-10">
          <section id="home-section">
            <Home />
          </section>

          <div className="max-w-6xl mx-auto px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          <section id="experience-section">
            <Experience />
          </section>

          <div className="max-w-6xl mx-auto px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          <section id="projects-section">
            <Projects />
          </section>

          <div className="max-w-6xl mx-auto px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>

          <section id="contact-section">
            <Contact />
          </section>
        </main>

        <Footer className="relative z-10" />
      </div>
    </>
  );
}

export default App;
