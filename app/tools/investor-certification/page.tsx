'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiCheck, FiAlertTriangle, FiFileText, FiLink, FiLock, FiDollarSign, FiBriefcase, FiLogIn } from 'react-icons/fi';
import { useYoursWallet } from 'yours-wallet-provider';
import { useAuth } from '@/components/Providers';

type CertificationType = 'high_net_worth' | 'sophisticated' | null;
type Step = 'auth' | 'select' | 'form' | 'warnings' | 'sign' | 'complete';

interface CertificationData {
  type: CertificationType;
  // High Net Worth
  incomeThreshold: boolean;
  assetsThreshold: boolean;
  // Sophisticated
  angelNetwork: boolean;
  previousInvestments: number;
  workExperience: string;
  directorQualifying: boolean;
  // Common
  fullName: string;
  acknowledgeRisks: boolean;
  acknowledgeNoAdvice: boolean;
  acknowledgeNoProtection: boolean;
}

const HNWI_STATEMENT = `STATEMENT FOR HIGH NET WORTH INVESTORS

I declare that I am a high net worth investor because at least one of the following applies to me:

[X] I had an annual income of £250,000 or more in the last financial year
[X] I had net assets of £1,000,000 or more (excluding my primary residence and pension) in the last financial year

I accept that the investments to which the promotions will relate may expose me to a significant risk of losing all of the money or other assets invested.

I am aware that it is open to me to seek advice from an authorised person who specialises in advising on non-mainstream pooled investments.`;

const SOPHISTICATED_STATEMENT = `STATEMENT FOR SELF-CERTIFIED SOPHISTICATED INVESTORS

I declare that I am a self-certified sophisticated investor because at least one of the following applies to me:

[X] I am a member of a network or syndicate of business angels and have been so for at least six months
[X] I have made more than one investment in an unlisted company in the two years prior to the date below
[X] I am working, or have worked in the two years prior to the date below, in a professional capacity in the private equity sector or in the provision of finance for small and medium enterprises
[X] I am currently, or have been in the two years prior to the date below, a director of a company with an annual turnover of at least £1 million

I accept that the investments to which the promotions will relate may expose me to a significant risk of losing all of the money or other assets invested.

I am aware that it is open to me to seek advice from an authorised person who specialises in advising on non-mainstream pooled investments.`;

