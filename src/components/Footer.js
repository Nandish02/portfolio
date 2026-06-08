import React, { useRef } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart } from 'react-icons/fa';
import useOnScreen from '../useOnScreen';

const Footer = () => {
  const ref = useRef(null);
  const visible = useOnScreen(ref);

  const socials = [
    { icon: FaGithub, href: 'https://github.com/Nandish02', label: 'GitHub' },
    { icon: FaLinkedin, href: 'https://www.linkedin.com/in/nandish-chokshi-48435a179', label: 'LinkedIn' },
    { icon: FaEnvelope, href: 'mailto:nandishchokshi02@gmail.com', label: 'Email' },
  ];

  return (
    <footer ref={ref} className="border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30" />

      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={`flex items-center gap-2 ${visible ? 'animate-blur-reveal' : 'opacity-0'}`}>
            <span className="font-heading font-bold text-lg group cursor-default">
              <span className="gradient-text">NC</span>
              <span className="text-muted-foreground">.dev</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }, i) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-10 h-10 rounded-lg border border-border bg-card flex items-center justify-center group hover:border-accent/30 hover:shadow-md hover:scale-110 hover:-translate-y-0.5 ${
                  visible ? 'animate-bounce-in' : 'opacity-0'
                }`}
                style={{
                  animationDelay: `${i * 80 + 200}ms`,
                  transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                }}
                aria-label={label}
              >
                <Icon size={16} className="text-muted-foreground group-hover:text-accent transition-colors duration-300" />
              </a>
            ))}
          </div>

          <p
            className={`text-sm text-muted-foreground flex items-center gap-1 ${
              visible ? 'animate-blur-reveal animate-delay-400' : 'opacity-0'
            }`}
          >
            Built with <FaHeart size={12} className="text-warm-rose animate-pulse-soft" /> by Nandish Chokshi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
