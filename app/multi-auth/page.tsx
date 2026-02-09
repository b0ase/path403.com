'use client'

import Link from 'next/link'
import { FiCheck, FiX, FiAlertCircle, FiArrowLeft, FiExternalLink } from 'react-icons/fi'

export default function MultiAuthPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors">
            <FiArrowLeft size={14} />
            <span className="text-xs uppercase tracking-widest">Back</span>
          </Link>
          <span className="text-xs text-gray-500 uppercase tracking-widest">Auth System Status</span>
          <div />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-2xl font-light mb-4">Multi-Provider Authentication System</h1>
          <p className="text-gray-500 text-sm">
            B0ASE uses a unified identity system that allows users to authenticate through multiple providers
            while maintaining a single account.
          </p>
        </div>

        {/* Status Banner */}
        <div className="mb-12 border border-green-900/50 bg-green-900/10">
          <div className="px-4 py-2 border-b border-green-900/50 flex items-center gap-2">
            <FiCheck className="text-green-500" size={14} />
            <span className="text-xs text-green-500 uppercase tracking-widest">System Status: Active</span>
          </div>
          <div className="p-6 text-sm text-gray-400">
            <p className="mb-4">
              The authentication system is fully operational. Users can sign in via email, social OAuth providers,
              or crypto wallets. All methods link to a single unified account.
            </p>
            <p className="text-xs text-gray-600">
              <Link href="/login" className="text-green-500 hover:text-green-400 underline">Go to Login Page</Link>
            </p>
          </div>
        </div>

        {/* Architecture Overview */}
        <div className="mb-12 border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Architecture Overview</span>
          </div>
          <div className="p-6">
            <div className="grid gap-6 text-sm">
              <div>
                <h3 className="text-white font-medium mb-2">Unified User Model</h3>
                <p className="text-gray-500">
                  A central <code className="text-gray-400 bg-gray-900 px-1">unified_users</code> table acts as the hub.
                  Each authentication method (OAuth, wallet) creates a <code className="text-gray-400 bg-gray-900 px-1">user_identity</code> record
                  that links to the unified user.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Multi-Provider Support</h3>
                <p className="text-gray-500">
                  Users can connect multiple providers to a single account. First connection creates the unified user;
                  subsequent connections link additional identities.
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2">Session Management</h3>
                <p className="text-gray-500">
                  Supabase handles OAuth sessions automatically. Wallet connections use custom cookies with 30-day expiry.
                  Twitter uses custom PKCE implementation due to Supabase limitations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supported Providers */}
        <div className="mb-12 border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Supported Providers</span>
          </div>

          {/* Social */}
          <div className="border-b border-gray-800">
            <div className="px-4 py-2 bg-gray-900/30">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Social OAuth</span>
            </div>
            <div className="divide-y divide-gray-800">
              <ProviderRow name="Google" route="/api/auth/google" implementation="Direct OAuth2 (googleapis)" status="ready" />
              <ProviderRow name="Twitter / X" route="/api/auth/twitter" implementation="Custom OAuth2 + PKCE" status="ready" />
              <ProviderRow name="Discord" route="/api/auth/discord" implementation="Supabase Auth" status="ready" />
              <ProviderRow name="GitHub" route="/api/auth/github" implementation="Supabase Auth" status="ready" />
              <ProviderRow name="LinkedIn" route="/api/auth/linkedin" implementation="Supabase OIDC" status="ready" />
            </div>
          </div>

          {/* Wallets */}
          <div>
            <div className="px-4 py-2 bg-gray-900/30">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Crypto Wallets</span>
            </div>
            <div className="divide-y divide-gray-800">
              <ProviderRow name="Phantom" chain="SOL" implementation="Browser Extension" status="ready" />
              <ProviderRow name="MetaMask" chain="ETH" implementation="EIP-1193" status="ready" />
              <ProviderRow name="OKX" chain="ETH" implementation="EIP-1193" status="ready" />
              <ProviderRow name="HandCash" chain="BSV" implementation="HandCash Connect SDK" status="ready" />
              <ProviderRow name="Yours Wallet" chain="BSV" implementation="React Context" status="ready" />
            </div>
          </div>
        </div>

        {/* Implementation Status */}
        <div className="mb-12 border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Implementation Status</span>
          </div>

          {/* Backend */}
          <div className="border-b border-gray-800">
            <div className="px-4 py-2 bg-green-900/10 flex items-center gap-2">
              <FiCheck className="text-green-500" size={12} />
              <span className="text-[10px] text-green-500 uppercase tracking-widest">Backend: Ready</span>
            </div>
            <div className="p-4 space-y-3">
              <StatusItem status="done" text="unified_users and user_identities tables" />
              <StatusItem status="done" text="OAuth callback handlers for all providers" />
              <StatusItem status="done" text="Wallet authentication endpoint (/api/auth/wallet)" />
              <StatusItem status="done" text="RBAC system (lib/rbac.ts) - 6 role levels" />
              <StatusItem status="done" text="Middleware route protection with ADMIN_EMAIL check" />
              <StatusItem status="done" text="Row-Level Security on all tables" />
              <StatusItem status="done" text="Account merging support (merge_unified_users function)" />
            </div>
          </div>

          {/* Frontend */}
          <div>
            <div className="px-4 py-2 bg-green-900/10 flex items-center gap-2">
              <FiCheck className="text-green-500" size={12} />
              <span className="text-[10px] text-green-500 uppercase tracking-widest">Frontend: Ready</span>
            </div>
            <div className="p-4 space-y-3">
              <StatusItem status="done" text="AuthContext provider (components/Providers.tsx)" />
              <StatusItem status="done" text="WalletConnectModal component" />
              <StatusItem status="done" text="Account page (/user/account)" />
              <StatusItem status="done" text="Login page (/login) - Unified auth UI" />
              <StatusItem status="done" text="Unified Auth Component - All providers in single page" />
            </div>
          </div>
        </div>

        {/* Migration Context */}
        <div className="mb-12 border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Migration Complete</span>
          </div>
          <div className="p-6 text-sm text-gray-500">
            <p className="mb-4">
              Migration from legacy duplicate login pages to unified auth system is complete:
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-900/30 text-green-500 flex items-center justify-center text-xs">
                  <FiCheck size={12} />
                </div>
                <div>
                  <p className="text-white">Build Unified Backend</p>
                  <p className="text-gray-600 text-xs">Complete - unified_users model implemented</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-900/30 text-green-500 flex items-center justify-center text-xs">
                  <FiCheck size={12} />
                </div>
                <div>
                  <p className="text-white">Remove Duplicate Login Pages</p>
                  <p className="text-gray-600 text-xs">Complete - Single unified login at /login</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-900/30 text-green-500 flex items-center justify-center text-xs">
                  <FiCheck size={12} />
                </div>
                <div>
                  <p className="text-white">Implement Unified Auth UI</p>
                  <p className="text-gray-600 text-xs">Complete - Email, 5 social providers, 4 wallets in one page</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Files */}
        <div className="mb-12 border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Key Files</span>
          </div>
          <div className="divide-y divide-gray-800 text-sm font-mono">
            <FileRow path="lib/rbac.ts" description="Role-Based Access Control system" />
            <FileRow path="middleware.ts" description="Route protection & session refresh" />
            <FileRow path="app/auth/callback/route.ts" description="Universal OAuth callback handler" />
            <FileRow path="app/api/auth/twitter/route.ts" description="Custom Twitter PKCE flow" />
            <FileRow path="app/api/auth/wallet/route.ts" description="Wallet authentication endpoint" />
            <FileRow path="components/Providers.tsx" description="AuthContext & auth methods" />
            <FileRow path="components/WalletConnectModal.tsx" description="Multi-provider connect UI" />
            <FileRow path="app/login/page.tsx" description="Unified auth UI - all providers" />
          </div>
        </div>

        {/* RBAC Roles */}
        <div className="mb-12 border border-gray-800">
          <div className="px-4 py-3 border-b border-gray-800">
            <span className="text-xs text-gray-500 uppercase tracking-widest">RBAC Roles</span>
          </div>
          <div className="divide-y divide-gray-800">
            <RoleRow role="super_admin" level={10} description="Full system control (*:* permissions)" />
            <RoleRow role="admin" level={5} description="Administrative access to most features" />
            <RoleRow role="builder" level={3} description="Create and manage projects" />
            <RoleRow role="investor" level={2} description="Access investment opportunities" />
            <RoleRow role="client" level={2} description="Manage client projects" />
            <RoleRow role="user" level={1} description="Basic platform access" />
          </div>
        </div>

        {/* Documentation Link */}
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-4">
            For complete technical documentation, see:
          </p>
          <Link
            href="/docs/AUTH-SYSTEM.md"
            className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
          >
            <span className="font-mono">docs/AUTH-SYSTEM.md</span>
            <FiExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProviderRow({ name, route, chain, implementation, status }: {
  name: string
  route?: string
  chain?: string
  implementation: string
  status: 'ready' | 'pending' | 'blocked'
}) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="text-sm text-white w-28">{name}</span>
        {route && <code className="text-xs text-gray-600">{route}</code>}
        {chain && <span className="text-[10px] text-gray-700 uppercase">{chain}</span>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-600">{implementation}</span>
        <StatusBadge status={status} />
      </div>
    </div>
  )
}

