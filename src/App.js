import React from 'react';
import Navbar from './components/Navbar';
import Contact from './components/Contact';
import Home from './components/Home';
import Skills from './components/Skills';
import Projects from './components/Projects';


function App() {
  const handleSmoothScroll = (event, targetId) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    targetElement.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      
      <nav style={{ display: 'flex', flexDirection: 'row' }}>
      <Navbar />
      </nav>
      <section id="home-section">
        <Home />
      </section>
      <section id="skills-section">
        <Skills />
      </section>
      <section id="projects-section">
        <Projects />
      </section>
      <section id="contact-section">
        <Contact />
      </section>
    </div>
  );
}

export default App;

