'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiLinkedin, FiGlobe, FiClock,
  FiDollarSign, FiFileText, FiCheck, FiArrowRight,
  FiAlertCircle, FiSend, FiBriefcase, FiEdit3
} from 'react-icons/fi';

interface GigDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  payRange: string;
  frequency: string;
  commitment: string;
  requirements: string[];
}

interface ApplicationForm {
  name: string;
  email: string;
  wallet: string;
  linkedIn: string;
  portfolio: string;
  experience: string;
  availability: string;
  rateExpectation: string;
  coverLetter: string;
  proposedTerms: string;
  agreeToTerms: boolean;
}

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const gigId = params.gigId as string;

  const [gig, setGig] = useState<GigDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);

  const [form, setForm] = useState<ApplicationForm>({
    name: '',
    email: '',
    wallet: '',
    linkedIn: '',
    portfolio: '',
    experience: '',
    availability: '',
    rateExpectation: '',
    coverLetter: '',
    proposedTerms: '',
    agreeToTerms: false,
  });

  // Fetch gig details
  useEffect(() => {
    async function fetchGig() {
      try {
        const res = await fetch(`/api/gigs/${gigId}`);
        if (res.ok) {
          const data = await res.json();
          setGig(data);
        } else {
          // Fallback to mock data for demo
          setGig({
            id: gigId,
            title: 'Gig Position',
            description: 'This is a demo gig position. In production, this would be fetched from the database.',
            category: 'Technical',
            payRange: '£50-80/hr',
            frequency: 'Ongoing',
            commitment: '20-40 hrs/week',
            requirements: ['Relevant experience', 'Good communication'],
          });
        }
      } catch (err) {
        // Use mock data on error
        setGig({
          id: gigId,
          title: 'Gig Position',
          description: 'Demo position',
          category: 'Technical',
          payRange: '£50-80/hr',
          frequency: 'Ongoing',
          commitment: '20-40 hrs/week',
          requirements: ['Relevant experience'],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchGig();
  }, [gigId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gigId,
          applicant: {
            name: form.name,
            email: form.email,
            wallet: form.wallet || undefined,
            linkedIn: form.linkedIn || undefined,
            portfolio: form.portfolio || undefined,
            experience: form.experience,
            availability: form.availability,
            rateExpectation: form.rateExpectation || undefined,
          },
          coverLetter: form.coverLetter,
          proposedTerms: form.proposedTerms || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setContractId(data.contractId);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Loading gig details...</p>
      </div>
    );
  }

  if (submitted && contractId) {
    return (
      <motion.div
        className="min-h-screen bg-black text-white font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="px-4 md:px-8 py-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-emerald-400 text-3xl" />
            </div>
            <h1 className="text-3xl font-bold uppercase tracking-tight mb-4">Application Submitted</h1>
            <p className="text-zinc-400 mb-8">
              Your application for <span className="text-white">{gig?.title}</span> has been received.
              A contract has been generated and is ready for review.
            </p>

            <div className="bg-zinc-900/50 border border-zinc-800 p-6 mb-8 text-left">
              <h3 className="text-sm font-bold uppercase text-zinc-400 mb-4">Next Steps</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold">1.</span>
                  <span className="text-zinc-300">Review your contract details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold">2.</span>
                  <span className="text-zinc-300">Sign the contract (wallet or email verification)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold">3.</span>
                  <span className="text-zinc-300">Contract inscribed on BSV blockchain</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold">4.</span>
                  <span className="text-zinc-300">Start working once client countersigns</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/sign/${contractId}`}
                className="px-6 py-3 bg-emerald-600 text-white font-bold uppercase tracking-wider hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
              >
                Review & Sign Contract
                <FiArrowRight />
              </Link>
              <Link
                href="/gigs"
                className="px-6 py-3 border border-zinc-700 text-zinc-400 font-bold uppercase tracking-wider hover:border-white hover:text-white transition-colors"
              >
                Back to Gigs
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white font-mono"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="px-4 md:px-8 py-16">
        {/* Header */}
        <div className="mb-8 border-b border-zinc-800 pb-8">
          <Link href="/gigs" className="text-xs text-zinc-500 hover:text-white mb-4 inline-block">
            ← Back to Gigs
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FiBriefcase className="text-emerald-400 text-xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
                Apply: {gig?.title}
              </h1>
              <p className="text-zinc-500 text-sm mt-1">{gig?.category} • {gig?.payRange} • {gig?.commitment}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="bg-zinc-900/30 border border-zinc-800 p-6">
                <h2 className="text-sm font-bold uppercase text-zinc-400 mb-4 flex items-center gap-2">
                  <FiUser size={14} /> Your Information
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">
                      Wallet Address <span className="text-zinc-600">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="wallet"
                      value={form.wallet}
                      onChange={handleChange}
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white"
                      placeholder="BSV, ETH, or SOL address"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">
                      LinkedIn <span className="text-zinc-600">(optional)</span>
                    </label>
                    <input
                      type="url"
                      name="linkedIn"
                      value={form.linkedIn}
                      onChange={handleChange}
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs text-zinc-500 uppercase mb-1">
                    Portfolio / Website <span className="text-zinc-600">(optional)</span>
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={form.portfolio}
                    onChange={handleChange}
                    className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              {/* Availability & Rate */}
              <div className="bg-zinc-900/30 border border-zinc-800 p-6">
                <h2 className="text-sm font-bold uppercase text-zinc-400 mb-4 flex items-center gap-2">
                  <FiClock size={14} /> Availability & Rate
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Availability *</label>
                    <select
                      name="availability"
                      value={form.availability}
                      onChange={handleChange}
                      required
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white"
                    >
                      <option value="">Select availability</option>
                      <option value="immediately">Immediately</option>
                      <option value="1-week">Within 1 week</option>
                      <option value="2-weeks">Within 2 weeks</option>
                      <option value="1-month">Within 1 month</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">
                      Rate Expectation <span className="text-zinc-600">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="rateExpectation"
                      value={form.rateExpectation}
                      onChange={handleChange}
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white"
                      placeholder="e.g., £50/hr or £2000/project"
                    />
                  </div>
                </div>
              </div>

              {/* Experience & Cover Letter */}
              <div className="bg-zinc-900/30 border border-zinc-800 p-6">
                <h2 className="text-sm font-bold uppercase text-zinc-400 mb-4 flex items-center gap-2">
                  <FiEdit3 size={14} /> Application Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Relevant Experience *</label>
                    <textarea
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white resize-none"
                      placeholder="Describe your relevant experience for this role..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">Cover Letter *</label>
                    <textarea
                      name="coverLetter"
                      value={form.coverLetter}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white resize-none"
                      placeholder="Why are you interested in this gig? What makes you a good fit?"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase mb-1">
                      Proposed Terms <span className="text-zinc-600">(optional)</span>
                    </label>
                    <textarea
                      name="proposedTerms"
                      value={form.proposedTerms}
                      onChange={handleChange}
                      rows={2}
                      className="w-full bg-black border border-zinc-800 px-3 py-2 text-sm focus:outline-none focus:border-white resize-none"
                      placeholder="Any specific terms or conditions you'd like to propose?"
                    />
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="bg-zinc-900/30 border border-zinc-800 p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={form.agreeToTerms}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                  <span className="text-xs text-zinc-400">
                    I understand that submitting this application will generate a contract that, once signed by both parties,
                    will be inscribed on the BSV blockchain as an immutable record. I agree to the{' '}
                    <Link href="/terms" className="text-white hover:underline">Terms of Service</Link>.
                  </span>
                </label>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 p-4 flex items-center gap-3">
                  <FiAlertCircle className="text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !form.agreeToTerms}
                className="w-full px-6 py-4 bg-emerald-600 text-white font-bold uppercase tracking-wider hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <FiSend /> Submit Application
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar - Gig Details */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {/* Gig Summary */}
              <div className="bg-zinc-900/30 border border-zinc-800 p-6">
                <h3 className="text-sm font-bold uppercase text-zinc-400 mb-4">Gig Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Category</span>
                    <span className="text-white">{gig?.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Pay Range</span>
                    <span className="text-emerald-400 font-bold">{gig?.payRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Frequency</span>
                    <span className="text-white">{gig?.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Commitment</span>
                    <span className="text-white">{gig?.commitment}</span>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {gig?.requirements && gig.requirements.length > 0 && (
                <div className="bg-zinc-900/30 border border-zinc-800 p-6">
                  <h3 className="text-sm font-bold uppercase text-zinc-400 mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {gig.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <FiCheck className="text-emerald-400 mt-0.5 shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contract Info */}
              <div className="bg-emerald-900/20 border border-emerald-500/30 p-6">
                <h3 className="text-sm font-bold uppercase text-emerald-400 mb-3 flex items-center gap-2">
                  <FiFileText size={14} /> On-Chain Contract
                </h3>
                <p className="text-xs text-zinc-400">
                  Your application will generate a contract that gets inscribed on the BSV blockchain
                  as a 1Sat Ordinal — creating immutable proof of your agreement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
