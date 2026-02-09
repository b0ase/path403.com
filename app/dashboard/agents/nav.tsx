'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiActivity, FiCpu, FiPlus } from 'react-icons/fi';

export default function AgentNav({ showCreateButton = false, onCreateClick }: { showCreateButton?: boolean; onCreateClick?: () => void }) {
    const pathname = usePathname();

    return (
        <div className="mb-8 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-2">
                        Agents
                    </h1>
                    <p className="text-white/60 text-lg">
                        Manage your autonomous AI agents
                    </p>
                </div>
                {showCreateButton && (
                    <button
                        onClick={onCreateClick}
                        className="bg-white text-black px-6 py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                    >
                        <FiPlus className="w-5 h-5" />
                        Create Agent
                    </button>
                )}
            </div>

            <div className="flex gap-1 overflow-x-auto">
                <NavLink href="/dashboard/agents" active={pathname === '/dashboard/agents'}>
                    <FiGrid className="w-4 h-4" />
                    Overview
                </NavLink>
                <NavLink href="/dashboard/agents/analytics" active={pathname === '/dashboard/agents/analytics'}>
                    <FiActivity className="w-4 h-4" />
                    Analytics
                </NavLink>
                {/* Future tabs */}
            </div>
        </div>
    );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className={`
        flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors
        ${active
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/20'}
      `}
        >
            {children}
        </Link>
    );
}
