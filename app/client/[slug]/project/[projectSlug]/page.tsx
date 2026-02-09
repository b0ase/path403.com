'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getClient, getProject } from '@/lib/clients';
import { FiArrowLeft, FiArrowRight, FiCheckSquare } from 'react-icons/fi';

export default function ProjectPage({
  params
}: {
  params: Promise<{ slug: string; projectSlug: string }>
}) {
  const { slug, projectSlug } = use(params);
  const client = getClient(slug);
  const project = getProject(slug, projectSlug);

  if (!client || !project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="px-4 md:px-8 py-16">
        <div className="w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/client" className="hover:text-white transition-colors">
              Clients
            </Link>
            <span>/</span>
            <Link href={`/client/${slug}`} className="hover:text-white transition-colors">
              {client.name}
            </Link>
            <span>/</span>
            <span className="text-white">{project.name}</span>
          </div>

          {/* Header */}
          <div className="mb-12 border-b border-gray-800 pb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                    {project.name}
                  </h1>
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
                  <p className="text-gray-400 max-w-2xl">{project.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-4">
                  Created {new Date(project.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <Link
                href={`/client/${slug}/project/${projectSlug}/checklist`}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
                style={{ backgroundColor: '#fff', color: '#000' }}
              >
                <FiCheckSquare size={16} />
                Project Checklist
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Details */}
            <div className="lg:col-span-2 space-y-8">
              <div className="p-6 border border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                  Project Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-white capitalize">{project.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Client</p>
                    <Link href={`/client/${slug}`} className="text-white hover:text-gray-300">
                      {client.name}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Description</p>
                    <p className="text-gray-400">{project.description || 'No description provided'}</p>
                  </div>
                </div>
              </div>

              {/* Checklist CTA */}
              <div className="p-8 border border-white/20 bg-white/5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Configure Project Scope</h3>
                    <p className="text-gray-400 text-sm">
                      Select services from our pricing menu to build your project checklist
                    </p>
                  </div>
                  <Link
                    href={`/client/${slug}/project/${projectSlug}/checklist`}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold hover:opacity-80 transition-colors whitespace-nowrap"
                    style={{ backgroundColor: '#fff', color: '#000' }}
                  >
                    Open Checklist <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="p-6 border border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    href={`/client/${slug}/project/${projectSlug}/checklist`}
                    className="flex items-center justify-between p-3 border border-gray-800 hover:border-gray-600 transition-colors"
                  >
                    <span className="text-sm">Project Checklist</span>
                    <FiArrowRight size={14} />
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center justify-between p-3 border border-gray-800 hover:border-gray-600 transition-colors"
                  >
                    <span className="text-sm">View Full Pricing</span>
                    <FiArrowRight size={14} />
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center justify-between p-3 border border-gray-800 hover:border-gray-600 transition-colors"
                  >
                    <span className="text-sm">Contact Support</span>
                    <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="p-6 border border-gray-800">
                <h3 className="text-sm font-bold uppercase tracking-tight mb-4 text-gray-400">
                  Client Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="text-white">{client.name}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Company:</span>{' '}
                    <span className="text-white">{client.company || 'N/A'}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{' '}
                    <a href={`mailto:${client.email}`} className="text-white hover:text-gray-300">
                      {client.email || 'N/A'}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-16 pt-8 border-t border-gray-800">
            <Link
              href={`/client/${slug}`}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
            >
              <FiArrowLeft size={14} />
              <span className="text-sm">Back to {client.name}</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
