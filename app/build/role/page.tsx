'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCircle,
  Code,
  Share2,
  TrendingUp,
  Palette,
  Megaphone,
  Handshake,
  Users,
  Check,
  ArrowRight,
  ChevronRight,
  Shield
} from 'lucide-react';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  traits: string[];
  pathway: string;
  benefits: string[];
}

const roleOptions: RoleOption[] = [
  {
    id: 'investor',
    title: 'Investor',
    description: 'I have capital and want to fund promising projects and entrepreneurs',
    icon: <TrendingUp className="h-6 w-6" />,
    traits: ['Capital Access', 'Risk Assessment', 'Portfolio Management', 'Due Diligence'],
    pathway: 'Investment Track',
    benefits: ['Access to investment opportunities', 'Portfolio tracking tools', 'Deal flow notifications', 'ROI analytics']
  },
  {
    id: 'builder',
    title: 'Builder / Developer',
    description: 'I create, code, and build digital products and solutions',
    icon: <Code className="h-6 w-6" />,
    traits: ['Technical Skills', 'Problem Solving', 'Product Development', 'Innovation'],
    pathway: 'Development Track',
    benefits: ['Project collaboration tools', 'Technical resources', 'Developer community', 'Code repositories']
  },
  {
    id: 'social',
    title: 'Social Media Manager',
    description: 'I excel at social media, content creation, and community building',
    icon: <Share2 className="h-6 w-6" />,
    traits: ['Content Creation', 'Community Management', 'Brand Awareness', 'Engagement'],
    pathway: 'Social Track',
    benefits: ['Content planning tools', 'Analytics dashboard', 'Scheduling features', 'Audience insights']
  },
  {
    id: 'strategist',
    title: 'Business Strategist',
    description: 'I focus on business strategy, planning, and growth optimization',
    icon: <UserCircle className="h-6 w-6" />,
    traits: ['Strategic Planning', 'Market Analysis', 'Business Development', 'Leadership'],
    pathway: 'Strategy Track',
    benefits: ['Strategy templates', 'Market research tools', 'Planning frameworks', 'Growth metrics']
  },
  {
    id: 'creative',
    title: 'Creative / Designer',
    description: 'I design, create visual content, and focus on user experience',
    icon: <Palette className="h-6 w-6" />,
    traits: ['Visual Design', 'User Experience', 'Creative Thinking', 'Brand Identity'],
    pathway: 'Creative Track',
    benefits: ['Design tools access', 'Creative resources', 'Portfolio showcase', 'Design community']
  },
  {
    id: 'marketer',
    title: 'Marketer',
    description: 'I drive growth through marketing campaigns and customer acquisition',
    icon: <Megaphone className="h-6 w-6" />,
    traits: ['Campaign Management', 'Customer Acquisition', 'Data Analysis', 'Growth Hacking'],
    pathway: 'Marketing Track',
    benefits: ['Campaign tools', 'Analytics platform', 'A/B testing', 'Customer insights']
  },
  {
    id: 'connector',
    title: 'Connector / Networker',
    description: 'I excel at connecting people and building valuable relationships',
    icon: <Handshake className="h-6 w-6" />,
    traits: ['Relationship Building', 'Networking', 'Partnership Development', 'Communication'],
    pathway: 'Networking Track',
    benefits: ['Connection tools', 'Event access', 'Networking opportunities', 'Relationship CRM']
  },
  {
    id: 'community',
    title: 'Community Builder',
    description: 'I build and nurture communities around shared interests and goals',
    icon: <Users className="h-6 w-6" />,
    traits: ['Community Management', 'Engagement', 'Event Planning', 'Culture Building'],
    pathway: 'Community Track',
    benefits: ['Community tools', 'Event planning', 'Member management', 'Engagement analytics']
  }
];

export default function RolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      const selectedRoleData = roleOptions.find(role => role.id === selectedRole);
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('userRoleData', JSON.stringify(selectedRoleData));
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/build/auth');
    } catch (error) {
      console.error('Error saving role:', error);
      setIsSubmitting(false);
    }
  };

  const selectedRoleData = roleOptions.find(role => role.id === selectedRole);

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black">
      <main className="relative z-10 px-4 md:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-zinc-900 pb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-white uppercase leading-none mb-6">
              Protocol Assignment
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl leading-relaxed">
              Define your operational identity. Selecting a role configures your environment parameters and unlocks specific toolkit capabilities.
            </p>
          </div>

          {/* Role Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 mb-24">
            {roleOptions.map((role) => (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`p-8 cursor-pointer transition-all duration-300 relative group h-full flex flex-col ${selectedRole === role.id
                    ? 'bg-zinc-900'
                    : 'bg-black hover:bg-zinc-950'
                  }`}
              >
                {selectedRole === role.id && (
                  <div className="absolute top-0 right-0 p-3 text-white bg-black border-l border-b border-white z-10">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <div className={`mb-8 p-3 border border-zinc-800 transition-colors w-fit ${selectedRole === role.id ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 group-hover:text-white'
                  }`}>
                  {role.icon}
                </div>

                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-widest">{role.title}</h3>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed mb-8 flex-1">
                  {role.description}
                </p>

                <div className="pt-6 border-t border-zinc-900 mt-auto">
                  <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-tighter block mb-3">KEY TRAITS</span>
                  <div className="flex flex-wrap gap-2">
                    {role.traits.slice(0, 2).map((trait, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-500 text-[9px] font-bold uppercase tracking-widest"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Role Deep Dive */}
          {selectedRoleData && (
            <div className="mb-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
                {/* Left: Info */}
                <div className="p-12 bg-zinc-950">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="p-4 bg-white text-black">
                      {selectedRoleData.icon}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold tracking-tighter uppercase leading-none">{selectedRoleData.title}</h2>
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2 block">{selectedRoleData.pathway}</span>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-4 block">Operational Assets</span>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedRoleData.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center text-xs text-zinc-400 uppercase tracking-widest group">
                            <ChevronRight className="h-3 w-3 mr-3 text-white transition-transform group-hover:translate-x-1" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Core Logic */}
                <div className="p-12 bg-black flex flex-col">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-12 block">Cognitive Parameters</span>
                  <div className="grid grid-cols-2 gap-8">
                    {selectedRoleData.traits.map((trait, index) => (
                      <div key={index} className="flex flex-col gap-3">
                        <div className="h-px bg-zinc-900 w-full" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{trait}</span>
                        <p className="text-[9px] text-zinc-600 uppercase leading-relaxed tracking-widest">
                          High-level proficiency in {trait.toLowerCase()} for {selectedRoleData.title.toLowerCase()} objectives.
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-12">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full h-20 bg-white text-black hover:bg-zinc-200 transition-colors font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 relative group"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin h-3 w-3 border-b-2 border-black"></div>
                          INITIALIZING...
                        </div>
                      ) : (
                        <>
                          COMMIT TO PROTOCOL
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedRole && (
            <div className="bg-zinc-950 border border-zinc-900 p-12 text-center">
              <Shield className="h-12 w-12 text-zinc-800 mx-auto mb-6" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">PLEASE SELECT OPERATIONAL ROLE TO PROCEED</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}