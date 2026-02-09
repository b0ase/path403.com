'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiLock, FiMail, FiUser, FiCreditCard } from 'react-icons/fi';
import { motion } from 'framer-motion';

const packagePricing = {
  starter: { price: 297, title: "Starter Package" },
  professional: { price: 597, title: "Professional Package" },
  enterprise: { price: 1497, title: "Enterprise Package" }
};

export default function CheckoutPage() {
  const params = useParams();
  const tier = params?.tier as string;
  const pkg = packagePricing[tier as keyof typeof packagePricing];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    billingAddress: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    agreeToTerms: false
  });

  const [submitting, setSubmitting] = useState(false);

  if (!pkg) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Package Not Found</h1>
          <Link href="/automation" className="text-blue-400 hover:underline">
            Return to Automation
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: Implement actual payment processing
    // This would integrate with Stripe or other payment gateway
    await new Promise(resolve => setTimeout(resolve, 2000));

    alert('Thank you! We will contact you within 24 hours to finalize setup.');
    setSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        {/* Back Button */}
        <Link
          href={`/automation/packages/${tier}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-8"
        >
          <FiArrowLeft /> Back to Package Details
        </Link>

        {/* Header */}
        <motion.div
          className="mb-12 text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/30 border border-green-700/50 mb-4">
            <FiLock className="text-green-400" size={16} />
            <span className="text-xs font-bold uppercase tracking-widest text-green-400">
              Secure Checkout
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
            Complete Your Order
          </h1>
          <p className="text-xl text-gray-400">
            You're one step away from transforming your creator workflow
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <section className="border border-gray-800 p-6 bg-gray-900/30">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-black border border-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 bg-black border border-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black border border-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Your Company"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-black border border-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="+44 7700 900000"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Information */}
              <section className="border border-gray-800 p-6 bg-gray-900/30">
                <h2 className="text-xl font-bold mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2">
                      Card Number *
                    </label>
                    <div className="relative">
                      <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        required
                        maxLength={19}
                        className="w-full pl-12 pr-4 py-3 bg-black border border-gray-800 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        required
                        maxLength={5}
                        className="w-full px-4 py-3 bg-black border border-gray-800 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        required
                        maxLength={4}
                        className="w-full px-4 py-3 bg-black border border-gray-800 focus:border-blue-500 focus:outline-none transition-colors font-mono"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="border border-blue-900/30 bg-blue-900/10 p-4">
                    <p className="text-sm text-blue-300 flex items-start gap-2">
                      <FiLock className="mt-0.5 flex-shrink-0" size={14} />
                      <span>
                        Your payment information is encrypted and secure. We never store your card details.
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Terms & Submit */}
              <section className="border border-gray-800 p-6 bg-gray-900/30">
                <div className="flex items-start gap-3 mb-6">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                    className="mt-1 w-4 h-4"
                  />
                  <label className="text-sm text-gray-400">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-400 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !formData.agreeToTerms}
                  className="w-full py-4 bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Processing...' : `Pay £${pkg.price}/month`}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  You will be charged £{pkg.price} monthly. Cancel anytime.
                </p>
              </section>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 border border-gray-800 p-6 bg-gray-900/30">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">{pkg.title}</span>
                  <span className="font-bold">£{pkg.price}/mo</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Setup Fee</span>
                  <span className="text-green-400 font-bold">FREE</span>
                </div>

                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total Today</span>
                    <span className="font-bold text-blue-400">£{pkg.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Then £{pkg.price}/month. Cancel anytime.
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <FiCheck className="text-green-500" size={16} />
                  <span className="text-gray-400">30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiCheck className="text-green-500" size={16} />
                  <span className="text-gray-400">Setup starts immediately</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiCheck className="text-green-500" size={16} />
                  <span className="text-gray-400">No long-term contract</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FiCheck className="text-green-500" size={16} />
                  <span className="text-gray-400">Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
