"use client";
import Link from 'next/link';
import ProjectImage from '@/components/ProjectImage';

export default function CorporateWebPortalPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800 mb-8">
        <Link href="/services/web-development" className="text-sky-400 hover:underline text-sm mb-4 inline-block">← Back to Web Development</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Corporate Web Portal</h1>
        <p className="text-xl text-gray-300 max-w-4xl mb-2">
          Secure corporate portal for document management and team collaboration.
        </p>
      </header>

      {/* Project Overview */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            Our client, a leading financial services firm, required a secure, scalable web portal to centralize document management and facilitate collaboration across distributed teams. The solution needed to meet strict compliance requirements and provide a seamless user experience for both staff and clients.
          </p>
        </div>
      </section>

      {/* Project Image */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative w-full h-48 bg-gray-800 overflow-hidden">
            <img
              src="http://localhost:3000/_next/image?url=%2Fimages%2Fservices%2Fweb-development%2Fcorporate-portal.png&w=640&q=75"
              alt="Corporate Web Portal"
              className="object-cover w-full h-full"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-4">
              <h4 className="text-white text-sm font-medium truncate">Corporate Web Portal</h4>
            </div>
          </div>
        </div>
      </section>

      {/* What We Did */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What We Did</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Designed a secure, role-based access system for sensitive documents</li>
            <li>Developed real-time collaboration tools (comments, notifications)</li>
            <li>Integrated SSO with Auth0 for seamless authentication</li>
            <li>Built a responsive, branded UI with Material UI</li>
            <li>Implemented audit logging and compliance features</li>
            <li>Deployed scalable infrastructure on Firebase</li>
          </ul>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-3 mb-2">
            {['Next.js', 'Firebase', 'Auth0', 'Material UI'].map((tech, index) => (
              <span key={index} className="px-4 py-2 bg-gray-800 text-cyan-400 text-sm rounded-full">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Role-based document access and sharing</li>
            <li>Real-time team collaboration and notifications</li>
            <li>Comprehensive audit trails for compliance</li>
            <li>Single sign-on (SSO) and multi-factor authentication</li>
            <li>Customizable dashboards for different user roles</li>
            <li>Mobile-friendly, responsive design</li>
          </ul>
        </div>
      </section>

      {/* Results & Impact */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Results & Impact</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Document retrieval time reduced by 70%</li>
            <li>Compliance audit preparation time cut in half</li>
            <li>Employee engagement and collaboration improved</li>
            <li>Zero security incidents since launch</li>
          </ul>
        </div>
      </section>

      {/* Client Testimonial */}
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">&quot;</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">&quot;The portal has transformed how our teams work together and manage sensitive documents. The security and ease of use are outstanding.&quot;</p>
              <div>
                <p className="font-semibold text-white">Sarah Lin</p>
                <p className="text-gray-400 text-sm">COO, Financial Services Client</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 