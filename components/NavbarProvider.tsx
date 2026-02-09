'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useColorTheme, ColorTheme } from './ThemePicker'
import NavbarWithMusic from './NavbarWithMusic'
import PublicNavbar from './PublicNavbar'
import GlobalAuthBar from './GlobalAuthBar'
import { useAuth } from './Providers'
import { useUserHandle } from '@/hooks/useUserHandle'

// Separate component for search params to wrap in Suspense
function SearchParamsHandler({ onThemeChange }: { onThemeChange: (theme: ColorTheme) => void }) {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlTheme = searchParams.get('theme')
    if (urlTheme && ['black', 'white', 'yellow', 'red', 'green', 'blue'].includes(urlTheme)) {
      onThemeChange(urlTheme as ColorTheme)
    } else if (urlTheme === 'light') {
      onThemeChange('white')
    } else if (urlTheme === 'dark') {
      onThemeChange('black')
    }
  }, [searchParams, onThemeChange])

  return null
}

interface NavbarContextType {
  isDark: boolean
  setIsDark: (dark: boolean | ((prev: boolean) => boolean)) => void
  // Controls for NavbarWithMusic
  activeCategory: string
  setActiveCategory: (category: string | ((prev: string) => string)) => void
  selectedFont: number
  setSelectedFont: (font: number | ((prev: number) => number)) => void
  showFontMenu: boolean
  setShowFontMenu: (show: boolean | ((prev: boolean) => boolean)) => void
  colorIntense: boolean
  setColorIntense: (intense: boolean | ((prev: boolean) => boolean)) => void
  globeStructured: boolean
  setGlobeStructured: (structured: boolean | ((prev: boolean) => boolean)) => void
  animationExpanded: boolean
  setAnimationExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void
  zoomLevel: number
  setZoomLevel: (level: number | ((prev: number) => number)) => void
  autoCycle: boolean
  setAutoCycle: (auto: boolean | ((prev: boolean) => boolean)) => void
  shadeLevel: number
  setShadeLevel: (level: number | ((prev: number) => number)) => void
  allAnimationsActive: boolean
  setAllAnimationsActive: (active: boolean | ((prev: boolean) => boolean)) => void
  toggleAllAnimations: () => void
  cycleShadeLevel: () => void
  // Minimal mode for Three.js (no bloom, satellites, env maps)
  minimalMode: boolean
  setMinimalMode: (minimal: boolean | ((prev: boolean) => boolean)) => void
  // Force hide navbar (for paywall mode, etc.)
  forceHideNavbar: boolean
  setForceHideNavbar: (hide: boolean) => void
  // Exposed for external use
  fontOptions: any[]
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined)

// Default values for when NavbarProvider is not present (standalone pages)
const defaultNavbarContext: NavbarContextType = {
  isDark: true,
  setIsDark: () => {},
  activeCategory: 'projects',
  setActiveCategory: () => {},
  selectedFont: 0,
  setSelectedFont: () => {},
  showFontMenu: false,
  setShowFontMenu: () => {},
  colorIntense: false,
  setColorIntense: () => {},
  globeStructured: false,
  setGlobeStructured: () => {},
  animationExpanded: true,
  setAnimationExpanded: () => {},
  zoomLevel: 50,
  setZoomLevel: () => {},
  autoCycle: false,
  setAutoCycle: () => {},
  shadeLevel: 2,
  setShadeLevel: () => {},
  allAnimationsActive: true,
  setAllAnimationsActive: () => {},
  toggleAllAnimations: () => {},
  cycleShadeLevel: () => {},
  minimalMode: true,
  setMinimalMode: () => {},
  forceHideNavbar: false,
  setForceHideNavbar: () => {},
  fontOptions: [],
}

export const useNavbar = () => {
  const context = useContext(NavbarContext)
  // Return defaults for standalone pages (no provider)
  if (context === undefined) {
    return defaultNavbarContext
  }
  return context
}

// Themes that need white text (dark mode styling)
const DARK_TEXT_THEMES: ColorTheme[] = ['black'];

