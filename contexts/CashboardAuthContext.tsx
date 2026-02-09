'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { HandCashAuth, HandCashUser, HandCashAuthResult } from '@/lib/cashboard/handcash'

interface AuthContextType {
  user: HandCashUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => void
  refreshProfile: () => Promise<void>
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<HandCashUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Check for existing session on mount and listen for storage changes
  useEffect(() => {
    const checkExistingSession = () => {
      const session = HandCashAuth.getStoredSession()
      if (session) {
        setUser(session.user)
      }
      setIsLoading(false)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'handcash_session') {
        if (e.newValue) {
          const session = JSON.parse(e.newValue)
          setUser(session.user)
        } else {
          setUser(null)
        }
      }
    }

    const handleAuthSuccess = () => {
      // Refresh auth state when authentication succeeds
      const session = HandCashAuth.getStoredSession()
      if (session) {
        setUser(session.user)
      }
    }

    checkExistingSession()
    
    // Listen for localStorage changes (for cross-tab sync)
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for auth success events
    window.addEventListener('handcash-auth-success', handleAuthSuccess)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('handcash-auth-success', handleAuthSuccess)
    }
  }, [])

  const signIn = async () => {
    try {
      setIsLoading(true)
      const authResult: HandCashAuthResult = await HandCashAuth.signInWithHandCash()
      HandCashAuth.storeUserSession(authResult)
      setUser(authResult.user)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    HandCashAuth.clearSession()
    setUser(null)
  }

  const refreshProfile = async () => {
    const session = HandCashAuth.getStoredSession()
    if (!session) return

    try {
      const updatedUser = await HandCashAuth.getUserProfile(session.accessToken)
      const updatedSession = {
        ...session,
        user: updatedUser,
      }
      localStorage.setItem('handcash_session', JSON.stringify(updatedSession))
      setUser(updatedUser)
    } catch (error) {
      console.error('Failed to refresh profile:', error)
      // If refresh fails, sign out the user
      signOut()
    }
  }

  const refreshAuth = () => {
    const session = HandCashAuth.getStoredSession()
    if (session) {
      setUser(session.user)
    } else {
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    refreshProfile,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
