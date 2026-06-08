import React, { useRef } from 'react';
import { FaBriefcase, FaGraduationCap, FaChalkboardTeacher, FaExternalLinkAlt } from 'react-icons/fa';
import nutanixLogo from '../Images/nutanix-logo.png';
import aiiscLogo from '../Images/aiisc-logo.png';
import useOnScreen from '../useOnScreen';

const BITS_LOGO_URL = 'https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg';

const experiences = [
  {
    company: 'Nutanix',
    website: 'https://www.nutanix.com',
    logo: nutanixLogo,
    logoBg: '#24135f',
    icon: FaBriefcase,
    color: '#4F46E5',
    roles: [
      { title: 'Member of Technical Staff 1 (MTS-1)', period: 'Jul 2025 — Jul 2026', location: 'Bengaluru, India' },
      { title: 'Member of Technical Staff (Intern)', period: 'Aug 2024 — Jun 2025', location: 'Bengaluru, India' },
    ],
    tags: ['Go', 'Python', 'Distributed Systems', 'Prism Central', 'AHV', 'AOS', 'REST APIs', 'Kubernetes', 'Docker'],
  },
  {
    company: 'AIISC — University of South Carolina',
    website: 'https://aiisc.ai',
    logo: aiiscLogo,
    logoBg: '#73000a',
    icon: FaGraduationCap,
    color: '#7C3AED',
    roles: [
      { title: 'Research Intern — AI/ML', period: 'Jan 2024 — Aug 2024', location: 'Columbia, SC (Remote)' },
    ],
    tags: ['NLP', 'Transformers', 'fMRI', 'PyTorch', 'Scikit-learn', 'Unsupervised Learning', 'GPT-2'],
  },
  {
    company: 'BITS Pilani, Goa Campus',
    website: 'https://www.bits-pilani.ac.in/goa/',
    logo: BITS_LOGO_URL,
    logoBg: '#ffffff',
    icon: FaChalkboardTeacher,
    color: '#0284C7',
    roles: [
      { title: 'Teaching Assistant — Computer Architecture & Database Systems', period: 'Jan 2024 — May 2024', location: 'Goa, India' },
    ],
    tags: null,
  },
];

const ExperienceCard = ({ exp, index }) => {
  const ref = useRef(null);
  const visible = useOnScreen(ref);

  return (
    <div ref={ref} className="relative flex gap-4 sm:gap-6 md:gap-10">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-700 ${
            visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          style={{
            backgroundColor: `${exp.color}10`,
            border: `1px solid ${exp.color}25`,
            transitionDelay: `${index * 200}ms`,
          }}
        >
          <exp.icon size={18} style={{ color: exp.color }} />
          <span
            className={`absolute inset-0 rounded-xl ${visible ? 'timeline-pulse' : ''}`}
            style={{ color: `${exp.color}40` }}
          />
        </div>
        {index < experiences.length - 1 && (
          <div
            className="w-px flex-1 origin-top transition-all duration-1000"
            style={{
              background: `linear-gradient(to bottom, ${exp.color}30, transparent)`,
              transform: visible ? 'scaleY(1)' : 'scaleY(0)',
              transitionDelay: `${index * 200 + 300}ms`,
            }}
          />
        )}
      </div>

      {/* Card with blur-to-sharp reveal */}
      <div
        className={`flex-1 min-w-0 pb-12 ${visible ? 'animate-blur-reveal' : 'opacity-0'}`}
        style={{ animationDelay: `${index * 200 + 100}ms` }}
      >
        <div className="group card card-hover overflow-hidden">
          <div className="p-6">
            {/* Company header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center p-1.5 shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                style={{ backgroundColor: exp.logoBg }}
              >
                {exp.logo ? (
                  <img src={exp.logo} alt={exp.company} className="w-full h-full object-contain" />
                ) : (
                  <exp.icon size={20} className="text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-foreground text-lg leading-tight truncate">
                    {exp.company}
                  </h3>
                  <a
                    href={exp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-accent hover:rotate-12 transition-all duration-300 shrink-0"
                    aria-label={`Visit ${exp.company}`}
                  >
                    <FaExternalLinkAlt size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Roles */}
            <div className="space-y-5">
              {exp.roles.map((role, ri) => (
                <div key={ri} className="flex gap-3 items-start">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 mt-[7px]"
                    style={{
                      backgroundColor: exp.color,
                      boxShadow: visible ? `0 0 8px ${exp.color}40` : 'none',
                    }}
                  />
                  <div>
                    <h4 className="font-heading font-semibold text-foreground text-sm sm:text-[15px] mb-1">
                      {role.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{role.period}</span>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                      <span>{role.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags with staggered entrance (only if tags exist) */}
            {exp.tags && (
              <div className={`flex flex-wrap gap-2 mt-5 pt-5 border-t border-border ${visible ? 'stagger-children' : ''}`}>
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border hover:border-accent/20 hover:text-accent hover:bg-accent/[0.04] transition-all duration-300 cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom accent line with shimmer */}
          <div className="relative h-[2px] overflow-hidden">
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(to right, transparent, ${exp.color}, transparent)` }}
            />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Experience = () => {
  const headRef = useRef(null);
  const headVisible = useOnScreen(headRef);

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-6">
        <div ref={headRef} className="text-center mb-16">
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-accent bg-accent/[0.06] border border-accent/15 mb-4 ${
              headVisible ? 'animate-scale-reveal' : 'opacity-0'
            }`}
          >
            Career Journey
          </span>
          <h2 className={`section-heading ${headVisible ? 'animate-blur-reveal animate-delay-200' : 'opacity-0'}`}>
            Work <span className="gradient-text">Experience</span>
          </h2>
        </div>

        <div className="relative">
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.company} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
