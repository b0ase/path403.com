'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-xl text-gray-400">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        <div className="prose prose-invert lg:prose-xl mx-auto text-gray-300">
          <p>
            Welcome to b0ase.com (the "Site", "Service"), operated by B0ASE ("we", "us", "our"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at <Link href="mailto:privacy@b0ase.com" className="text-sky-400 hover:text-sky-300">privacy@b0ase.com</Link>.
          </p>

          <h2 className="text-white">1. INFORMATION WE COLLECT</h2>
          <p>
            We collect personal information that you voluntarily provide to us when you register on the Service, express an interest in obtaining information about us or our products and services, when you participate in activities on the Service, or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of your interactions with us and the Service, the choices you make, and the products and features you use. The personal information we collect may include the following:
          </p>
          <ul>
            <li><strong>Personal Information Provided by You:</strong> We collect names; email addresses; usernames; passwords; contact preferences; contact or authentication data; billing addresses; debit/credit card numbers; phone numbers; and other similar information.</li>
            <li><strong>Payment Data:</strong> We may collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by our payment processor and you should review its privacy policies and contact the payment processor directly to respond to your questions.</li>
            <li><strong>Social Media Login Data:</strong> We may provide you with the option to register with us using your existing social media account details, like Google, GitHub, or others. If you choose to register in this way, we will collect the information described in the section called "HOW DO WE HANDLE YOUR SOCIAL LOGINS?" below.</li>
          </ul>
          <p>
            All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
          </p>

          <h2 className="text-white">2. HOW WE USE YOUR INFORMATION</h2>
          <p>
            We use personal information collected via our Service for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.
          </p>
          <ul>
            <li>To facilitate account creation and logon process.</li>
            <li>To post testimonials.</li>
            <li>Request feedback.</li>
            <li>To enable user-to-user communications.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
            <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
            <li>To respond to legal requests and prevent harm.</li>
            {/* Add more specific uses relevant to b0ase.com */}
          </ul>

          <h2 className="text-white">3. WILL YOUR INFORMATION BE SHARED WITH ANYONE?</h2>
          <p>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
          </p>
          {/* Detail specific sharing practices, e.g., with service providers, third parties */}

          <h2 className="text-white">4. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
          <p>
            If you choose to register or log in to our services using a social media account, we may have access to certain information about you. We receive information from your social media provider, but what we receive depends on the social media provider and your privacy settings with that provider.
          </p>

          <h2 className="text-white">5. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
          <p>
            We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
          </p>

          <h2 className="text-white">6. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
          <p>
            We aim to protect your personal information through a system of organizational and technical security measures.
          </p>

          <h2 className="text-white">7. DO WE COLLECT INFORMATION FROM MINORS?</h2>
          <p>
            We do not knowingly solicit data from or market to children under 18 years of age.
          </p>

          <h2 className="text-white">8. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
          <p>
            In some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information.
          </p>
          <p>
             To make such a request, please use the <Link href="mailto:privacy@b0ase.com" className="text-sky-400 hover:text-sky-300">contact details</Link> provided below. We will consider and act upon any request in accordance with applicable data protection laws.
          </p>

          <h2 className="text-white">9. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
          <p>
            Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (“DNT”) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. 
          </p>

          <h2 className="text-white">10. UPDATES TO THIS NOTICE</h2>
          <p>
            We may update this privacy notice from time to time. The updated version will be indicated by an updated “Last Updated” date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.
          </p>

          <h2 className="text-white">11. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
          <p>
            If you have questions or comments about this notice, you may email us at <Link href="mailto:privacy@b0ase.com" className="text-sky-400 hover:text-sky-300">privacy@b0ase.com</Link> or by post to:
          </p>
          <p>
            B0ASE<br />
            [Your Company Address - To Be Filled In]<br />
            [City, State, Zip Code]<br />
            [Country]
          </p>

          <h2 className="text-white">12. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
          <p>
            Based on the applicable laws of your country, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances. To request to review, update, or delete your personal information, please submit a request form by contacting us at <Link href="mailto:privacy@b0ase.com" className="text-sky-400 hover:text-sky-300">privacy@b0ase.com</Link>.
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