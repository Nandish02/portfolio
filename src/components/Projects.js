import React, { useRef } from 'react';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import useOnScreen from '../useOnScreen';

const BrainIllustration = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Brain outline (left hemisphere) */}
    <path
      d="M120 100 Q100 60, 140 45 Q170 30, 195 50 Q210 35, 200 60 Q215 55, 205 75 Q220 80, 200 95 Q215 110, 195 120 Q200 140, 175 145 Q160 160, 135 150 Q110 155, 115 135 Q95 130, 110 115 Q95 105, 120 100Z"
      fill="none"
      stroke="url(#brainGrad)"
      strokeWidth="1.5"
      opacity="0.7"
    />
    {/* Brain outline (right hemisphere) */}
    <path
      d="M205 100 Q185 60, 225 45 Q255 30, 280 50 Q295 35, 285 60 Q300 55, 290 75 Q305 80, 285 95 Q300 110, 280 120 Q285 140, 260 145 Q245 160, 220 150 Q195 155, 200 135 Q180 130, 195 115 Q180 105, 205 100Z"
      fill="none"
      stroke="url(#brainGrad)"
      strokeWidth="1.5"
      opacity="0.7"
    />
    {/* Neural network nodes - Layer 1 */}
    {[55, 80, 105, 130, 145].map((y, i) => (
      <circle key={`l1-${i}`} cx="40" cy={y} r="4" fill="#a78bfa" opacity="0.7" filter="url(#glow)">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {/* Neural network nodes - Layer 2 */}
    {[65, 90, 115, 140].map((y, i) => (
      <circle key={`l2-${i}`} cx="70" cy={y} r="3" fill="#60a5fa" opacity="0.6" filter="url(#glow)">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2.2 + i * 0.4}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {/* Connections L1 to L2 */}
    {[55, 80, 105, 130, 145].map((y1, i) =>
      [65, 90, 115, 140].map((y2, j) => (
        <line key={`c1-${i}-${j}`} x1="44" y1={y1} x2="67" y2={y2} stroke="#a78bfa" strokeWidth="0.5" opacity="0.15" />
      ))
    )}
    {/* Neural network nodes - Right side Layer 1 */}
    {[55, 80, 105, 130, 145].map((y, i) => (
      <circle key={`r1-${i}`} cx="360" cy={y} r="4" fill="#22d3ee" opacity="0.7" filter="url(#glow)">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {/* Neural network nodes - Right side Layer 2 */}
    {[65, 90, 115, 140].map((y, i) => (
      <circle key={`r2-${i}`} cx="330" cy={y} r="3" fill="#60a5fa" opacity="0.6" filter="url(#glow)">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2.3 + i * 0.4}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {/* Connections R1 to R2 */}
    {[55, 80, 105, 130, 145].map((y1, i) =>
      [65, 90, 115, 140].map((y2, j) => (
        <line key={`c2-${i}-${j}`} x1="356" y1={y1} x2="333" y2={y2} stroke="#22d3ee" strokeWidth="0.5" opacity="0.15" />
      ))
    )}
    {/* Pulse arrows from NN to brain */}
    <line x1="80" y1="100" x2="115" y2="100" stroke="url(#nodeGrad)" strokeWidth="1" opacity="0.4" strokeDasharray="4 3">
      <animate attributeName="stroke-dashoffset" values="0;-14" dur="2s" repeatCount="indefinite" />
    </line>
    <line x1="290" y1="100" x2="325" y2="100" stroke="url(#nodeGrad)" strokeWidth="1" opacity="0.4" strokeDasharray="4 3">
      <animate attributeName="stroke-dashoffset" values="0;14" dur="2s" repeatCount="indefinite" />
    </line>
    {/* Floating data points around brain */}
    {[
      [150, 55], [180, 40], [220, 42], [260, 55],
      [270, 130], [240, 150], [180, 148], [140, 135],
      [155, 90], [250, 88],
    ].map(([x, y], i) => (
      <circle key={`d-${i}`} cx={x} cy={y} r="2" fill="#f472b6" opacity="0.5">
        <animate attributeName="r" values="1;3;1" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

const VAEIllustration = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vaeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f472b6" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
      </linearGradient>
      <filter id="glowVae">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    {/* Encoder side */}
    <text x="55" y="25" fill="#f472b6" fontSize="10" fontFamily="monospace" opacity="0.7" textAnchor="middle">Encoder</text>
    {/* Input layer (5 nodes) */}
    {[50, 70, 90, 110, 130, 150].map((y, i) => (
      <circle key={`e1-${i}`} cx="30" cy={y} r="5" fill="#f472b6" opacity="0.6" filter="url(#glowVae)">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {/* Hidden layer 1 (4 nodes) */}
    {[65, 85, 115, 135].map((y, i) => (
      <circle key={`e2-${i}`} cx="80" cy={y} r="4" fill="#d946ef" opacity="0.5" filter="url(#glowVae)" />
    ))}
    {/* Hidden layer 2 (3 nodes) */}
    {[75, 100, 125].map((y, i) => (
      <circle key={`e3-${i}`} cx="130" cy={y} r="4" fill="#a78bfa" opacity="0.5" filter="url(#glowVae)" />
    ))}
    {/* Connections encoder */}
    {[50, 70, 90, 110, 130, 150].map((y1, i) =>
      [65, 85, 115, 135].map((y2, j) => (
        <line key={`ce1-${i}-${j}`} x1="35" y1={y1} x2="76" y2={y2} stroke="#f472b6" strokeWidth="0.4" opacity="0.12" />
      ))
    )}
    {[65, 85, 115, 135].map((y1, i) =>
      [75, 100, 125].map((y2, j) => (
        <line key={`ce2-${i}-${j}`} x1="84" y1={y1} x2="126" y2={y2} stroke="#d946ef" strokeWidth="0.4" opacity="0.12" />
      ))
    )}
    {/* Latent space (bottleneck) - z */}
    <text x="200" y="25" fill="#a78bfa" fontSize="10" fontFamily="monospace" opacity="0.7" textAnchor="middle">Latent Space (z)</text>
    {/* Latent space visualization */}
    <ellipse cx="200" cy="100" rx="40" ry="50" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.25" strokeDasharray="4 3" />
    <ellipse cx="200" cy="100" rx="25" ry="32" fill="none" stroke="#a78bfa" strokeWidth="0.8" opacity="0.15" />
    {/* Mu and sigma */}
    <circle cx="185" cy="90" r="5" fill="#a78bfa" opacity="0.7" filter="url(#glowVae)">
      <animate attributeName="cy" values="88;92;88" dur="3s" repeatCount="indefinite" />
    </circle>
    <text x="185" y="78" fill="#a78bfa" fontSize="8" fontFamily="monospace" opacity="0.5" textAnchor="middle">μ</text>
    <circle cx="215" cy="110" r="5" fill="#818cf8" opacity="0.7" filter="url(#glowVae)">
      <animate attributeName="cy" values="112;108;112" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <text x="215" y="125" fill="#818cf8" fontSize="8" fontFamily="monospace" opacity="0.5" textAnchor="middle">σ</text>
    {/* Scattered latent points */}
    {[
      [190, 95], [195, 105], [205, 85], [210, 100], [198, 115],
      [188, 108], [208, 92], [200, 100], [193, 88], [207, 112],
    ].map(([x, y], i) => (
      <circle key={`lp-${i}`} cx={x} cy={y} r="1.5" fill="#c4b5fd" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {/* Connections to latent */}
    {[75, 100, 125].map((y, i) => (
      <line key={`cl-${i}`} x1="134" y1={y} x2="160" y2="100" stroke="#a78bfa" strokeWidth="0.6" opacity="0.2" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="3s" repeatCount="indefinite" />
      </line>
    ))}
    {/* Decoder side */}
    <text x="345" y="25" fill="#60a5fa" fontSize="10" fontFamily="monospace" opacity="0.7" textAnchor="middle">Decoder</text>
    {/* Decoder hidden 1 */}
    {[75, 100, 125].map((y, i) => (
      <circle key={`d1-${i}`} cx="270" cy={y} r="4" fill="#60a5fa" opacity="0.5" filter="url(#glowVae)" />
    ))}
    {/* Decoder hidden 2 */}
    {[65, 85, 115, 135].map((y, i) => (
      <circle key={`d2-${i}`} cx="320" cy={y} r="4" fill="#38bdf8" opacity="0.5" filter="url(#glowVae)" />
    ))}
    {/* Output layer */}
    {[50, 70, 90, 110, 130, 150].map((y, i) => (
      <circle key={`d3-${i}`} cx="370" cy={y} r="5" fill="#22d3ee" opacity="0.6" filter="url(#glowVae)">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {/* Connections from latent to decoder */}
    {[75, 100, 125].map((y, i) => (
      <line key={`cld-${i}`} x1="240" y1="100" x2="266" y2={y} stroke="#60a5fa" strokeWidth="0.6" opacity="0.2" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="3s" repeatCount="indefinite" />
      </line>
    ))}
    {[75, 100, 125].map((y1, i) =>
      [65, 85, 115, 135].map((y2, j) => (
        <line key={`cd1-${i}-${j}`} x1="274" y1={y1} x2="316" y2={y2} stroke="#60a5fa" strokeWidth="0.4" opacity="0.12" />
      ))
    )}
    {[65, 85, 115, 135].map((y1, i) =>
      [50, 70, 90, 110, 130, 150].map((y2, j) => (
        <line key={`cd2-${i}-${j}`} x1="324" y1={y1} x2="365" y2={y2} stroke="#38bdf8" strokeWidth="0.4" opacity="0.12" />
      ))
    )}
    {/* Arrow labels */}
    <text x="148" y="175" fill="#d946ef" fontSize="8" fontFamily="monospace" opacity="0.4">encode →</text>
    <text x="245" y="175" fill="#60a5fa" fontSize="8" fontFamily="monospace" opacity="0.4">→ decode</text>
  </svg>
);

const projects = [
  {
    title: 'Brain-LLM: Neural Activation Mapping',
    description:
      'Leveraged transformer-based language models to generate semantic embeddings for neural mapping. Analyzed contributions of 12 hidden layers within deep networks to predict fMRI brain activity across four distinct narrative stimuli with 3D visualization of activation patterns.',
    illustration: BrainIllustration,
    tags: ['Transformers', 'fMRI', 'NLP', 'Deep Learning', 'PyTorch', '3D Visualization'],
    github: 'https://github.com/Nandish02/Brain-LLMs',
    color: '#a78bfa',
    accent: 'accent-purple',
  },
  {
    title: 'VAE Benchmark: Pyro vs PyTorch',
    description:
      'Comparative study of Variational Autoencoder implementations using probabilistic programming (Pyro) versus traditional deep learning (PyTorch). Evaluated generative quality, training convergence, and developer ergonomics on MNIST with SVI and ELBO optimization.',
    illustration: VAEIllustration,
    tags: ['Generative AI', 'VAE', 'Probabilistic ML', 'Pyro', 'PyTorch', 'MNIST'],
    github: 'https://github.com/Nandish02/CS-F301-POPL-VAE-Comparison',
    color: '#f472b6',
    accent: 'accent-pink',
  },
];

const ProjectCard = ({ project, index }) => {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  const Illustration = project.illustration;

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl overflow-hidden glass transition-all duration-700 hover:shadow-2xl ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{
        transitionDelay: `${index * 200}ms`,
        boxShadow: `0 0 0 0 ${project.color}00`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 20px 60px -15px ${project.color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 0 0 0 ${project.color}00`;
      }}
    >
      {/* Illustration area */}
      <div className="relative h-52 overflow-hidden bg-navy-800/50">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <Illustration />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />

        {/* Floating action icons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-white/[0.15] transition-colors"
          >
            <FaGithub size={16} />
          </a>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:bg-white/[0.15] transition-colors"
          >
            <FaExternalLinkAlt size={14} />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading text-xl font-bold mb-3 text-white group-hover:text-accent-blue transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-colors"
              style={{
                backgroundColor: `${project.color}08`,
                borderColor: `${project.color}20`,
                color: `${project.color}cc`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div
        className="h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${project.color}, transparent)`,
        }}
      />
    </div>
  );
};

function Projects() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent-purple/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-[300px] h-[300px] rounded-full bg-accent-pink/[0.03] blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-accent-pink glass mb-4">
            Featured Work
          </span>
          <h2 className="section-heading">
            Research & <span className="gradient-text">Projects</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-lg mx-auto">
            Exploring the intersection of AI, neuroscience, and software engineering
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