export default function NavbarProvider({ children }: { children: ReactNode }) {
  const { colorTheme, setColorTheme } = useColorTheme()
  const pathname = usePathname()

  const [activeCategory, setActiveCategory] = useState('projects')
  const [selectedFont, setSelectedFont] = useState(0)
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [colorIntense, setColorIntense] = useState(false)
  const [globeStructured, setGlobeStructured] = useState(false)
  const [animationExpanded, setAnimationExpanded] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(50)
  const [autoCycle, setAutoCycle] = useState(false)
  const [shadeLevel, setShadeLevel] = useState(2)
  const [allAnimationsActive, setAllAnimationsActive] = useState(true)
  const [minimalMode, setMinimalMode] = useState(true) // Default to minimal for better performance
  // Navbar always visible — no paywall gate
  const [forceHideNavbar, setForceHideNavbar] = useState(false)

  // Derive isDark from color theme (black/red/green/blue = dark text mode)
  const isDark = DARK_TEXT_THEMES.includes(colorTheme)

  // No-op function for backwards compatibility (toggle removed)
  const setIsDark = (dark: boolean | ((prev: boolean) => boolean)) => {
    // Theme is now controlled by color picker, not a separate toggle
    console.warn('setIsDark is deprecated - theme is controlled by color picker')
  }

  // Force NavbarWithMusic across the entire site as per user request
  const useMusicNavbar = true

  // PublicNavbar is no longer used for path-based switching
  const usePublicNavbar = false

  // Define font options
  const fontOptions = [
    {
      name: 'Swiss Design',
      fonts: {
        primary: 'Helvetica Neue, Helvetica, sans-serif',
        secondary: 'Helvetica Neue, Helvetica, sans-serif',
        mono: 'IBM Plex Mono, monospace',
        display: 'Helvetica Neue, Helvetica, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    },
    {
      name: 'Neo Grotesque',
      fonts: {
        primary: 'Manrope, sans-serif',
        secondary: 'DM Sans, sans-serif',
        mono: 'Fira Code, monospace',
        display: 'Manrope, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 800 }
    },
    {
      name: 'Grotesk',
      fonts: {
        primary: 'Space Grotesk, sans-serif',
        secondary: 'Work Sans, sans-serif',
        mono: 'Space Mono, monospace',
        display: 'Space Grotesk, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    },
    {
      name: 'Neutral',
      fonts: {
        primary: 'Inter, sans-serif',
        secondary: 'Inter, sans-serif',
        mono: 'JetBrains Mono, monospace',
        display: 'Inter, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 900 }
    },
    {
      name: 'Minimal Sans',
      fonts: {
        primary: 'Plus Jakarta Sans, sans-serif',
        secondary: 'Outfit, sans-serif',
        mono: 'Source Code Pro, monospace',
        display: 'Plus Jakarta Sans, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 800 }
    },
    {
      name: 'Modern Classic',
      fonts: {
        primary: 'Syne, sans-serif',
        secondary: 'Lexend, sans-serif',
        mono: 'Overpass Mono, monospace',
        display: 'Syne, sans-serif'
      },
      weights: { regular: 400, bold: 700, black: 800 }
    }
  ]

  const { handle: handcashHandle } = useUserHandle()
  // Show navbar unless forced hidden (e.g., paywall mode)
  const showNavbar = (useMusicNavbar || usePublicNavbar) && !forceHideNavbar

  const contextValue = useMemo(() => ({
    isDark, setIsDark,
    activeCategory, setActiveCategory,
    selectedFont, setSelectedFont,
    showFontMenu, setShowFontMenu,
    colorIntense, setColorIntense,
    globeStructured, setGlobeStructured,
    animationExpanded, setAnimationExpanded,
    zoomLevel, setZoomLevel,
    autoCycle, setAutoCycle,
    shadeLevel, setShadeLevel,
    allAnimationsActive, setAllAnimationsActive,
    toggleAllAnimations: () => setAllAnimationsActive(!allAnimationsActive),
    cycleShadeLevel: () => setShadeLevel((shadeLevel + 1) % 5),
    minimalMode, setMinimalMode,
    forceHideNavbar, setForceHideNavbar,
    fontOptions
  }), [
    isDark, activeCategory, selectedFont, showFontMenu, colorIntense,
    globeStructured, animationExpanded, zoomLevel, autoCycle, shadeLevel, allAnimationsActive, minimalMode, forceHideNavbar, fontOptions
  ])

  return (
    <NavbarContext.Provider value={contextValue}>
      {/* Handle URL theme params in Suspense boundary for static generation */}
      <Suspense fallback={null}>
        <SearchParamsHandler onThemeChange={setColorTheme} />
      </Suspense>
      {/* Only render navbar when not force-hidden - prevents flash on paywall */}
      {!forceHideNavbar && (
        <div className="navbar-container flex flex-col fixed top-0 left-0 right-0 z-[60]">
          {!useMusicNavbar && <GlobalAuthBar />}

          {/* Render the appropriate primary navbar */}
          {useMusicNavbar ? (
            <NavbarWithMusic
              isDark={isDark}
              setIsDark={setIsDark}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
              showFontMenu={showFontMenu}
              setShowFontMenu={setShowFontMenu}
              fontOptions={fontOptions}
              colorIntense={colorIntense}
              setColorIntense={setColorIntense}
              globeStructured={globeStructured}
              setGlobeStructured={setGlobeStructured}
              animationExpanded={animationExpanded}
              setAnimationExpanded={setAnimationExpanded}
              zoomLevel={zoomLevel}
              autoCycle={autoCycle}
              setAutoCycle={setAutoCycle}
              shadeLevel={shadeLevel}
              allAnimationsActive={allAnimationsActive}
              toggleAllAnimations={() => setAllAnimationsActive(!allAnimationsActive)}
              cycleShadeLevel={() => setShadeLevel((shadeLevel + 1) % 5)}
              hideNavbar={!showNavbar}
              isStacked={false} // Force relative positioning to handle its own stack
            />
          ) : usePublicNavbar ? (
            <PublicNavbar />
          ) : null}
        </div>
      )}
      <div>
        {children}
      </div>
    </NavbarContext.Provider>
  )
}