'use client';

import { useState } from 'react';
import { FaCreditCard, FaPaypal, FaBitcoin } from 'react-icons/fa';

interface PayoutPreferencesStepProps {
  onComplete: (data: {
    method?: 'stripe' | 'paypal' | 'crypto';
    stripeAccountId?: string;
    paypalEmail?: string;
    cryptoCurrency?: string;
    cryptoAddress?: string;
  }) => void;
  onBack: () => void;
}

export default function PayoutPreferencesStep({
  onComplete,
  onBack,
}: PayoutPreferencesStepProps) {
  const [payoutMethod, setPayoutMethod] = useState<'stripe' | 'paypal' | 'crypto'>('stripe');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [cryptoCurrency, setCryptoCurrency] = useState('BSV');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [stripeConnecting, setStripeConnecting] = useState(false);

  const handleStripeConnect = async () => {
    setStripeConnecting(true);
    try {
      // Create Stripe Connect account
      const response = await fetch('/api/developer/payout/stripe-connect', {
        method: 'POST',
      });

      if (response.ok) {
        const { accountLinkUrl } = await response.json();
        // Redirect to Stripe onboarding
        window.location.href = accountLinkUrl;
      } else {
        alert('Failed to connect Stripe account. Please try again.');
        setStripeConnecting(false);
      }
    } catch (error) {
      alert('Failed to connect Stripe account. Please try again.');
      setStripeConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate based on payout method
      if (payoutMethod === 'paypal' && !paypalEmail.trim()) {
        alert('Please enter your PayPal email');
        setLoading(false);
        return;
      }

      if (payoutMethod === 'crypto' && !cryptoAddress.trim()) {
        alert('Please enter your crypto address');
        setLoading(false);
        return;
      }

      // Get current user ID
      const userIdResponse = await fetch('/api/auth/me');
      const userData = await userIdResponse.json();

      const response = await fetch('/api/developer/payout/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          payoutMethod,
          paypalEmail: payoutMethod === 'paypal' ? paypalEmail : undefined,
          cryptoCurrency: payoutMethod === 'crypto' ? cryptoCurrency : undefined,
          cryptoAddress: payoutMethod === 'crypto' ? cryptoAddress : undefined,
        }),
      });

      if (response.ok) {
        onComplete({
          method: payoutMethod,
          paypalEmail: payoutMethod === 'paypal' ? paypalEmail : undefined,
          cryptoCurrency: payoutMethod === 'crypto' ? cryptoCurrency : undefined,
          cryptoAddress: payoutMethod === 'crypto' ? cryptoAddress : undefined,
        });
      } else {
        alert('Failed to save payout preferences. Please try again.');
      }
    } catch (error) {
      alert('Failed to save payout preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-2">Choose Payout Method</h2>
      <p className="text-gray-400 mb-6">
        Select how you would like to receive payments from completed contracts.
      </p>

      {/* Payout Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Stripe */}
        <button
          type="button"
          onClick={() => setPayoutMethod('stripe')}
          className={`p-6 rounded-lg border-2 transition-all ${
            payoutMethod === 'stripe'
              ? 'border-sky-500 bg-sky-500/10'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
          }`}
        >
          <FaCreditCard className="text-3xl mb-3 mx-auto text-sky-400" />
          <h3 className="font-semibold mb-1">Bank Account</h3>
          <p className="text-xs text-gray-400">via Stripe Connect</p>
          <p className="text-xs text-green-400 mt-2">Recommended</p>
        </button>

        {/* PayPal */}
        <button
          type="button"
          onClick={() => setPayoutMethod('paypal')}
          className={`p-6 rounded-lg border-2 transition-all ${
            payoutMethod === 'paypal'
              ? 'border-sky-500 bg-sky-500/10'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
          }`}
        >
          <FaPaypal className="text-3xl mb-3 mx-auto text-blue-400" />
          <h3 className="font-semibold mb-1">PayPal</h3>
          <p className="text-xs text-gray-400">Email-based payouts</p>
        </button>

        {/* Crypto */}
        <button
          type="button"
          onClick={() => setPayoutMethod('crypto')}
          className={`p-6 rounded-lg border-2 transition-all ${
            payoutMethod === 'crypto'
              ? 'border-sky-500 bg-sky-500/10'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
          }`}
        >
          <FaBitcoin className="text-3xl mb-3 mx-auto text-orange-400" />
          <h3 className="font-semibold mb-1">Cryptocurrency</h3>
          <p className="text-xs text-gray-400">BSV, ETH, SOL</p>
        </button>
      </div>

      {/* Stripe Connect */}
      {payoutMethod === 'stripe' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3">Connect Your Bank Account</h3>
          <p className="text-sm text-gray-400 mb-4">
            Stripe Connect allows secure bank transfers directly to your account.
            You'll be redirected to Stripe to complete the setup.
          </p>
          <ul className="text-sm text-gray-400 space-y-2 mb-4">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-1.5" />
              Direct bank deposits
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-1.5" />
              Secure and compliant
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-sky-400 rounded-full mt-1.5" />
              Low transaction fees
            </li>
          </ul>
          <button
            type="button"
            onClick={handleStripeConnect}
            disabled={stripeConnecting}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            {stripeConnecting ? 'Connecting to Stripe...' : 'Connect Stripe Account'}
          </button>
        </div>
      )}

      {/* PayPal Email */}
      {payoutMethod === 'paypal' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3">PayPal Email Address</h3>
          <p className="text-sm text-gray-400 mb-4">
            Enter the email address associated with your PayPal account.
            Payouts will be sent to this address.
          </p>
          <input
            type="email"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="your-email@example.com"
            required={payoutMethod === 'paypal'}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
          />
        </div>
      )}

      {/* Crypto Address */}
      {payoutMethod === 'crypto' && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3">Cryptocurrency Wallet</h3>
          <p className="text-sm text-gray-400 mb-4">
            Enter your wallet address. Payouts will be converted to crypto and sent automatically.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Currency</label>
            <select
              value={cryptoCurrency}
              onChange={(e) => setCryptoCurrency(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500"
            >
              <option value="BSV">Bitcoin SV (BSV)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="SOL">Solana (SOL)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Wallet Address</label>
            <input
              type="text"
              value={cryptoAddress}
              onChange={(e) => setCryptoAddress(e.target.value)}
              placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
              required={payoutMethod === 'crypto'}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-sky-500 font-mono text-sm"
            />
          </div>

          <div className="mt-4 bg-yellow-900/20 border border-yellow-800 text-yellow-400 rounded-lg p-3">
            <p className="text-xs">
              <strong>Important:</strong> Double-check your wallet address. Incorrect addresses may
              result in permanent loss of funds.
            </p>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-800 text-blue-400 rounded-lg p-4 mb-6">
        <p className="text-sm">
          <strong>Platform Fee:</strong> b0ase takes a 5% platform fee on all completed contracts.
          You'll receive 95% of the contract value.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}
