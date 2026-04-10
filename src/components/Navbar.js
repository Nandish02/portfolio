import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaArrowUp } from 'react-icons/fa';

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

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 400);

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

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${
          scrolled
            ? 'py-3 glass shadow-lg shadow-black/20'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => scrollTo('home-section')}
            className="font-heading font-bold text-xl tracking-tight group"
          >
            <span className="gradient-text">NC</span>
            <span className="text-gray-400 group-hover:text-gray-200 transition-colors ml-1">
              .dev
            </span>
          </button>

          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => scrollTo(link.id)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeSection === link.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {activeSection === link.id && (
                    <span className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]" />
                  )}
                  <span className="relative">{link.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative z-50 w-10 h-10 flex items-center justify-center rounded-lg glass glass-hover transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[998] bg-navy-900/95 backdrop-blur-xl transition-all duration-500 md:hidden flex flex-col items-center justify-center gap-2 ${
          mobileOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map((link, i) => (
          <button
            key={link.id}
            onClick={() => scrollTo(link.id)}
            className={`text-3xl font-heading font-semibold py-4 transition-all duration-300 ${
              mobileOpen
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            } ${
              activeSection === link.id
                ? 'gradient-text'
                : 'text-gray-400 hover:text-white'
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
        className={`fixed bottom-6 right-6 z-[997] w-12 h-12 rounded-full glass flex items-center justify-center transition-all duration-500 group hover:scale-110 ${
          showScrollTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <FaArrowUp
          size={16}
          className="text-accent-purple group-hover:text-accent-blue transition-colors"
        />
      </button>
    </>
  );
};

export default Navbar;
