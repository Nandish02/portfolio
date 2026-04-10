import React, { useRef } from 'react';
import { FaReact, FaJs, FaNode, FaPython, FaDocker, FaGitAlt } from 'react-icons/fa';
import {
  SiCplusplus,
  SiTailwindcss,
  SiMysql,
  SiPytorch,
  SiScikitlearn,
  SiExpress,
  SiNumpy,
  SiPandas,
  SiGo,
} from 'react-icons/si';
import { BsBraces } from 'react-icons/bs';
import useOnScreen from '../useOnScreen';

const categories = [
  {
    title: 'Languages',
    color: 'from-accent-purple to-accent-pink',
    skills: [
      { icon: FaPython, name: 'Python', color: '#34d399' },
      { icon: SiCplusplus, name: 'C++', color: '#a78bfa' },
      { icon: FaJs, name: 'JavaScript', color: '#facc15' },
      { icon: SiGo, name: 'Go', color: '#22d3ee' },
    ],
  },
  {
    title: 'AI / ML',
    color: 'from-accent-pink to-accent-blue',
    skills: [
      { icon: SiPytorch, name: 'PyTorch', color: '#f97316' },
      { icon: SiScikitlearn, name: 'Scikit-learn', color: '#60a5fa' },
      { icon: SiNumpy, name: 'NumPy', color: '#22d3ee' },
      { icon: SiPandas, name: 'Pandas', color: '#a78bfa' },
    ],
  },
  {
    title: 'Web & Backend',
    color: 'from-accent-blue to-accent-cyan',
    skills: [
      { icon: FaReact, name: 'React', color: '#60a5fa' },
      { icon: FaNode, name: 'Node.js', color: '#34d399' },
      { icon: SiExpress, name: 'Express.js', color: '#a3a3a3' },
      { icon: SiTailwindcss, name: 'Tailwind CSS', color: '#22d3ee' },
      { icon: BsBraces, name: 'REST APIs', color: '#f97316' },
    ],
  },
  {
    title: 'DevOps & Data',
    color: 'from-accent-cyan to-accent-emerald',
    skills: [
      { icon: SiMysql, name: 'MySQL', color: '#22d3ee' },
      { icon: FaDocker, name: 'Docker', color: '#60a5fa' },
      { icon: FaGitAlt, name: 'Git', color: '#f97316' },
    ],
  },
];

const SkillCard = ({ icon: Icon, name, color, delay }) => (
  <div
    className="group flex flex-col items-center gap-3 p-5 rounded-2xl glass glass-hover transition-all duration-500 hover:scale-105 hover:-translate-y-1 opacity-0 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    <div
      className="w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
      style={{ backgroundColor: `${color}15` }}
    >
      <Icon className="text-3xl transition-colors duration-300" style={{ color }} />
    </div>
    <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">
      {name}
    </span>
  </div>
);

const Skills = () => {
  const ref = useRef(null);
  const visible = useOnScreen(ref);

  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent-blue/[0.04] blur-[150px] pointer-events-none" />

      <div ref={ref} className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-accent-cyan glass mb-4">
            Technical Toolkit
          </span>
          <h2 className="section-heading">
            My <span className="gradient-text">Skillset</span>
          </h2>
        </div>

        {visible && (
          <div className="space-y-12">
            {categories.map((cat, ci) => (
              <div key={cat.title}>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-1 h-6 rounded-full bg-gradient-to-b ${cat.color}`}
                  />
                  <h3 className="font-heading text-xl font-semibold text-gray-300">
                    {cat.title}
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {cat.skills.map((skill, si) => (
                    <SkillCard
                      key={skill.name}
                      {...skill}
                      delay={ci * 150 + si * 80}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
