import fs from 'fs'
import path from 'path'

export interface ExternalService {
  name: string
  type: 'wallet' | 'ai' | 'storage' | 'auth' | 'blockchain' | 'api' | 'database'
  description: string
}

export interface ApiGroup {
  name: string
  routes: string[]
}

export interface CodebaseAnalysis {
  name: string
  description: string
  stack: string[]
  structure: {
    pages: string[]
    apiRoutes: string[]
    components: string[]
    libs: string[]
    models: string[]
  }
  stats: {
    totalFiles: number
    pages: number
    apiRoutes: number
    components: number
  }
  // Enhanced architecture details
  externalServices: ExternalService[]
  apiGroups: ApiGroup[]
  authMethods: string[]
  keyFeatures: string[]
}

// Analyze a Next.js codebase
export function analyzeCodebase(projectPath: string, name: string): CodebaseAnalysis | null {
  try {
    if (!fs.existsSync(projectPath)) {
      return null
    }

    const analysis: CodebaseAnalysis = {
      name,
      description: '',
      stack: [],
      structure: {
        pages: [],
        apiRoutes: [],
        components: [],
        libs: [],
        models: []
      },
      stats: {
        totalFiles: 0,
        pages: 0,
        apiRoutes: 0,
        components: 0
      },
      externalServices: [],
      apiGroups: [],
      authMethods: [],
      keyFeatures: []
    }

    // Check for package.json to determine stack
    const packageJsonPath = path.join(projectPath, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      if (deps['next']) analysis.stack.push('Next.js')
      if (deps['react']) analysis.stack.push('React')
      if (deps['@prisma/client'] || deps['prisma']) analysis.stack.push('Prisma')
      if (deps['@supabase/supabase-js']) analysis.stack.push('Supabase')
      if (deps['three'] || deps['@react-three/fiber']) analysis.stack.push('Three.js')
      if (deps['@bsv/sdk'] || deps['bsv']) analysis.stack.push('BSV')
      if (deps['@handcash/sdk']) analysis.stack.push('HandCash')
      if (deps['tailwindcss']) analysis.stack.push('Tailwind')
      if (deps['framer-motion']) analysis.stack.push('Framer Motion')
    }

    // Find pages (App Router)
    const appDir = path.join(projectPath, 'app')
    const srcAppDir = path.join(projectPath, 'src', 'app')
    const pagesDir = fs.existsSync(srcAppDir) ? srcAppDir : appDir

    if (fs.existsSync(pagesDir)) {
      analysis.structure.pages = findPages(pagesDir, pagesDir)
      analysis.structure.apiRoutes = findApiRoutes(pagesDir, pagesDir)
      analysis.stats.pages = analysis.structure.pages.length
      analysis.stats.apiRoutes = analysis.structure.apiRoutes.length
    }

    // Find components
    const componentsDir = path.join(projectPath, 'components')
    const srcComponentsDir = path.join(projectPath, 'src', 'components')
    const compDir = fs.existsSync(srcComponentsDir) ? srcComponentsDir : componentsDir

    if (fs.existsSync(compDir)) {
      analysis.structure.components = findComponents(compDir, compDir)
      analysis.stats.components = analysis.structure.components.length
    }

    // Find lib files
    const libDir = path.join(projectPath, 'lib')
    const srcLibDir = path.join(projectPath, 'src', 'lib')
    const libPath = fs.existsSync(srcLibDir) ? srcLibDir : libDir

    if (fs.existsSync(libPath)) {
      analysis.structure.libs = findFiles(libPath, libPath, ['.ts', '.tsx', '.js'])
    }

    // Check for Prisma models
    const prismaSchema = path.join(projectPath, 'prisma', 'schema.prisma')
    if (fs.existsSync(prismaSchema)) {
      const schema = fs.readFileSync(prismaSchema, 'utf-8')
      const modelMatches = schema.match(/model\s+(\w+)/g)
      if (modelMatches) {
        analysis.structure.models = modelMatches.map(m => m.replace('model ', ''))
      }
    }

    // Detect external services from dependencies
    const packageJsonPath2 = path.join(projectPath, 'package.json')
    if (fs.existsSync(packageJsonPath2)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath2, 'utf-8'))
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

      // Wallet integrations
      if (deps['@handcash/sdk'] || deps['@handcash/handcash-connect']) {
        analysis.externalServices.push({ name: 'HandCash', type: 'wallet', description: 'BSV wallet & payments' })
        analysis.authMethods.push('HandCash Connect')
      }
      if (deps['@solana/wallet-adapter-react'] || deps['@solana/web3.js']) {
        analysis.externalServices.push({ name: 'Phantom', type: 'wallet', description: 'Solana wallet' })
        analysis.authMethods.push('Phantom Wallet')
      }
      if (deps['ethers'] || deps['web3'] || deps['@web3-react/core']) {
        analysis.externalServices.push({ name: 'MetaMask', type: 'wallet', description: 'Ethereum wallet' })
        analysis.authMethods.push('MetaMask')
      }

      // AI Services
      if (deps['openai']) {
        analysis.externalServices.push({ name: 'OpenAI', type: 'ai', description: 'GPT models' })
      }
      if (deps['@anthropic-ai/sdk']) {
        analysis.externalServices.push({ name: 'Anthropic', type: 'ai', description: 'Claude models' })
      }
      if (deps['@google/generative-ai'] || deps['@google-cloud/aiplatform']) {
        analysis.externalServices.push({ name: 'Google AI', type: 'ai', description: 'Gemini/Vertex AI' })
      }

      // Storage
      if (deps['@pinata/sdk'] || deps['pinata']) {
        analysis.externalServices.push({ name: 'Pinata', type: 'storage', description: 'IPFS pinning' })
      }
      if (deps['ipfs-http-client']) {
        analysis.externalServices.push({ name: 'IPFS', type: 'storage', description: 'Decentralized storage' })
      }

      // Auth
      if (deps['@supabase/supabase-js'] || deps['@supabase/auth-helpers-nextjs']) {
        analysis.externalServices.push({ name: 'Supabase', type: 'auth', description: 'Auth & Database' })
        analysis.authMethods.push('Supabase Auth')
      }
      if (deps['next-auth']) {
        analysis.externalServices.push({ name: 'NextAuth', type: 'auth', description: 'OAuth providers' })
        analysis.authMethods.push('OAuth')
      }

      // Blockchain
      if (deps['@bsv/sdk'] || deps['bsv']) {
        analysis.externalServices.push({ name: 'BSV', type: 'blockchain', description: 'Bitcoin SV blockchain' })
      }

      // 3D/Graphics
      if (deps['three'] || deps['@react-three/fiber']) {
        analysis.keyFeatures.push('3D Graphics')
      }

      // Media
      if (deps['ffmpeg'] || deps['fluent-ffmpeg']) {
        analysis.keyFeatures.push('Video Processing')
      }
    }

    // Group API routes by domain
    if (analysis.structure.apiRoutes.length > 0) {
      const groups: Record<string, string[]> = {}
      for (const route of analysis.structure.apiRoutes) {
        const parts = route.replace('/api/', '').split('/')
        const domain = parts[0] || 'misc'
        if (!groups[domain]) groups[domain] = []
        groups[domain].push(route)
      }
      analysis.apiGroups = Object.entries(groups)
        .map(([name, routes]) => ({ name, routes }))
        .sort((a, b) => b.routes.length - a.routes.length)
    }

    // Detect key features from file patterns
    const allLibFiles = analysis.structure.libs.join(' ').toLowerCase()
    if (allLibFiles.includes('staking') || allLibFiles.includes('stake')) {
      analysis.keyFeatures.push('Staking System')
    }
    if (allLibFiles.includes('marketplace') || allLibFiles.includes('market')) {
      analysis.keyFeatures.push('Marketplace')
    }
    if (allLibFiles.includes('mint') || allLibFiles.includes('nft')) {
      analysis.keyFeatures.push('NFT Minting')
    }
    if (allLibFiles.includes('stream') || allLibFiles.includes('audio')) {
      analysis.keyFeatures.push('Audio Streaming')
    }

    return analysis
  } catch (e) {
    console.error(`Failed to analyze ${projectPath}:`, e)
    return null
  }
}

