'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiCheck, FiMail, FiCalendar, FiArrowRight, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';

const packageDetails = {
  starter: {
    title: "Starter Package",
    price: 297,
    platforms: 2,
    features: ["Basic scheduling", "2 platforms", "Email support"]
  },
  professional: {
    title: "Professional Package",
    price: 597,
    platforms: 5,
    features: ["AI content generation", "5 platforms", "Analytics dashboard", "Priority support"]
  },
  enterprise: {
    title: "Enterprise Package",
    price: 1497,
    platforms: "Unlimited",
    features: ["Custom workflows", "Unlimited platforms", "Dedicated account manager", "24/7 support", "White-label options"]
  }
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier') as keyof typeof packageDetails;
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  const pkg = tier ? packageDetails[tier] : null;

  useEffect(() => {
    // Could verify session with Stripe here if needed
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-400">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-4 md:px-8 py-16">
        <div className="w-full text-center">
          {/* Success Icon */}
          <motion.div
            className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/20 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <FiCheck className="text-green-500" size={48} />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
              Welcome Aboard!
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Your subscription to {pkg?.title || 'Social Media Automation'} is now active.
            </p>
          </motion.div>

          {/* Order Summary */}
          {pkg && (
            <motion.div
              className="border border-gray-800 bg-gray-900/30 p-6 mb-8 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-lg font-bold mb-4">Your Package</h2>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">{pkg.title}</span>
                <span className="font-bold text-green-400">£{pkg.price}/month</span>
              </div>
              <div className="border-t border-gray-800 pt-4">
                <p className="text-sm text-gray-500 mb-2">Includes:</p>
                <ul className="space-y-1">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                      <FiCheck className="text-green-500" size={14} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {/* What Happens Next */}
          <motion.div
            className="border border-gray-800 bg-gray-900/30 p-6 mb-8 text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-bold mb-4">What Happens Next?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-blue-400" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Check Your Email</h3>
                  <p className="text-sm text-gray-400">
                    You'll receive a confirmation email with your receipt and onboarding link within the next few minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <FiCalendar className="text-purple-400" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Onboarding Call</h3>
                  <p className="text-sm text-gray-400">
                    Our team will reach out within 24 hours to schedule your onboarding call and gather your platform access.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <FiCheck className="text-green-400" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Automation Setup</h3>
                  <p className="text-sm text-gray-400">
                    We'll configure your N8N workflows and have your automations running within 3-5 business days.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/automation"
              className="px-6 py-3 bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              Back to Automation
              <FiArrowRight size={16} />
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-800 text-white font-bold hover:bg-gray-900 transition-colors"
            >
              Return Home
            </Link>
          </motion.div>

          {/* Support Note */}
          <motion.p
            className="text-sm text-gray-500 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Questions? Contact us at{' '}
            <a href="mailto:richard@b0ase.com" className="text-blue-400 hover:underline">
              richard@b0ase.com
            </a>
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <FiLoader className="animate-spin" size={48} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
