---
name: b0ase-project-standards
description: b0ase.com coding standards and best practices enforcement. Use when reviewing code, setting up new projects, or refactoring existing code. Triggers on "Review code", "Check b0ase standards", "Audit project", "Setup new project", or any code quality review tasks.
license: MIT
metadata:
  author: b0ase.com
  version: "1.0.0"
---

# b0ase Project Standards

Comprehensive coding standards and best practices for all b0ase.com projects. Ensures consistency, security, and performance across client deliverables.

## When to Apply

Reference these guidelines when:
- Setting up new client projects
- Reviewing code before deployment
- Refactoring existing codebases
- Onboarding new developers
- Conducting security audits

## Core Principles

1. **Security First** - No compromises on security vulnerabilities
2. **Performance by Default** - Optimize from the start, not as an afterthought
3. **Maintainability** - Code should be readable 6 months from now
4. **Client Ownership** - Clients must be able to maintain code post-handoff
5. **Documentation** - Self-documenting code + essential comments only

## Standards Categories

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Security | CRITICAL | `sec-` |
| 2 | Package Management | CRITICAL | `pkg-` |
| 3 | Performance | HIGH | `perf-` |
| 4 | Code Quality | HIGH | `qual-` |
| 5 | Documentation | MEDIUM | `docs-` |
| 6 | DevOps | MEDIUM | `ops-` |

## 1. Security Standards (CRITICAL)

### sec-env-variables
**Never commit secrets to git**
```bash
# ✓ CORRECT
# .env (gitignored)
DATABASE_URL=postgresql://...
API_KEY=sk_live_...

# .env.example (committed)
DATABASE_URL=postgresql://user:pass@localhost:5432/db
API_KEY=your_api_key_here
```

```bash
# ✗ WRONG
# Committing .env files
# Hardcoding secrets in code
const apiKey = "sk_live_abc123xyz"
```

**Why**: Leaked credentials = security breach. Use environment variables + .env.example templates.

### sec-input-validation
**Validate and sanitize ALL user input**
```typescript
// ✓ CORRECT
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(120)
})

const result = userSchema.safeParse(userInput)
if (!result.success) {
  return { error: result.error }
}
```

```typescript
// ✗ WRONG
// Direct database query with user input
db.query(`SELECT * FROM users WHERE email = '${email}'`)

// No validation on API inputs
app.post('/user', (req, res) => {
  db.insert(req.body) // Dangerous!
})
```

**Why**: Prevents SQL injection, XSS, and other injection attacks.

### sec-dependencies
**Keep dependencies updated and audited**
```bash
# ✓ CORRECT - Run regularly
pnpm audit
pnpm update

# Check for vulnerabilities
npx audit-ci --moderate
```

**Why**: Vulnerable dependencies are the #1 attack vector. Audit weekly.

### sec-authentication
**Use established auth libraries, never roll your own**
```typescript
// ✓ CORRECT
import { auth } from '@/lib/auth' // Next-Auth, Clerk, Supabase Auth
import { hash, compare } from 'bcrypt'

// ✗ WRONG
function hashPassword(password) {
  return Buffer.from(password).toString('base64') // NEVER DO THIS
}
```

**Why**: Cryptography is hard. Use battle-tested libraries.

### sec-cors-headers
**Restrict CORS to known origins**
```typescript
// ✓ CORRECT
const allowedOrigins = [
  'https://client-app.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))

// ✗ WRONG
app.use(cors({ origin: '*' })) // Allows anyone!
```

**Why**: Prevents unauthorized cross-origin requests.

## 2. Package Management (CRITICAL)

### pkg-pnpm-only
**All projects must use pnpm, never npm or yarn**
```bash
# ✓ CORRECT
pnpm install
pnpm add package-name
pnpm run build

# ✗ WRONG
npm install
yarn add package-name
```

**Why**: pnpm is faster, more disk-efficient, and stricter about dependencies.

