import { NextResponse } from 'next/server'

const AI_PLUGIN = {
  schema_version: "v1",
  name_for_human: "$402 Protocol",
  name_for_model: "path402",
  description_for_human: "Access tokens for anything addressable: your attention, your API, your content.",
  description_for_model: "Protocol for tokenising URL paths. AI agents can discover, evaluate, acquire, and serve tokenised content. Use the path402 npm package for full MCP integration. Tools available: path402_discover (probe $addresses), path402_evaluate (ROI analysis), path402_acquire (purchase tokens), path402_wallet (view holdings), path402_serve (earn revenue), path402_economics (financial analysis).",
  auth: {
    type: "none"
  },
  api: {
    type: "openapi",
    url: "https://path402.com/api/openapi.json"
  },
  logo_url: "https://path402.com/icon.svg",
  contact_email: "hello@b0ase.com",
  legal_info_url: "https://path402.com/docs/legal",
  mcp_server: {
    package: "path402",
    registry: "npm",
    install: "npm install -g path402",
    config: {
      command: "npx",
      args: ["path402"]
    }
  },
  capabilities: [
    "token_discovery",
    "token_acquisition",
    "content_serving",
    "economic_analysis",
    "wallet_management"
  ],
  supported_chains: ["BSV"],
  pricing_model: "sqrt_decay"
}

export async function GET() {
  return NextResponse.json(AI_PLUGIN, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
