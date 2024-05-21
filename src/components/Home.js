import React, { useState, useEffect } from 'react';
import { FaGithub, FaEnvelope, FaLinkedin } from 'react-icons/fa';
import { RingLoader } from 'react-spinners';

function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating an asynchronous operation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    // Cleanup the timer on component unmount or when loading is finished
    return () => clearTimeout(timer);
  }, [window.scrollY]);

  return (
    <div>
      <div name='about' className='w-full h-screen bg-[#0a192f] text-gray-300'>
        <div className='flex flex-col justify-center items-center w-full h-full'>
          {loading ? (
            <RingLoader color="#36d7b7" cssOverride={{}} size={150} speedMultiplier={1.5} />
          ) : (
            <div style={{ marginBottom: '10px' }}></div>
          )}
          <div className='max-w-[1000px] w-full grid grid-cols-2 gap-8'>
            <div className='sm:text-right pb-10 pl-4'>
              <p className='text-4xl font-bold inline border-b-4 border-pink-600'>
                <span className='font-bold uppercase tracking'>About Me</span>
              </p>
            </div>
            <div></div>
          </div>
          <div className='max-w-[1000px] w-full grid sm:grid-cols-2 gap-8 px-4'>
            <div className='sm:text-right text-4xl font-bold'>
              <p>
                Hi, I'm <span className='text-pink-500 font-bold'>Nandish Chokshi</span>, nice to meet you.
              </p>
              <div className='flex items-center justify-center sm:justify-end mt-6'>
                <a href='https://github.com/Nandish02' className='mr-4' target='_blank' rel='noopener noreferrer'>
                  <FaGithub size={28} className='text-white' />
                </a>
                <a href='mailto:nandishchokshi02@gmail.com' className='mr-4' target='_blank' rel='noopener noreferrer'>
                  <FaEnvelope size={28} className='text-white' />
                </a>
                <a href='https://www.linkedin.com/in/nandish-chokshi-2904' target='_blank' rel='noopener noreferrer'>
                  <FaLinkedin size={28} className='text-white' />
                </a>
              </div>
            </div>
            <div>
              <p style={{ fontWeight: 'semi-bold' }}>
                I am a Computer Science student at BITS Goa. An aspiring software engineer and enthusiastic student with a love for coding and problem-solving. Eager to learn and apply new technologies to create innovative solutions.
              </p>
              <p style={{ marginTop: '0rem', fontWeight: 'semi-bold' }}>
                Let's connect and explore opportunities together!
              </p>
              <div style={{ marginTop: '1rem' }}>
                <a
                  href='https://github.com/Nandish02/portfolio/blob/master/src/Images/Nandish_Chokshi-Resume.pdf'
                  className='transition-all duration-200 border-seashell border hover:border-opacity-0 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-opacity-10 hover:text-xl'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Resume
                </a>
              </div>
            </div>
          </div>
          <hr className='max-w-[1000px] mx-auto border-t-2 border-gray-500 my-8' />
        </div>
      </div>
    </div>
  );
}

export default Home;
