import React, { useRef, useState } from 'react';
import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import useOnScreen from '../useOnScreen';

const contactLinks = [
  {
    icon: FaEnvelope,
    label: 'Email',
    value: 'nandishchokshi02@gmail.com',
    href: 'mailto:nandishchokshi02@gmail.com',
    color: '#f472b6',
  },
  {
    icon: FaLinkedin,
    label: 'LinkedIn',
    value: 'nandish-chokshi',
    href: 'https://www.linkedin.com/in/nandish-chokshi-48435a179',
    color: '#60a5fa',
  },
  {
    icon: FaGithub,
    label: 'GitHub',
    value: 'Nandish02',
    href: 'https://github.com/Nandish02',
    color: '#a78bfa',
  },
];

function Contact() {
  const sectionRef = useRef(null);
  const visible = useOnScreen(sectionRef);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('https://formsubmit.co/ajax/979622a9828a72a269004c71ea33d4b5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          _subject: formData.subject || 'New message from portfolio',
          message: formData.message,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }

    setTimeout(() => setStatus('idle'), 6000);
  };

  const inputBase =
    'w-full bg-white/[0.03] rounded-xl px-4 py-3.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all duration-300 border';

  const inputClasses = (field) =>
    `${inputBase} ${
      focused === field
        ? 'border-accent-purple/50 shadow-lg shadow-accent-purple/5 bg-white/[0.06]'
        : 'border-white/[0.08] hover:border-white/[0.15]'
    }`;

  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent-pink/[0.03] blur-[150px] pointer-events-none" />

      <div ref={sectionRef} className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-accent-emerald glass mb-4">
            Let's Connect
          </span>
          <h2 className="section-heading">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-md mx-auto text-sm">
            Have a project in mind or want to chat? Drop me a message.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left: contact links */}
          <div className="lg:col-span-2 space-y-4">
            {contactLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 p-5 rounded-2xl glass glass-hover transition-all duration-500 hover:-translate-y-0.5 ${
                  visible
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-6'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: `${link.color}12` }}
                >
                  <link.icon
                    size={20}
                    style={{ color: link.color }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-white text-sm">
                    {link.label}
                  </p>
                  <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors truncate">
                    {link.value}
                  </p>
                </div>
              </a>
            ))}

            {/* Small note */}
            <p className="text-[11px] text-gray-600 pl-1 pt-2">
              Typically respond within 24 hours.
            </p>
          </div>

          {/* Right: form */}
          <div
            className={`lg:col-span-3 rounded-2xl glass overflow-hidden transition-all duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              {/* Honeypot for spam prevention */}
              <input type="text" name="_honey" style={{ display: 'none' }} />

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-widest"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    placeholder="Your name"
                    className={inputClasses('name')}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-widest"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    className={inputClasses('email')}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-widest"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  onFocus={() => setFocused('subject')}
                  onBlur={() => setFocused(null)}
                  placeholder="What's this about?"
                  className={inputClasses('subject')}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-[11px] font-medium text-gray-500 mb-2 uppercase tracking-widest"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  placeholder="Tell me about your project or idea..."
                  className={`${inputClasses('message')} resize-none`}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="group relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-purple/15 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent-blue via-accent-purple to-accent-pink bg-300% animate-gradient-x" />
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                  {status === 'sending' ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={13} />
                      Send Message
                    </>
                  )}
                </span>
              </button>

              {status === 'success' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-sm animate-fade-in-up">
                  <FaCheckCircle size={15} />
                  <span>Sent! I'll get back to you soon.</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in-up">
                  <FaExclamationCircle size={15} />
                  <span>
                    Something went wrong.{' '}
                    <a
                      href="mailto:nandishchokshi02@gmail.com"
                      className="underline underline-offset-2"
                    >
                      Email me directly
                    </a>
                    .
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
