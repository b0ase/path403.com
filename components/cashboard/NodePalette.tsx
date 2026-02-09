"use client"

import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { GripVertical } from 'lucide-react'

export type PaletteItem = {
  type: string
  name: string
  category: string
  icon?: React.ReactNode
}

export function NodePalette({
  title = 'Add Nodes',
  nodeTypes,
  categories,
  onPick,
  visible = true,
}: {
  title?: string
  nodeTypes: PaletteItem[]
  categories: string[]
  onPick: (type: string) => void
  visible?: boolean
}) {
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c, true])) as Record<string, boolean>
  )
  
  // Draggable state
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState(() => {
    // Default to top-right corner
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth - 276, y: 16 } // 276 = 260px width + 16px padding
    }
    return { x: 16, y: 16 }
  })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const paletteRef = useRef<HTMLDivElement>(null)

  // Load saved position
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nodePalette.position')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number' && 
            parsed.x >= 0 && parsed.y >= 0 && 
            parsed.x < window.innerWidth - 260 && parsed.y < window.innerHeight - 100) {
          setPosition(parsed)
        }
      }
    } catch (error) {
      console.warn('Failed to load palette position:', error)
    }
  }, [])

  // Drag handlers
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // More aggressive event handling
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    
    console.log('🎯 Drag start triggered!')
    setIsDragging(true)
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const rect = paletteRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      })
    }
    
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
    
    // Ensure React Flow doesn't interfere
    if (paletteRef.current) {
      paletteRef.current.style.pointerEvents = 'auto'
    }
  }, [])

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !paletteRef.current) return
    
    console.log('🎯 Drag move!')
    e.preventDefault()
    e.stopImmediatePropagation()
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const newX = clientX - dragOffset.x
    const newY = clientY - dragOffset.y
    
    // Get dynamic dimensions for constraints
    const rect = paletteRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Constrain to viewport with padding
    const padding = 16
    const maxX = viewportWidth - rect.width - padding
    const maxY = viewportHeight - rect.height - padding
    
    const constrainedX = Math.max(padding, Math.min(newX, maxX))
    const constrainedY = Math.max(padding, Math.min(newY, maxY))
    
    requestAnimationFrame(() => {
      setPosition({ x: constrainedX, y: constrainedY })
    })
  }, [isDragging, dragOffset])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
    
    // Save position
    try {
      localStorage.setItem('nodePalette.position', JSON.stringify(position))
    } catch (error) {
      console.warn('Failed to save palette position:', error)
    }
  }, [isDragging, position])

  // Set up global event listeners
  useEffect(() => {
    if (isDragging) {
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        handleDragMove(e)
      }

      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleDragEnd)

      return () => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleDragEnd)
      }
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  if (!visible) {
    return null
  }

  return (
    <div 
      ref={paletteRef}
      className={`bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-3 min-w-[260px] w-[260px] max-h-[70vh] overflow-y-auto transition-all duration-300 ${
        isDragging ? 'shadow-2xl scale-[1.02] border-blue-400/50 cursor-grabbing' : 'shadow-lg hover:shadow-xl'
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isDragging ? 9999 : 9998, // Much higher z-index to be above React Flow and modals
        userSelect: 'none',
        willChange: isDragging ? 'transform' : 'auto',
        pointerEvents: 'auto' // Ensure it can receive events
      }}

    >
      <div 
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing hover:bg-white/5 p-2 -m-2 mb-0 rounded transition-colors"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        title="Drag to move palette"
      >
        <div className="flex items-center gap-2">
          <div className="text-gray-400 hover:text-white">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="text-xs text-gray-400">{title} <span className="text-[10px] text-gray-500">({nodeTypes.length})</span></div>
        </div>
        <button
          aria-label="toggle"
          onClick={(e) => {
            e.stopPropagation() // Prevent drag from starting
            setOpen((prev) =>
              Object.fromEntries(Object.keys(prev).map((k) => [k, !prev[k]])) as Record<string, boolean>
            )
          }}
          className="text-gray-400 hover:text-white text-xs hover:bg-white/10 px-2 py-1 rounded"
        >
          Collapse
        </button>
      </div>
      {categories.map((cat) => (
        <div key={cat} className="mb-3">
          <button
            onClick={() => setOpen((p) => ({ ...p, [cat]: !p[cat] }))}
            className="w-full text-left text-[11px] uppercase tracking-wide text-gray-500 mb-2"
          >
            {cat} <span className="text-[10px] text-gray-600">({nodeTypes.filter((n) => n.category === cat).length})</span>
          </button>
          {open[cat] && (
            <div className="grid grid-cols-2 gap-2">
              {nodeTypes
                .filter((n) => n.category === cat)
                .map((n) => (
                  <button
                    key={`${n.category}:${n.type}`}
                    onClick={() => onPick(n.type)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-left"
                    title={`Add ${n.name}`}
                  >
                    <span className="inline-flex items-center justify-center">{n.icon}</span>
                    <span className="text-sm text-white truncate">{n.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default NodePalette