**Migration**: If you encounter an npm project:
1. Delete `node_modules` and `package-lock.json`
2. Run `pnpm install`
3. Commit `pnpm-lock.yaml`

### pkg-no-legacy-deps
**Never restore node_modules from backups**
```bash
# ✓ CORRECT
pnpm install  # Always install fresh

# ✗ WRONG
cp -r backup/node_modules .  # Never restore from backup
```

**Why**: Dependencies should be reproducible from lockfile.

### pkg-workspace-monorepos
**Use pnpm workspaces for multi-package projects**
```yaml
# ✓ CORRECT - pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// package.json
{
  "name": "client-project",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build"
  }
}
```

**Why**: Better dependency management and faster installs.

## 3. Performance Standards (HIGH)

### perf-bundle-analysis
**Analyze bundle size before deployment**
```bash
# ✓ CORRECT
pnpm build
pnpm analyze  # Should be in package.json scripts
```

```json
// package.json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  },
  "devDependencies": {
    "@next/bundle-analyzer": "latest"
  }
}
```

**Why**: Catch bloat before users experience it.

### perf-image-optimization
**Always optimize images**
```tsx
// ✓ CORRECT - Next.js Image component
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority={isAboveFold}
/>

// ✗ WRONG
<img src="/hero.jpg" alt="Hero" /> // No optimization
```

**Why**: Images are often 50%+ of page weight.

### perf-lazy-loading
**Lazy load non-critical components**
```tsx
// ✓ CORRECT
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <Skeleton />,
  ssr: false
})

// ✗ WRONG
import HeavyChart from '@/components/Chart' // Loads immediately
```

**Why**: Faster initial page load.

### perf-database-indexes
**Index frequently queried fields**
```sql
-- ✓ CORRECT
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- ✗ WRONG
-- No indexes on foreign keys or WHERE clause fields
```

**Why**: Queries without indexes = slow database.

## 4. Code Quality Standards (HIGH)

### qual-typescript-strict
**Enable TypeScript strict mode**
```json
// ✓ CORRECT - tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}

// ✗ WRONG
{
  "compilerOptions": {
    "strict": false  // or missing
  }
}
```

**Why**: Catch errors at compile time, not runtime.

### qual-no-any
**Avoid `any` type - use `unknown` or proper types**
```typescript
// ✓ CORRECT
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Safe to use
  }
}

// Or use proper types
interface ApiResponse {
  data: User[]
  total: number
}

// ✗ WRONG
function processData(data: any) {
  // Type safety disabled
}
```

**Why**: `any` defeats the purpose of TypeScript.

### qual-error-handling
**Always handle errors explicitly**
```typescript
// ✓ CORRECT
try {
  const data = await fetchUser(id)
  return { success: true, data }
} catch (error) {
  console.error('Failed to fetch user:', error)
  return { success: false, error: 'User not found' }
}

// ✗ WRONG
const data = await fetchUser(id) // Unhandled promise rejection
```

**Why**: Unhandled errors crash apps.

### qual-consistent-naming
**Use consistent naming conventions**
```typescript
// ✓ CORRECT
// Files: kebab-case
user-profile.tsx
api-client.ts

// Components: PascalCase
function UserProfile() {}

// Variables/functions: camelCase
const userName = 'John'
function getUserById(id: string) {}

// Constants: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'

// ✗ WRONG
function user_profile() {}  // Mixed conventions
const UserName = 'John'     // Wrong casing for variable
```

**Why**: Consistency = readability.

## 5. Documentation Standards (MEDIUM)

### docs-readme-required
**Every project must have a comprehensive README**
```markdown
# ✓ CORRECT - README.md structure

# Project Name

Brief description of what this project does.

## Tech Stack
- Next.js 14
- PostgreSQL
- Tailwind CSS

## Getting Started
\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Environment Variables
See `.env.example` for required variables.

## Deployment
\`\`\`bash
pnpm build
vercel deploy --prod
\`\`\`

## Client Access
- Dashboard: https://app.client.com
- Admin: https://admin.client.com
- Credentials: See 1Password vault "Client Name"
```

