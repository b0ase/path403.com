'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  Lightbulb,
  Users,
  Settings,
  MessageSquare,
  CheckCircle,
  Clock,
  Briefcase,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    title: 'Vision Protocol',
    id: 'VISION',
    icon: <Lightbulb className="h-6 w-6" />,
    fields: [
      { label: 'Identifier', name: 'companyName', type: 'text', placeholder: 'ENTER ENTITY NAME', required: true },
      { label: 'Strategic Mission', name: 'vision', type: 'textarea', placeholder: 'DESCRIBE CORE MISSION AND OBJECTIVES', required: true },
      { label: 'Sector Integration', name: 'industry', type: 'text', placeholder: 'INDUSTRIES / MARKET SECTORS', required: false },
    ],
  },
  {
    title: 'Personnel Assets',
    id: 'PERSONNEL',
    icon: <Users className="h-6 w-6" />,
    fields: [
      { label: 'Founder(s)', name: 'founders', type: 'text', placeholder: 'NAME KEY STAKEHOLDERS', required: true },
      { label: 'Core Unit', name: 'team', type: 'textarea', placeholder: 'SPECIFY KEY PERSONNEL ROLES', required: false },
    ],
  },
  {
    title: 'Logic Modules',
    id: 'LOGIC',
    icon: <Settings className="h-6 w-6" />,
    fields: [
      { label: 'Required Infrastructures', name: 'services', type: 'textarea', placeholder: 'SPECIFY MODULES, SERVICES, OR CAPABILITIES', required: true },
      { label: 'Technical Constraints', name: 'notes', type: 'textarea', placeholder: 'ADDITIONAL SPECIFICATIONS', required: false },
    ],
  },
  {
    title: 'Consultation Phase',
    id: 'CONSULT',
    icon: <MessageSquare className="h-6 w-6" />,
    fields: [
      { label: 'Temporal Window', name: 'date', type: 'text', placeholder: 'PREFERRED SCHEDULING', required: false },
      { label: 'Communication Channel', name: 'email', type: 'email', placeholder: 'STAKEHOLDER@EMAIL.COM', required: true },
    ],
  },
];

export default function StartACompanyPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black leading-relaxed uppercase">
      <main className="relative z-10 px-4 md:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-24 border-b border-zinc-900 pb-12">
            <Link href="/studio" className="inline-flex items-center text-zinc-500 hover:text-white transition-colors mb-8 text-xs font-bold tracking-widest group">
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Return to Studio
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-zinc-900 border border-zinc-800 mr-6">
                  <Briefcase className="h-10 w-10 text-zinc-400" />
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white uppercase leading-none">Entity Initiation</h1>
              </div>
              <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed tracking-wide lowercase">
                Architect and register a new corporate entity within the studio ecosystem. Define vision, personnel, and core logic modules.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
            {/* Step Indicators (Desktop) */}
            <div className="hidden lg:block space-y-1">
              {steps.map((item, idx) => (
                <div
                  key={item.id}
                  className={`p-6 border transition-all duration-300 ${idx === step
                    ? 'bg-zinc-900 border-white text-white'
                    : idx < step
                      ? 'bg-black border-zinc-900 text-zinc-600'
                      : 'bg-black border-zinc-900 text-zinc-800'
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold tracking-[0.3em]">PHASE {idx + 1}</span>
                    {idx < step && <CheckCircle className="h-4 w-4 text-white" />}
                  </div>
                  <p className="text-sm font-bold tracking-widest">{item.title}</p>
                </div>
              ))}
            </div>

            {/* Main Form Area */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-950 border border-zinc-900 p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-white opacity-20"></div>
                <div className="absolute top-0 right-0 p-8">
                  <span className="text-[10px] font-bold text-zinc-800 tracking-widest">[{step + 1}/{steps.length}]</span>
                </div>

                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="mb-12">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400">
                          {steps[step].icon}
                        </div>
                        <h2 className="text-2xl font-bold tracking-widest">{steps[step].title}</h2>
                      </div>
                      <div className="h-px w-full bg-zinc-900">
                        <motion.div
                          className="h-px bg-white"
                          initial={{ width: 0 }}
                          animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-8">
                      {steps[step].fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-[10px] font-bold text-zinc-500 tracking-[0.2em] mb-4">
                            {field.label} {field.required && <span className="text-white opacity-50 ml-1">*</span>}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              name={field.name}
                              required={field.required}
                              placeholder={field.placeholder}
                              value={form[field.name] || ''}
                              onChange={handleChange}
                              rows={4}
                              className="w-full bg-zinc-900 border border-zinc-800 p-4 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                            />
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              required={field.required}
                              placeholder={field.placeholder}
                              value={form[field.name] || ''}
                              onChange={handleChange}
                              className="w-full bg-zinc-900 border border-zinc-800 p-4 h-14 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-white transition-colors rounded-none placeholder:text-zinc-800"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 pt-12 border-t border-zinc-900">
                      {step > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleBack}
                          className="h-14 px-10 border-zinc-800 text-zinc-500 hover:text-white hover:border-white rounded-none font-bold tracking-widest text-xs transition-all"
                        >
                          PREVIOUS
                        </Button>
                      )}
                      {step < steps.length - 1 ? (
                        <Button
                          type="button"
                          onClick={handleNext}
                          className="h-14 px-10 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-widest text-xs ml-auto"
                        >
                          PROCEED [→]
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="h-14 px-10 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-widest text-xs ml-auto"
                        >
                          SUBMIT INITIATION
                        </Button>
                      )}
                    </div>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 space-y-12"
                  >
                    <div className="inline-flex p-8 bg-zinc-900 border border-white text-white mb-8">
                      <CheckCircle className="h-16 w-16" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold tracking-tighter mb-4">PROTOCOL INITIATED</h2>
                      <p className="text-zinc-500 text-xs tracking-[0.2em] max-w-md mx-auto leading-relaxed">
                        YOUR ENTITY REGISTRATION IS BEING PROCESSED. A STRIKE TEAM WILL CONTACT YOU SHORTLY TO FINALIZE THE MISSION PARAMETERS.
                      </p>
                    </div>
                    <Link href="/studio">
                      <Button className="h-14 px-12 bg-white text-black hover:bg-zinc-200 rounded-none font-bold tracking-widest text-xs mt-12">
                        RETURN TO COMMAND CENTER
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Context Footer */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-black border border-zinc-900 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock className="h-4 w-4 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400 tracking-widest">ESTIMATED PROCESSING</span>
                  </div>
                  <p className="text-xs font-bold text-white tracking-widest">24-48 BUSINESS HOURS FOR INITIAL AUDIT.</p>
                </div>
                <div className="bg-black border border-zinc-900 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-4 w-4 text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400 tracking-widest">SECURITY STATUS</span>
                  </div>
                  <p className="text-xs font-bold text-white tracking-widest">ENCRYPTED TRANSMISSION PROTOCOL ACTIVE.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}