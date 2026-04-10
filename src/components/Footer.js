import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaHeart } from 'react-icons/fa';

const Footer = () => {
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
    <footer className="relative border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-lg">
              <span className="gradient-text">NC</span>
              <span className="text-gray-500">.dev</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg glass glass-hover flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label={label}
              >
                <Icon
                  size={16}
                  className="text-gray-500 group-hover:text-accent-purple transition-colors"
                />
              </a>
            ))}
          </div>

          <p className="text-sm text-gray-600 flex items-center gap-1">
            Built with <FaHeart size={12} className="text-accent-pink" /> by
            Nandish Chokshi
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
