'use client'

import { Tldraw, Editor, TLShapeId, createShapeId, toRichText } from 'tldraw'
import 'tldraw/tldraw.css'
import { useCallback, useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

interface ExternalService {
  name: string
  type: 'wallet' | 'ai' | 'storage' | 'auth' | 'blockchain' | 'api' | 'database'
  description: string
}

interface ApiGroup {
  name: string
  routes: string[]
}

interface CodebaseAnalysis {
  name: string
  stack: string[]
  structure: {
    pages: string[]
    apiRoutes: string[]
    components: string[]
    libs: string[]
    models: string[]
  }
  stats: {
    pages: number
    apiRoutes: number
    components: number
  }
  externalServices: ExternalService[]
  apiGroups: ApiGroup[]
  authMethods: string[]
  keyFeatures: string[]
}

interface SchematicsEditorProps {
  projectSlug?: string
  projectName?: string
  initialData?: any
  onSave?: (data: any) => void
  readOnly?: boolean
}

export function SchematicsEditor({
  projectSlug,
  projectName,
  initialData,
  onSave,
  readOnly = false
}: SchematicsEditorProps) {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [analysis, setAnalysis] = useState<CodebaseAnalysis | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === 'dark'

  // Fetch codebase analysis
  useEffect(() => {
    if (!projectSlug) return

    fetch(`/api/schematics/analyze?slug=${projectSlug}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setAnalysis(data)
        }
      })
      .catch(console.error)
  }, [projectSlug])

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor)

    // Load initial data if provided
    if (initialData) {
      try {
        // Load snapshot using the loadSnapshot API
        const loadFn = (editor.store as any).loadSnapshot || (editor.store as any).deserialize
        if (loadFn) {
          loadFn.call(editor.store, initialData)
        }
      } catch (e) {
        console.error('Failed to load schematic data:', e)
      }
    }
  }, [initialData])

  // Sync editor dark mode with site theme
  useEffect(() => {
    if (editor) {
      editor.user.updateUserPreferences({ colorScheme: isDarkMode ? 'dark' : 'light' })
    }
  }, [editor, isDarkMode])

  // Generate architecture diagram from analysis
  const generateDiagram = useCallback(() => {
    if (!editor || !analysis) return

    setIsGenerating(true)

    // Clear existing shapes
    const allShapeIds = Array.from(editor.getCurrentPageShapeIds())
    if (allShapeIds.length > 0) {
      editor.deleteShapes(allShapeIds)
    }

    const shapes: any[] = []
    const MAIN_X = 100
    const MAIN_WIDTH = 700
    const SERVICES_X = 920
    const SERVICES_WIDTH = 200
    let yOffset = 100

    // Title
    shapes.push({
      id: createShapeId(),
      type: 'text',
      x: MAIN_X,
      y: 30,
      props: {
        richText: toRichText(`${analysis.name} Architecture`),
        size: 'xl',
        font: 'mono'
      }
    })

    // Stack section
    if (analysis.stack.length > 0) {
      shapes.push({
        id: createShapeId(),
        type: 'text',
        x: MAIN_X,
        y: 70,
        props: {
          richText: toRichText('Stack: ' + analysis.stack.join(' | ')),
          size: 's',
          font: 'mono'
        }
      })
    }

    // Key Features (if any)
    if (analysis.keyFeatures && analysis.keyFeatures.length > 0) {
      shapes.push({
        id: createShapeId(),
        type: 'geo',
        x: MAIN_X,
        y: yOffset,
        props: {
          w: MAIN_WIDTH,
          h: 50,
          geo: 'rectangle',
          color: 'red',
          fill: 'semi'
        }
      })
      shapes.push({
        id: createShapeId(),
        type: 'text',
        x: MAIN_X + 10,
        y: yOffset + 15,
        props: {
          richText: toRichText('KEY FEATURES: ' + analysis.keyFeatures.join(' • ')),
          size: 's',
          font: 'mono'
        }
      })
      yOffset += 70
    }

    // Frontend Layer
    shapes.push({
      id: createShapeId(),
      type: 'geo',
      x: MAIN_X,
      y: yOffset,
      props: {
        w: MAIN_WIDTH,
        h: 180,
        geo: 'rectangle',
        color: 'blue',
        fill: 'semi'
      }
    })
    shapes.push({
      id: createShapeId(),
      type: 'text',
      x: MAIN_X + 10,
      y: yOffset + 10,
      props: {
        richText: toRichText(`FRONTEND (${analysis.stats.pages} pages)`),
        size: 's',
        font: 'mono'
      }
    })

    // Add page nodes
    const pageNodes = analysis.structure.pages.slice(0, 10)
    pageNodes.forEach((page, i) => {
      const col = i % 5
      const row = Math.floor(i / 5)
      shapes.push({
        id: createShapeId(),
        type: 'geo',
        x: MAIN_X + 15 + col * 135,
        y: yOffset + 45 + row * 55,
        props: {
          w: 125,
          h: 45,
          geo: 'rectangle',
          color: 'light-blue',
          fill: 'solid',
          text: page.length > 14 ? page.slice(0, 14) + '...' : page,
          font: 'mono',
          size: 's'
        }
      })
    })

    yOffset += 200

    // API Layer - Use grouped APIs if available
    if (analysis.stats.apiRoutes > 0) {
      const apiHeight = analysis.apiGroups && analysis.apiGroups.length > 0 ? 220 : 180
      shapes.push({
        id: createShapeId(),
        type: 'geo',
        x: MAIN_X,
        y: yOffset,
        props: {
          w: MAIN_WIDTH,
          h: apiHeight,
          geo: 'rectangle',
          color: 'green',
          fill: 'semi'
        }
      })
      shapes.push({
        id: createShapeId(),
        type: 'text',
        x: MAIN_X + 10,
        y: yOffset + 10,
        props: {
          richText: toRichText(`API ROUTES (${analysis.stats.apiRoutes} endpoints)`),
          size: 's',
          font: 'mono'
        }
      })

      // Show API groups if available
      if (analysis.apiGroups && analysis.apiGroups.length > 0) {
        const topGroups = analysis.apiGroups.slice(0, 5)
        topGroups.forEach((group, i) => {
          shapes.push({
            id: createShapeId(),
            type: 'geo',
            x: MAIN_X + 15 + i * 135,
            y: yOffset + 45,
            props: {
              w: 125,
              h: 70,
              geo: 'rectangle',
              color: 'light-green',
              fill: 'solid',
              text: `${group.name}\n(${group.routes.length})`,
              font: 'mono',
              size: 's'
            }
          })
        })

        // Show sample routes below groups
        const sampleRoutes = analysis.structure.apiRoutes.slice(0, 5)
        sampleRoutes.forEach((route, i) => {
          const displayRoute = route.replace('/api/', '')
          shapes.push({
            id: createShapeId(),
            type: 'geo',
            x: MAIN_X + 15 + i * 135,
            y: yOffset + 130,
            props: {
              w: 125,
              h: 35,
              geo: 'rectangle',
              color: 'green',
              fill: 'pattern',
              text: displayRoute.length > 12 ? displayRoute.slice(0, 12) + '...' : displayRoute,
              font: 'mono',
              size: 's'
            }
          })
        })
      } else {
        // Fallback to simple route list
        const apiNodes = analysis.structure.apiRoutes.slice(0, 10)
        apiNodes.forEach((route, i) => {
          const col = i % 5
          const row = Math.floor(i / 5)
          const displayRoute = route.replace('/api/', '')
          shapes.push({
            id: createShapeId(),
            type: 'geo',
            x: MAIN_X + 15 + col * 135,
            y: yOffset + 45 + row * 55,
            props: {
              w: 125,
              h: 45,
              geo: 'rectangle',
              color: 'light-green',
              fill: 'solid',
              text: displayRoute.length > 12 ? displayRoute.slice(0, 12) + '...' : displayRoute,
              font: 'mono',
              size: 's'
            }
          })
        })
      }

      yOffset += apiHeight + 20
    }

    // Database Layer (if models exist)
    if (analysis.structure.models.length > 0) {
      shapes.push({
        id: createShapeId(),
        type: 'geo',
        x: MAIN_X,
        y: yOffset,
        props: {
          w: MAIN_WIDTH,
          h: 140,
          geo: 'rectangle',
          color: 'violet',
          fill: 'semi'
        }
      })
      shapes.push({
        id: createShapeId(),
        type: 'text',
        x: MAIN_X + 10,
        y: yOffset + 10,
        props: {
          richText: toRichText(`DATABASE MODELS (${analysis.structure.models.length})`),
          size: 's',
          font: 'mono'
        }
      })

      // Add model nodes
      const modelNodes = analysis.structure.models.slice(0, 10)
      modelNodes.forEach((model, i) => {
        const col = i % 5
        const row = Math.floor(i / 5)
        shapes.push({
          id: createShapeId(),
          type: 'geo',
          x: MAIN_X + 15 + col * 135,
          y: yOffset + 45 + row * 45,
          props: {
            w: 125,
            h: 38,
            geo: 'rectangle',
            color: 'light-violet',
            fill: 'solid',
            text: model,
            font: 'mono',
            size: 's'
          }
        })
      })

      yOffset += 160
    }

    // Components section
    if (analysis.stats.components > 0) {
      shapes.push({
        id: createShapeId(),
        type: 'geo',
        x: MAIN_X,
        y: yOffset,
        props: {
          w: MAIN_WIDTH,
          h: 140,
          geo: 'rectangle',
          color: 'orange',
          fill: 'semi'
        }
      })
      shapes.push({
        id: createShapeId(),
        type: 'text',
        x: MAIN_X + 10,
        y: yOffset + 10,
        props: {
          richText: toRichText(`COMPONENTS (${analysis.stats.components})`),
          size: 's',
          font: 'mono'
        }
      })

      // Add component nodes
      const compNodes = analysis.structure.components.slice(0, 10)
      compNodes.forEach((comp, i) => {
        const col = i % 5
        const row = Math.floor(i / 5)
        shapes.push({
          id: createShapeId(),
          type: 'geo',
          x: MAIN_X + 15 + col * 135,
          y: yOffset + 45 + row * 45,
          props: {
            w: 125,
            h: 38,
            geo: 'rectangle',
            color: 'yellow',
            fill: 'solid',
            text: comp.length > 12 ? comp.slice(0, 12) + '...' : comp,
            font: 'mono',
            size: 's'
          }
        })
      })
    }

    // ==================
    // EXTERNAL SERVICES (Right side)
    // ==================
    if (analysis.externalServices && analysis.externalServices.length > 0) {
      let serviceY = 100

      // External Services container
      shapes.push({
        id: createShapeId(),
        type: 'geo',
        x: SERVICES_X,
        y: serviceY,
        props: {
          w: SERVICES_WIDTH,
          h: 50 + analysis.externalServices.length * 70,
          geo: 'rectangle',
          color: 'grey',
          fill: 'semi'
        }
      })
      shapes.push({
        id: createShapeId(),
        type: 'text',
        x: SERVICES_X + 10,
        y: serviceY + 10,
        props: {
          richText: toRichText('EXTERNAL SERVICES'),
          size: 's',
          font: 'mono'
        }
      })

      // Add service nodes
      analysis.externalServices.forEach((service, i) => {
        const colorMap: Record<string, string> = {
          wallet: 'yellow',
          ai: 'light-blue',
          storage: 'light-green',
          auth: 'light-violet',
          blockchain: 'orange',
          api: 'grey',
          database: 'violet'
        }
        shapes.push({
          id: createShapeId(),
          type: 'geo',
          x: SERVICES_X + 15,
          y: serviceY + 50 + i * 65,
          props: {
            w: SERVICES_WIDTH - 30,
            h: 55,
            geo: 'rectangle',
            color: colorMap[service.type] || 'grey',
            fill: 'solid',
            text: `${service.name}\n${service.description}`,
            font: 'mono',
            size: 's'
          }
        })
      })

      serviceY += 60 + analysis.externalServices.length * 70

      // Auth Methods (if any)
      if (analysis.authMethods && analysis.authMethods.length > 0) {
        shapes.push({
          id: createShapeId(),
          type: 'geo',
          x: SERVICES_X,
          y: serviceY,
          props: {
            w: SERVICES_WIDTH,
            h: 50 + analysis.authMethods.length * 35,
            geo: 'rectangle',
            color: 'light-red',
            fill: 'semi'
          }
        })
        shapes.push({
          id: createShapeId(),
          type: 'text',
          x: SERVICES_X + 10,
          y: serviceY + 10,
          props: {
            richText: toRichText('AUTH METHODS'),
            size: 's',
            font: 'mono'
          }
        })

        analysis.authMethods.forEach((method, i) => {
          shapes.push({
            id: createShapeId(),
            type: 'geo',
            x: SERVICES_X + 15,
            y: serviceY + 45 + i * 35,
            props: {
              w: SERVICES_WIDTH - 30,
              h: 28,
              geo: 'rectangle',
              color: 'red',
              fill: 'pattern',
              text: method,
              font: 'mono',
              size: 's'
            }
          })
        })
      }
    }

    // Create all shapes
    editor.createShapes(shapes)

    // Zoom to fit
    editor.zoomToFit()

    setIsGenerating(false)
  }, [editor, analysis])

  const handleSave = useCallback(() => {
    if (!editor || !onSave) return

    // Get snapshot using available API
    const getSnapshotFn = (editor.store as any).getSnapshot || (editor.store as any).serialize
    const snapshot = getSnapshotFn ? getSnapshotFn.call(editor.store) : editor.store
    onSave(snapshot)
  }, [editor, onSave])

  return (
    <div className="w-full h-full relative">
      <Tldraw
        onMount={handleMount}
        inferDarkMode={false}
      />

      {/* Project info overlay */}
      {projectName && (
        <div className="absolute top-4 left-4 z-50 bg-black/80 border border-zinc-800 px-4 py-2 rounded-lg">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Schematic</p>
          <p className="text-white font-bold">{projectName}</p>
          {analysis && (
            <p className="text-xs text-zinc-400 mt-1">
              {analysis.stats.pages} pages | {analysis.stats.apiRoutes} APIs | {analysis.stats.components} components
            </p>
          )}
        </div>
      )}

      {/* Generate button */}
      {analysis && (
        <button
          onClick={generateDiagram}
          disabled={isGenerating}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold text-sm uppercase tracking-wider transition-colors rounded"
        >
          {isGenerating ? 'Generating...' : 'Generate from Codebase'}
        </button>
      )}

      {/* Save button */}
      {onSave && !readOnly && (
        <button
          onClick={handleSave}
          className="absolute bottom-4 right-4 z-50 px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          Save Schematic
        </button>
      )}
    </div>
  )
}

export default SchematicsEditor
