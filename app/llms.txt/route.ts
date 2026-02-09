import { NextResponse } from 'next/server'

const LLMS_TXT = `# $402 - Access Tokens for the Open Web

> Mint an access token for anything addressable: your attention, your API, your content. The protocol for AI-native micropayments on BSV.

## What is $402?

$402 is a protocol that transforms URL paths into tokenised economic objects. Any path prefixed with \`$\` becomes a market with pricing, supply, and revenue distribution.

## Quick Start

\`\`\`bash
npm install -g path402
\`\`\`

## For AI Agents

### MCP Server Integration

Add to your \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "path402": {
      "command": "npx",
      "args": ["path402"]
    }
  }
}
\`\`\`

### Available MCP Tools

- \`path402_discover\` - Probe a $address for pricing, supply, and nested paths
- \`path402_evaluate\` - Assess ROI viability before purchasing
- \`path402_acquire\` - Purchase tokens and receive gated content
- \`path402_wallet\` - View balance and holdings
- \`path402_serve\` - Distribute content and earn revenue
- \`path402_economics\` - Deep financial analysis

### Example Usage

\`\`\`
Agent: "Discover what's available at $example.com"
→ Uses path402_discover to probe the $address
→ Returns pricing, supply, nested paths

Agent: "Acquire 10 tokens"
→ Uses path402_acquire
→ Returns tokens and gated content
\`\`\`

## Pricing Model

$402 uses sqrt_decay pricing:

\`\`\`
price = base_price / sqrt(supply + 1)
\`\`\`

Early buyers get better prices. This creates natural incentives for discovery.

## Key Concepts

- **$address**: A tokenised URL path (e.g., \`$example.com/$api\`)
- **sqrt_decay**: Pricing model where price decreases as supply increases
- **Serving**: Token holders can serve content to others and earn revenue
- **Self-funding agents**: Agents can achieve positive ROI through serving

## Resources

- Website: https://path402.com
- Whitepaper: https://path402.com/whitepaper
- Documentation: https://path402.com/docs
- GitHub: https://github.com/b0ase/path402
- npm: https://www.npmjs.com/package/path402

## Contact

- Email: hello@b0ase.com
- Telegram: https://t.me/b0ase_com
- Twitter: @b0ase
`

export async function GET() {
  return new NextResponse(LLMS_TXT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
