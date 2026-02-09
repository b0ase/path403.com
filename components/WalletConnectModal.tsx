'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiArrowUpRight, FiMail, FiLock, FiSend } from 'react-icons/fi'
import { useAuth } from './Providers'

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
}

export default function WalletConnectModal({ isOpen, onClose, isDark }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const { signInWithGoogle, signInWithDiscord, signInWithGithub, signInWithLinkedin, signInWithEmail, signUpWithEmail, sendMagicLink } = useAuth()

  const connectPhantom = async () => {
    setConnecting('phantom')
    try {
      const phantom = (window as any).phantom?.solana
      if (phantom?.isPhantom) {
        // Try eager connect first (auto-connect if previously approved)
        try {
          const response = await phantom.connect({ onlyIfTrusted: true })
          localStorage.setItem('walletType', 'phantom')
          localStorage.setItem('walletAddress', response.publicKey.toString())
          onClose()
          window.location.reload()
          return
        } catch {
          // Not previously connected, request full connection
        }

        const response = await phantom.connect()
        localStorage.setItem('walletType', 'phantom')
        localStorage.setItem('walletAddress', response.publicKey.toString())
        onClose()
        window.location.reload()
      } else {
        window.open('https://phantom.app/', '_blank')
      }
    } catch (error: any) {
      // Handle common Phantom errors silently
      if (error?.code === 4001 || error?.message?.includes('User rejected')) {
        console.log('User rejected Phantom connection')
      } else {
        console.error('Phantom connection error:', error)
      }
    } finally {
      setConnecting(null)
    }
  }

  const connectMetaMask = async () => {
    setConnecting('metamask')
    try {
      // Find MetaMask specifically - handle multiple wallet extensions
      let metamaskProvider = null
      const ethereum = (window as any).ethereum

      if (ethereum?.providers?.length) {
        // Multiple providers - find the real MetaMask
        metamaskProvider = ethereum.providers.find((p: any) => p.isMetaMask && !p.isOKExWallet && !p.isOkxWallet)
      } else if (ethereum?.isMetaMask && !ethereum?.isOKExWallet && !ethereum?.isOkxWallet) {
        // Single provider that is MetaMask (not OKX pretending)
        metamaskProvider = ethereum
      }

      if (metamaskProvider) {
        const accounts = await metamaskProvider.request({ method: 'eth_requestAccounts' })
        localStorage.setItem('walletType', 'metamask')
        localStorage.setItem('walletAddress', accounts[0])
        onClose()
        window.location.reload()
      } else {
        // MetaMask not found, open install page
        window.open('https://metamask.io/download/', '_blank')
      }
    } catch (error) {
      console.error('MetaMask connection error:', error)
    } finally {
      setConnecting(null)
    }
  }

  const connectOKX = async () => {
    setConnecting('okx')
    try {
      // OKX provides its own provider at window.okxwallet
      const okxwallet = (window as any).okxwallet
      if (okxwallet) {
        const accounts = await okxwallet.request({ method: 'eth_requestAccounts' })
        localStorage.setItem('walletType', 'okx')
        localStorage.setItem('walletAddress', accounts[0])
        onClose()
        window.location.reload()
      } else {
        // Try finding OKX in ethereum providers
        const ethereum = (window as any).ethereum
        let okxProvider = null

        if (ethereum?.providers?.length) {
          okxProvider = ethereum.providers.find((p: any) => p.isOkxWallet || p.isOKExWallet)
        } else if (ethereum?.isOkxWallet || ethereum?.isOKExWallet) {
          okxProvider = ethereum
        }

        if (okxProvider) {
          const accounts = await okxProvider.request({ method: 'eth_requestAccounts' })
          localStorage.setItem('walletType', 'okx')
          localStorage.setItem('walletAddress', accounts[0])
          onClose()
          window.location.reload()
        } else {
          window.open('https://www.okx.com/web3', '_blank')
        }
      }
    } catch (error: any) {
      if (error?.code === 4001) {
        console.log('User rejected OKX connection')
      } else {
        console.error('OKX connection error:', error)
      }
    } finally {
      setConnecting(null)
    }
  }

  const connectHandCash = () => {
    setConnecting('handcash')
    window.location.href = '/api/auth/handcash'
  }

  const connectGoogle = async () => {
    setConnecting('google')
    try {
      await signInWithGoogle()
      onClose()
    } catch (error) {
      console.error('Google sign-in error:', error)
      setConnecting(null)
    }
  }

  const connectTwitter = () => {
    setConnecting('twitter')
    // Use custom Twitter OAuth route (bypasses GoTrue which doesn't work)
    window.location.href = '/api/auth/twitter'
  }

  const connectDiscord = async () => {
    setConnecting('discord')
    try {
      await signInWithDiscord()
      onClose()
    } catch (error) {
      console.error('Discord sign-in error:', error)
      setConnecting(null)
    }
  }

  const connectGitHub = async () => {
    setConnecting('github')
    try {
      await signInWithGithub()
      onClose()
    } catch (error) {
      console.error('GitHub sign-in error:', error)
      setConnecting(null)
    }
  }

  const connectLinkedIn = async () => {
    setConnecting('linkedin')
    try {
      await signInWithLinkedin()
      onClose()
    } catch (error) {
      console.error('LinkedIn sign-in error:', error)
      setConnecting(null)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    setEmailSuccess(null)
    setConnecting('email')

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password)
        if (error) {
          setEmailError(error.message)
        } else {
          setEmailSuccess('Check your email to confirm your account!')
        }
      } else {
        const { error } = await signInWithEmail(email, password)
        if (error) {
          setEmailError(error.message)
        } else {
          onClose()
          window.location.reload()
        }
      }
    } catch (err: any) {
      setEmailError(err.message || 'An error occurred')
    } finally {
      setConnecting(null)
    }
  }

  const handleMagicLink = async () => {
    if (!email) {
      setEmailError('Please enter your email')
      return
    }
    setEmailError(null)
    setEmailSuccess(null)
    setConnecting('magiclink')

    try {
      const { error } = await sendMagicLink(email)
      if (error) {
        setEmailError(error.message)
      } else {
        setEmailSuccess('Magic link sent! Check your email.')
      }
    } catch (err: any) {
      setEmailError(err.message || 'An error occurred')
    } finally {
      setConnecting(null)
    }
  }

  if (!isOpen) return null

  const Spinner = () => (
    <div className="w-4 h-4 border-2 border-gray-700 border-t-white animate-spin" />
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 ${isDark ? 'bg-black/90' : 'bg-white/90'}`}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative z-10 w-full max-w-2xl border ${isDark ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <span className="text-xs text-gray-500 uppercase tracking-widest">Connect</span>
              <button
                onClick={onClose}
                className={`text-gray-500 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Email Login */}
            <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="px-4 py-2 text-[10px] text-gray-600 uppercase tracking-widest">Email</div>
              <form onSubmit={handleEmailSubmit} className="px-4 pb-4 space-y-3">
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border text-sm pl-9 pr-3 py-2 focus:outline-none ${isDark ? 'bg-gray-900 border-gray-800 text-white focus:border-gray-700' : 'bg-gray-50 border-gray-200 text-black focus:border-gray-400'}`}
                    disabled={connecting !== null}
                  />
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full border text-sm pl-9 pr-3 py-2 focus:outline-none ${isDark ? 'bg-gray-900 border-gray-800 text-white focus:border-gray-700' : 'bg-gray-50 border-gray-200 text-black focus:border-gray-400'}`}
                    disabled={connecting !== null}
                  />
                </div>

                {emailError && (
                  <p className="text-red-500 text-xs">{emailError}</p>
                )}
                {emailSuccess && (
                  <p className="text-green-500 text-xs">{emailSuccess}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={connecting !== null || !email || !password}
                    className={`flex-1 text-xs uppercase tracking-widest py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                  >
                    {connecting === 'email' ? <Spinner /> : (isSignUp ? 'Sign Up' : 'Sign In')}
                  </button>
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    disabled={connecting !== null || !email}
                    className={`flex items-center justify-center gap-1 px-3 text-xs uppercase tracking-widest py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                    title="Send magic link"
                  >
                    {connecting === 'magiclink' ? <Spinner /> : <FiSend size={12} />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className={`w-full text-[10px] text-gray-500 transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </form>
            </div>

            {/* Social Logins */}
            <div className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="px-4 py-2 text-[10px] text-gray-600 uppercase tracking-widest">Social</div>
              <div className={`grid grid-cols-5 divide-x ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                {/* Google */}
                <button
                  onClick={connectGoogle}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'google' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'google' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>Google</span>
                </button>

                {/* Twitter/X */}
                <button
                  onClick={connectTwitter}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'twitter' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'twitter' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>X</span>
                </button>

                {/* Discord */}
                <button
                  onClick={connectDiscord}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'discord' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'discord' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>Discord</span>
                </button>

                {/* GitHub */}
                <button
                  onClick={connectGitHub}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'github' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'github' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>GitHub</span>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={connectLinkedIn}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'linkedin' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'linkedin' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Wallets */}
            <div>
              <div className="px-4 py-2 text-[10px] text-gray-600 uppercase tracking-widest">Wallets</div>
              <div className={`grid grid-cols-4 divide-x ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                {/* Phantom */}
                <button
                  onClick={connectPhantom}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'phantom' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'phantom' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 128 128" fill="currentColor">
                      <path d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm-8.5 89.5c-4.1 0-7.5-3.4-7.5-7.5s3.4-7.5 7.5-7.5 7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5zm17 0c-4.1 0-7.5-3.4-7.5-7.5s3.4-7.5 7.5-7.5 7.5 3.4 7.5 7.5-3.4 7.5-7.5 7.5zm25.5-7.5c0 15.5-12.5 28-28 28h-12c-15.5 0-28-12.5-28-28V46c0-15.5 12.5-28 28-28h12c15.5 0 28 12.5 28 28v36z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>Phantom</span>
                  <span className={`text-[8px] uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>SOL</span>
                </button>

                {/* MetaMask */}
                <button
                  onClick={connectMetaMask}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'metamask' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'metamask' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.94 5.55L13.2.67a2.4 2.4 0 00-2.4 0L2.06 5.55A2.4 2.4 0 00.86 7.6v9.79a2.4 2.4 0 001.2 2.08l8.74 4.86a2.4 2.4 0 002.4 0l8.74-4.86a2.4 2.4 0 001.2-2.08V7.6a2.4 2.4 0 00-1.2-2.05zM12 15.6a3.6 3.6 0 110-7.2 3.6 3.6 0 010 7.2z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>MetaMask</span>
                  <span className={`text-[8px] uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>ETH</span>
                </button>

                {/* OKX */}
                <button
                  onClick={connectOKX}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'okx' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'okx' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V8h2v4zm4 4h-2v-2h2v2zm0-4h-2V8h2v4z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>OKX</span>
                  <span className={`text-[8px] uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>ETH</span>
                </button>

                {/* HandCash */}
                <button
                  onClick={connectHandCash}
                  disabled={connecting !== null}
                  className={`group flex flex-col items-center justify-center py-6 transition-all ${connecting === 'handcash' ? 'opacity-50' : ''} ${isDark ? 'hover:bg-gray-900/50' : 'hover:bg-gray-100'}`}
                >
                  {connecting === 'handcash' ? <Spinner /> : (
                    <svg className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                  )}
                  <span className={`text-[10px] text-gray-500 uppercase tracking-widest mt-2 transition-colors ${isDark ? 'group-hover:text-white' : 'group-hover:text-black'}`}>HandCash</span>
                  <span className={`text-[8px] uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-700' : 'text-gray-400'}`}>BSV</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
