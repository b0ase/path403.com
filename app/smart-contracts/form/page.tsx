'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiCheck, FiCode } from 'react-icons/fi';

const contractTypes = [
  { id: 'dividend', label: 'Dividend Distribution', desc: 'Automatic payouts to token holders' },
  { id: 'governance', label: 'Governance / Voting', desc: 'Decentralized decision making' },
  { id: 'escrow', label: 'Escrow / Payments', desc: 'Trustless payment holding' },
  { id: 'vesting', label: 'Token Vesting', desc: 'Time-locked token releases' },
  { id: 'staking', label: 'Staking / Rewards', desc: 'Lock tokens to earn rewards' },
  { id: 'crowdfunding', label: 'Crowdfunding', desc: 'Raise funds with milestones' },
  { id: 'other', label: 'Something Else', desc: 'Custom contract needs' },
];

const blockchains = [
  { id: 'bsv', label: 'BSV (Bitcoin SV)', desc: 'Low fees, high throughput' },
  { id: 'eth', label: 'Ethereum', desc: 'Most popular, high fees' },
  { id: 'sol', label: 'Solana', desc: 'Fast, growing ecosystem' },
  { id: 'multi', label: 'Multi-chain', desc: 'Deploy on multiple chains' },
  { id: 'unsure', label: 'Not sure yet', desc: 'Need guidance' },
];

const budgetRanges = [
  { id: 'under5k', label: 'Under $5,000', desc: 'Simple contract, standard features' },
  { id: '5k-15k', label: '$5,000 - $15,000', desc: 'Custom contract, some complexity' },
  { id: '15k-50k', label: '$15,000 - $50,000', desc: 'Complex contract, full testing' },
  { id: 'over50k', label: '$50,000+', desc: 'Enterprise, multi-contract system' },
  { id: 'discuss', label: 'Let\'s discuss', desc: 'Need scoping first' },
];

const timelines = [
  { id: 'asap', label: 'ASAP', desc: 'Within 2 weeks' },
  { id: '1month', label: '1 month', desc: 'Standard timeline' },
  { id: '3months', label: '2-3 months', desc: 'No rush' },
  { id: 'exploring', label: 'Just exploring', desc: 'Researching options' },
];

export default function SmartContractsFormPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    contractType: '',
    blockchain: '',
    budget: '',
    timeline: '',
    projectName: '',
    description: '',
    name: '',
    email: '',
    company: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 5;

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.contractType;
      case 2: return !!formData.blockchain;
      case 3: return !!formData.budget && !!formData.timeline;
      case 4: return !!formData.projectName;
      case 5: return !!formData.name && !!formData.email;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Send to API
      const response = await fetch('/api/leads/smart-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const OptionButton = ({
    selected,
    onClick,
    label,
    desc
  }: {
    selected: boolean;
    onClick: () => void;
    label: string;
    desc: string;
  }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 border text-left transition-all ${
        selected
          ? 'border-white bg-white/10'
          : 'border-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={`font-bold ${selected ? 'text-white' : 'text-gray-300'}`}>
            {label}
          </div>
          <div className="text-sm text-gray-500">{desc}</div>
        </div>
        {selected && <FiCheck className="text-white" size={20} />}
      </div>
    </button>
  );

  if (isSubmitted) {
    return (
      <motion.div
        className="min-h-screen bg-black text-white flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-md text-center">
          <div className="w-16 h-16 border border-white flex items-center justify-center mx-auto mb-6">
            <FiCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-4">Request Received</h1>
          <p className="text-gray-400 mb-8">
            Thanks for your interest in smart contract development.
            I'll review your requirements and get back to you within 24 hours.
          </p>
          <Link
            href="/smart-contracts"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors"
          >
            Back to Smart Contracts
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/smart-contracts"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6"
          >
            <FiArrowLeft size={14} />
            Back to Smart Contracts
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gray-900/50 p-3 border border-gray-800">
              <FiCode className="text-2xl text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Smart Contract Request
            </h1>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mt-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 transition-colors ${
                  i < step ? 'bg-white' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2 font-mono">
            STEP {step} OF {totalSteps}
          </div>
        </div>

        {/* Step 1: Contract Type */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-2">What type of smart contract do you need?</h2>
            <p className="text-gray-500 mb-6">Select the option that best describes your project.</p>

            <div className="space-y-3">
              {contractTypes.map(type => (
                <OptionButton
                  key={type.id}
                  selected={formData.contractType === type.id}
                  onClick={() => updateField('contractType', type.id)}
                  label={type.label}
                  desc={type.desc}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Blockchain */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-2">Which blockchain?</h2>
            <p className="text-gray-500 mb-6">Where should this contract be deployed?</p>

            <div className="space-y-3">
              {blockchains.map(chain => (
                <OptionButton
                  key={chain.id}
                  selected={formData.blockchain === chain.id}
                  onClick={() => updateField('blockchain', chain.id)}
                  label={chain.label}
                  desc={chain.desc}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Budget & Timeline */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-2">Budget & Timeline</h2>
            <p className="text-gray-500 mb-6">Help me understand your constraints.</p>

            <div className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Budget Range</h3>
              <div className="space-y-2">
                {budgetRanges.map(range => (
                  <OptionButton
                    key={range.id}
                    selected={formData.budget === range.id}
                    onClick={() => updateField('budget', range.id)}
                    label={range.label}
                    desc={range.desc}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Timeline</h3>
              <div className="space-y-2">
                {timelines.map(time => (
                  <OptionButton
                    key={time.id}
                    selected={formData.timeline === time.id}
                    onClick={() => updateField('timeline', time.id)}
                    label={time.label}
                    desc={time.desc}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Project Details */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-2">Tell me about your project</h2>
            <p className="text-gray-500 mb-6">What are you building?</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Project / Company Name *
                </label>
                <input
                  type="text"
                  value={formData.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  placeholder="e.g., My DeFi Project"
                  className="w-full p-4 bg-transparent border border-gray-800 focus:border-white outline-none transition-colors text-white placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Project Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe what you're building and what the smart contract needs to do..."
                  rows={5}
                  className="w-full p-4 bg-transparent border border-gray-800 focus:border-white outline-none transition-colors text-white placeholder:text-gray-600 resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5: Contact Info */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold mb-2">How can I reach you?</h2>
            <p className="text-gray-500 mb-6">I'll send you a proposal within 24 hours.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="John Smith"
                  className="w-full p-4 bg-transparent border border-gray-800 focus:border-white outline-none transition-colors text-white placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="john@company.com"
                  className="w-full p-4 bg-transparent border border-gray-800 focus:border-white outline-none transition-colors text-white placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="Company Name"
                  className="w-full p-4 bg-transparent border border-gray-800 focus:border-white outline-none transition-colors text-white placeholder:text-gray-600"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-gray-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className={`inline-flex items-center gap-2 px-6 py-3 font-bold transition-colors ${
                canProceed()
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              Continue
              <FiArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`inline-flex items-center gap-2 px-6 py-3 font-bold transition-colors ${
                canProceed() && !isSubmitting
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
              <FiArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
