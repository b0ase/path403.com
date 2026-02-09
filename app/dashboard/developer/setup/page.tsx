'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GitHubVerificationStep from '@/components/marketplace/onboarding/GitHubVerificationStep';
import ProfileSetupStep from '@/components/marketplace/onboarding/ProfileSetupStep';
import PayoutPreferencesStep from '@/components/marketplace/onboarding/PayoutPreferencesStep';
import AgentRegistrationStep from '@/components/marketplace/onboarding/AgentRegistrationStep';

type Step = 'github' | 'profile' | 'payout' | 'agent' | 'complete';

interface OnboardingData {
  githubUsername?: string;
  githubVerified?: boolean;
  githubStars?: number;
  profile?: {
    bio?: string;
    skills?: string[];
    hourlyRate?: number;
    portfolioUrls?: string[];
    availability?: string;
  };
  payout?: {
    method?: 'stripe' | 'paypal' | 'crypto';
    stripeAccountId?: string;
    paypalEmail?: string;
    cryptoCurrency?: string;
    cryptoAddress?: string;
  };
  agents?: Array<{
    name: string;
    description: string;
    capabilities: Record<string, any>;
  }>;
}

export default function DeveloperOnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('github');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const router = useRouter();

  const steps: Step[] = ['github', 'profile', 'payout', 'agent', 'complete'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const handleGitHubVerified = (data: {
    username: string;
    verified: boolean;
    stars: number;
  }) => {
    setOnboardingData((prev) => ({
      ...prev,
      githubUsername: data.username,
      githubVerified: data.verified,
      githubStars: data.stars,
    }));
    setCurrentStep('profile');
  };

  const handleProfileComplete = (profileData: OnboardingData['profile']) => {
    setOnboardingData((prev) => ({
      ...prev,
      profile: profileData,
    }));
    setCurrentStep('payout');
  };

  const handlePayoutComplete = (payoutData: OnboardingData['payout']) => {
    setOnboardingData((prev) => ({
      ...prev,
      payout: payoutData,
    }));
    setCurrentStep('agent');
  };

  const handleAgentComplete = (agentData?: OnboardingData['agents']) => {
    setOnboardingData((prev) => ({
      ...prev,
      agents: agentData,
    }));
    setCurrentStep('complete');
  };

  const handleSkipAgent = () => {
    setCurrentStep('complete');
  };

  const handleFinish = () => {
    router.push('/dashboard/developer/profile');
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Developer Onboarding</h1>
          <p className="text-gray-400">
            Join the b0ase marketplace and start receiving contract opportunities
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Step {currentStepIndex + 1} of {steps.length}</span>
            <span className="text-sm text-gray-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-sky-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          {currentStep === 'github' && (
            <GitHubVerificationStep onVerified={handleGitHubVerified} />
          )}

          {currentStep === 'profile' && (
            <ProfileSetupStep
              githubUsername={onboardingData.githubUsername}
              onComplete={handleProfileComplete}
              onBack={() => setCurrentStep('github')}
            />
          )}

          {currentStep === 'payout' && (
            <PayoutPreferencesStep
              onComplete={handlePayoutComplete}
              onBack={() => setCurrentStep('profile')}
            />
          )}

          {currentStep === 'agent' && (
            <AgentRegistrationStep
              onComplete={handleAgentComplete}
              onSkip={handleSkipAgent}
              onBack={() => setCurrentStep('payout')}
            />
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg
                  className="w-16 h-16 mx-auto text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-4">Onboarding Complete!</h2>
              <p className="text-gray-400 mb-8">
                Your developer profile is now active on the b0ase marketplace.
                <br />
                Clients can now discover you and send contract opportunities.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleFinish}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Go to Developer Dashboard
                </button>
                <button
                  onClick={() => router.push('/contracts/developers')}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Browse Developer Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
