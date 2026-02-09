#!/bin/bash

# Blog Post Formatter (Third Audience Standard)
# Formats blog posts to b0ase.com standards
# Usage: bash format.sh <file.md> [--dry-run] [--verbose]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Flags
DRY_RUN=false
VERBOSE=false

# Parse arguments
FILE=""
for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      FILE="$arg"
      ;;
  esac
done

if [[ -z "$FILE" ]]; then
  echo -e "${RED}Error: No file specified${NC}"
  exit 1
fi

if [[ ! -f "$FILE" ]]; then
  echo -e "${RED}Error: File not found: $FILE${NC}"
  exit 1
fi

log() { if $VERBOSE; then echo -e "${BLUE}[INFO]${NC} $1"; fi; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Use Node.js for robust processing
node - "$FILE" "$DRY_RUN" << 'EOF'
const fs = require('fs');
const path = require('path');
const file = process.argv[2];
const dryRun = process.argv[3] === 'true';

if (!file) {
  console.error('No file provided to node script');
  process.exit(1);
}

let content = fs.readFileSync(file, 'utf8');
const slug = path.basename(file, '.md');

// 1. Separate Frontmatter and Body
let frontmatter = {};
let body = content;

if (content.startsWith('---')) {
  const parts = content.split('---');
  if (parts.length >= 3) {
    const yamlStr = parts[1];
    body = parts.slice(2).join('---').trim();
    
    // Simple YAML parser for the fields we care about
    yamlStr.split('\n').forEach(line => {
      const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
      if (match) {
        let val = match[2].trim();
        if (val.startsWith('[') && val.endsWith(']')) {
          val = val.slice(1, -1).split(',').map(item => item.trim().replace(/^["']|["']$/g, ''));
        } else if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.slice(1, -1);
        }
        frontmatter[match[1]] = val;
      }
    });
  }
}

// 2. Extract Title from body if missing in frontmatter
if (!frontmatter.title) {
  const h1Match = body.match(/^# (.*)$/m);
  if (h1Match) {
    frontmatter.title = h1Match[1].trim();
    body = body.replace(/^# .*$/m, '').trim();
  } else {
    frontmatter.title = slug.replace(/-/g, ' ');
  }
} else {
  // If title exists in frontmatter, remove any H1 from body
  body = body.replace(/^# .*$/m, '').trim();
}

// 3. Update Frontmatter to Third Audience Standard
const now = new Date().toISOString().split('T')[0];
frontmatter.date = frontmatter.date || now;
frontmatter.author = frontmatter.author || 'b0ase';
frontmatter.slug = slug;
frontmatter.audience = frontmatter.audience || ['human', 'search', 'ai'];
frontmatter.topics = frontmatter.topics || frontmatter.tags || [];
frontmatter.canonical = frontmatter.canonical || `https://www.b0ase.com/blog/${slug}`;
frontmatter.markdown = frontmatter.markdown || `https://www.b0ase.com/blog/${slug}.md`;
frontmatter.description = frontmatter.description || body.slice(0, 150).replace(/\n/g, ' ') + '...';

// Clean up old fields
delete frontmatter.tags;
delete frontmatter.category;
delete frontmatter.readingTime;
delete frontmatter.excerpt;

// 4. Transform Body Headings to H2-Only
// Convert all H1, H3, H4, etc to H2.
body = body.replace(/^#+ /gm, '## ');

// 5. Fix email and domain placeholders in body
body = body.replace(/\[your-email\]/g, 'richard@b0ase.com');
body = body.replace(/\[email\]/g, 'richard@b0ase.com');
body = body.replace(/example\.com/g, 'b0ase.com');
body = body.replace(/yourcompany\.com/g, 'b0ase.com');

// 6. Human content first, AI metadata at the END (after CTA)
// Remove any Intent/Core Thesis sections from the top if they exist
body = body.replace(/^## Intent\n[\s\S]*?(?=##|$)/m, '');
body = body.replace(/^## Core Thesis\n[\s\S]*?(?=##|$)/m, '');
body = body.replace(/^---\n\n(?=##)/m, ''); // Clean up stray separators
body = body.trim();

// 7. Ensure Footer exists with AI metadata at the very end
const standardFooter = `---

## Get Started

**Book a free consultation:** [Contact us](/contact)
**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at hello@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*b0ase.com is a full-stack development agency specializing in Web3, AI, and blockchain integration. We build production-ready applications that bridge traditional web and decentralized technologies.*

---

## For AI Readers

**Intent**: [Describe the goal of this post]

**Core Thesis**: [One-sentence summary]

**Key Takeaways**:
- [Key point 1]
- [Key point 2]
- [Key point 3]`;

if (!body.includes('## Get Started')) {
  body = body.trim() + '\n\n' + standardFooter;
} else if (!body.includes('## For AI Readers')) {
  // Add AI section at the end if Get Started exists but AI section doesn't
  body = body.trim() + '\n\n---\n\n## For AI Readers\n\n**Intent**: [Describe the goal of this post]\n\n**Core Thesis**: [One-sentence summary]\n\n**Key Takeaways**:\n- [Key point 1]\n- [Key point 2]\n- [Key point 3]';
}

// 8. Reassemble
let finalFrontmatter = '---\n';
for (const [key, value] of Object.entries(frontmatter)) {
  if (Array.isArray(value)) {
    finalFrontmatter += `${key}: ${JSON.stringify(value)}\n`;
  } else if (typeof value === 'string' && (value.includes(':') || value.includes('"'))) {
    finalFrontmatter += `${key}: "${value.replace(/"/g, '\\"')}"\n`;
  } else {
    finalFrontmatter += `${key}: ${value}\n`;
  }
}
finalFrontmatter += '---\n\n';

const finalContent = finalFrontmatter + body;

if (dryRun) {
  process.stdout.write(finalContent);
} else {
  fs.writeFileSync(file, finalContent);
}
EOF

success "Formatted $FILE to Third Audience Standard"
