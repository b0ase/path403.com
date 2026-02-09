"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface ContractFormProps {
  service: string;
  price: string;
  unit: string;
  category: string;
  slug: string;
}

export default function ContractForm({ service, price, unit, category, slug }: ContractFormProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    projectDescription: "",
    deadline: "",
    paymentMethod: "stripe",
    agreeToTerms: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse price (remove currency symbols and convert to number)
      const priceMatch = price.match(/[\d,]+/);
      const totalAmount = priceMatch
        ? parseFloat(priceMatch[0].replace(/,/g, ''))
        : 250;

      // Create marketplace contract
      const response = await fetch('/api/marketplace/contracts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractSlug: slug,
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          projectDescription: formData.projectDescription,
          deadline: formData.deadline || undefined,
          totalAmount,
          paymentMethod: formData.paymentMethod,
          serviceTitle: service,
          category,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create contract');
      }

      const data = await response.json();

      // Handle payment redirect
      if (formData.paymentMethod === 'stripe' && data.payment?.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.payment.checkoutUrl;
      } else if (formData.paymentMethod === 'paypal' && data.payment?.approvalUrl) {
        // Redirect to PayPal approval
        window.location.href = data.payment.approvalUrl;
      } else if (formData.paymentMethod === 'crypto' && data.payment?.walletAddress) {
        // Show crypto payment info
        setSubmitted(true);
        // Store payment info in state for display
      } else {
        throw new Error('Payment initialization failed');
      }
    } catch (err) {
      console.error('[contract-form] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create contract');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 border border-green-900 bg-green-950/10"
      >
        <h3 className="text-xl font-bold text-green-400 mb-4 uppercase font-mono">
          Contract Submitted
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          Your contract has been submitted. We'll send you:
        </p>
        <ul className="space-y-2 text-sm text-zinc-400 mb-6">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Contract ID and blockchain inscription link</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Escrow wallet address for payment</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Timeline and milestone breakdown</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Invoice with crypto payment details</span>
          </li>
        </ul>
        <p className="text-xs text-zinc-600 font-mono">
          Expected response time: Within 24 hours
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Client Details */}
      <div className="p-4 border border-zinc-900 bg-zinc-950/50">
        <h3 className="text-sm font-bold text-white mb-3 uppercase font-mono">
          Client Information
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 uppercase font-mono mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full bg-black border border-zinc-900 text-white px-4 py-3 text-sm font-mono focus:border-zinc-700 focus:outline-none transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase font-mono mb-2">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="w-full bg-black border border-zinc-900 text-white px-4 py-3 text-sm font-mono focus:border-zinc-700 focus:outline-none transition-colors"
              placeholder="john@example.com"
            />
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="p-4 border border-zinc-900 bg-zinc-950/50">
        <h3 className="text-sm font-bold text-white mb-3 uppercase font-mono">
          Project Details
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-500 uppercase font-mono mb-2">
              Project Description *
            </label>
            <textarea
              required
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              className="w-full bg-black border border-zinc-900 text-white px-4 py-3 text-sm font-mono focus:border-zinc-700 focus:outline-none transition-colors resize-none"
              placeholder="Describe what you need..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase font-mono mb-2">
              Preferred Deadline
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full bg-black border border-zinc-900 text-white px-4 py-3 text-sm font-mono focus:border-zinc-700 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="p-4 border border-zinc-900 bg-zinc-950/50">
        <h3 className="text-sm font-bold text-white mb-3 uppercase font-mono">
          Payment Method
        </h3>

        {error && (
          <div className="mb-4 p-3 border border-red-900 bg-red-950/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-3 p-3 border border-zinc-900 hover:border-blue-900 hover:bg-blue-950/10 cursor-pointer transition-all">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={formData.paymentMethod === "stripe"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            />
            <div className="flex-1">
              <div className="text-sm font-bold text-white font-mono">Credit/Debit Card</div>
              <div className="text-xs text-zinc-500">Visa, Mastercard, Amex • Powered by Stripe</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-zinc-900 hover:border-blue-900 hover:bg-blue-950/10 cursor-pointer transition-all">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={formData.paymentMethod === "paypal"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            />
            <div className="flex-1">
              <div className="text-sm font-bold text-white font-mono">PayPal</div>
              <div className="text-xs text-zinc-500">Pay with PayPal balance or linked cards</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-zinc-900 hover:border-yellow-900 hover:bg-yellow-950/10 cursor-pointer transition-all">
            <input
              type="radio"
              name="paymentMethod"
              value="crypto"
              checked={formData.paymentMethod === "crypto"}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            />
            <div className="flex-1">
              <div className="text-sm font-bold text-white font-mono">Cryptocurrency</div>
              <div className="text-xs text-zinc-500">BSV, ETH, SOL • On-chain escrow</div>
            </div>
          </label>
        </div>
      </div>

      {/* Terms */}
      <div className="p-4 border border-zinc-900 bg-zinc-950/50">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={formData.agreeToTerms}
            onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
            className="mt-1"
          />
          <div className="text-xs text-zinc-400 leading-relaxed">
            I agree to the terms of this contract. Payment will be held in escrow until work is delivered and approved.
            I understand that this contract will be inscribed on the blockchain and is legally binding.
          </div>
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-4 bg-white text-black text-sm font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!formData.agreeToTerms || loading}
      >
        {loading ? 'Processing...' : 'Sign Contract & Proceed to Payment'}
      </button>

      <p className="text-xs text-zinc-600 text-center font-mono">
        {formData.paymentMethod === 'stripe' && 'Next: Secure Stripe checkout'}
        {formData.paymentMethod === 'paypal' && 'Next: PayPal payment'}
        {formData.paymentMethod === 'crypto' && 'Next: Crypto payment instructions'}
      </p>
    </form>
  );
}
