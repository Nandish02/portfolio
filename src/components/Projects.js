import React from 'react';
import mupImage from '../Images/mup_image.png';
import rest from '../Images/rest.png';
import japp from '../Images/Journal-App.png';

function Projects() {
  return (
    <div name='projects' className='flex flex-col items-center w-full min-h-screen bg-[#0a192f] text-gray-300'>
      <div className="container mx-auto mt-20">
        <h1 className="text-4xl font-bold mb-6 text-center">
          <span className="border-b-2 border-pink-500 pb-2">PROJECTS</span>
        </h1>
        <div className="flex flex-wrap justify-center items-start">
      
        <div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/3 p-4 h-96 ">
  <a href="https://github.com/Nandish02/Smart-Garage-System.git" target="_blank" rel="noopener noreferrer">
    <div className="bg-blue-200 shadow-md rounded-lg p-4 m-4 transform hover:scale-105 transition duration-300 h-full flex flex-col items-center overflow-y-auto scrollbar-hide">
      <img src={mupImage} alt="Project 1" className="w-full h-32 object-cover rounded-lg mb-4" />
      <h2 className="text-lg font-bold mb-2 text-black">Smart Garage System</h2>
      <p className="text-gray-500 mb-4">
        <li>Simulated the working of a smart garage where the cars could be stored in individual parking lots.</li>
        <li>Designed the system using an Intel 8086 microprocessor.</li>
        <li>Designed a car counter system using IR sensors and an LCD screen to display the count of cars.</li>
      </p>
      <button className="text-blue-500 bg-transparent border border-blue-500 py-2 px-4 rounded hover:bg-blue-500 hover:text-white transition-colors">
        Check it Out
      </button>
    </div>
  </a>
</div>

<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/3 p-4 h-96">
  <a href="YOUR_PROJECT_2_URL" target="_blank" rel="noopener noreferrer">
    <div className="bg-blue-200 shadow-md rounded-lg p-4 m-4 transform hover:scale-105 transition duration-300 h-full flex flex-col items-center overflow-y-auto scrollbar-hide">
      <img src={rest} alt="Project 2" className="w-full h-32 object-cover rounded-lg mb-4" />
      <h2 className="text-lg font-bold mb-2 text-black">Real-Time API</h2>
      <p className="text-gray-500 mb-4">
        <li>Developed and implemented a RESTful API server using Node.js and Express.js to interact between front-end and MySQL database.</li>
        <li>Used JavaScript and Tailwind CSS to build the front-end and implemented client-side and server-side functionalities for API calling and MySQL database integration.</li>
      </p>
      <button className="text-blue-500 bg-transparent border border-blue-500 py-2 px-4 rounded hover:bg-blue-500 hover:text-white transition-colors">
        Check it Out
      </button>
    </div>
  </a>
</div>

<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/3 p-4 h-96">
  <a href="YOUR_PROJECT_3_URL" target="_blank" rel="noopener noreferrer">
    <div className="bg-blue-200 shadow-md rounded-lg p-4 m-4 transform hover:scale-105 transition duration-300 h-full flex flex-col items-center overflow-y-auto scrollbar-hide">
      <img src={japp} alt="Project 3" className="w-full h-32 object-cover rounded-lg mb-4" />
      <h2 className="text-lg font-bold mb-2 text-black">Journal App</h2>
      <p className="text-gray-500 mb-4">
        <li>Journal based App using Java and Android Studio that allows the user to record entries in the app.</li>
        <li>The user can enter the title, select the Date, Start Time, and End Time. Dialog Pickers are used for selection. Saving and deletion of entries are allowed using the Room Database underneath.</li>
        <li>The menu bar also shows a share option so the user can share plain text through the OS - specified apps on the device.</li>
      </p>
      <button className="text-blue-500 bg-transparent border border-blue-500 py-2 px-4 rounded hover:bg-blue-500 hover:text-white transition-colors">
        Check it Out
      </button>
    </div>
  </a>
</div>



        </div>
      </div>
    </div>
  );
}

export default Projects;
