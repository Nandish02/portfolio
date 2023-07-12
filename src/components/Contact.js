import React, { useState } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import axios from 'axios';

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name && email && message) {
      console.log('Form submitted:', { name, email, message });
      alert('Form submitted successfully');
      setName('');
      setEmail('');
      setMessage('');

    const emaildata = { Phone: name, Email: email, Date: message };
      await axios.post('https://selfcare.servebbs.org/WebService/WebService1.asmx/SendEmail', emaildata);
      
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        window.location.reload(); 
      }, 2000);
    } else {
      console.log('Please fill all the fields');
    }
  };

  return (
    <div name='contact' className='flex flex-col justify-center items-center w-full h-screen bg-[#0a192f] text-gray-300'>
      <div className="max-w-xl mx-auto mt-10 sm:mt-20">
        <h1 className="text-5xl font-bold mb-8">
          <span className="border-b-4 border-pink-500">Contact Me!</span>
        </h1>
        {submitted ? (
          <div className="bg-green-500 text-white px-4 py-2 rounded mb-6">
            Form submitted successfully!
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xl font-medium mb-2" htmlFor="name"> Name </label>
            <input
              className="w-full border border-gray-300 rounded px-4 py-2 text-black"
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-xl font-medium mb-2" htmlFor="email"> Email </label>
            <input
              className="w-full border border-gray-300 rounded px-4 py-2 text-black"
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-xl font-medium mb-2" htmlFor="message"> Text message </label>
            <textarea
              className="w-full border border-gray-300 rounded px-4 py-2 text-black"
              id="message"
              name="message"
              rows="6"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </div>
          <button type="submit" className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded">
            <span className="mr-2">Send</span>
            <IoSendSharp size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Contact;
