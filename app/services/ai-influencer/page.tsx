import { FaArrowLeft, FaUser } from 'react-icons/fa';
import Link from 'next/link';

export default function AIInfluencerPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <Link href="/services" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <FaArrowLeft />
          Back to Services
        </Link>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaUser className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white mb-2">
              AI Influencer
            </h1>
            <p className="text-xl text-gray-400 mb-2">Complete AI-Powered Social Media Presence</p>
          </div>
        </div>
        <p className="text-lg text-gray-400 max-w-3xl leading-relaxed">
          Launch and scale your digital influencer presence with our AI-powered ecosystem. From content creation to automated posting, audience engagement to brand partnerships – we handle everything while you focus on strategy and growth.
        </p>
      </div>
      {/* ...rest of the page content... */}
    </div>
  );
} 