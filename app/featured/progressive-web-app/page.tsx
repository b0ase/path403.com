"use client";
import Link from 'next/link';
import ProjectImage from '@/components/ProjectImage';

export default function ProgressiveWebAppPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-4 md:px-8 py-8 border-b border-gray-800 mb-8">
        <Link href="/services/web-development" className="text-sky-400 hover:underline text-sm mb-4 inline-block">← Back to Web Development</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Progressive Web App</h1>
        <p className="text-xl text-gray-300 max-w-4xl mb-2">
          Progressive web app with offline support and real-time data sync for field teams.
        </p>
      </header>

      {/* Project Overview */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
          <p className="text-gray-300 mb-4">
            Our client, a logistics company, needed a mobile-first application for field agents to access and update job data in real time—even in areas with poor connectivity. The solution had to work seamlessly offline and synchronize data instantly when a connection was available.
          </p>
        </div>
      </section>

      {/* Project Image */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative w-full h-48 bg-gray-800 overflow-hidden">
            <img
              src="http://localhost:3000/_next/image?url=%2Fimages%2Fservices%2Fweb-development%2Fprogressive-app.png&w=640&q=75"
              alt="Progressive Web App"
              className="object-cover w-full h-full"
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-4">
              <h4 className="text-white text-sm font-medium truncate">Progressive Web App</h4>
            </div>
          </div>
        </div>
      </section>

      {/* What We Did */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">What We Did</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Designed a mobile-first, responsive UI for field agents</li>
            <li>Implemented offline support using Service Workers and IndexedDB</li>
            <li>Built real-time data sync with WebSockets</li>
            <li>Integrated push notifications for job updates</li>
            <li>Optimized for fast load and install as a PWA</li>
            <li>Ensured cross-device compatibility and accessibility</li>
          </ul>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
          <div className="flex flex-wrap gap-3 mb-2">
            {['React', 'Service Workers', 'IndexedDB', 'WebSockets'].map((tech, index) => (
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
            <li>Offline access and data entry</li>
            <li>Real-time job updates and notifications</li>
            <li>Automatic data sync when online</li>
            <li>Installable on any device (PWA)</li>
            <li>Secure authentication and user management</li>
            <li>Custom dashboards for different user roles</li>
          </ul>
        </div>
      </section>

      {/* Results & Impact */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Results & Impact</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Field agent productivity increased by 30%</li>
            <li>Data loss incidents dropped to zero</li>
            <li>App adoption rate exceeded 95% among staff</li>
            <li>Positive feedback on usability and reliability</li>
          </ul>
        </div>
      </section>

      {/* Client Testimonial */}
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black p-6 border border-gray-800 shadow-xl relative">
            <div className="text-4xl text-cyan-500 opacity-30 absolute top-4 left-4">&quot;</div>
            <div className="relative z-10">
              <p className="text-gray-300 mb-4 italic">&quot;Our field teams can now work anywhere, anytime. The offline support and instant sync have made a huge difference to our operations.&quot;</p>
              <div>
                <p className="font-semibold text-white">James Carter</p>
                <p className="text-gray-400 text-sm">Operations Manager, Logistics Client</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 