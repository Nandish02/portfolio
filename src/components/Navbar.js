import React, { useState, useEffect } from 'react';
import { animateScroll as scroll } from 'react-scroll';
import { FaBars, FaTimes, FaArrowUp } from 'react-icons/fa';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const handleClick = () => setNav(!nav);
  const handleSmoothScroll = (targetId) => {
    const targetElement = document.getElementById(targetId);
    targetElement.scrollIntoView({ behavior: 'smooth' });
    setNav(false);
  };

  const handleScrollToTop = () => {
    scroll.scrollToTop({ behavior: 'smooth' });
  };

  const handleGoToHome = () => {
    setActiveSection('home');
    handleScrollToTop();
  };
  

  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="z-[9999] fixed w-full h-[80px] flex justify-between items-center px-4 bg-[#143c78] text-gray-300 ">
      <button onClick={handleGoToHome} className="mr-4">
        <span className="font-bold">Portfolio</span>
      </button>
      <ul className="hidden md:flex ml-auto space-x-4">
        <li>
          <button
            onClick={() => {
              handleSmoothScroll('skills-section');
              setActiveSection('skills');
            }}
            className={`underline-button ${activeSection === 'skills' ? 'active' : ''}`}
          >
            <span className="font-semibold text-lg">Skills</span>
          </button>
        </li>
     
        <li>
          <button
            onClick={() => {
              handleSmoothScroll('projects-section');
              setActiveSection('projects');
            }}
            className={`underline-button ${activeSection === 'projects' ? 'active' : ''}`}
          >
            <span className="font-semibold text-lg">Projects</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              handleSmoothScroll('contact-section');
              setActiveSection('contact');
            }}
            className={`underline-button ${activeSection === 'contact' ? 'active' : ''}`}
          >
            <span className="font-semibold text-lg">Contact</span>
          </button>
        </li>
      </ul>
      <div onClick={handleClick} className="md:hidden z-10">
        {!nav ? <FaBars /> : <FaTimes />}
      </div>
      <ul className={!nav ? 'hidden' : 'absolute top-0 right-0 w-full h-screen bg-[#0a192f] flex flex-col justify-center items-center'}>
        <li className="py-8 text-5xl">
          <button
            onClick={() => {
              handleSmoothScroll('skills-section');
              setActiveSection('skills');
            }}
          >
            Skills
          </button>
        </li>
       
        <li className="py-8 text-5xl">
          <button
            onClick={() => {
              handleSmoothScroll('projects-section');
              setActiveSection('projects');
            }}
          >
            Projects
          </button>
        </li>
        <li className="py-8 text-5xl">
          <button
            onClick={() => {
              handleSmoothScroll('contact-section');
              setActiveSection('contact');
            }}
          >
            Contact
          </button>
        </li>
      </ul>
      <div className="hidden lg:flex fixed flex-col top-[35%] right-0">
       
      </div>
      {showScrollToTop && (
        <div className="fixed bottom-4 right-4">
          <button onClick={handleScrollToTop} className="bg-[#143c78] text-gray-300 rounded-full p-3">
            <FaArrowUp size={20} />
          </button>
        </div>
      )}
      <style jsx>{`
        .underline-button {
          position: relative;
        }

        .underline-button::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 2px;
          background-color: #EC407A;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .underline-button.active::after {
          opacity: 1;
        }
      `}</style>
      
      <style jsx>{`
        @media (min-width: 768px) {
          .hidden-md {
            display: none;
          }

          .ml-auto > :not(:last-child) {
            margin-right: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Navbar;

