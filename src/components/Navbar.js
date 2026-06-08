import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const navLinks = [
  { id: 'home-section', label: 'Home' },
  { id: 'experience-section', label: 'Experience' },
  { id: 'projects-section', label: 'Projects' },
  { id: 'contact-section', label: 'Contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home-section');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 400);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? window.scrollY / docHeight : 0);

      const sections = navLinks.map((l) => document.getElementById(l.id));
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.getBoundingClientRect().top <= 120) {
          setActiveSection(navLinks[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  }, []);

  return (
    <>
      {/* Scroll progress bar */}
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
          scrolled
            ? 'py-3 bg-card/80 backdrop-blur-md border-b border-border shadow-sm'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => scrollTo('home-section')}
            className="font-heading font-bold text-xl tracking-tight group relative"
          >
            <span className="gradient-text transition-all duration-300 group-hover:tracking-wider">NC</span>
            <span className="text-muted-foreground group-hover:text-secondary transition-all duration-300 ml-0.5">
              .dev
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-accent to-warm-violet group-hover:w-full transition-all duration-500" />
          </button>

          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollTo(link.id)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeSection === link.id
                      ? 'text-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {activeSection === link.id && (
                    <span className="absolute inset-0 rounded-lg bg-accent/[0.06] border border-accent/10 animate-scale-reveal" />
                  )}
                  <span className="relative">{link.label}</span>
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-accent rounded-full transition-all duration-500 ${
                      activeSection === link.id ? 'w-4' : 'w-0'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-all"
            aria-label="Toggle menu"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span className={`absolute w-5 h-[2px] bg-foreground rounded transition-all duration-300 ${mobileOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
              <span className={`absolute w-5 h-[2px] bg-foreground rounded transition-all duration-300 ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
              <span className={`absolute w-5 h-[2px] bg-foreground rounded transition-all duration-300 ${mobileOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[998] bg-background/95 backdrop-blur-xl transition-all duration-500 md:hidden flex flex-col items-center justify-center gap-2 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map((link, i) => (
          <button
            key={link.id}
            onClick={() => scrollTo(link.id)}
            className={`text-3xl font-heading font-semibold py-4 transition-all duration-500 ${
              mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${
              activeSection === link.id ? 'gradient-text' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ transitionDelay: mobileOpen ? `${i * 80}ms` : '0ms' }}
          >
            {link.label}
          </button>
        ))}
      </div>

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-6 right-6 z-[997] w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center group hover:scale-110 hover:shadow-xl hover:border-accent/30 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}
        aria-label="Scroll to top"
      >
        <FaArrowUp
          size={16}
          className="text-accent group-hover:text-warm-violet group-hover:-translate-y-0.5 transition-all duration-300"
        />
      </button>
    </>
  );
};

export default Navbar;
