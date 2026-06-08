import React, { useRef, useCallback, useState } from 'react';
import { FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import useOnScreen from '../useOnScreen';

const BrainIllustration = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.7" />
        <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#818CF8" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <path d="M120 100 Q100 60, 140 45 Q170 30, 195 50 Q210 35, 200 60 Q215 55, 205 75 Q220 80, 200 95 Q215 110, 195 120 Q200 140, 175 145 Q160 160, 135 150 Q110 155, 115 135 Q95 130, 110 115 Q95 105, 120 100Z" fill="none" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.7" />
    <path d="M205 100 Q185 60, 225 45 Q255 30, 280 50 Q295 35, 285 60 Q300 55, 290 75 Q305 80, 285 95 Q300 110, 280 120 Q285 140, 260 145 Q245 160, 220 150 Q195 155, 200 135 Q180 130, 195 115 Q180 105, 205 100Z" fill="none" stroke="url(#brainGrad)" strokeWidth="1.5" opacity="0.7" />
    {[55, 80, 105, 130, 145].map((y, i) => (
      <circle key={`l1-${i}`} cx="40" cy={y} r="4" fill="#4F46E5" opacity="0.6" filter="url(#glow)">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[65, 90, 115, 140].map((y, i) => (
      <circle key={`l2-${i}`} cx="70" cy={y} r="3" fill="#7C3AED" opacity="0.5" filter="url(#glow)">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2.2 + i * 0.4}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[55, 80, 105, 130, 145].map((y1, i) =>
      [65, 90, 115, 140].map((y2, j) => (
        <line key={`c1-${i}-${j}`} x1="44" y1={y1} x2="67" y2={y2} stroke="#4F46E5" strokeWidth="0.5" opacity="0.1" />
      ))
    )}
    {[55, 80, 105, 130, 145].map((y, i) => (
      <circle key={`r1-${i}`} cx="360" cy={y} r="4" fill="#818CF8" opacity="0.6" filter="url(#glow)">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[65, 90, 115, 140].map((y, i) => (
      <circle key={`r2-${i}`} cx="330" cy={y} r="3" fill="#7C3AED" opacity="0.5" filter="url(#glow)">
        <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2.3 + i * 0.4}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[55, 80, 105, 130, 145].map((y1, i) =>
      [65, 90, 115, 140].map((y2, j) => (
        <line key={`c2-${i}-${j}`} x1="356" y1={y1} x2="333" y2={y2} stroke="#818CF8" strokeWidth="0.5" opacity="0.1" />
      ))
    )}
    <line x1="80" y1="100" x2="115" y2="100" stroke="url(#nodeGrad)" strokeWidth="1" opacity="0.4" strokeDasharray="4 3">
      <animate attributeName="stroke-dashoffset" values="0;-14" dur="2s" repeatCount="indefinite" />
    </line>
    <line x1="290" y1="100" x2="325" y2="100" stroke="url(#nodeGrad)" strokeWidth="1" opacity="0.4" strokeDasharray="4 3">
      <animate attributeName="stroke-dashoffset" values="0;14" dur="2s" repeatCount="indefinite" />
    </line>
    {[[150,55],[180,40],[220,42],[260,55],[270,130],[240,150],[180,148],[140,135],[155,90],[250,88]].map(([x,y],i) => (
      <circle key={`d-${i}`} cx={x} cy={y} r="2" fill="#7C3AED" opacity="0.4">
        <animate attributeName="r" values="1;3;1" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0.5;0.15" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
);

const VAEIllustration = () => (
  <svg viewBox="0 0 400 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vaeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#E11D48" stopOpacity="0.7" />
        <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#0284C7" stopOpacity="0.7" />
      </linearGradient>
      <filter id="glowVae">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
    <text x="55" y="25" fill="#E11D48" fontSize="10" fontFamily="monospace" opacity="0.7" textAnchor="middle">Encoder</text>
    {[50,70,90,110,130,150].map((y,i) => (
      <circle key={`e1-${i}`} cx="30" cy={y} r="5" fill="#E11D48" opacity="0.5" filter="url(#glowVae)">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[65,85,115,135].map((y,i) => (
      <circle key={`e2-${i}`} cx="80" cy={y} r="4" fill="#be185d" opacity="0.4" filter="url(#glowVae)" />
    ))}
    {[75,100,125].map((y,i) => (
      <circle key={`e3-${i}`} cx="130" cy={y} r="4" fill="#7C3AED" opacity="0.4" filter="url(#glowVae)" />
    ))}
    {[50,70,90,110,130,150].map((y1,i) => [65,85,115,135].map((y2,j) => (
      <line key={`ce1-${i}-${j}`} x1="35" y1={y1} x2="76" y2={y2} stroke="#E11D48" strokeWidth="0.4" opacity="0.1" />
    )))}
    {[65,85,115,135].map((y1,i) => [75,100,125].map((y2,j) => (
      <line key={`ce2-${i}-${j}`} x1="84" y1={y1} x2="126" y2={y2} stroke="#be185d" strokeWidth="0.4" opacity="0.1" />
    )))}
    <text x="200" y="25" fill="#7C3AED" fontSize="10" fontFamily="monospace" opacity="0.6" textAnchor="middle">Latent Space (z)</text>
    <ellipse cx="200" cy="100" rx="40" ry="50" fill="none" stroke="#7C3AED" strokeWidth="1" opacity="0.2" strokeDasharray="4 3" />
    <ellipse cx="200" cy="100" rx="25" ry="32" fill="none" stroke="#7C3AED" strokeWidth="0.8" opacity="0.12" />
    <circle cx="185" cy="90" r="5" fill="#7C3AED" opacity="0.5" filter="url(#glowVae)">
      <animate attributeName="cy" values="88;92;88" dur="3s" repeatCount="indefinite" />
    </circle>
    <text x="185" y="78" fill="#7C3AED" fontSize="8" fontFamily="monospace" opacity="0.5" textAnchor="middle">&#956;</text>
    <circle cx="215" cy="110" r="5" fill="#4F46E5" opacity="0.5" filter="url(#glowVae)">
      <animate attributeName="cy" values="112;108;112" dur="3.5s" repeatCount="indefinite" />
    </circle>
    <text x="215" y="125" fill="#4F46E5" fontSize="8" fontFamily="monospace" opacity="0.5" textAnchor="middle">&#963;</text>
    {[[190,95],[195,105],[205,85],[210,100],[198,115],[188,108],[208,92],[200,100],[193,88],[207,112]].map(([x,y],i) => (
      <circle key={`lp-${i}`} cx={x} cy={y} r="1.5" fill="#818CF8" opacity="0.3">
        <animate attributeName="opacity" values="0.15;0.45;0.15" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[75,100,125].map((y,i) => (
      <line key={`cl-${i}`} x1="134" y1={y} x2="160" y2="100" stroke="#7C3AED" strokeWidth="0.6" opacity="0.15" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="3s" repeatCount="indefinite" />
      </line>
    ))}
    <text x="345" y="25" fill="#0284C7" fontSize="10" fontFamily="monospace" opacity="0.6" textAnchor="middle">Decoder</text>
    {[75,100,125].map((y,i) => (
      <circle key={`d1-${i}`} cx="270" cy={y} r="4" fill="#0284C7" opacity="0.4" filter="url(#glowVae)" />
    ))}
    {[65,85,115,135].map((y,i) => (
      <circle key={`d2-${i}`} cx="320" cy={y} r="4" fill="#0369a1" opacity="0.4" filter="url(#glowVae)" />
    ))}
    {[50,70,90,110,130,150].map((y,i) => (
      <circle key={`d3-${i}`} cx="370" cy={y} r="5" fill="#0284C7" opacity="0.5" filter="url(#glowVae)">
        <animate attributeName="opacity" values="0.3;0.6;0.3" dur={`${2.5 + i * 0.2}s`} repeatCount="indefinite" />
      </circle>
    ))}
    {[75,100,125].map((y,i) => (
      <line key={`cld-${i}`} x1="240" y1="100" x2="266" y2={y} stroke="#0284C7" strokeWidth="0.6" opacity="0.15" strokeDasharray="3 2">
        <animate attributeName="stroke-dashoffset" values="0;-10" dur="3s" repeatCount="indefinite" />
      </line>
    ))}
    {[75,100,125].map((y1,i) => [65,85,115,135].map((y2,j) => (
      <line key={`cd1-${i}-${j}`} x1="274" y1={y1} x2="316" y2={y2} stroke="#0284C7" strokeWidth="0.4" opacity="0.1" />
    )))}
    {[65,85,115,135].map((y1,i) => [50,70,90,110,130,150].map((y2,j) => (
      <line key={`cd2-${i}-${j}`} x1="324" y1={y1} x2="365" y2={y2} stroke="#0369a1" strokeWidth="0.4" opacity="0.1" />
    )))}
    <text x="148" y="175" fill="#be185d" fontSize="8" fontFamily="monospace" opacity="0.4">encode &#8594;</text>
    <text x="245" y="175" fill="#0284C7" fontSize="8" fontFamily="monospace" opacity="0.4">&#8594; decode</text>
  </svg>
);

const projects = [
  {
    title: 'Brain-LLM: Neural Activation Mapping',
    description: 'Leveraged transformer-based language models to generate semantic embeddings for neural mapping. Analyzed contributions of 12 hidden layers within deep networks to predict fMRI brain activity across four distinct narrative stimuli with 3D visualization of activation patterns.',
    illustration: BrainIllustration,
    tags: ['Transformers', 'fMRI', 'NLP', 'Deep Learning', 'PyTorch', '3D Visualization'],
    github: 'https://github.com/Nandish02/Brain-LLMs',
    color: '#4F46E5',
  },
  {
    title: 'VAE Benchmark: Pyro vs PyTorch',
    description: 'Comparative study of Variational Autoencoder implementations using probabilistic programming (Pyro) versus traditional deep learning (PyTorch). Evaluated generative quality, training convergence, and developer ergonomics on MNIST with SVI and ELBO optimization.',
    illustration: VAEIllustration,
    tags: ['Generative AI', 'VAE', 'Probabilistic ML', 'Pyro', 'PyTorch', 'MNIST'],
    github: 'https://github.com/Nandish02/CS-F301-POPL-VAE-Comparison',
    color: '#7C3AED',
  },
];

const ProjectCard = ({ project, index }) => {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  const Illustration = project.illustration;
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 10;
    const rotateY = (x - 0.5) * 10;
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      boxShadow: `${(x - 0.5) * -20}px ${(y - 0.5) * -20}px 50px -12px ${project.color}20`,
    });
  }, [project.color]);

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    });
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl overflow-hidden card ${
        visible ? 'animate-blur-reveal' : 'opacity-0'
      }`}
      style={{
        animationDelay: `${index * 200}ms`,
        ...tiltStyle,
        transition: tiltStyle.transform ? 'transform 0.15s ease-out, box-shadow 0.15s ease-out' : 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Illustration area with hover zoom */}
      <div className="relative h-52 overflow-hidden bg-muted">
        <div className="absolute inset-0 flex items-center justify-center p-6 transition-transform duration-700 group-hover:scale-110">
          <Illustration />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />

        {/* Glow overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at 50% 50%, ${project.color}08, transparent 70%)` }}
        />

        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-sm flex items-center justify-center hover:bg-card hover:scale-110 transition-all duration-300"
          >
            <FaGithub size={16} className="text-foreground" />
          </a>
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm border border-border shadow-sm flex items-center justify-center hover:bg-card hover:scale-110 transition-all duration-300"
          >
            <FaExternalLinkAlt size={14} className="text-foreground" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-heading text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors duration-300">
          {project.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-5">
          {project.description}
        </p>
        <div className={`flex flex-wrap gap-2 ${visible ? 'stagger-children' : ''}`}>
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105 cursor-default"
              style={{
                backgroundColor: `${project.color}06`,
                borderColor: `${project.color}15`,
                color: `${project.color}cc`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom accent line with shimmer */}
      <div className="relative h-[2px] overflow-hidden">
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `linear-gradient(to right, transparent, ${project.color}, transparent)` }}
        />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 shimmer" />
      </div>
    </div>
  );
};

function Projects() {
  const headRef = useRef(null);
  const headVisible = useOnScreen(headRef);

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6">
        <div ref={headRef} className="text-center mb-16">
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-warm-violet bg-warm-violet/[0.06] border border-warm-violet/15 mb-4 ${
              headVisible ? 'animate-scale-reveal' : 'opacity-0'
            }`}
          >
            Featured Work
          </span>
          <h2 className={`section-heading ${headVisible ? 'animate-blur-reveal animate-delay-200' : 'opacity-0'}`}>
            Research & <span className="gradient-text">Projects</span>
          </h2>
          <p className={`mt-4 text-muted-foreground max-w-lg mx-auto ${headVisible ? 'animate-blur-reveal animate-delay-400' : 'opacity-0'}`}>
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
