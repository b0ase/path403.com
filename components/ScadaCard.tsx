import React from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

interface ScadaCardProps {
  title: string;
  description: string;
  href: string;
  icon?: React.ReactNode;
}

const ScadaCard: React.FC<ScadaCardProps> = ({ title, description, href, icon }) => {
  return (
    <Link href={href}>
      <div className="group relative flex flex-col h-full bg-zinc-950/40 border border-zinc-900 rounded-pillar overflow-hidden transition-all duration-300 hover:border-zinc-700">
        {/* Glow Effect */}
        {/* Header decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>

        <div className="relative p-8 flex flex-col h-full">
          {icon && (
            <div className="mb-6 w-12 h-12 flex items-center justify-center rounded-pillar bg-black border border-zinc-900 text-zinc-500 group-hover:border-white group-hover:text-white transition-all duration-300">
              {icon}
            </div>
          )}

          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-4 transition-colors duration-300">
            {title}
          </h3>

          <p className="text-zinc-600 text-[11px] uppercase tracking-tighter leading-relaxed mb-8 flex-grow">
            {description}
          </p>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-800 group-hover:text-zinc-400 transition-colors duration-300">
            LOAD_MODULE <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ScadaCard;
