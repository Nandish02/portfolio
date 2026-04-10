import React, { useState, useEffect } from 'react';
import { FaGithub, FaEnvelope, FaLinkedin, FaFileAlt, FaArrowRight } from 'react-icons/fa';

function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const socials = [
    {
      icon: FaGithub,
      href: 'https://github.com/Nandish02',
      label: 'GitHub',
    },
    {
      icon: FaLinkedin,
      href: 'https://www.linkedin.com/in/nandish-chokshi-48435a179',
      label: 'LinkedIn',
    },
    {
      icon: FaEnvelope,
      href: 'mailto:nandishchokshi02@gmail.com',
      label: 'Email',
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Name */}
        <h1
          className={`font-heading text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Hi, I'm{' '}
          <span className="gradient-text whitespace-nowrap">Nandish Chokshi</span>
        </h1>

        {/* Descriptor tags — stack vertically on mobile */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-12 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <a
            href="https://www.nutanix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg glass glass-hover text-sm font-medium text-accent-blue transition-all duration-300 hover:scale-105"
          >
            Software Engineer @ Nutanix
          </a>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
          <a
            href="https://aiisc.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg glass glass-hover text-sm font-medium text-accent-purple transition-all duration-300 hover:scale-105"
          >
            Former Research Intern @ AIISC
          </a>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
          <span className="px-4 py-2 rounded-lg glass text-sm font-medium text-accent-cyan">
            CS grad @ BITS Pilani
          </span>
        </div>

        {/* CTA buttons */}
        <div
          className={`flex flex-wrap items-center justify-center gap-4 mb-14 transition-all duration-700 delay-[350ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <a
            href="https://drive.google.com/file/d/1MVz3KGzX82HHtQgXfrFgfAnE0H6gqm9g/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/20"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink bg-300% animate-gradient-x" />
            <FaFileAlt className="relative z-10" size={15} />
            <span className="relative z-10">Resume</span>
          </a>
          <button
            onClick={() =>
              document
                .getElementById('contact-section')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold glass glass-hover transition-all duration-300 hover:scale-105 text-gray-300"
          >
            Let's Talk
            <FaArrowRight
              size={13}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* Social links */}
        <div
          className={`flex items-center justify-center gap-3 transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-xl glass glass-hover flex items-center justify-center transition-all duration-300 hover:scale-110 group"
              aria-label={label}
            >
              <Icon
                size={18}
                className="text-gray-500 group-hover:text-accent-purple transition-colors"
              />
            </a>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 delay-[700ms] ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-5 h-8 rounded-full border border-gray-700 flex justify-center pt-1.5">
          <div className="w-0.5 h-2 rounded-full bg-accent-purple/60 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

export default Home;
