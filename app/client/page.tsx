'use client';

import Link from 'next/link';
import { FiArrowRight, FiCheckCircle, FiFileText, FiCreditCard, FiPlay } from 'react-icons/fi';

const steps = [
  {
    number: '01',
    title: 'Discovery Call',
    description: 'We discuss your project, goals, and requirements. No commitment - just a conversation to understand what you need.',
    icon: FiPlay,
  },
  {
    number: '02',
    title: 'Project Proposal',
    description: 'You receive a detailed proposal with scope, timeline, and pricing. We use transparent, itemized pricing from our rate card.',
    icon: FiFileText,
  },
  {
    number: '03',
    title: 'Build Your Checklist',
    description: 'Select exactly what you need from our services menu. Add items, adjust quantities, and see your total in real-time.',
    icon: FiCheckCircle,
  },
  {
    number: '04',
    title: 'Choose Payment Plan',
    description: 'Pay in equal thirds: 33.3% upfront, 33.3% on delivery, and 33.3% within 30 days. Or choose 50/50 or pay in full for simplicity.',
    icon: FiCreditCard,
  },
];

const paymentPlans = [
  {
    name: 'Equal Thirds',
    tag: 'Default',
    description: 'Spread payments evenly across the project lifecycle',
    breakdown: ['33.3% deposit to start', '33.3% on delivery', '33.3% within 30 days'],
  },
  {
    name: '50/50',
    tag: null,
    description: 'Simple two-payment structure',
    breakdown: ['50% deposit to start', '50% on delivery'],
  },
  {
    name: '100% Upfront',
    tag: null,
    description: 'Pay once and forget about it',
    breakdown: ['Full payment upfront', 'No invoices to track'],
  },
];

export default function ClientPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Hero Section */}
          <div className="mb-16 border border-white bg-white/5 p-8 md:p-12">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700/50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Start Today • Launch Within 48 Hours</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
                From Idea to Live Product in Days, Not Months
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
                No lengthy contracts. No hidden fees. Just transparent pricing, fast delivery, and flexible payment plans. Most projects start within 48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Schedule Free Call <FiArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white text-white text-sm font-bold hover:bg-white hover:text-black transition-colors"
                >
                  View Pricing
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-bold mb-1">48h</div>
                  <div className="text-sm text-gray-400">Average start time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">£50/hr</div>
                  <div className="text-sm text-gray-400">Transparent rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-gray-400">Money-back guarantee</div>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-12 border-b border-gray-800 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="bg-zinc-900/50 p-4 md:p-6 border border-zinc-800 self-start">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex items-end gap-4">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tighter leading-none">
                  HOW IT WORKS
                </h2>
                <div className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-widest">
                  SIMPLE • FAST • TRANSPARENT
                </div>
              </div>
            </div>
            <p className="text-gray-400 max-w-2xl text-lg leading-relaxed">
              Four simple steps from first contact to project delivery. No complexity, no surprises.
            </p>
          </div>

          {/* Process Steps */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-8 text-gray-400">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="p-6 border border-gray-800 hover:border-gray-600 transition-all relative"
                >
                  <div className="absolute top-4 right-4 text-4xl font-bold text-gray-900">
                    {step.number}
                  </div>
                  <step.icon className="w-8 h-8 text-white mb-4" />
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Plans */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-8 text-gray-400">
              Payment Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-6 border transition-all ${plan.tag ? 'border-white bg-white/5' : 'border-gray-800 hover:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    {plan.tag && (
                      <span
                        className="px-2 py-1 text-xs"
                        style={{ backgroundColor: '#fff', color: '#000' }}
                      >
                        {plan.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <ul className="space-y-2">
                    {plan.breakdown.map((item, i) => (
                      <li key={i} className="text-gray-500 text-sm flex items-center gap-2">
                        <span className="text-gray-600">+</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* What You Get */}
          <div className="mb-16">
            <h2 className="text-xl font-bold uppercase tracking-tight mb-8 text-gray-400">
              What You Get
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-800">
                <h3 className="font-bold mb-4">Transparent Pricing</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Every service has a clear price. No hidden fees, no surprises.
                  Build your project from our comprehensive rate card with 100+ services.
                </p>
                <Link
                  href="/pricing"
                  className="text-sm text-white hover:text-gray-300 flex items-center gap-2"
                >
                  View Full Rate Card <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="p-6 border border-gray-800">
                <h3 className="font-bold mb-4">Project Dashboard</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Once your project starts, you&apos;ll have access to a dedicated dashboard
                  to track progress, communicate, and manage deliverables.
                </p>
                <Link
                  href="/clients"
                  className="text-sm text-white hover:text-gray-300 flex items-center gap-2"
                >
                  Get Started <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="p-6 border border-gray-800">
                <h3 className="font-bold mb-4">Flexible Scope</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Start small and scale up. Add services as you need them.
                  Your checklist is always editable before you lock in.
                </p>
                <Link
                  href="/services"
                  className="text-sm text-white hover:text-gray-300 flex items-center gap-2"
                >
                  Browse Services <FiArrowRight size={14} />
                </Link>
              </div>
              <div className="p-6 border border-gray-800">
                <h3 className="font-bold mb-4">Secure Payments</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Pay securely via Stripe or cryptocurrency. All transactions are
                  encrypted and your payment details are never stored.
                </p>
                <span className="text-sm text-gray-600">
                  Stripe, Bitcoin, Ethereum accepted
                </span>
              </div>
            </div>
          </div>

          {/* Existing Client Login */}
          <div className="mb-16 p-8 border border-white/20 bg-white/5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Existing Client?</h3>
                <p className="text-gray-400">
                  Log in to access your projects, checklists, and invoices.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
                style={{ backgroundColor: '#fff', color: '#000' }}
              >
                Client Login <FiArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="border border-white bg-white/5 p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700/50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">No Commitment • Free Consultation</span>
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Let&apos;s Build Something Great
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Book a 15-minute discovery call. We&apos;ll discuss your project, answer questions, and show you exactly how we can help. Zero pressure, zero obligation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors"
                >
                  Schedule Free Call <FiArrowRight size={16} />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white text-white text-sm font-bold hover:bg-white hover:text-black transition-colors"
                >
                  View Full Pricing
                </Link>
              </div>
              <div className="text-sm text-gray-400">
                Or email us directly at{' '}
                <a href="mailto:richard@b0ase.com" className="text-white hover:underline font-bold">
                  richard@b0ase.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