function findPages(dir: string, baseDir: string): string[] {
  const pages: string[] = []

  try {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // Skip api directory and special Next.js directories
        if (item !== 'api' && !item.startsWith('_') && !item.startsWith('.')) {
          pages.push(...findPages(fullPath, baseDir))
        }
      } else if (item === 'page.tsx' || item === 'page.ts' || item === 'page.js') {
        const relativePath = path.relative(baseDir, dir)
        const route = '/' + relativePath.replace(/\\/g, '/')
        pages.push(route === '/' ? '/' : route)
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return pages
}

function findApiRoutes(dir: string, baseDir: string): string[] {
  const routes: string[] = []
  const apiDir = path.join(dir, 'api')

  if (!fs.existsSync(apiDir)) return routes

  function scanDir(currentDir: string) {
    try {
      const items = fs.readdirSync(currentDir)

      for (const item of items) {
        const fullPath = path.join(currentDir, item)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          scanDir(fullPath)
        } else if (item === 'route.ts' || item === 'route.js') {
          const relativePath = path.relative(baseDir, currentDir)
          routes.push('/' + relativePath.replace(/\\/g, '/'))
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }

  scanDir(apiDir)
  return routes
}

function findComponents(dir: string, baseDir: string): string[] {
  const components: string[] = []

  try {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        components.push(...findComponents(fullPath, baseDir))
      } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
        const name = item.replace(/\.(tsx|jsx)$/, '')
        if (name[0] === name[0].toUpperCase()) {
          components.push(name)
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return components
}

function findFiles(dir: string, baseDir: string, extensions: string[]): string[] {
  const files: string[] = []

  try {
    const items = fs.readdirSync(dir)

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...findFiles(fullPath, baseDir, extensions))
      } else if (extensions.some(ext => item.endsWith(ext))) {
        const relativePath = path.relative(baseDir, fullPath)
        files.push(relativePath.replace(/\\/g, '/'))
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return files
}
