import Link from 'next/link';
import ProjectImage from '@/components/ProjectImage';

export default function CryptoTradingPlatformPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800 mb-8">
        <Link href="/services/software-development" className="text-sky-400 hover:underline text-sm mb-4 inline-block">← Back to Software Development</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Crypto Trading Platform</h1>
        <p className="text-xl text-gray-300 max-w-4xl mb-2">
          Secure and user-friendly cryptocurrency trading platform with real-time market data and advanced order types.
        </p>
      </header>

      {/* Project Overview */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            {/* TODO: Add detailed project overview text here */}
            This project involved developing a comprehensive cryptocurrency trading platform designed for both novice and experienced traders. Key aspects included ensuring security, providing real-time data, and offering a range of trading tools.
          </p>
        </div>
      </section>

      {/* Project Image */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <ProjectImage 
            service="software-development" // Assuming this is the correct service folder for the image
            projectId="crypto-trading"     // Based on image file name
            title="Crypto Trading Platform"
          />
        </div>
      </section>

      {/* What We Did */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What We Did</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {/* TODO: Add specific tasks accomplished */}
            <li>Designed and implemented a secure user authentication system.</li>
            <li>Integrated with multiple cryptocurrency exchange APIs for real-time data.</li>
            <li>Developed a responsive front-end interface for trading and account management.</li>
            <li>Built a robust backend to handle trading logic and order processing.</li>
            <li>Implemented security best practices throughout the platform.</li>
          </ul>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-3 mb-2">
            {['React', 'Node.js', 'WebSockets', 'Blockchain APIs', 'PostgreSQL', 'Docker'].map((tech, index) => (
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
            {/* TODO: Add key features of the platform */}
            <li>Real-time market data and price charts.</li>
            <li>Support for multiple cryptocurrency pairs.</li>
            <li>Advanced order types (limit, market, stop-loss).</li>
            <li>Secure wallet integration.</li>
            <li>User-friendly trading interface.</li>
            <li>Comprehensive transaction history.</li>
          </ul>
        </div>
      </section>

      {/* Optional: Results & Impact (Add if applicable) */}
      {/* 
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Results & Impact</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>TODO: Add quantifiable results or impact of the project</li>
          </ul>
        </div>
      </section>
      */}

      {/* Optional: Client Testimonial (Add if applicable) */}
      {/*
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">"</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">TODO: Add client testimonial here if available.</p>
              <div>
                <p className="font-semibold text-white">Client Name</p>
                <p className="text-gray-400 text-sm">Client Title/Company</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}
    </div>
  );
} 