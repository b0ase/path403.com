'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiMail, FiMessageCircle } from 'react-icons/fi';
import { FaTwitter, FaLinkedinIn, FaTelegram, FaDiscord } from 'react-icons/fa';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Stats for the visual layout matching Content page
  const contactMethods = [
    { name: 'Email', icon: FiMail, href: 'mailto:richard@b0ase.com', display: 'richard@b0ase.com' },
    { name: 'WhatsApp', icon: FiMessageCircle, href: 'https://wa.me/447898073077', display: '+44 7898 073077' },
    { name: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/b0ase', display: '@b0ase' },
    { name: 'LinkedIn', icon: FaLinkedinIn, href: 'https://linkedin.com/in/richardboase', display: 'Richard Boase' },
    { name: 'Telegram', icon: FaTelegram, href: 'https://t.me/richardboase', display: '@richardboase' },
    { name: 'Discord', icon: FaDiscord, href: 'https://discord.gg/gbTG9BcM', display: '@b0ase' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Create mailto link
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:richard@b0ase.com?subject=${subject}&body=${body}`;

    // Reset form after a delay
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSending(false);
    }, 1000);
  };

  return (
    <motion.div
      className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 pt-32 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div>
          {/* Header */}
          <motion.div
            className="mb-8 flex flex-col md:flex-row md:items-end gap-6 border-b border-zinc-900 pb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
              <FiMail className="text-4xl md:text-6xl text-white" />
            </div>
            <div className="flex items-end gap-4">
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-none tracking-tighter">
                CONTACT
              </h2>
              <div className="text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
                GET_IN_TOUCH
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="flex items-baseline gap-8 mb-16"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div>
              <span className="text-4xl md:text-5xl font-bold text-white">
                {contactMethods.length}
              </span>
              <span className="text-sm ml-2 text-gray-400 uppercase tracking-wide">
                Channels
              </span>
            </div>
            <div>
              <span className="text-4xl md:text-5xl font-bold text-white">
                24h
              </span>
              <span className="text-sm ml-2 text-gray-400 uppercase tracking-wide">
                Response Time
              </span>
            </div>
          </motion.div>

          {/* Contact Channels Grid */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-medium text-gray-400">
                Direct Channels
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.05 }}
                  className="group"
                >
                  <a href={method.href} target="_blank" rel="noopener noreferrer">
                    <div className="border border-gray-800 hover:border-gray-600 p-3 transition-all duration-300 h-full bg-black hover:bg-zinc-900/10">
                      <method.icon className="text-xl text-gray-400 mb-2 group-hover:text-white transition-colors" />
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-white uppercase tracking-tight">
                        {method.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono truncate">
                        {method.display}
                      </p>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="mt-20 border-t border-gray-800 pt-12">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">
                  Send a Message
                </h3>
                <p className="text-gray-400">
                  Or use the form below to open your default mail client prepopulated with your message.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/20 p-8 border border-zinc-800">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors font-mono"
                      placeholder="YOUR NAME"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors font-mono"
                      placeholder="YOUR@EMAIL.COM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="w-full bg-black border border-zinc-800 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors font-mono resize-none"
                    placeholder="YOUR MESSAGE..."
                  />
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={sending}
                    className={`px-8 py-3 font-bold flex items-center justify-center gap-2 transition-colors uppercase tracking-wider ${sending
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                      : 'bg-white text-black hover:bg-gray-200 border border-white'
                      }`}
                  >
                    <FiSend size={16} />
                    {sending ? 'Processing...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
