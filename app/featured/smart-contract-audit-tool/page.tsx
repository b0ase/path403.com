import Link from 'next/link';
import ProjectImage from '@/components/ProjectImage';

export default function SmartContractAuditToolPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800 mb-8">
        <Link href="/services/software-development" className="text-sky-400 hover:underline text-sm mb-4 inline-block">← Back to Software Development</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Smart Contract Audit Tool</h1>
        <p className="text-xl text-gray-300 max-w-4xl mb-2">
          Automated tool for analyzing and validating smart contracts across multiple blockchain networks.
        </p>
      </header>

      {/* Project Overview */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            {/* TODO: Add detailed project overview text here */}
            This project focused on creating a sophisticated tool to automate the auditing of smart contracts, enhancing security and reliability in the blockchain space. It supports multiple networks and provides detailed vulnerability reports.
          </p>
        </div>
      </section>

      {/* Project Image */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <ProjectImage 
            service="software-development" 
            projectId="smart-contract-audit" 
            title="Smart Contract Audit Tool"
          />
        </div>
      </section>

      {/* What We Did */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What We Did</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {/* TODO: Add specific tasks accomplished */}
            <li>Developed a static and dynamic analysis engine for smart contract code.</li>
            <li>Integrated support for popular blockchain platforms like Ethereum and Binance Smart Chain.</li>
            <li>Designed a user-friendly interface for submitting contracts and viewing audit reports.</li>
            <li>Created a comprehensive database of known vulnerabilities and best practices.</li>
            <li>Implemented automated reporting and alert mechanisms.</li>
          </ul>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-3 mb-2">
            {['Solidity', 'Python', 'Web3.js', 'Ethereum', 'JavaScript', 'Mythril'].map((tech, index) => (
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
            {/* TODO: Add key features of the tool */}
            <li>Automated vulnerability detection.</li>
            <li>Support for multiple blockchain networks.</li>
            <li>Detailed and actionable audit reports.</li>
            <li>Integration with development workflows.</li>
            <li>Regularly updated vulnerability database.</li>
            <li>User-friendly interface for easy contract submission.</li>
          </ul>
        </div>
      </section>

      {/* Optional sections (Results & Impact, Client Testimonial) can be added here if needed, similar to the crypto page */}

    </div>
  );
} 