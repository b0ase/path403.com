'use client';

import { useParams } from 'next/navigation';
import { portfolioData } from '@/lib/data';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';
import { Users, Building2, Handshake } from 'lucide-react';
import Link from 'next/link';

export default function TeamPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const project = portfolioData.projects.find(p => p.slug === slug);

  if (!project) return null;

  // b0ase.com team - the core team behind all projects
  const coreTeam = [
    {
      name: 'Richard Boase',
      role: 'Founder & Lead Developer',
      description: 'Full-stack developer with 10+ years experience. Building on Bitcoin since 2018.',
      avatar: '/boase_icon.png',
      links: {
        twitter: 'https://twitter.com/b0ase',
        github: 'https://github.com/b0ase',
        website: 'https://b0ase.com',
      },
    },
  ];

  // Key partners from project data
  const partners = project.keyPartners || [];

  return (
    <div className="space-y-12">
      {/* Core Team */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Users size={20} className="text-gray-500" />
          <h2 className="text-xl font-bold uppercase tracking-tight text-gray-400">Core Team</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreTeam.map((member, i) => (
            <div key={i} className="p-6 border border-gray-800 bg-gray-900/30">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0">
                  {member.avatar && (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  <p className="text-sm text-blue-400 mb-2">{member.role}</p>
                  <p className="text-sm text-gray-400">{member.description}</p>
                </div>
              </div>

              {/* Social links */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-800">
                {member.links.twitter && (
                  <Link
                    href={member.links.twitter}
                    target="_blank"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <FaTwitter size={18} />
                  </Link>
                )}
                {member.links.github && (
                  <Link
                    href={member.links.github}
                    target="_blank"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <FaGithub size={18} />
                  </Link>
                )}
                {member.links.website && (
                  <Link
                    href={member.links.website}
                    target="_blank"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    <FiGlobe size={18} />
                  </Link>
                )}
              </div>
            </div>
          ))}

          {/* Hiring CTA */}
          <div className="p-6 border border-dashed border-gray-700 bg-gray-900/20 flex flex-col items-center justify-center text-center">
            <Users size={32} className="text-gray-600 mb-3" />
            <h3 className="text-lg font-bold mb-1">Join the Team</h3>
            <p className="text-sm text-gray-500 mb-4">
              As the project grows, so does the team.
            </p>
            <Link
              href="/contact"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Get in touch →
            </Link>
          </div>
        </div>
      </div>

      {/* Backed by b0ase.com */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Building2 size={20} className="text-gray-500" />
          <h2 className="text-xl font-bold uppercase tracking-tight text-gray-400">Backed By</h2>
        </div>

        <div className="p-6 border border-gray-800 bg-gray-900/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white flex items-center justify-center">
              <span className="text-black font-black text-lg">B0</span>
            </div>
            <div>
              <h3 className="text-lg font-bold">b0ase.com</h3>
              <p className="text-sm text-gray-400">
                Venture studio building companies from concept to exit
              </p>
            </div>
            <Link
              href="/"
              className="ml-auto px-4 py-2 border border-gray-700 text-sm hover:border-gray-600 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Key Partners */}
      {partners.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Handshake size={20} className="text-gray-500" />
            <h2 className="text-xl font-bold uppercase tracking-tight text-gray-400">Key Partners</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {partners.map((partner, i) => (
              <div
                key={i}
                className="p-4 border border-gray-800 bg-gray-900/30 text-center"
              >
                <p className="text-sm text-gray-300">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advisory note */}
      <div className="p-4 border border-gray-800 bg-gray-900/30 text-sm text-gray-500">
        <strong className="text-gray-400">Note:</strong> Team composition may evolve as the project
        develops. Advisors and additional team members will be announced as they join.
      </div>
    </div>
  );
}
