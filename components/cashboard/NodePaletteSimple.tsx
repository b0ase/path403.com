"use client"

import React, { useState, useRef, useCallback } from 'react'
import { GripVertical } from 'lucide-react'

export type PaletteItem = {
  type: string
  name: string
  category: string
  icon?: React.ReactNode
}

export default function NodePaletteSimple({
  title = "Add Nodes",
  nodeTypes,
  categories,
  onPick,
  visible = true
}: {
  title?: string
  nodeTypes: PaletteItem[]
  categories: string[]
  onPick: (type: string) => void
  visible?: boolean
}) {
  console.log('NodePaletteSimple props:', { title, nodeTypes, categories, visible })
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c, true])) as Record<string, boolean>
  )
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 100, y: 100 })
  
  // Resizing state
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null>(null)
  const [size, setSize] = useState({ width: 260, height: 800 })
  
  const paletteRef = useRef<HTMLDivElement>(null)
  
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsDragging(true)
    
    // Store the offset from the mouse to the element's top-left corner
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
    
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }, [position])
  
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !paletteRef.current) return
    
    e.preventDefault()
    
    let newX = e.clientX - dragOffset.x
    let newY = e.clientY - dragOffset.y
    
    // Boundary constraints to keep palette on screen
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Prevent going off the left edge
    if (newX < 0) newX = 0
    // Prevent going off the right edge
    if (newX + size.width > viewportWidth) newX = viewportWidth - size.width
    // Prevent going off the top edge
    if (newY < 0) newY = 0
    // Prevent going off the bottom edge
    if (newY + size.height > viewportHeight) newY = viewportHeight - size.height
    
    // Update position state and transform
    setPosition({ x: newX, y: newY })
    paletteRef.current.style.transform = `translate(${newX}px, ${newY}px)`
  }, [isDragging, dragOffset, size.width, size.height])
  
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    
    setIsDragging(false)
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [isDragging])
  
  // Resize handlers
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw') => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setResizeDirection(direction)
    
    document.body.style.userSelect = 'none'
    document.body.style.cursor = direction.includes('e') || direction.includes('w') ? 'ew-resize' : 'ns-resize'
  }, [])

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !paletteRef.current) return
    
    e.preventDefault()
    
    const rect = paletteRef.current.getBoundingClientRect()
    let newWidth = size.width
    let newHeight = size.height
    
    // Calculate new dimensions based on resize direction
    if (resizeDirection?.includes('e')) {
      // Resizing from right edge - width increases
      newWidth = Math.max(200, e.clientX - rect.left)
    }
    if (resizeDirection?.includes('w')) {
      // Resizing from left edge - width decreases, adjust position
      const newLeft = e.clientX
      const maxWidth = size.width + (rect.left - newLeft)
      newWidth = Math.max(200, maxWidth)
      if (newWidth > 200) {
        // Update position to keep right edge in place
        setPosition(prev => ({
          x: prev.x + (rect.left - newLeft),
          y: prev.y
        }))
      }
    }
    if (resizeDirection?.includes('s')) {
      // Resizing from bottom edge - height increases
      newHeight = Math.max(300, e.clientY - rect.top)
    }
    if (resizeDirection?.includes('n')) {
      // Resizing from top edge - height decreases, adjust position
      const newTop = e.clientY
      const maxHeight = size.height + (rect.top - newTop)
      newHeight = Math.max(300, maxHeight)
      if (newHeight > 300) {
        // Update position to keep bottom edge in place
        setPosition(prev => ({
          x: prev.x,
          y: prev.y + (rect.top - newTop)
        }))
      }
    }
    
    // Constrain to reasonable limits
    const maxWidth = 800
    const maxHeight = 800
    
    newWidth = Math.min(newWidth, maxWidth)
    newHeight = Math.min(newHeight, maxHeight)
    
    // Prevent going off-screen
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Check if the new size would push the palette off-screen
    if (position.x + newWidth > viewportWidth - 20) {
      newWidth = Math.max(200, viewportWidth - position.x - 20)
    }
    if (position.y + newHeight > viewportHeight - 20) {
      newHeight = Math.max(300, viewportHeight - position.y - 20)
    }
    if (position.x < 20) {
      setPosition(prev => ({ ...prev, x: 20 }))
    }
    if (position.y < 20) {
      setPosition(prev => ({ ...prev, y: 20 }))
    }
    
    setSize({ width: newWidth, height: newHeight })
  }, [isResizing, resizeDirection, size])

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return
    
    setIsResizing(false)
    setResizeDirection(null)
    
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [isResizing])

  // Set up drag event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // Set up resize event listeners
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  // Position palette on right side after mount and handle window resize
  React.useEffect(() => {
    const positionPalette = () => {
      // Ensure palette stays within viewport bounds
      const maxX = Math.max(20, window.innerWidth - size.width - 20)
      const newX = Math.min(maxX, 280) // Don't go too far right
      const newY = Math.min(100, window.innerHeight - size.height - 20)
      console.log('Positioning palette at:', { x: newX, y: newY, windowWidth: window.innerWidth })
      setPosition({ x: newX, y: newY })
    }

    // Position on mount
    positionPalette()

    // Handle window resize
    const handleWindowResize = () => {
      positionPalette()
    }

    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [size.width, size.height])

  if (!visible) {
    console.log('NodePaletteSimple not visible, returning null')
    return null
  }

  console.log('NodePaletteSimple rendering with position:', position, 'size:', size, 'visible:', visible)

  return (
    <div 
      ref={paletteRef}
      className={`bg-black/80 backdrop-blur-xl border border-white/20 rounded-lg p-3 overflow-y-auto transition-all relative ${
        isDragging ? 'shadow-2xl scale-[1.02] border-blue-400/50' : 'shadow-lg'
      }`}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        minWidth: '200px',
        minHeight: '300px',
        zIndex: 9999
      }}
    >
      {/* Additional Resize Handles for the main container */}
      {/* North (top) */}
      <div 
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-400/20 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'n')}
        title="Resize height"
      ></div>
      
      {/* South (bottom) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-blue-400/20 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 's')}
        title="Resize height"
      ></div>
      
      {/* East (right) */}
      <div 
        className="absolute top-0 right-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400/20 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'e')}
        title="Resize width"
      ></div>
      
      {/* West (left) */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400/20 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'w')}
        title="Resize width"
      ></div>
      
      {/* Corner handles */}
      <div 
        className="absolute top-0 right-0 w-3 h-3 cursor-nw-resize hover:bg-blue-400/30 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
        title="Resize diagonally"
      ></div>
      
      <div 
        className="absolute top-0 left-0 w-3 h-3 cursor-ne-resize hover:bg-blue-400/30 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
        title="Resize diagonally"
      ></div>
      
      <div 
        className="absolute bottom-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-blue-400/30 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'se')}
        title="Resize diagonally"
      ></div>
      
      <div 
        className="absolute bottom-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-blue-400/30 transition-colors z-10"
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
        title="Resize diagonally"
      ></div>
      <div 
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing hover:bg-white/10 p-2 -m-2 mb-0 rounded transition-colors relative border-b border-white/10"
        onMouseDown={handleDragStart}
        title="Drag to move palette"
      >
        <div className="flex items-center gap-2">
          <div className="text-gray-400 hover:text-white">
            <GripVertical className="w-4 h-4" />
          </div>
                  <div className="text-xs text-white font-bold">
          {title} <span className="text-[10px] text-white">({nodeTypes.length})</span>
        </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation() // Prevent drag from starting
            setOpen(prev => Object.fromEntries(Object.keys(prev).map(k => [k, false])))
          }}
          className="text-gray-400 hover:text-white text-xs hover:bg-white/10 px-2 py-1 rounded"
        >
          Collapse
        </button>
        
        {/* Resize Handles */}
        {/* North (top) */}
        <div 
          className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-400/20 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, 'n')}
          title="Resize height"
        ></div>
        
        {/* South (bottom) */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-400/20 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, 's')}
          title="Resize height"
        ></div>
        
        {/* East (right) */}
        <div 
          className="absolute top-0 right-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-400/20 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, 'e')}
          title="Resize width"
        ></div>
        
        {/* West (left) */}
        <div 
          className="absolute top-0 left-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-400/20 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, 'w')}
          title="Resize width"
        ></div>
        
        {/* Corner handles */}
        <div 
          className="absolute top-0 right-0 w-2 h-2 cursor-nw-resize hover:bg-blue-400/30 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
          title="Resize diagonally"
        ></div>
        
        <div 
          className="absolute top-0 left-0 w-2 h-2 cursor-ne-resize hover:bg-blue-400/30 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
          title="Resize diagonally"
        ></div>
        
        <div 
          className="absolute bottom-0 right-0 w-2 h-2 cursor-ne-resize hover:bg-blue-400/30 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, 'se')}
          title="Resize diagonally"
        ></div>
        
        <div 
          className="absolute bottom-0 left-0 w-2 h-2 cursor-nw-resize hover:bg-blue-400/30 transition-colors"
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
          title="Resize diagonally"
        ></div>
      </div>
      
      {categories.map((cat) => (
        <div key={cat} className="mb-3">
          <button
            onClick={() => setOpen((p) => ({ ...p, [cat]: !p[cat] }))}
            className="w-full text-left text-[11px] uppercase tracking-wide text-gray-500 mb-2"
          >
            {cat} ({nodeTypes.filter((n) => n.category === cat).length})
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
