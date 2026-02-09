'use client'

import { useState } from 'react'
import { X, User, LogOut, Wallet } from 'lucide-react'
import { useAuth } from '@/contexts/CashboardAuthContext'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SignUpModal = ({ isOpen, onClose }: SignUpModalProps) => {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string>('')

  const handleHandCashSignIn = async () => {
    try {
      setSigningIn(true)
      setError('')
      
      // Clear any old session data first
      localStorage.removeItem('handcash_session')
      
      // Get the authorization URL
      const response = await fetch('/api/auth/handcash/redirect')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authorization URL')
      }
      
      // Open HandCash auth in popup
      const popup = window.open(
        data.authorization_url,
        'handcash-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      )
      
      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.')
      }
      
      // Listen for the popup to close or send a message
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setSigningIn(false)
          
          // Check if authentication was successful
          const session = localStorage.getItem('handcash_session')
          if (session) {
            // Trigger auth context update
            window.dispatchEvent(new CustomEvent('handcash-auth-success'))
            onClose() // Close modal on success
          }
        }
      }, 1000)
      
      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'HANDCASH_AUTH_SUCCESS') {
          clearInterval(checkClosed)
          popup.close()
          setSigningIn(false)
          
          // Trigger auth context update
          window.dispatchEvent(new CustomEvent('handcash-auth-success'))
          onClose() // Close modal on success
        } else if (event.data.type === 'HANDCASH_AUTH_ERROR') {
          clearInterval(checkClosed)
          popup.close()
          setSigningIn(false)
          setError(event.data.error || 'Authentication failed')
        }
      }
      
      window.addEventListener('message', handleMessage)
      
      // Cleanup on component unmount or timeout
      setTimeout(() => {
        clearInterval(checkClosed)
        window.removeEventListener('message', handleMessage)
        if (!popup.closed) {
          popup.close()
          setSigningIn(false)
        }
      }, 300000) // 5 minute timeout
      
    } catch (error: any) {
      console.error('Sign in failed:', error)
      let errorMessage = 'Sign in failed. Please try again.'
      
      // Handle specific error cases
      if (error.message?.includes('Failed to get authorization URL') || 
          error.message?.includes('HandCash App ID not configured')) {
        errorMessage = 'HandCash authentication temporarily unavailable. Please try again later.'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message?.includes('Popup blocked')) {
        errorMessage = error.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      setSigningIn(false)
    }
  }

  if (!isOpen) return null

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-black/90 border border-white/20 rounded-2xl p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-black/90 border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.displayName}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">{user.displayName}</h3>
              <p className="text-green-400">@{user.handle}</p>
              {user.spendableBalance !== undefined && (
                <p className="text-sm text-gray-400">
                  Balance: {user.spendableBalance} {user.localCurrencyCode}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Continue
            </button>
            <button
              onClick={signOut}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black/90 border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Sign Up</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          {/* HandCash Sign In */}
          <button
            onClick={handleHandCashSignIn}
            disabled={signingIn}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-3 shadow-lg"
          >
            {signingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="font-medium">Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#22c55e"/>
                  <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-medium">Sign in with HandCash</span>
              </>
            )}
          </button>
          
          {/* Google Sign In */}
          <button
            onClick={() => {
              // TODO: Implement Google sign-in
              console.log('Google sign-in clicked')
            }}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-3 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Sign in with Google</span>
          </button>
          
          {/* Phantom Wallet Connect */}
          <button
            onClick={() => {
              // TODO: Implement Phantom wallet connection
              console.log('Phantom wallet connect clicked')
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-3 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              <path d="M8 16c0 2.21 1.79 4 4 4s4-1.79 4-4" fill="none" stroke="white" strokeWidth="2"/>
              <circle cx="9" cy="11" r="1" fill="white"/>
              <circle cx="15" cy="11" r="1" fill="white"/>
            </svg>
            <span className="font-medium">Connect with Phantom</span>
          </button>
          
          {/* MetaMask Connect */}
          <button
            onClick={() => {
              // TODO: Implement MetaMask connection
              console.log('MetaMask connect clicked')
            }}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center space-x-3 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M21.49 13.16c-.76-.24-1.64-.15-2.2-.14l-.47-.01c-.38 0-.75.01-1.12.01-.37 0-.75 0-1.12-.01l-.47.01c-.56-.01-1.44-.1-2.2.14-.76.24-1.64.76-1.64 1.64v.47c0 .38.01.75.01 1.12 0 .37 0 .75-.01 1.12v.47c0 .88.88 1.4 1.64 1.64.76.24 1.64.15 2.2.14l.47-.01c.38 0 .75-.01 1.12-.01.37 0 .75 0 1.12.01l.47.01c.56.01 1.44.1 2.2-.14.76-.24 1.64-.76 1.64-1.64v-.47c0-.38-.01-.75-.01-1.12 0-.37 0-.75.01-1.12v-.47c0-.88-.88-1.4-1.64-1.64z" fill="currentColor"/>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
            </svg>
            <span className="font-medium">Connect with MetaMask</span>
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
