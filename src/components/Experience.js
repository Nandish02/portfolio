import React, { useRef } from 'react';
import { FaBriefcase, FaGraduationCap, FaExternalLinkAlt } from 'react-icons/fa';
import nutanixLogo from '../Images/nutanix-logo.png';
import aiiscLogo from '../Images/aiisc-logo.png';
import useOnScreen from '../useOnScreen';

const experiences = [
  {
    company: 'Nutanix',
    website: 'https://www.nutanix.com',
    logo: nutanixLogo,
    logoBg: '#24135f',
    icon: FaBriefcase,
    color: '#818cf8',
    roles: [
      {
        title: 'Member of Technical Staff 1 (MTS-1)',
        period: 'Jul 2025 — Present',
        location: 'Bengaluru, India',
        highlights: [
          'Designing and developing horizontally scalable control-plane services for Nutanix\'s hyper-converged infrastructure (HCI) platform',
          'Building next-generation v4 REST APIs for Prism Central, enabling unified management of VM lifecycle, cluster operations, and data protection across multi-cloud environments',
          'Improving observability and telemetry pipelines to monitor distributed AOS clusters at scale, reducing mean-time-to-detect for platform anomalies',
          'Collaborating with cross-functional teams on AHV hypervisor integrations and performance-critical storage I/O paths',
        ],
      },
      {
        title: 'Member of Technical Staff (Intern)',
        period: 'Aug 2024 — Jun 2025',
        location: 'Bengaluru, India',
        highlights: [
          'Contributed to the Prism platform team, developing scalable backend services powering cluster management and infrastructure orchestration',
          'Implemented API migration workflows from legacy v2/v3 endpoints to the standardized v4 API framework, improving developer experience and schema consistency',
          'Optimized distributed storage layer interactions for Controller VM (CVM) operations, enhancing data locality and replication performance',
          'Participated in on-call rotations and incident response for enterprise-grade SLA-bound cloud infrastructure',
        ],
      },
    ],
    tags: ['Go', 'Python', 'Distributed Systems', 'Prism Central', 'AHV', 'AOS', 'REST APIs', 'Kubernetes', 'Docker'],
  },
  {
    company: 'AIISC — University of South Carolina',
    website: 'https://aiisc.ai',
    logo: aiiscLogo,
    logoBg: '#73000a',
    icon: FaGraduationCap,
    color: '#a78bfa',
    roles: [
      {
        title: 'Research Intern — AI/ML',
        period: 'Jan 2024 — Aug 2024',
        location: 'Columbia, SC (Remote)',
        highlights: [
          'Engineered unsupervised clustering pipelines on 8M+ cognitive data points to map hierarchical relationships between abstract concepts',
          'Co-authored abstract "A Hierarchical Categorical Structure of Abstract Concepts" — accepted for poster presentation at SNL\'2024 (Society for the Neurobiology of Language)',
          'Analyzed activations across 12 transformer hidden layers to predict fMRI brain responses to four distinct narrative stimuli using ridge regression',
          'Built 3D neural activation visualization pipelines, revealing language-related activation patterns across cortical and subcortical brain structures',
        ],
      },
    ],
    tags: ['NLP', 'Transformers', 'fMRI', 'PyTorch', 'Scikit-learn', 'Unsupervised Learning', 'GPT-2'],
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
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-700 ${
            visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          style={{ backgroundColor: `${exp.color}18`, border: `1px solid ${exp.color}30` }}
        >
          <exp.icon size={18} style={{ color: exp.color }} />
        </div>
        {index < experiences.length - 1 && (
          <div
            className={`w-px flex-1 transition-all duration-1000 ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background: `linear-gradient(to bottom, ${exp.color}40, transparent)`,
            }}
          />
        )}
      </div>

      {/* Card */}
      <div
        className={`flex-1 min-w-0 pb-12 transition-all duration-700 ${
          visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
        }`}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        <div className="group rounded-2xl glass glass-hover transition-all duration-500 hover:-translate-y-1 overflow-hidden">
          <div className="p-6">
            {/* Company header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center p-1.5 shrink-0"
                style={{ backgroundColor: exp.logoBg }}
              >
                <img
                  src={exp.logo}
                  alt={exp.company}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-white text-lg leading-tight truncate">
                    {exp.company}
                  </h3>
                  <a
                    href={exp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-accent-blue transition-colors shrink-0"
                    aria-label={`Visit ${exp.company}`}
                  >
                    <FaExternalLinkAlt size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Roles within the company */}
            <div className="space-y-6">
              {exp.roles.map((role, ri) => (
                <div key={ri} className="relative">
                  {/* Role connector for multi-role cards */}
                  {exp.roles.length > 1 && (
                    <div className="absolute -left-4 sm:-left-[21px] top-0 bottom-0 flex flex-col items-center">
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-2"
                        style={{ backgroundColor: exp.color }}
                      />
                      {ri < exp.roles.length - 1 && (
                        <div
                          className="w-px flex-1"
                          style={{ backgroundColor: `${exp.color}25` }}
                        />
                      )}
                    </div>
                  )}

                  <div>
                    <h4 className="font-heading font-semibold text-gray-200 text-sm sm:text-[15px] mb-1">
                      {role.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-3">
                      <span>{role.period}</span>
                      <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-600" />
                      <span>{role.location}</span>
                    </div>

                    <ul className="space-y-2">
                      {role.highlights.map((h, i) => (
                        <li key={i} className="flex gap-2.5 text-sm text-gray-400 leading-relaxed">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]"
                            style={{ backgroundColor: `${exp.color}80` }}
                          />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/[0.05]">
              {exp.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/[0.04] text-gray-500 border border-white/[0.05]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom accent */}
          <div
            className="h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(to right, transparent, ${exp.color}, transparent)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Experience = () => {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-accent-blue/[0.03] blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-accent-blue glass mb-4">
            Career Journey
          </span>
          <h2 className="section-heading">
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
