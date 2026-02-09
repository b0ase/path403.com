'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClient, getClientProjects } from '@/lib/clients';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

export default function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const client = getClient(slug);
  const projects = getClientProjects(slug);

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Back link */}
          <Link
            href="/client"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8"
          >
            <FiArrowLeft size={14} />
            <span className="text-sm">All Clients</span>
          </Link>

          {/* Header */}
          <div className="mb-12 border-b border-gray-800 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                    {client.name}
                  </h1>
                  <span
                    className={`px-2 py-1 text-xs uppercase ${
                      client.status === 'active'
                        ? 'bg-green-900/50 text-green-400'
                        : client.status === 'completed'
                        ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>
                {client.company && (
                  <p className="text-gray-400">{client.company}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  Client since {new Date(client.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold uppercase tracking-tight text-gray-300">
                Projects
              </h2>
              <span className="text-xs text-gray-500 uppercase tracking-widest">
                {projects.length} total
              </span>
            </div>

            {projects.length === 0 ? (
              <div className="p-8 border border-gray-800 text-center">
                <p className="text-gray-500 mb-4">No projects yet</p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold hover:opacity-80 transition-colors"
                  style={{ backgroundColor: '#fff', color: '#000' }}
                >
                  Start a Project <FiArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/client/${slug}/project/${project.slug}`}
                    className="p-6 border border-gray-800 hover:border-gray-600 bg-black hover:bg-gray-900/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{project.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs uppercase ${
                          project.status === 'completed'
                            ? 'bg-green-900/50 text-green-400'
                            : project.status === 'in_progress'
                            ? 'bg-blue-900/50 text-blue-400'
                            : project.status === 'on_hold'
                            ? 'bg-orange-900/50 text-orange-400'
                            : 'bg-gray-900/50 text-gray-400'
                        }`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                    )}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                      <span className="text-gray-500 text-xs">
                        Created {new Date(project.createdAt).toLocaleDateString('en-GB')}
                      </span>
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        View Project <FiArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-gray-800">
              <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                Contact
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Email:</span>{' '}
                  <a href={`mailto:${client.email}`} className="text-white hover:text-gray-300">
                    {client.email || 'Not provided'}
                  </a>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Company:</span>{' '}
                  <span className="text-white">{client.company || 'Not provided'}</span>
                </p>
              </div>
            </div>
            <div className="p-6 border border-gray-800">
              <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/contact"
                  className="px-4 py-2 text-xs border border-gray-800 hover:border-gray-600 transition-colors"
                >
                  New Project
                </Link>
                <Link
                  href="/pricing"
                  className="px-4 py-2 text-xs border border-gray-800 hover:border-gray-600 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
