'use client';

import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-black text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-xl text-gray-400">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-invert lg:prose-xl mx-auto text-gray-300">
          <p>
            Welcome to b0ase.com ("b0ase", "we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of our website, services, and software (collectively, the "Service").
          </p>
          <p>
            By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Service.
          </p>

          <h2 className="text-white">1. DESCRIPTION OF SERVICE</h2>
          <p>
            b0ase.com is a full-service digital agency providing software development, AI agent integration, web design, and blockchain-related services. We also offer interactive experiences including but not limited to $BOASE tokens and music production tools.
          </p>

          <h2 className="text-white">2. ELIGIBILITY AND ACCOUNTS</h2>
          <p>
            You must be at least 18 years old to use this Service. To access certain features, you may be required to register an account or connect a third-party wallet (such as HandCash). You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>

          <h2 className="text-white">3. USER CONDUCT</h2>
          <p>
            You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the Service. Prohibited activities include, but are not limited to:
          </p>
          <ul>
            <li>Attempting to gain unauthorized access to our systems.</li>
            <li>Using automated systems (bots, scrapers) without our express permission.</li>
            <li>Engaging in fraudulent transactions or manipulating token economies.</li>
            <li>Posting or transmitting malicious code or viruses.</li>
          </ul>

          <h2 className="text-white">4. INTELLECTUAL PROPERTY</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of B0ASE and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of B0ASE.
          </p>

          <h2 className="text-white">5. PAYMENTS AND REFUNDS</h2>
          <p>
            Certain services or interactions may require payment in USD or Bitcoin SV (BSV). All payments are final and non-refundable unless otherwise required by law or specified in a separate service agreement.
          </p>

          <h2 className="text-white">6. LIMITATION OF LIABILITY</h2>
          <p>
            In no event shall B0ASE, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h2 className="text-white">7. DISCLAIMER</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied.
          </p>

          <h2 className="text-white">8. GOVERNING LAW</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which B0ASE operates, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-white">9. CHANGES TO TERMS</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes by updating the "Last Updated" date at the top of this page.
          </p>

          <h2 className="text-white">10. CONTACT US</h2>
          <p>
            If you have any questions about these Terms, please contact us at <Link href="mailto:legal@b0ase.com" className="text-sky-400 hover:text-sky-300">legal@b0ase.com</Link>.
          </p>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-700 text-center">
          <Link href="/" className="text-sky-400 hover:text-sky-300">
            Return to b0ase.com
          </Link>
        </footer>
      </div>
    </div>
  );
}
