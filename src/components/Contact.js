import React from 'react';

function Contact() {
  return (
    <div name='contact' className='flex flex-col justify-center items-center min-h-screen bg-[#0a192f] text-gray-300'>
      <style>
        {`
          /* Style the scrollbar for WebKit browsers (Chrome, Safari) */
          ::webkit-scrollbar {
            width: 8px;
          }

          ::webkit-scrollbar-thumb {
            background-color: #4f4f4f;
            border-radius: 4px;
          }

          ::webkit-scrollbar-track {
            background-color: #0a192f;
          }
        `}
      </style>
      <div className="max-w-xl mx-auto mt-10 sm:mt-20 overflow-y-auto">
        <h1 className="text-5xl font-bold mb-8">
          <span className="border-b-4 border-pink-500">Contact Me!</span>
        </h1>
        <div className="mb-6">
          {/* Include the Google Form iframe */}
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdvNKoXR9L2x6mbWPOgxSttwtHz-tLFBgDSIq9-OT5NTFoPBw/viewform?embedded=true"
            height="618"
            width="640"
          >
            Loading...
          </iframe>
        </div>
      </div>
    </div>
  );
}

export default Contact;




