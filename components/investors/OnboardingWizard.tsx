'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck, FaArrowRight, FaArrowLeft, FaKey, FaUserCheck, FaShieldAlt, FaCoins, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

type Step = 'connect' | 'kyc' | 'accreditation' | 'vault';

interface OnboardingState {
  isAuthenticated: boolean;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  isAccredited: boolean;
  hasVault: boolean;
  vaultAddress: string | null;
}

const STEPS: { id: Step; title: string; icon: React.ElementType }[] = [
  { id: 'connect', title: 'Connect', icon: FaKey },
  { id: 'kyc', title: 'KYC', icon: FaUserCheck },
  { id: 'accreditation', title: 'Certification', icon: FaShieldAlt },
  { id: 'vault', title: 'Create Vault', icon: FaCoins },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('connect');
  const [state, setState] = useState<OnboardingState>({
    isAuthenticated: false,
    kycStatus: 'none',
    isAccredited: false,
    hasVault: false,
    vaultAddress: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check initial state
  useEffect(() => {
    async function checkStatus() {
      try {
        // Check auth and registration status
        const res = await fetch('/api/investors/register');
        if (res.ok) {
          const data = await res.json();
          setState(prev => ({
            ...prev,
            isAuthenticated: true,
            hasVault: data.hasVault,
            vaultAddress: data.vaultAddress,
            kycStatus: data.kyc?.status || 'none',
            isAccredited: data.shareholder?.accreditedInvestor || false,
          }));

          // Determine starting step based on progress
          if (data.hasVault) {
            // Already complete - redirect to dashboard
            router.push('/investors/dashboard');
            return;
          } else if (data.kyc?.isVerified) {
            setCurrentStep('vault');
          } else if (data.kyc?.status === 'none' || data.kyc?.status === 'rejected') {
            setCurrentStep('kyc');
          } else if (data.kyc?.status === 'pending') {
            setCurrentStep('kyc');
          }
        } else if (res.status === 401) {
          setState(prev => ({ ...prev, isAuthenticated: false }));
          setCurrentStep('connect');
        }
      } catch (err) {
        console.error('Status check error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [router]);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const goToStep = (step: Step) => {
    setError(null);
    setCurrentStep(step);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-2xl text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = step.id === currentStep;
            const isComplete = index < currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isComplete ? 'bg-green-500 border-green-500' : ''}
                      ${isActive ? 'bg-white border-white' : ''}
                      ${!isComplete && !isActive ? 'border-zinc-700 bg-zinc-900' : ''}
                    `}
                  >
                    {isComplete ? (
                      <FaCheck className="text-white" />
                    ) : (
                      <Icon className={isActive ? 'text-black' : 'text-zinc-500'} />
                    )}
                  </div>
                  <span className={`mt-2 text-xs uppercase tracking-wider ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-20 h-0.5 mx-2 ${isComplete ? 'bg-green-500' : 'bg-zinc-700'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-400 flex items-center gap-3">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'connect' && (
            <ConnectStep
              isAuthenticated={state.isAuthenticated}
              onComplete={() => {
                setState(prev => ({ ...prev, isAuthenticated: true }));
                goToStep('kyc');
              }}
            />
          )}

          {currentStep === 'kyc' && (
            <KycStep
              kycStatus={state.kycStatus}
              onComplete={() => {
                setState(prev => ({ ...prev, kycStatus: 'pending' }));
                goToStep('accreditation');
              }}
            />
          )}

          {currentStep === 'accreditation' && (
            <AccreditationStep
              isAccredited={state.isAccredited}
              onComplete={() => {
                setState(prev => ({ ...prev, isAccredited: true }));
                goToStep('vault');
              }}
            />
          )}

          {currentStep === 'vault' && (
            <VaultStep
              hasVault={state.hasVault}
              vaultAddress={state.vaultAddress}
              onComplete={() => {
                router.push('/investors/dashboard');
              }}
              onError={setError}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => {
            const prevIndex = currentStepIndex - 1;
            if (prevIndex >= 0) {
              goToStep(STEPS[prevIndex].id);
            }
          }}
          disabled={currentStepIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaArrowLeft /> Back
        </button>
      </div>
    </div>
  );
}

// Step Components

function ConnectStep({
  isAuthenticated,
  onComplete,
}: {
  isAuthenticated: boolean;
  onComplete: () => void;
}) {
  if (isAuthenticated) {
    return (
      <div className="border border-zinc-800 p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-2xl text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Connected</h3>
        <p className="text-zinc-400 mb-6">You're signed in and ready to continue.</p>
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          Continue to KYC <FaArrowRight />
        </button>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 p-8">
      <h3 className="text-2xl font-bold text-white mb-4">Connect Your Account</h3>
      <p className="text-zinc-400 mb-8">
        Sign in with Google, GitHub, or connect your crypto wallet to get started.
      </p>

      <div className="grid gap-4 max-w-md">
        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-3 border border-zinc-700 px-6 py-4 hover:bg-zinc-900 transition-colors"
        >
          <span className="text-white font-medium">Sign in with Google</span>
        </a>
        <a
          href="/api/auth/github"
          className="flex items-center justify-center gap-3 border border-zinc-700 px-6 py-4 hover:bg-zinc-900 transition-colors"
        >
          <span className="text-white font-medium">Sign in with GitHub</span>
        </a>
        <button
          onClick={() => {
            // Would trigger wallet modal
            alert('Wallet connect coming soon');
          }}
          className="flex items-center justify-center gap-3 border border-zinc-700 px-6 py-4 hover:bg-zinc-900 transition-colors"
        >
          <FaKey className="text-zinc-400" />
          <span className="text-white font-medium">Connect Wallet</span>
        </button>
      </div>
    </div>
  );
}

function KycStep({
  kycStatus,
  onComplete,
}: {
  kycStatus: string;
  onComplete: () => void;
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    idFrontUrl: '',
    idBackUrl: '',
    proofOfAddressUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (kycStatus === 'approved') {
    return (
      <div className="border border-zinc-800 p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-2xl text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">KYC Verified</h3>
        <p className="text-zinc-400 mb-6">Your identity has been verified.</p>
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          Continue <FaArrowRight />
        </button>
      </div>
    );
  }

  if (kycStatus === 'pending') {
    return (
      <div className="border border-zinc-800 p-8 text-center">
        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaSpinner className="text-2xl text-white animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">KYC Pending</h3>
        <p className="text-zinc-400 mb-6">Your documents are being reviewed. This typically takes 1-2 business days.</p>
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-300 px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-700 transition-colors"
        >
          Continue Anyway <FaArrowRight />
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          government_id_front_url: formData.idFrontUrl || 'pending-upload',
          government_id_back_url: formData.idBackUrl || null,
          proof_of_address_url: formData.proofOfAddressUrl || 'pending-upload',
        }),
      });

      if (res.ok) {
        onComplete();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit KYC');
      }
    } catch (err) {
      console.error('KYC submit error:', err);
      alert('Failed to submit KYC');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-zinc-800 p-8">
      <h3 className="text-2xl font-bold text-white mb-4">KYC Verification</h3>
      <p className="text-zinc-400 mb-8">
        We need to verify your identity to comply with securities regulations.
        Your data is encrypted and stored securely.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Full Legal Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            required
            className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-white focus:border-white outline-none transition-colors"
            placeholder="John Smith"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Date of Birth</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            required
            className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-white focus:border-white outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Government ID (Front)</label>
          <div className="border border-dashed border-zinc-700 p-8 text-center">
            <p className="text-zinc-500 text-sm">Upload passport or driver's license</p>
            <input
              type="file"
              accept="image/*"
              className="mt-4"
              onChange={() => {
                // Would handle file upload
                setFormData(prev => ({ ...prev, idFrontUrl: 'uploaded' }));
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Proof of Address</label>
          <div className="border border-dashed border-zinc-700 p-8 text-center">
            <p className="text-zinc-500 text-sm">Utility bill or bank statement (dated within 3 months)</p>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="mt-4"
              onChange={() => {
                // Would handle file upload
                setFormData(prev => ({ ...prev, proofOfAddressUrl: 'uploaded' }));
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || !formData.fullName || !formData.dateOfBirth}
          className="w-full bg-white text-black py-4 font-bold uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit KYC Documents'}
        </button>
      </form>
    </div>
  );
}

function AccreditationStep({
  isAccredited,
  onComplete,
}: {
  isAccredited: boolean;
  onComplete: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [reason, setReason] = useState('');

  if (isAccredited) {
    return (
      <div className="border border-zinc-800 p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-2xl text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Certified</h3>
        <p className="text-zinc-400 mb-6">Your certified investor status is confirmed.</p>
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          Continue <FaArrowRight />
        </button>
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 p-8">
      <h3 className="text-2xl font-bold text-white mb-4">Certified Investor Verification</h3>
      <p className="text-zinc-400 mb-8">
        Under FCA regulations and FSMA, we can only accept investments from certified high net worth
        individuals or self-certified sophisticated investors.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 p-6 mb-8">
        <h4 className="font-bold text-white mb-4">Certified Investor Qualifications (UK)</h4>
        <ul className="space-y-3 text-zinc-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            <span><strong>High Net Worth:</strong> Annual income of £170,000+ or net assets of £430,000+ (excluding primary residence and pension)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            <span><strong>Sophisticated Investor:</strong> Member of angel network, made 2+ investments in unlisted companies in past 2 years, or worked in private equity/finance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            <span><strong>Self-Certified Sophisticated:</strong> Sufficient knowledge and experience to understand risks of investing in non-mainstream pooled investments</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">•</span>
            <span><strong>Professional Investor:</strong> FCA-authorised firm or regulated professional</span>
          </li>
        </ul>
      </div>

      <div className="space-y-4 mb-8">
        <label className="block text-sm text-zinc-400 mb-2">Basis for Certification</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-white focus:border-white outline-none transition-colors"
        >
          <option value="">Select qualification basis...</option>
          <option value="high_net_worth">High Net Worth Individual (£170k+ income or £430k+ assets)</option>
          <option value="sophisticated">Sophisticated Investor (investment experience)</option>
          <option value="self_certified">Self-Certified Sophisticated Investor</option>
          <option value="professional">Professional Investor (FCA-authorised)</option>
        </select>
      </div>

      <label className="flex items-start gap-3 cursor-pointer mb-8">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-1"
        />
        <span className="text-zinc-300 text-sm">
          I certify that I qualify as a certified investor under FCA regulations (Financial Promotion Order)
          and understand that this investment involves significant risk. I acknowledge that I may lose
          all of my investment and that b0ase.com may request additional documentation to verify my status.
        </span>
      </label>

      <button
        onClick={onComplete}
        disabled={!checked || !reason}
        className="w-full bg-white text-black py-4 font-bold uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Confirm Certification
      </button>
    </div>
  );
}

function VaultStep({
  hasVault,
  vaultAddress,
  onComplete,
  onError,
}: {
  hasVault: boolean;
  vaultAddress: string | null;
  onComplete: () => void;
  onError: (error: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [userPublicKey, setUserPublicKey] = useState('');
  const [createdVault, setCreatedVault] = useState<{ address: string } | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Registration form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isCertified, setIsCertified] = useState(false);

  // Check if already registered
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/investors/register');
        const data = await res.json();
        if (data.isRegistered) {
          setIsRegistered(true);
        }
      } catch (err) {
        console.error('Failed to check registration status:', err);
      }
    };
    checkStatus();
  }, []);

  // Handle registration after vault is created
  const handleRegister = async () => {
    if (!fullName || !email) {
      onError('Please enter your name and email');
      return;
    }
    if (!isCertified) {
      onError('Please certify that you are an eligible investor');
      return;
    }

    setRegistering(true);
    onError('');

    try {
      const res = await fetch('/api/investors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          accreditedInvestor: true,
          accreditedReason: 'self_certified',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsRegistered(true);
      } else {
        // If already registered, that's fine
        if (res.status === 409) {
          setIsRegistered(true);
        } else {
          onError(data.error || 'Failed to register');
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      onError('Failed to complete registration');
    } finally {
      setRegistering(false);
    }
  };

  if (hasVault && vaultAddress && isRegistered) {
    return (
      <div className="border border-zinc-800 p-8 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="text-2xl text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Registration Complete</h3>
        <p className="text-zinc-400 mb-4">You are now a registered $BOASE investor.</p>
        <p className="font-mono text-sm bg-zinc-900 p-3 text-zinc-300 break-all">{vaultAddress}</p>
        <button
          onClick={onComplete}
          className="mt-6 inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          Go to Dashboard <FaArrowRight />
        </button>
      </div>
    );
  }

  // Vault created but not yet registered - show registration form
  if (createdVault || (hasVault && vaultAddress)) {
    const currentVaultAddress = createdVault?.address || vaultAddress;

    return (
      <div className="border border-zinc-800 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Vault Created!</h3>
          <p className="font-mono text-sm bg-zinc-900 p-3 text-zinc-300 break-all">{currentVaultAddress}</p>
        </div>

        <div className="border-t border-zinc-800 pt-8">
          <h4 className="text-lg font-bold text-white mb-4">Complete Registration</h4>
          <p className="text-zinc-400 mb-6">
            Enter your details to be registered as a $BOASE investor.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:border-white focus:outline-none"
              />
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-4 mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCertified}
                  onChange={(e) => setIsCertified(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-zinc-300">
                  I certify that I am a High Net Worth Individual (annual income ≥£170,000 or net assets ≥£430,000)
                  or a Sophisticated Investor as defined by the FCA Financial Promotion Order, and I understand
                  the risks of investing in unlisted securities.
                </span>
              </label>
            </div>

            <button
              onClick={handleRegister}
              disabled={registering || !fullName || !email || !isCertified}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registering ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                <>Complete Registration <FaArrowRight /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!userPublicKey) {
      onError('Please enter your wallet public key');
      return;
    }

    setCreating(true);
    onError('');

    try {
      const res = await fetch('/api/investors/create-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPublicKey }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setCreatedVault({ address: data.vault.address });
      } else {
        onError(data.error || 'Failed to create vault');
      }
    } catch (err) {
      console.error('Create vault error:', err);
      onError('Failed to create vault');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="border border-zinc-800 p-8">
      <h3 className="text-2xl font-bold text-white mb-4">Create Your Custody Vault</h3>
      <p className="text-zinc-400 mb-8">
        Your $BOASE tokens will be held in a 2-of-2 multisig vault. Both you and b0ase.com
        must approve any transfer, ensuring regulatory compliance.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 p-6 mb-8">
        <h4 className="font-bold text-white mb-4">2-of-2 Multisig Model</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-zinc-300">Key 1: Your wallet (you control)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-zinc-300">Key 2: b0ase.com platform (we control)</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm">
            <strong className="text-zinc-300">Why 2-of-2?</strong> FCA regulations require transfer restrictions on private securities.
            Both parties must approve, ensuring investors cannot transfer shares to unverified parties,
            and b0ase cannot unilaterally move investor tokens.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-zinc-400 mb-2">Your Wallet Public Key (Hex)</label>
        <input
          type="text"
          value={userPublicKey}
          onChange={(e) => setUserPublicKey(e.target.value)}
          placeholder="Enter your BSV public key (66-130 characters)"
          className="w-full bg-zinc-900 border border-zinc-700 px-4 py-3 text-white font-mono text-sm focus:border-white outline-none transition-colors"
        />
        <p className="text-zinc-500 text-xs mt-2">
          You can get this from your BSV wallet. It's used to create your unique multisig address.
        </p>
      </div>

      <button
        onClick={handleCreate}
        disabled={creating || !userPublicKey}
        className="w-full bg-white text-black py-4 font-bold uppercase tracking-wider hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {creating ? (
          <>
            <FaSpinner className="animate-spin" /> Creating Vault...
          </>
        ) : (
          'Create Vault'
        )}
      </button>
    </div>
  );
}