**Why**: Clients need to understand and maintain the project.

### docs-inline-comments
**Comment the "why", not the "what"**
```typescript
// ✓ CORRECT
// Retry failed uploads to handle transient network errors
const uploadWithRetry = async (file: File) => {
  return retry(() => uploadFile(file), { maxAttempts: 3 })
}

// ✗ WRONG
// This function uploads a file
const uploadFile = async (file: File) => {
  // Call the upload function
  return await upload(file)
}
```

**Why**: Code should be self-documenting; comments explain reasoning.

### docs-api-documentation
**Document all API endpoints**
```typescript
// ✓ CORRECT
/**
 * GET /api/users/:id
 *
 * Fetches user by ID
 *
 * @param id - User UUID
 * @returns User object with profile data
 * @throws 404 if user not found
 * @throws 403 if unauthorized
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Implementation
}
```

**Why**: APIs are contracts; document them.

## 6. DevOps Standards (MEDIUM)

### ops-env-files
**Use .env.example for documentation**
```bash
# ✓ CORRECT structure
.env.local          # Local development (gitignored)
.env.production     # Production secrets (gitignored)
.env.example        # Template (committed)
```

```bash
# .env.example
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
NEXT_PUBLIC_API_URL=https://api.example.com
OPENAI_API_KEY=sk_xxx
```

**Why**: Team members know what variables are needed.

### ops-ci-cd
**All projects must have CI/CD**
```yaml
# ✓ CORRECT - .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
```

**Why**: Catch errors before deployment.

### ops-health-checks
**Implement health check endpoints**
```typescript
// ✓ CORRECT - app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.query('SELECT 1')

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    )
  }
}
```

**Why**: Monitoring and uptime tracking.

## Project Checklist

Before marking a project as complete, verify:

### Pre-Deployment Checklist
- [ ] All secrets in environment variables (not committed)
- [ ] `pnpm audit` shows no critical vulnerabilities
- [ ] TypeScript strict mode enabled, no errors
- [ ] All environment variables documented in .env.example
- [ ] README.md complete with setup instructions
- [ ] CI/CD pipeline passing
- [ ] Health check endpoint implemented
- [ ] Error tracking configured (Sentry, LogRocket, etc.)
- [ ] Performance budget met (Lighthouse score > 90)
- [ ] Bundle size analyzed and optimized
- [ ] Database indexes on all foreign keys
- [ ] CORS properly configured
- [ ] API rate limiting implemented
- [ ] Client access documented (URLs, credentials)

### Code Review Checklist
- [ ] No `any` types (use `unknown` or proper types)
- [ ] Input validation on all user inputs
- [ ] Error handling on all async operations
- [ ] Images optimized (using Image component)
- [ ] No console.logs in production code
- [ ] Consistent naming conventions
- [ ] Comments explain "why", not "what"
- [ ] No TODO comments without tickets
- [ ] No dead code or commented code
- [ ] Tests cover critical paths

## Usage

Run automated checks:
```bash
bash /mnt/skills/user/b0ase-standards/scripts/audit.sh [project-path]
```

This will check:
- Package manager (must be pnpm)
- Security vulnerabilities
- TypeScript configuration
- Environment variable setup
- Documentation completeness
- Common anti-patterns

## Enforcement

These standards are **non-negotiable** for b0ase projects. Code that doesn't meet these standards will not be deployed to client environments.

For exceptions, document the reasoning in project README and get explicit approval.

## Resources

- Security: https://owasp.org/www-project-top-ten/
- Performance: https://web.dev/vitals/
- TypeScript: https://www.typescriptlang.org/tsconfig
- pnpm: https://pnpm.io/

## Updates

Standards are living documents. Check for updates:
```bash
bash /mnt/skills/user/b0ase-standards/scripts/check-updates.sh
```
