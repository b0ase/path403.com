/**
 * x402 MCP Tools
 *
 * Registers x402 facilitator tools with the MCP server.
 * These tools enable AI agents to:
 * - Verify multi-chain payment signatures
 * - Settle payments with BSV inscription
 * - Retrieve inscription proofs
 * - Query facilitator statistics
 * - Discover facilitator capabilities
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import {
  X402VerifyInputSchema,
  X402SettleInputSchema,
  X402InscriptionInputSchema,
  X402StatsInputSchema,
  X402DiscoverInputSchema,
  type X402VerifyInput,
  type X402SettleInput,
  type X402InscriptionInput,
  type X402StatsInput,
  type X402DiscoverInput,
} from '../schemas/x402-inputs.js';

import {
  verifyPayment,
  settlePayment,
  getInscription,
  getStats,
  getDiscovery,
  estimateFees,
} from '../services/x402-client.js';

import { NETWORK_CONFIG, SUPPORTED_ASSETS } from '../types/x402.js';

// ── Register All x402 Tools ────────────────────────────────────────

export function registerX402Tools(server: McpServer): void {
  // Tool: x402_verify
  server.registerTool(
    "x402_verify",
    {
      title: "Verify x402 Payment",
      description: `Verify a payment signature from any supported chain (BSV, Base, Solana, Ethereum).

This is the core x402 verification endpoint. It validates that a payment signature is authentic and the authorization is valid. Optionally inscribes the proof on BSV for permanent notarization.

Args:
  - network (string): Origin chain where payment was signed ('bsv', 'base', 'solana', 'ethereum')
  - payload (object): Payment payload containing signature and authorization
  - inscribe (boolean): Whether to inscribe proof on BSV (default: true)

Returns:
  Verification result with optional inscription ID and fee breakdown.

Use this when:
  - Verifying a payment before granting access to content
  - Creating permanent proof of payment on BSV
  - Validating x402 payment headers from HTTP requests`,
      inputSchema: X402VerifyInputSchema,
      annotations: {
        readOnlyHint: false,  // Can create inscriptions
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      }
    },
    async (params: X402VerifyInput) => {
      try {
        const result = await verifyPayment({
          x402Version: params.x402Version,
          scheme: params.scheme,
          network: params.network,
          payload: params.payload,
          inscribe: params.inscribe,
        });

        const emoji = result.valid ? "✅" : "❌";

        const lines = [
          `## ${emoji} x402 Verification: ${params.network.toUpperCase()}`,
          "",
          `**Valid:** ${result.valid}`,
        ];

        if (!result.valid) {
          lines.push(`**Reason:** ${result.invalidReason}`);
        } else {
          lines.push(`**From:** ${params.payload.authorization.from}`);
          lines.push(`**To:** ${params.payload.authorization.to}`);
          lines.push(`**Amount:** ${params.payload.authorization.value}`);

          if (result.inscriptionId) {
            lines.push("");
            lines.push("### BSV Inscription");
            lines.push(`**Inscription ID:** ${result.inscriptionId}`);
            lines.push(`**Transaction:** ${result.inscriptionTxId}`);
            lines.push(`**Explorer:** https://whatsonchain.com/tx/${result.inscriptionTxId}`);
          }

          if (result.fee) {
            lines.push("");
            lines.push("### Fees");
            lines.push(`**Verification:** ${result.fee.verification} sats`);
            lines.push(`**Inscription:** ${result.fee.inscription} sats`);
            lines.push(`**Total:** ${result.fee.total} sats`);
          }
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }],
          structuredContent: result,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Verification failed: ${msg}` }],
        };
      }
    }
  );

  // Tool: x402_settle
  server.registerTool(
    "x402_settle",
    {
      title: "Settle x402 Payment",
      description: `Settle a payment on any supported chain. Can settle on origin chain or on BSV (cheapest).

The settlement process:
1. Verifies the payment signature
2. Settles the payment (transfer funds)
3. Inscribes proof on BSV (permanent notarization)

PATH402.com routes to the cheapest settlement option by default (BSV).

Args:
  - network (string): Origin chain where payment was signed
  - payload (object): Payment payload with signature and authorization
  - settleOn (string): Chain to settle on (default: 'bsv' - cheapest)
  - paymentRequirements (object): Optional context about the payment

Returns:
  Settlement transaction, inscription ID, and cost comparison.

Use this when:
  - Finalizing a payment after verification
  - Choosing the cheapest settlement route
  - Creating an immutable payment record`,
      inputSchema: X402SettleInputSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      }
    },
    async (params: X402SettleInput) => {
      try {
        const result = await settlePayment({
          x402Version: params.x402Version,
          scheme: params.scheme,
          network: params.network,
          payload: params.payload,
          paymentRequirements: params.paymentRequirements,
          settleOn: params.settleOn,
        });

        const emoji = result.success ? "✅" : "❌";

        const lines = [
          `## ${emoji} x402 Settlement`,
          "",
        ];

        if (!result.success) {
          lines.push(`**Error:** ${result.error}`);
        } else {
          lines.push(`**Status:** Settled`);
          lines.push(`**Origin Chain:** ${params.network}`);
          lines.push(`**Settlement Chain:** ${result.settlementChain || params.settleOn}`);
          lines.push(`**Transaction:** ${result.transaction}`);

          if (result.inscriptionId) {
            lines.push("");
            lines.push("### BSV Inscription");
            lines.push(`**Inscription ID:** ${result.inscriptionId}`);
            lines.push(`**Transaction:** ${result.inscriptionTxId}`);
            lines.push(`**Explorer:** https://whatsonchain.com/tx/${result.inscriptionTxId}`);
          }

          if (result.fee) {
            lines.push("");
            lines.push("### Fees");
            lines.push(`**Settlement:** ${result.fee.settlement} sats`);
            lines.push(`**Inscription:** ${result.fee.inscription} sats`);
            lines.push(`**Total:** ${result.fee.total} sats`);
          }

          if (result.costComparison) {
            lines.push("");
            lines.push("### Cost Comparison");
            lines.push(`| Chain | Fee (sats) |`);
            lines.push(`|-------|------------|`);
            lines.push(`| BSV | ${result.costComparison.bsv} ${result.costComparison.cheapest === 'bsv' ? '← cheapest' : ''} |`);
            lines.push(`| Base | ${result.costComparison.base} ${result.costComparison.cheapest === 'base' ? '← cheapest' : ''} |`);
            lines.push(`| Solana | ${result.costComparison.solana} ${result.costComparison.cheapest === 'solana' ? '← cheapest' : ''} |`);
            lines.push(`| Ethereum | ${result.costComparison.ethereum} ${result.costComparison.cheapest === 'ethereum' ? '← cheapest' : ''} |`);
          }
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }],
          structuredContent: result,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Settlement failed: ${msg}` }],
        };
      }
    }
  );

  // Tool: x402_inscription
  server.registerTool(
    "x402_inscription",
    {
      title: "Get x402 Inscription",
      description: `Retrieve an x402 inscription by ID.

Inscriptions are permanent proofs of x402 payments stored on BSV. They contain:
- Origin chain and transaction
- Payment details (from, to, amount, asset)
- Cryptographic signature
- Timestamp and facilitator info

Args:
  - inscriptionId (string): Inscription ID in format 'txid_vout'

Returns:
  Full inscription proof with explorer link.

Use this when:
  - Verifying a past payment
  - Auditing transaction history
  - Proving payment occurred`,
      inputSchema: X402InscriptionInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      }
    },
    async (params: X402InscriptionInput) => {
      try {
        const result = await getInscription(params.inscriptionId);

        if (!result) {
          return {
            isError: true,
            content: [{ type: "text", text: `Inscription not found: ${params.inscriptionId}` }],
          };
        }

        const lines = [
          `## x402 Inscription: ${params.inscriptionId}`,
          "",
          `**Transaction:** ${result.txId}`,
          `**Block Height:** ${result.blockHeight || 'Pending'}`,
          `**Timestamp:** ${new Date(result.timestamp).toISOString()}`,
          `**Fee:** ${result.fee} sats`,
          "",
          "### Payment Proof",
          `**Protocol:** ${result.proof.p}`,
          `**Version:** ${result.proof.v}`,
          `**Origin Chain:** ${result.proof.origin.chain}`,
          `**Origin TX:** ${result.proof.origin.txId}`,
          "",
          "### Payment Details",
          `**From:** ${result.proof.payment.from}`,
          `**To:** ${result.proof.payment.to}`,
          `**Amount:** ${result.proof.payment.amount}`,
          `**Asset:** ${result.proof.payment.asset}`,
          "",
          `**Explorer:** ${result.explorerUrl}`,
        ];

        return {
          content: [{ type: "text", text: lines.join("\n") }],
          structuredContent: result,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Inscription lookup failed: ${msg}` }],
        };
      }
    }
  );

  // Tool: x402_stats
  server.registerTool(
    "x402_stats",
    {
      title: "x402 Facilitator Stats",
      description: `Get statistics from the PATH402.com x402 facilitator.

Returns:
- Total inscriptions created
- Fees collected
- Inscriptions by origin chain
- Supported networks and their configuration
- Current fee structure

Args:
  - response_format ('markdown' | 'json'): Output format

Use this when:
  - Checking facilitator health
  - Understanding fee structure
  - Viewing cross-chain activity`,
      inputSchema: X402StatsInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      }
    },
    async (params: X402StatsInput) => {
      try {
        const stats = await getStats();

        if (!stats) {
          return {
            isError: true,
            content: [{ type: "text", text: "Failed to fetch facilitator stats" }],
          };
        }

        if (params.response_format === 'json') {
          return {
            content: [{ type: "text", text: JSON.stringify(stats, null, 2) }],
            structuredContent: stats,
          };
        }

        const lines = [
          `## x402 Facilitator: ${stats.facilitator}`,
          "",
          `**Version:** ${stats.version}`,
          `**Status:** ${stats.status}`,
          "",
          "### Statistics",
          `**Total Inscriptions:** ${stats.stats.totalInscriptions}`,
          `**Total Fees Collected:** ${stats.stats.totalFeesCollected} sats`,
          "",
          "### By Origin Chain",
          `| Chain | Inscriptions |`,
          `|-------|--------------|`,
        ];

        for (const [chain, count] of Object.entries(stats.stats.byOriginChain)) {
          lines.push(`| ${chain} | ${count} |`);
        }

        lines.push("");
        lines.push("### Fee Structure");
        lines.push(`**Verification:** ${stats.fees.verification.amount} ${stats.fees.verification.currency}`);
        lines.push(`**Inscription:** ${stats.fees.inscription.amount} ${stats.fees.inscription.currency}`);
        lines.push(`**Settlement:** ${stats.fees.settlement.percent}% (min ${stats.fees.settlement.minimum} ${stats.fees.settlement.currency})`);

        lines.push("");
        lines.push("### Supported Networks");
        for (const network of stats.supportedNetworks) {
          lines.push(`- **${network.name}** (${network.network})${network.chainId ? ` - Chain ID: ${network.chainId}` : ''}`);
        }

        return {
          content: [{ type: "text", text: lines.join("\n") }],
          structuredContent: stats,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Stats fetch failed: ${msg}` }],
        };
      }
    }
  );

  // Tool: x402_discover
  server.registerTool(
    "x402_discover",
    {
      title: "Discover x402 Facilitator",
      description: `Fetch the x402 discovery document from a facilitator.

The discovery document (/.well-known/x402.json) contains everything needed to interact with the facilitator:
- Supported networks and assets
- API endpoints
- Fee structure
- Token information (if applicable)
- Pricing model details

Args:
  - response_format ('markdown' | 'json'): Output format
  - facilitator_url (string): Custom facilitator URL (default: path402.com)

Returns:
  Complete facilitator capabilities and configuration.

Use this when:
  - Integrating with a new x402 facilitator
  - Understanding what a facilitator supports
  - Getting endpoint URLs programmatically`,
      inputSchema: X402DiscoverInputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      }
    },
    async (params: X402DiscoverInput) => {
      try {
        const discovery = await getDiscovery(params.facilitator_url);

        if (!discovery) {
          return {
            isError: true,
            content: [{ type: "text", text: "Failed to fetch discovery document" }],
          };
        }

        if (params.response_format === 'json') {
          return {
            content: [{ type: "text", text: JSON.stringify(discovery, null, 2) }],
            structuredContent: discovery,
          };
        }

        const lines = [
          `## x402 Discovery: ${discovery.facilitator.name}`,
          "",
          `**Description:** ${discovery.facilitator.description}`,
          `**Website:** ${discovery.facilitator.website}`,
          `**Documentation:** ${discovery.facilitator.documentation}`,
          "",
          "### Supported Networks",
          discovery.supportedNetworks.map(n => `- ${n}`).join("\n"),
          "",
          "### Supported Schemes",
          discovery.supportedSchemes.map(s => `- ${s}`).join("\n"),
          "",
          "### Endpoints",
          `- **Verify:** ${discovery.endpoints.verify}`,
          `- **Settle:** ${discovery.endpoints.settle}`,
          `- **Inscription:** ${discovery.endpoints.inscription}`,
          `- **Stats:** ${discovery.endpoints.stats}`,
          "",
          "### Fees",
          `- **Verification:** ${discovery.fees.verification.amount} ${discovery.fees.verification.currency}`,
          `- **Inscription:** ${discovery.fees.inscription.amount} ${discovery.fees.inscription.currency}`,
          `- **Settlement:** ${discovery.fees.settlement.percent}% (min ${discovery.fees.settlement.minimum} ${discovery.fees.settlement.currency})`,
        ];

        if (discovery.token) {
          lines.push("");
          lines.push("### Token");
          lines.push(`- **Symbol:** ${discovery.token.symbol}`);
          lines.push(`- **Name:** ${discovery.token.name}`);
          lines.push(`- **Protocol:** ${discovery.token.protocol}`);
          lines.push(`- **Total Supply:** ${discovery.token.totalSupply.toLocaleString()}`);
          if (discovery.token.marketUrl) {
            lines.push(`- **Market:** ${discovery.token.marketUrl}`);
          }
        }

        if (discovery.pricing) {
          lines.push("");
          lines.push("### Token Pricing");
          lines.push(`- **Model:** ${discovery.pricing.model}`);
          lines.push(`- **Formula:** ${discovery.pricing.formula}`);
          lines.push(`- **Current Price:** ${discovery.pricing.currentPriceSats} sats`);
          lines.push(`- **Treasury Remaining:** ${discovery.pricing.treasuryRemaining.toLocaleString()}`);
        }

        lines.push("");
        lines.push("### Features");
        for (const [feature, enabled] of Object.entries(discovery.features)) {
          lines.push(`- ${feature}: ${enabled ? '✓' : '✗'}`);
        }

        lines.push("");
        lines.push(`**License:** ${discovery.license}`);
        lines.push(`**License URL:** ${discovery.licenseUrl}`);

        return {
          content: [{ type: "text", text: lines.join("\n") }],
          structuredContent: discovery,
        };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [{ type: "text", text: `Discovery failed: ${msg}` }],
        };
      }
    }
  );

  console.error("[x402] Registered 5 x402 tools: verify, settle, inscription, stats, discover");
}
