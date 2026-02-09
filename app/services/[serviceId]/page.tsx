'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiClock, FiDollarSign } from 'react-icons/fi';
import { services } from '@/lib/services';
import { motion } from 'framer-motion';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;
  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4 font-mono">404: Service Not Found</h1>
        <p className="text-zinc-500 mb-8">The service "{serviceId}" does not exist in our catalog.</p>
        <button
          onClick={() => router.push('/services')}
          className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
        >
          Return to Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

        {/* Navigation */}
        <nav className="mb-12">
          <Link href="/services" className="inline-flex items-center text-zinc-500 hover:text-white transition-colors group">
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Services
          </Link>
        </nav>

        {/* Header */}
        <header className="mb-12 border-b border-zinc-900 pb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-xs font-mono uppercase tracking-wider text-cyan-500">
            <span className="px-2 py-1 bg-cyan-950/30 border border-cyan-900 rounded">{service.category}</span>
            <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">{service.status}</span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            {service.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-400 leading-relaxed max-w-2xl"
          >
            {service.description}
          </motion.p>
        </header>

        {/* Main Content */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column: Details */}
          <div className="md:col-span-2 space-y-12">

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">About the Service</h2>
              <div className="prose prose-invert prose-zinc max-w-none">
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                  {service.longDescription || service.description}
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Deliverables</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.deliverables.map((item, i) => (
                  <li key={i} className="flex items-start bg-zinc-900/50 p-4 rounded-lg border border-zinc-900">
                    <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6 text-white">Technologies</h2>
              <div className="flex flex-wrap gap-2">
                {service.technologies.map((tech) => (
                  <span key={tech} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-300 font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Key Info Card */}
          <div className="md:col-span-1">
            <div className="sticky top-8 bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-6 pb-4 border-b border-zinc-900">Project Overview</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center text-zinc-500 mb-2">
                    <FiDollarSign className="w-4 h-4 mr-2" />
                    <span className="text-xs uppercase tracking-widest">Estimated cost</span>
                  </div>
                  <p className="text-xl font-mono font-semibold text-white">{service.price}</p>
                </div>

                <div>
                  <div className="flex items-center text-zinc-500 mb-2">
                    <FiClock className="w-4 h-4 mr-2" />
                    <span className="text-xs uppercase tracking-widest">Timeline</span>
                  </div>
                  <p className="text-xl font-mono font-semibold text-white">{service.timeline}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-900">
                <Link
                  href={`/contact?service=${service.id}`}
                  className="block w-full py-3 bg-white text-black text-center font-bold rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Inquire Now
                </Link>
                <p className="text-xs text-zinc-600 text-center mt-3">
                  Free consultation included
                </p>
              </div>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}