'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiHome, FiSettings, FiGrid, FiList } from 'react-icons/fi';
import { services } from '@/lib/services';
import { useNavbar } from '@/components/NavbarProvider';

export default function ServicesPage() {
  const router = useRouter();
  const { isDark } = useNavbar();
  const [filter, setFilter] = useState<'All' | 'AI & Automation' | 'Development' | 'Creative' | 'Automation'>('All');

  const filteredServices = (filter === 'All'
    ? services
    : services.filter(service => service.category === filter)).sort((a, b) => (a.shortTitle || a.title).localeCompare(b.shortTitle || b.title));

  const categories = ['All', 'AI & Automation', 'Development', 'Creative', 'Automation'];

  return (
    <motion.div
      className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-black text-white' : 'bg-white text-black'} selection:bg-blue-500 selection:text-white relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.section
        className="px-4 md:px-8 py-20 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
          <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isDark ? 'bg-blue-600' : 'bg-blue-400'}`} />
          <div className={`absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-10 ${isDark ? 'bg-purple-600' : 'bg-purple-400'}`} />
        </div>

        {/* High-Fidelity Header */}
        <motion.div
          className={`mb-20 border-b pb-12 relative z-10 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row md:items-end gap-8 mb-6">
            <div className={`p-6 border self-start shadow-xl ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
              <FiSettings className={`text-4xl md:text-7xl transition-colors ${isDark ? 'text-white' : 'text-black'}`} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-mono uppercase tracking-[0.3em] text-blue-500 font-bold mb-1">
                Engineering & Design
              </div>
              <h1 className="text-5xl md:text-8xl font-black leading-none tracking-tighter">
                SERVICES<span className="text-blue-500">_</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-10 gap-8">
            <div className="max-w-2xl">
              <p className={`text-lg md:text-xl font-medium leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Premium architectural and creative capabilities for the next generation of digital artifacts. We build for the **Third Audience** — ensuring every interface is as legible to AI agents as it is to humans.
              </p>
            </div>
            <div className={`flex gap-10 font-mono text-xs uppercase tracking-widest text-zinc-500 border-l pl-8 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div>
                <span className={`block text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{services.length}</span>
                Total
              </div>
              <div>
                <span className={`block text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{services.filter(s => s.featured).length}</span>
                Featured
              </div>
            </div>
          </div>
        </motion.div>

        {/* UI/UX Spotlight (if filtered to All or Creative) */}
        {(filter === 'All' || filter === 'Creative') && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className={`h-px flex-grow ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
              <div className="text-[10px] font-mono tracking-[0.4em] uppercase text-zinc-400">Core Offering</div>
              <div className={`h-px flex-grow ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            </div>
          </div>
        )}

        {/* Filter Navigation */}
        <div className={`flex flex-wrap gap-2 mb-16 p-2 border rounded-2xl w-fit mx-auto md:mx-0 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'}`}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat as any)}
              className={`px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-xl ${filter === cat
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : `${isDark ? 'hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'hover:bg-zinc-200 text-zinc-500 hover:text-black'}`
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          <AnimatePresence mode="wait">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onClick={() => router.push(`/services/${service.id}`)}
                className={`group relative p-8 rounded-3xl transition-all duration-500 cursor-pointer overflow-hidden border flex flex-col h-full ${isDark
                  ? 'bg-zinc-900/40 border-zinc-800 hover:border-blue-500/50'
                  : 'bg-white border-zinc-100 shadow-xl shadow-zinc-200/50 hover:border-blue-400/50'
                  }`}
                style={{
                  boxShadow: isDark
                    ? 'inset 0 1px 1px rgba(255,255,255,0.05)'
                    : 'inset 0 1px 1px rgba(255,255,255,0.8)'
                }}
              >
                {/* Glow Effect */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] transition-opacity duration-500 opacity-0 group-hover:opacity-40 ${isDark ? 'bg-blue-600' : 'bg-blue-400'}`} />

                <div className="flex justify-between items-start mb-8 z-10">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-blue-500 font-bold">
                      {service.category}
                    </span>
                    <h3 className={`text-2xl font-black leading-tight tracking-tight leading-none group-hover:text-blue-500 transition-colors`}>
                      {service.shortTitle || service.title}
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl transition-all duration-300 ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'} group-hover:bg-blue-600 group-hover:text-white`}>
                    <FiArrowRight className="w-5 h-5" />
                  </div>
                </div>

                <p className={`text-sm mb-10 leading-relaxed z-10 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {service.description}
                </p>

                <div className={`mt-auto pt-8 border-t z-10 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.technologies.slice(0, 4).map(tech => (
                      <span key={tech} className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${isDark
                        ? 'bg-zinc-950/80 border-zinc-800 text-zinc-500 group-hover:border-zinc-700'
                        : 'bg-zinc-50 border-zinc-100 text-zinc-400 group-hover:border-zinc-200'
                        }`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-zinc-500">Timeline: {service.timeline}</span>
                    <span className={`font-black p-2 rounded-lg ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                      {service.price}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredServices.length === 0 && (
          <motion.div
            className={`text-center py-32 rounded-3xl border-2 border-dashed ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-zinc-400 text-xl font-mono mb-6 italic">NullPointerException: No capabilities found.</p>
            <button
              onClick={() => setFilter('All')}
              className={`px-10 py-4 text-xs font-black uppercase tracking-[0.3em] transition-all rounded-full ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black'}`}
            >
              System Reset
            </button>
          </motion.div>
        )}

        <div className={`mt-32 pt-12 border-t text-center ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <Link
            href="/"
            className={`inline-flex items-center gap-3 font-black uppercase tracking-[0.2em] text-xs transition-all hover:gap-5 ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}
          >
            <FiHome className="text-lg" /> <span>Back to Nexus</span>
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}