'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiType, FiDroplet, FiGrid, FiLayers, FiMaximize2, FiMinimize2, FiRefreshCw, FiSun, FiMoon, FiCode } from 'react-icons/fi'

interface MobileNavMenuProps {
  isOpen: boolean
  onClose: () => void
  isDark: boolean
  setIsDark: (dark: boolean) => void
  selectedFont: number
  setSelectedFont: (font: number) => void
  fontOptions: any[]
  colorIntense: boolean
  setColorIntense: (intense: boolean) => void
  globeStructured: boolean
  setGlobeStructured: (structured: boolean) => void
  animationExpanded: boolean
  setAnimationExpanded: (expanded: boolean) => void
  autoCycle: boolean
  setAutoCycle: (auto: boolean) => void
  copiedState: boolean
  setCopiedState: (copied: boolean) => void
  zoomLevel: number
}

export default function MobileNavMenu({
  isOpen,
  onClose,
  isDark,
  setIsDark,
  selectedFont,
  setSelectedFont,
  fontOptions,
  colorIntense,
  setColorIntense,
  globeStructured,
  setGlobeStructured,
  animationExpanded,
  setAnimationExpanded,
  autoCycle,
  setAutoCycle,
  copiedState,
  setCopiedState,
  zoomLevel,
}: MobileNavMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 right-0 h-full w-64 p-6 z-50 ${isDark ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-md border-l ${isDark ? 'border-white/10' : 'border-black/10'}`}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>Controls</h2>
            <button onClick={onClose}>
              <FiX size={24} />
            </button>
          </div>
          <div className="space-y-6">
            {/* Font Selector */}
            <div className="relative">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Font</label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(Number(e.target.value))}
                className={`w-full p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
              >
                {fontOptions.map((font, index) => (
                  <option key={index} value={index}>{font.name}</option>
                ))}
              </select>
            </div>
            {/* Other controls */}
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Vibrant Colors</label>
              <button onClick={() => setColorIntense(!colorIntense)}>
                <FiDroplet size={20} className={colorIntense ? 'fill-current' : ''} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Globe Structure</label>
              <button onClick={() => setGlobeStructured(!globeStructured)}>
                {globeStructured ? <FiGrid size={20} /> : <FiLayers size={20} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Animation</label>
              <button onClick={() => setAnimationExpanded(!animationExpanded)}>
                {animationExpanded ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Auto-Cycle</label>
              <button onClick={() => setAutoCycle(!autoCycle)}>
                <FiRefreshCw size={20} className={autoCycle ? 'animate-spin-slow' : ''} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Theme</label>
              <button onClick={() => setIsDark(!isDark)}>
                {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Copy State</label>
              <button
                onClick={() => {
                  const stateString = `t:${isDark ? 'd' : 'l'} | f:${selectedFont} | c:${colorIntense ? '1' : '0'} | s:${globeStructured ? 'sp' : 'st'} | m:${animationExpanded ? '1' : '0'} | z:${zoomLevel}`
                  navigator.clipboard.writeText(stateString)
                  setCopiedState(true)
                  setTimeout(() => setCopiedState(false), 2000)
                }}
              >
                <FiCode size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