export default function InvestorCertificationPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>('auth');
  const [data, setData] = useState<CertificationData>({
    type: null,
    incomeThreshold: false,
    assetsThreshold: false,
    angelNetwork: false,
    previousInvestments: 0,
    workExperience: '',
    directorQualifying: false,
    fullName: '',
    acknowledgeRisks: false,
    acknowledgeNoAdvice: false,
    acknowledgeNoProtection: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [statusStep, setStatusStep] = useState('');

  // Wallet
  const wallet = useYoursWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check auth status and advance to select step if authenticated
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // User is logged in, proceed to selection
        if (step === 'auth') {
          setStep('select');
        }
      }
    }
  }, [authLoading, user, step]);

  useEffect(() => {
    if (wallet?.isReady) {
      wallet.isConnected().then((connected: boolean) => {
        if (connected) {
          wallet.getAddresses().then((addrs: any) => {
            if (addrs) setWalletAddress(addrs.bsvAddress);
          });
        }
      });
    }
  }, [wallet?.isReady]);

  const connectWallet = async () => {
    if (!wallet || !wallet.isReady) {
      window.open('https://yours.org', '_blank');
      return;
    }
    try {
      await wallet.connect();
      const addrs = await wallet.getAddresses();
      if (addrs) setWalletAddress(addrs.bsvAddress);
    } catch (e) {
      console.error(e);
      setError('Failed to connect wallet');
    }
  };

  const selectType = (type: CertificationType) => {
    setData({ ...data, type });
    setStep('form');
  };

  const isHNWIValid = () => data.incomeThreshold || data.assetsThreshold;
  const isSophisticatedValid = () =>
    data.angelNetwork ||
    data.previousInvestments >= 2 ||
    data.workExperience.length > 10 ||
    data.directorQualifying;

  const isFormValid = () => {
    if (!data.fullName || data.fullName.length < 3) return false;
    if (data.type === 'high_net_worth') return isHNWIValid();
    if (data.type === 'sophisticated') return isSophisticatedValid();
    return false;
  };

  const isWarningsAccepted = () =>
    data.acknowledgeRisks && data.acknowledgeNoAdvice && data.acknowledgeNoProtection;

  const generateStatement = () => {
    const now = new Date().toISOString().split('T')[0];
    let statement = data.type === 'high_net_worth' ? HNWI_STATEMENT : SOPHISTICATED_STATEMENT;

    // Replace placeholders based on selections
    if (data.type === 'high_net_worth') {
      statement = statement.replace('[X] I had an annual income', data.incomeThreshold ? '[X] I had an annual income' : '[ ] I had an annual income');
      statement = statement.replace('[X] I had net assets', data.assetsThreshold ? '[X] I had net assets' : '[ ] I had net assets');
    }

    statement += `\n\nSigned: ${data.fullName}\nDate: ${now}\nWallet: ${walletAddress}`;
    return statement;
  };

  const handleSign = async () => {
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const statement = generateStatement();

      // 1. Sign the message
      setStatusStep('Please sign the certification statement...');
      const signature = await wallet.signMessage({ message: statement });

      if (!signature) {
        throw new Error('Signature cancelled or failed');
      }

      // 2. Submit to API
      setStatusStep('Recording certification...');
      const response = await fetch('/api/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certification_type: data.type,
          income_threshold_met: data.incomeThreshold,
          assets_threshold_met: data.assetsThreshold,
          angel_network_member: data.angelNetwork,
          previous_investments_count: data.previousInvestments,
          relevant_work_experience: data.workExperience,
          director_of_qualifying_co: data.directorQualifying,
          statement_text: statement,
          full_name: data.fullName,
          wallet_address: walletAddress,
          signature_hash: typeof signature === 'string' ? signature : signature.sig,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save certification');
      }

      setResult(result.data);
      setStep('complete');

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
      setStatusStep('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      <div className="max-w-pillar mx-auto px-4 py-16">

        {/* Header */}
        <header className="mb-16 border-b border-zinc-900 pb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 text-zinc-500 text-xs tracking-widest uppercase">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Investor Certification / UK FCA Exemptions
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">
              CERTIFY<span className="text-zinc-800">.INVESTOR</span>
            </h1>
            <p className="text-zinc-500 max-w-lg">
              Self-certify as a High Net Worth or Sophisticated Investor under UK FCA regulations.
              Your certification is signed and recorded on-chain.
            </p>
          </div>
          <FiShield className="text-6xl text-zinc-900" />
        </header>

        {/* Progress Bar - Hidden on auth step */}
        {step !== 'auth' && (
          <div className="mb-12">
            <div className="flex justify-between text-xs text-zinc-600 mb-2">
              <span className={step === 'select' ? 'text-amber-500' : ''}>1. Select Type</span>
              <span className={step === 'form' ? 'text-amber-500' : ''}>2. Qualify</span>
              <span className={step === 'warnings' ? 'text-amber-500' : ''}>3. Risk Warnings</span>
              <span className={step === 'sign' ? 'text-amber-500' : ''}>4. Sign</span>
              <span className={step === 'complete' ? 'text-green-500' : ''}>5. Complete</span>
            </div>
            <div className="h-1 bg-zinc-900 rounded-pillar overflow-hidden">
              <motion.div
                className="h-full bg-amber-500"
                initial={{ width: '0%' }}
                animate={{
                  width: step === 'select' ? '20%' :
                    step === 'form' ? '40%' :
                      step === 'warnings' ? '60%' :
                        step === 'sign' ? '80%' : '100%'
                }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 0: Authentication Required */}
          {step === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto text-center"
            >
              {authLoading ? (
                <div className="flex flex-col items-center gap-4 py-16">
                  <div className="w-12 h-12 border-4 border-t-amber-500 border-zinc-800 rounded-full animate-spin"></div>
                  <p className="text-zinc-500 text-sm">Checking authentication...</p>
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-zinc-900 rounded-pillar flex items-center justify-center mx-auto mb-8">
                    <FiLogIn className="text-4xl text-amber-500" />
                  </div>

                  <h2 className="text-3xl font-bold mb-4">Account Required</h2>

                  <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                    To certify as an investor, you need a b0ase account. Your certification will be linked to your account and stored securely.
                  </p>

                  <div className="space-y-4">
                    <button
                      onClick={() => router.push('/signup?redirect=/tools/investor-certification')}
                      className="w-full py-4 bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors rounded-pillar"
                    >
                      Create Account
                    </button>

                    <button
                      onClick={() => router.push('/login?redirect=/tools/investor-certification')}
                      className="w-full py-4 border border-zinc-800 text-white font-bold text-sm hover:border-zinc-600 transition-colors rounded-pillar"
                    >
                      Already have an account? Log in
                    </button>
                  </div>

                  <div className="mt-12 p-6 border border-zinc-800 bg-zinc-950 text-left rounded-pillar">
                    <h3 className="font-bold mb-3 text-sm">Why do I need an account?</h3>
                    <ul className="text-xs text-zinc-500 space-y-2">
                      <li>• Your investor certification must be linked to a verified identity</li>
                      <li>• Certifications expire after 12 months and need renewal</li>
                      <li>• Your certification status is checked when purchasing shares</li>
                      <li>• UK FCA regulations require an audit trail of certifications</li>
                    </ul>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 1: Select Type */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <button
                onClick={() => selectType('high_net_worth')}
                className="group p-8 border-2 border-zinc-800 hover:border-amber-500 transition-all text-left rounded-pillar"
              >
                <div className="w-16 h-16 bg-zinc-900 group-hover:bg-amber-500/20 rounded-full flex items-center justify-center mb-6 transition-colors">
                  <FiDollarSign className="text-3xl text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">High Net Worth</h3>
                <p className="text-zinc-500 text-sm mb-4">
                  For individuals with significant income or assets.
                </p>
                <ul className="text-xs text-zinc-600 space-y-1">
                  <li>• Annual income £250,000+, OR</li>
                  <li>• Net assets £1,000,000+ (excl. home/pension)</li>
                </ul>
              </button>

              <button
                onClick={() => selectType('sophisticated')}
                className="group p-8 border-2 border-zinc-800 hover:border-amber-500 transition-all text-left rounded-pillar"
              >
                <div className="w-16 h-16 bg-zinc-900 group-hover:bg-amber-500/20 rounded-full flex items-center justify-center mb-6 transition-colors">
                  <FiBriefcase className="text-3xl text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Sophisticated Investor</h3>
                <p className="text-zinc-500 text-sm mb-4">
                  For individuals with investment experience.
                </p>
                <ul className="text-xs text-zinc-600 space-y-1">
                  <li>• Angel network member 6+ months, OR</li>
                  <li>• 2+ unlisted company investments, OR</li>
                  <li>• Private equity/SME finance experience, OR</li>
                  <li>• Director of £1M+ turnover company</li>
                </ul>
              </button>
            </motion.div>
          )}

          {/* Step 2: Qualification Form */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl"
            >
              <h2 className="text-2xl font-bold mb-6">
                {data.type === 'high_net_worth' ? 'High Net Worth Qualification' : 'Sophisticated Investor Qualification'}
              </h2>

              {data.type === 'high_net_worth' ? (
                <div className="space-y-6">
                  <p className="text-zinc-500 text-sm">
                    Select at least one that applies to you:
                  </p>

                  <label className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.incomeThreshold}
                      onChange={(e) => setData({ ...data, incomeThreshold: e.target.checked })}
                      className="mt-1 w-5 h-5 accent-amber-500"
                    />
                    <div>
                      <span className="font-bold">Annual Income £250,000+</span>
                      <p className="text-xs text-zinc-500 mt-1">
                        I had an annual income of £250,000 or more in the last financial year.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.assetsThreshold}
                      onChange={(e) => setData({ ...data, assetsThreshold: e.target.checked })}
                      className="mt-1 w-5 h-5 accent-amber-500"
                    />
                    <div>
                      <span className="font-bold">Net Assets £1,000,000+</span>
                      <p className="text-xs text-zinc-500 mt-1">
                        I had net assets of £1,000,000 or more (excluding primary residence and pension) in the last financial year.
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-zinc-500 text-sm">
                    Select all that apply to you:
                  </p>

                  <label className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.angelNetwork}
                      onChange={(e) => setData({ ...data, angelNetwork: e.target.checked })}
                      className="mt-1 w-5 h-5 accent-amber-500"
                    />
                    <div className="rounded-pillar">
                      <span className="font-bold">Business Angel Network Member</span>
                      <p className="text-xs text-zinc-500 mt-1">
                        I am a member of a network or syndicate of business angels and have been so for at least six months.
                      </p>
                    </div>
                  </label>

                  <div className="p-4 border border-zinc-800">
                    <label className="font-bold block mb-2">Previous Unlisted Company Investments</label>
                    <p className="text-xs text-zinc-500 mb-3">
                      Number of investments in unlisted companies in the past 2 years:
                    </p>
                    <input
                      type="number"
                      min="0"
                      value={data.previousInvestments}
                      onChange={(e) => setData({ ...data, previousInvestments: parseInt(e.target.value) || 0 })}
                      className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm rounded-pillar"
                    />
                  </div>

                  <div className="p-4 border border-zinc-800 rounded-pillar">
                    <label className="font-bold block mb-2">Private Equity / SME Finance Experience</label>
                    <p className="text-xs text-zinc-500 mb-3">
                      Describe your professional experience in the private equity sector or provision of finance for SMEs (past 2 years):
                    </p>
                    <textarea
                      value={data.workExperience}
                      onChange={(e) => setData({ ...data, workExperience: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 p-2 text-sm h-24 rounded-pillar"
                      placeholder="e.g., Investment Manager at XYZ Capital..."
                    />
                  </div>

                  <label className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.directorQualifying}
                      onChange={(e) => setData({ ...data, directorQualifying: e.target.checked })}
                      className="mt-1 w-5 h-5 accent-amber-500"
                    />
                    <div>
                      <span className="font-bold">Director of £1M+ Company</span>
                      <p className="text-xs text-zinc-500 mt-1">
                        I am currently, or have been in the past 2 years, a director of a company with an annual turnover of at least £1 million.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Full Name */}
              <div className="mt-8 p-4 border border-zinc-800 rounded-pillar">
                <label className="font-bold block mb-2">Your Full Legal Name</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 p-3 text-sm rounded-pillar"
                  placeholder="As it appears on your ID..."
                />
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep('select')}
                  className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('warnings')}
                  disabled={!isFormValid()}
                  className={`flex-1 py-3 font-bold text-sm transition-all ${isFormValid()
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                  Continue to Risk Warnings →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Risk Warnings */}
          {step === 'warnings' && (
            <motion.div
              key="warnings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-3 text-red-500 mb-6">
                <FiAlertTriangle className="text-3xl" />
                <h2 className="text-2xl font-bold">Risk Warnings</h2>
              </div>

              <div className="bg-red-950/20 border border-red-900 p-6 mb-8 rounded-pillar">
                <h3 className="font-bold text-red-400 mb-4">IMPORTANT: READ CAREFULLY</h3>
                <ul className="space-y-3 text-sm text-red-300">
                  <li>• Investing in unlisted companies carries high risks including loss of your entire investment.</li>
                  <li>• These investments are illiquid — you may not be able to sell your shares.</li>
                  <li>• Past performance is not a reliable indicator of future results.</li>
                  <li>• You should only invest money you can afford to lose entirely.</li>
                  <li>• These investments are not protected by the Financial Services Compensation Scheme (FSCS).</li>
                  <li>• You should seek independent financial advice before investing.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.acknowledgeRisks}
                    onChange={(e) => setData({ ...data, acknowledgeRisks: e.target.checked })}
                    className="mt-1 w-5 h-5 accent-red-500"
                  />
                  <div>
                    <span className="font-bold">I understand I may lose everything</span>
                    <p className="text-xs text-zinc-500 mt-1">
                      I accept that the investments to which this certification relates may expose me to a significant risk of losing all of the money or other assets invested.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.acknowledgeNoAdvice}
                    onChange={(e) => setData({ ...data, acknowledgeNoAdvice: e.target.checked })}
                    className="mt-1 w-5 h-5 accent-red-500"
                  />
                  <div>
                    <span className="font-bold">I should seek professional advice</span>
                    <p className="text-xs text-zinc-500 mt-1">
                      I am aware that it is open to me to seek advice from an authorised person who specialises in advising on non-mainstream pooled investments.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 p-4 border border-zinc-800 hover:border-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.acknowledgeNoProtection}
                    onChange={(e) => setData({ ...data, acknowledgeNoProtection: e.target.checked })}
                    className="mt-1 w-5 h-5 accent-red-500"
                  />
                  <div>
                    <span className="font-bold">I have no FSCS protection</span>
                    <p className="text-xs text-zinc-500 mt-1">
                      I understand that these investments are not protected by the Financial Services Compensation Scheme and I have no recourse to the Financial Ombudsman Service.
                    </p>
                  </div>
                </label>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep('form')}
                  className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep('sign')}
                  disabled={!isWarningsAccepted()}
                  className={`flex-1 py-3 font-bold text-sm transition-all ${isWarningsAccepted()
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                  Continue to Sign →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Sign */}
          {step === 'sign' && (
            <motion.div
              key="sign"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiFileText className="text-3xl text-amber-500" />
                <h2 className="text-2xl font-bold">Review & Sign</h2>
              </div>

              {/* Statement Preview */}
              <div className="bg-zinc-950 border border-zinc-800 p-6 mb-8 font-mono text-xs whitespace-pre-wrap text-zinc-400 rounded-pillar">
                {generateStatement()}
              </div>

              {/* Wallet Connection */}
              <div className="border border-zinc-800 p-4 mb-6 rounded-pillar">
                {!walletAddress ? (
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 rounded-pillar"
                  >
                    <FiLink /> Connect Yours Wallet to Sign
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 uppercase tracking-widest">Connected Wallet</span>
                    <span className="font-mono text-green-500">
                      {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 8)}
                    </span>
                  </div>
                )}
              </div>

              {/* Status */}
              {isProcessing && (
                <div className="bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col items-center justify-center gap-4 mb-6 rounded-pillar">
                  <div className="w-12 h-12 border-4 border-t-amber-500 border-zinc-800 rounded-full animate-spin"></div>
                  <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">{statusStep}</p>
                </div>
              )}

              {error && (
                <div className="p-4 border border-red-900 bg-red-950/20 text-red-500 text-xs font-mono mb-6 rounded-pillar">
                  ERROR: {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('warnings')}
                  disabled={isProcessing}
                  className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSign}
                  disabled={!walletAddress || isProcessing}
                  className={`flex-1 py-3 font-bold text-sm transition-all flex items-center justify-center gap-2 rounded-pillar ${walletAddress && !isProcessing
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                  <FiLock /> Sign Certification
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Complete */}
          {step === 'complete' && result && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-3 text-green-500 mb-6">
                <FiCheck className="text-3xl" />
                <h2 className="text-2xl font-bold">Certification Complete</h2>
              </div>

              <div className="bg-green-950/20 border border-green-900 p-6 mb-8 rounded-pillar">
                <p className="text-green-400 mb-4">
                  You are now certified as a <strong>{data.type === 'high_net_worth' ? 'High Net Worth' : 'Sophisticated'}</strong> Investor.
                </p>
                <p className="text-sm text-green-600">
                  This certification is valid for 12 months until {new Date(result.valid_until).toLocaleDateString()}.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-pillar">
                  <span className="text-zinc-500">Certification ID</span>
                  <span className="font-mono">{result.id?.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-pillar">
                  <span className="text-zinc-500">Type</span>
                  <span className="font-mono">{result.certification_type}</span>
                </div>
                <div className="flex justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-pillar">
                  <span className="text-zinc-500">Valid From</span>
                  <span className="font-mono">{new Date(result.valid_from).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-pillar">
                  <span className="text-zinc-500">Valid Until</span>
                  <span className="font-mono">{new Date(result.valid_until).toLocaleDateString()}</span>
                </div>
                {result.inscription_txid && (
                  <div className="flex justify-between p-3 bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">On-Chain Proof</span>
                    <a
                      href={`https://whatsonchain.com/tx/${result.inscription_txid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-amber-500 hover:text-amber-400"
                    >
                      View →
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-8 p-4 border border-zinc-800 bg-zinc-950 rounded-pillar">
                <h4 className="font-bold mb-2">What's Next?</h4>
                <p className="text-xs text-zinc-500">
                  You can now participate in investment opportunities that require investor certification.
                  Your certification status will be checked automatically when you attempt to purchase shares or tokens.
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <a
                  href="/dashboard"
                  className="flex-1 py-3 bg-amber-500 text-black font-bold text-sm text-center hover:bg-amber-400 rounded-pillar"
                >
                  Go to Dashboard
                </a>
                <a
                  href="/tools"
                  className="px-6 py-3 border border-zinc-800 hover:border-zinc-600 text-sm"
                >
                  More Tools
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CAVEAT EMPTOR */}
        <div className="mt-16 pt-8 border-t border-zinc-900">
          <div className="text-center">
            <p className="text-xs text-zinc-700 uppercase tracking-widest mb-2">CAVEAT EMPTOR</p>
            <p className="text-[10px] text-zinc-600 max-w-lg mx-auto">
              This tool facilitates self-certification under UK FCA exemptions for financial promotions.
              We rely on your certification in good faith. False certification may constitute fraud.
              This is not financial advice. Consult a qualified professional before investing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
