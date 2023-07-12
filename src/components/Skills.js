import React from 'react';
import { FaReact, FaJs, FaNode, FaCuttlefish } from 'react-icons/fa';
import { SiCplusplus, SiPowerbi,SiTailwindcss } from 'react-icons/si';
import {GrMysql} from 'react-icons/gr';

const Skills = () => {
  return (
    <div name='skills' className='flex justify-center items-center w-full h-screen bg-[#0a192f] text-gray-300'>
      <div className='max-w-[1000px] mx-auto p-4 flex flex-col justify-center items-center w-full'>
        <div className='text-center'>
          <p className='text-4xl font-bold inline border-b-4 border-pink-600 mt-0'>SKILLSET</p>
        </div>

     
        <div className='grid grid-cols-2 md:grid-cols-3 gap-x-24 gap-y-32 mt-4 justify-center items-center'>
          <div className='col-span-2 md:col-span-3 flex flex-col items-center justify-center'>
            <p className='text-2xl font-bold mt-2'>Tools</p>
          </div>
        </div>

 
        <div className='grid grid-cols-3 md:grid-cols-4 gap-x-24 gap-y-32 mt-8 justify-center' rel="noopener noreferrer">
          <div className='flex flex-col items-center justify-center' >
            <FaReact className='text-6xl text-blue-500 transition-transform transform hover:scale-110 cursor-pointer' />
            <p className='text-base font-bold mt-2 group-hover:opacity-100 transition-opacity'>
              React
            </p>
          </div>
          <div className='flex flex-col items-center justify-center' rel="noopener noreferrer">
            <SiTailwindcss className='text-6xl text-blue-400 transition-transform transform hover:scale-110 cursor-pointer' />
            <p className='text-base font-bold mt-2 group-hover:opacity-100 transition-opacity'>
              Tailwind CSS
            </p>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <FaNode className='text-6xl text-green-500 transition-transform transform hover:scale-110 cursor-pointer' />
            <p className='text-base font-bold mt-2 group-hover:opacity-100 transition-opacity'>
              Node.js
            </p>
          </div>
          <div className='flex flex-col items-center justify-center'>
            <SiPowerbi className='text-6xl text-yellow-300 transition-transform transform hover:scale-110 cursor-pointer' />
            <p className='text-base font-bold mt-2 group-hover:opacity-100 transition-opacity'>
              PowerBI
            </p>
          </div>
        </div>

      
  


<div className='grid grid-cols-2 md:grid-cols-3 gap-x-24 gap-y-32 mt-8 justify-center'>
  <div className='col-span-2 md:col-span-3 flex flex-col items-center justify-center'>
    <p className='text-2xl font-bold mt-2'>Languages</p>
  </div>
</div>


<div className='grid grid-cols-3 md:grid-cols-4 gap-x-24 gap-y-32 mt-8 justify-center'>
  <div className='flex flex-col items-center justify-center'>
    <SiCplusplus className='text-6xl text-purple-500 transition-transform transform hover:scale-110 cursor-pointer' />
    <p className='text-base font-bold mt-2 group-hover:opacity-100 transition-opacity'>
      C++
    </p>
  </div>
  <div className='flex flex-col items-center justify-center'>
    <FaCuttlefish className='text-6xl text-blue-300 transition-transform transform hover:scale-110 cursor-pointer' />
    <p className='text-base font-bold mt-2 group-hover:opacity-100 transition-opacity'>
      C
    </p>
  </div>
  <div className='flex flex-col items-center justify-center'>
    <FaJs className='text-6xl text-yellow-500 transition-transform transform hover:scale-110 cursor-pointer' />
    <p className='text-base font-bold mt-2 group-hover:opacity-100 transition-opacity'>
      JavaScript
    </p>
  </div>
  <div className='flex flex-col items-center justify-center'>
  <GrMysql className='text-6xl' style={{ color: '#00758F' }} />
  <p className='text-base font-bold mt-2 group-hover:opacity-100 transition-opacity'>
    MySQL
  </p>
</div>

</div>


      </div>
    </div>
  );
};

export default Skills;
