'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiCode, FiAward, FiBriefcase, FiDownload, FiChevronDown, FiChevronUp, FiExternalLink } from 'react-icons/fi';
import { portfolioData } from '@/lib/data';

export default function CVSummary() {
  const [isDetailed, setIsDetailed] = useState(false);
  const { boaseStats, skills, experience, education, about } = portfolioData;

  const stats = [
    { label: 'Years Experience', value: boaseStats.yearsExperience, icon: FiClock, color: 'text-blue-400' },
    { label: 'Projects Shipped', value: boaseStats.projectsLaunched, icon: FiBriefcase, color: 'text-green-400' },
    { label: 'Lines of Code', value: boaseStats.linesOfCode, icon: FiCode, color: 'text-purple-400' },
    { label: 'Token Price', value: boaseStats.tokenPrice, icon: FiAward, color: 'text-yellow-400' },
  ];

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/richard-boase-cv.pdf';
    link.download = 'richard-boase-cv.pdf';
    link.click();
  };

  return (
    <div className="bg-gray-900/30 backdrop-blur-md border border-gray-800 p-8 md:p-12 h-full flex flex-col">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">
            $BOASE
          </h2>
          <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-[0.3em]">Institutional Asset Profile</p>
        </div>
        <div className="px-4 py-1.5 border border-white/10 bg-white/5 rounded-full text-white/40 text-[10px] font-mono tracking-widest uppercase">
          Static Revision 2.0
        </div>
      </div>

      {/* Founder's Vision / Mission */}
      <div className="mb-12">
        <h3 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-[0.4em]">Founder's Vision</h3>
        <p className="text-gray-300 leading-relaxed text-lg font-light tracking-tight">
          {about.bio || "Boase is a high-performance full-stack developer and digital architect. Specializing in decentralized applications, AI integration, and scalable web platforms. Participating in the $BOASE ecosystem is a strategic alignment with human capital and high-velocity shipping across the entire studio network."}
        </p>
      </div>

      {/* Core Competencies - Simplified */}
      <div className="mb-12 pt-12 border-t border-gray-800">
        <h3 className="text-[10px] font-bold text-gray-500 mb-6 uppercase tracking-[0.4em]">Operational Matrix</h3>
        <div className="flex flex-wrap gap-3">
          {['AI Integration', 'Web3 Architecture', 'Full-Stack Systems', 'UI/UX Strategy'].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-sm text-[10px] text-gray-400 font-bold uppercase tracking-widest"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Action Toggle */}
      <div className="mt-auto pt-8 border-t border-gray-800">
        <button
          onClick={() => setIsDetailed(!isDetailed)}
          className="w-full flex items-center justify-center gap-4 px-6 py-4 bg-white !text-black font-black uppercase tracking-[0.4em] transition-all hover:bg-gray-200 text-[10px]"
        >
          {isDetailed ? (
            <>Close Performance Report <FiChevronUp /></>
          ) : (
            <>View Professional Audit <FiChevronDown className="group-hover:translate-y-1 transition-transform" /></>
          )}
        </button>
      </div>

      {/* Detailed Content */}
      <AnimatePresence>
        {isDetailed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-8 space-y-8">
              {/* Experience Section */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                  <FiBriefcase className="text-green-400" /> Professional Experience
                </h3>
                <div className="space-y-6">
                  {experience?.map((exp) => (
                    <div key={exp.id} className="relative pl-4 border-l-2 border-gray-800 hover:border-blue-500 transition-colors">
                      <h4 className="text-white font-medium text-base">{exp.role}</h4>
                      <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                        <span>{exp.company}</span>
                        <span className="font-mono text-xs bg-gray-800 px-2 py-0.5 rounded">{exp.period}</span>
                      </div>
                      <ul className="space-y-1">
                        {exp.description.map((item, i) => (
                          <li key={i} className="text-xs text-gray-400 leading-relaxed">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education Section */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                  <FiAward className="text-yellow-400" /> Education
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {education?.map((edu) => (
                    <div key={edu.id} className="bg-black/20 p-4 rounded border border-gray-800">
                      <h4 className="text-white font-medium text-sm">{edu.degree}</h4>
                      <div className="text-xs text-blue-400 mb-1">{edu.school}</div>
                      <p className="text-xs text-gray-500">{edu.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Skills Matrix */}
              <section>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
                  <FiCode className="text-purple-400" /> Technical Matrix
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Core Stack</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.frameworks.map(t => (
                        <span key={t} className="text-[10px] px-2 py-1 bg-gray-800 rounded text-gray-300 border border-gray-700">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Languages</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.languages.map(t => (
                        <span key={t} className="text-[10px] px-2 py-1 bg-gray-800 rounded text-gray-300 border border-gray-700">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white !text-black font-bold rounded hover:bg-gray-200 transition-colors text-sm"
                >
                  <FiDownload /> Download Full PDF
                </button>
                <a
                  href={about.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0A66C2] text-white font-bold rounded hover:bg-[#004182] transition-colors text-sm"
                >
                  <FiExternalLink /> LinkedIn Profile
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
