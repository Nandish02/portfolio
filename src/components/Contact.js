import React, { useRef, useState, useCallback } from 'react';
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
  { icon: FaEnvelope, label: 'Email', value: 'nandishchokshi02@gmail.com', href: 'mailto:nandishchokshi02@gmail.com', color: '#E11D48' },
  { icon: FaLinkedin, label: 'LinkedIn', value: 'nandish-chokshi', href: 'https://www.linkedin.com/in/nandish-chokshi-48435a179', color: '#0284C7' },
  { icon: FaGithub, label: 'GitHub', value: 'Nandish02', href: 'https://github.com/Nandish02', color: '#4F46E5' },
];

function Contact() {
  const sectionRef = useRef(null);
  const visible = useOnScreen(sectionRef);
  const headRef = useRef(null);
  const headVisible = useOnScreen(headRef);

  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');
  const [focused, setFocused] = useState(null);

  const submitRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://formsubmit.co/ajax/979622a9828a72a269004c71ea33d4b5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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

  const handleMagnetic = useCallback((e) => {
    const btn = submitRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.02)`;
  }, []);

  const handleMagneticLeave = useCallback(() => {
    if (submitRef.current) submitRef.current.style.transform = 'translate(0,0) scale(1)';
  }, []);

  const inputBase = 'w-full bg-muted/60 rounded-xl px-4 py-3.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none border';

  const inputClasses = (field) =>
    `${inputBase} ${
      focused === field
        ? 'border-accent ring-2 ring-accent/10 bg-card shadow-sm scale-[1.01]'
        : 'border-border hover:border-accent/20'
    }`;

  return (
    <section className="relative py-24 md:py-32">
      <div ref={sectionRef} className="max-w-5xl mx-auto px-6">
        <div ref={headRef} className="text-center mb-16">
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-warm-emerald bg-warm-emerald/[0.06] border border-warm-emerald/15 mb-4 ${
              headVisible ? 'animate-scale-reveal' : 'opacity-0'
            }`}
          >
            Let's Connect
          </span>
          <h2 className={`section-heading ${headVisible ? 'animate-blur-reveal animate-delay-200' : 'opacity-0'}`}>
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className={`mt-4 text-muted-foreground max-w-md mx-auto text-sm ${headVisible ? 'animate-blur-reveal animate-delay-400' : 'opacity-0'}`}>
            Have a project in mind or want to chat? Drop me a message.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Contact links */}
          <div className="lg:col-span-2 space-y-4">
            {contactLinks.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 p-5 card card-hover ${
                  visible ? 'animate-slide-up-spring' : 'opacity-0'
                }`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    backgroundColor: `${link.color}10`,
                    transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                >
                  <link.icon size={20} style={{ color: link.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-semibold text-foreground text-sm">{link.label}</p>
                  <p className="text-xs text-muted-foreground group-hover:text-secondary transition-colors truncate">
                    {link.value}
                  </p>
                </div>
                <FaEnvelope
                  size={12}
                  className="ml-auto text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  style={{ display: link.label === 'Email' ? 'none' : undefined }}
                />
              </a>
            ))}
            <p className="text-[11px] text-muted-foreground pl-1 pt-2">
              Typically respond within 24 hours.
            </p>
          </div>

          {/* Form */}
          <div
            className={`lg:col-span-3 card overflow-hidden ${
              visible ? 'animate-blur-reveal' : 'opacity-0'
            }`}
            style={{ animationDelay: '300ms' }}
          >
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              <input type="text" name="_honey" style={{ display: 'none' }} />

              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true },
                  { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', required: true },
                ].map((field) => (
                  <div key={field.id} className="relative">
                    <label
                      htmlFor={field.id}
                      className={`block text-[11px] font-medium mb-2 uppercase tracking-widest transition-all duration-300 ${
                        focused === field.id ? 'text-accent' : 'text-muted-foreground'
                      }`}
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      required={field.required}
                      value={formData[field.id]}
                      onChange={handleChange}
                      onFocus={() => setFocused(field.id)}
                      onBlur={() => setFocused(null)}
                      placeholder={field.placeholder}
                      className={inputClasses(field.id)}
                      style={{ transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                    />
                  </div>
                ))}
              </div>

              <div className="relative">
                <label
                  htmlFor="subject"
                  className={`block text-[11px] font-medium mb-2 uppercase tracking-widest transition-all duration-300 ${
                    focused === 'subject' ? 'text-accent' : 'text-muted-foreground'
                  }`}
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
                  style={{ transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                />
              </div>

              <div className="relative">
                <label
                  htmlFor="message"
                  className={`block text-[11px] font-medium mb-2 uppercase tracking-widest transition-all duration-300 ${
                    focused === 'message' ? 'text-accent' : 'text-muted-foreground'
                  }`}
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
                  style={{ transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                />
              </div>

              <button
                ref={submitRef}
                type="submit"
                disabled={status === 'sending'}
                className="magnetic-btn group relative w-full py-3.5 rounded-xl font-semibold text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  boxShadow: '0 4px 24px -4px rgba(79, 70, 229, 0.35)',
                  transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
                }}
                onMouseMove={handleMagnetic}
                onMouseLeave={handleMagneticLeave}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-accent via-warm-violet to-accent bg-300% animate-gradient-x" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), transparent 60%)' }}
                />
                <span className="relative z-10 flex items-center justify-center gap-2 text-sm">
                  {status === 'sending' ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={13} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                      Send Message
                    </>
                  )}
                </span>
              </button>

              {status === 'success' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm animate-slide-up-spring">
                  <FaCheckCircle size={15} />
                  <span>Sent! I'll get back to you soon.</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-slide-up-spring">
                  <FaExclamationCircle size={15} />
                  <span>
                    Something went wrong.{' '}
                    <a href="mailto:nandishchokshi02@gmail.com" className="underline underline-offset-2">Email me directly</a>.
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
