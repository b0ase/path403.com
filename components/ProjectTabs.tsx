import React from 'react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { FaInfoCircle, FaChartBar, FaCog, FaCode, FaGlobe, FaImage, FaExternalLinkAlt, FaGithub, FaTwitter, FaEnvelope, FaLock } from 'react-icons/fa';
import type { Project } from '@/lib/data';

interface ProjectTabsProps {
  project: Project;
  themeConfig?: { primary: string; secondary: string };
}

// Theme helper for consistent theming
const getThemeStyles = (themeConfig?: { primary: string; secondary: string }) => {
  if (!themeConfig) {
    return {
      primaryText: 'text-blue-400',
      secondaryText: 'text-purple-400',
      borderColor: 'border-white/20',
      activeBg: 'bg-blue-600',
      hoverBg: 'hover:bg-white/10',
      cardBorder: 'border-white/10',
      accentText: 'text-green-400',
    };
  }

  const colorStyles: Record<string, { text: string; bg: string; border: string }> = {
    pink: { text: 'text-pink-400', bg: 'bg-pink-600', border: 'border-pink-500/30' },
    purple: { text: 'text-purple-400', bg: 'bg-purple-600', border: 'border-purple-500/30' },
    blue: { text: 'text-blue-400', bg: 'bg-blue-600', border: 'border-blue-500/30' },
    cyan: { text: 'text-cyan-400', bg: 'bg-cyan-600', border: 'border-cyan-500/30' },
    green: { text: 'text-green-400', bg: 'bg-green-600', border: 'border-green-500/30' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-600', border: 'border-amber-500/30' },
    orange: { text: 'text-orange-400', bg: 'bg-orange-600', border: 'border-orange-500/30' },
    yellow: { text: 'text-yellow-400', bg: 'bg-yellow-600', border: 'border-yellow-500/30' },
    red: { text: 'text-red-400', bg: 'bg-red-600', border: 'border-red-500/30' },
    teal: { text: 'text-teal-400', bg: 'bg-teal-600', border: 'border-teal-500/30' },
  };

  const primary = colorStyles[themeConfig.primary] || colorStyles.blue;
  const secondary = colorStyles[themeConfig.secondary] || colorStyles.purple;

  return {
    primaryText: primary.text,
    secondaryText: secondary.text,
    borderColor: primary.border,
    activeBg: primary.bg,
    hoverBg: 'hover:bg-white/10',
    cardBorder: primary.border,
    accentText: primary.text,
  };
};

const tabDefs = [
  { id: 'overview', name: 'Overview', icon: FaInfoCircle },
  { id: 'business-model', name: 'Business Model', icon: FaChartBar },
  { id: 'services', name: 'Services', icon: FaCog },
  { id: 'technology', name: 'Technology', icon: FaCode },
  { id: 'market', name: 'Market Analysis', icon: FaGlobe },
  { id: 'gallery', name: 'Gallery', icon: FaImage },
];

export default function ProjectTabs({ project, themeConfig }: ProjectTabsProps) {
  // Get theme styles
  const theme = getThemeStyles(themeConfig);

  // Pick a main image for the hero if available
  const mainImage = project.cardImageUrls && project.cardImageUrls.length > 0 ? project.cardImageUrls[0] : null;

  return (
    <div className="w-full">
      {/* Hero Section with Icon/Title/Stats */}
      <div className="relative mb-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wide mb-4">
              {project.slug === 'bitcoin-file-utility' ? (
                <>Bitcoin F<span className="line-through opacity-50">ile</span> Utility</>
              ) : project.title}
            </h1>
            {project.subtitle && <p className="text-lg text-gray-400 font-medium mb-4">{project.subtitle}</p>}
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2">
                  <FaExternalLinkAlt size={14} />
                  Visit Website
                </a>
              )}
              {project.githubUrl && project.githubUrl !== '#' && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center gap-2">
                  <FaGithub size={14} />
                  View Code
                </a>
              )}
              {project.xUrl && project.xUrl !== '#' && (
                <a href={project.xUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center gap-2">
                  <FaTwitter size={14} />
                  X
                </a>
              )}
              <a href="/market" className="px-6 py-3 border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center gap-2">
                <FaExternalLinkAlt size={14} />
                View on Market
              </a>
              <a href="/login" className="px-6 py-3 border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-all flex items-center gap-2">
                <FaLock size={14} />
                Investor Login
              </a>
            </div>
            {/* Key Stats */}
            <div className="flex flex-wrap gap-6 mb-4">
              {project.tokenName && (
                <div className={`border ${theme.borderColor} rounded-lg px-4 py-3`}>
                  <div className={`text-xl font-bold ${theme.primaryText}`}>{project.tokenName}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Token</div>
                </div>
              )}
              {project.status && (
                <div className={`border ${theme.borderColor} rounded-lg px-4 py-3`}>
                  <div className="text-xl font-bold text-white">{project.status}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
                </div>
              )}
              {project.price && (
                <div className={`border ${theme.borderColor} rounded-lg px-4 py-3`}>
                  <div className={`text-xl font-bold ${theme.accentText}`}>${project.price.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Valuation</div>
                </div>
              )}
            </div>
          </div>
          {/* Hero Image */}
          <div className="relative">
            {mainImage && (
              <div className={`relative border ${theme.borderColor} rounded-lg overflow-hidden`}>
                <Image
                  src={mainImage}
                  alt={project.title + ' hero'}
                  width={600}
                  height={400}
                  className="w-full h-auto"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Tabs Section */}
      <div className={`border-t ${theme.cardBorder} mt-8 pt-8`}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 flex flex-wrap gap-2">
            {tabDefs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 px-4 py-2 text-sm">
                  <Icon size={14} />
                  {tab.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="space-y-6 mt-6">
                <h2 className="text-2xl font-bold text-white">What is {project.title}?</h2>
                <p className="text-gray-300">{project.description || 'No overview available.'}</p>
                {project.valuePropositions && project.valuePropositions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Key Features</h3>
                    <ul className="list-disc ml-6 text-gray-300 space-y-1">
                      {project.valuePropositions.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                )}
                {project.keyPartners && project.keyPartners.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Key Partners</h3>
                    <ul className="list-disc ml-6 text-gray-300 space-y-1">
                      {project.keyPartners.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                )}
                {project.tech && project.tech.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Technologies</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech, i) => (
                        <span key={i} className={`px-3 py-1 border ${theme.borderColor} ${theme.primaryText} text-sm rounded-lg`}>{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            {/* Business Model Tab */}
            <TabsContent value="business-model">
              <div className="space-y-6 mt-6">
                <h2 className="text-2xl font-bold text-white">Business Model</h2>
                {project.valuePropositions && project.valuePropositions.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Value Propositions</h3>
                    <ul className="list-disc ml-6 text-gray-300 space-y-1">
                      {project.valuePropositions.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                ) : <p className="text-gray-500">No business model details available.</p>}
                {project.revenueStreams && project.revenueStreams.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Revenue Streams</h3>
                    <ul className="list-disc ml-6 text-gray-300 space-y-1">
                      {project.revenueStreams.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                )}
                {project.costStructure && project.costStructure.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Cost Structure</h3>
                    <ul className="list-disc ml-6 text-gray-300 space-y-1">
                      {project.costStructure.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
            {/* Services Tab */}
            <TabsContent value="services">
              <div className="space-y-6 mt-6">
                <h2 className="text-2xl font-bold text-white">Services</h2>
                {project.keyActivities && project.keyActivities.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Key Activities</h3>
                    <ul className="list-disc ml-6 text-gray-300 space-y-1">
                      {project.keyActivities.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                ) : <p className="text-gray-500">No services listed.</p>}
              </div>
            </TabsContent>
            {/* Technology Tab */}
            <TabsContent value="technology">
              <div className="space-y-6 mt-6">
                <h2 className="text-2xl font-bold text-white">Technology</h2>
                {project.tech && project.tech.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, i) => (
                      <span key={i} className="px-3 py-1 border border-white/20 text-white text-sm rounded-lg">{tech}</span>
                    ))}
                  </div>
                ) : <p className="text-gray-500">No technology stack listed.</p>}
              </div>
            </TabsContent>
            {/* Market Analysis Tab */}
            <TabsContent value="market">
              <div className="space-y-6 mt-6">
                <h2 className="text-2xl font-bold text-white">Market Analysis</h2>
                {project.customerSegments && project.customerSegments.length > 0 ? (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Target Users</h3>
                    <ul className="list-disc ml-6 text-gray-300 space-y-1">
                      {project.customerSegments.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                ) : <p className="text-gray-500">No market analysis available.</p>}
                {project.channels && project.channels.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Distribution Channels</h3>
                    <ul className="list-disc ml-6 text-gray-300 space-y-1">
                      {project.channels.map((v, i) => <li key={i}>{v}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <div className="space-y-6 mt-6">
                <h2 className="text-2xl font-bold text-white">Gallery</h2>
                {project.cardImageUrls && project.cardImageUrls.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.cardImageUrls.map((url, i) => (
                      <div key={i} className="relative border border-white/20 rounded-lg overflow-hidden aspect-video flex items-center justify-center bg-black">
                        <Image
                          src={url}
                          alt={`${project.title} screenshot ${i + 1}`}
                          width={800}
                          height={450}
                          className="object-contain"
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                          priority={i < 2}
                          quality={85}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No images available.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
      </div>
      {/* Contact/CTA Section */}
      <div className="mt-12 border-t border-white/10 pt-12">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4 text-white">Interested in {project.title}?</h3>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">Contact us to learn more, invest, or partner on this project.</p>
          <a
            href={`mailto:richard@b0ase.com?subject=Interest in ${encodeURIComponent(project.title)}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all"
          >
            <FaEnvelope size={16} /> Contact About Project
          </a>
        </div>
      </div>
    </div>
  );
} 