function StatusItem({ status, text }: { status: 'done' | 'pending' | 'blocked'; text: string }) {
  return (
    <div className="flex items-start gap-2">
      {status === 'done' && <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={14} />}
      {status === 'pending' && <div className="w-3.5 h-3.5 border border-gray-700 mt-0.5 flex-shrink-0" />}
      {status === 'blocked' && <FiX className="text-red-500 mt-0.5 flex-shrink-0" size={14} />}
      <span className={`text-xs ${status === 'blocked' ? 'text-red-400' : 'text-gray-500'}`}>{text}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: 'ready' | 'pending' | 'blocked' }) {
  const styles = {
    ready: 'bg-green-900/30 text-green-500',
    pending: 'bg-gray-800 text-gray-500',
    blocked: 'bg-red-900/30 text-red-500'
  }
  const labels = {
    ready: 'Ready',
    pending: 'Pending',
    blocked: 'Blocked'
  }
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function FileRow({ path, description, highlight }: { path: string; description: string; highlight?: boolean }) {
  return (
    <div className={`px-4 py-3 flex items-center justify-between ${highlight ? 'bg-red-900/10' : ''}`}>
      <code className={`text-xs ${highlight ? 'text-red-400' : 'text-gray-400'}`}>{path}</code>
      <span className={`text-xs ${highlight ? 'text-red-500' : 'text-gray-600'}`}>{description}</span>
    </div>
  )
}

function RoleRow({ role, level, description }: { role: string; level: number; description: string }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <code className="text-xs text-gray-400 w-28">{role}</code>
        <span className="text-[10px] text-gray-700 uppercase">Level {level}</span>
      </div>
      <span className="text-xs text-gray-600">{description}</span>
    </div>
  )
}
