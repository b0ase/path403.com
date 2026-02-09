/**
 * x402 Input Schemas
 *
 * Zod validation schemas for x402 MCP tools.
 * These define the input parameters for each x402_* tool.
 */

import { z } from 'zod';

// ── Shared Schemas ─────────────────────────────────────────────────

const SupportedNetworkSchema = z.enum(['bsv', 'base', 'solana', 'ethereum']);

const PaymentSchemeSchema = z.enum(['exact', 'upto']);

const PaymentAuthorizationSchema = z.object({
  from: z.string().min(1, 'Payer address required'),
  to: z.string().min(1, 'Recipient address required'),
  value: z.string().min(1, 'Payment value required'),
  validAfter: z.string(),
  validBefore: z.string(),
  nonce: z.string().min(1, 'Nonce required for replay protection'),
});

const PaymentPayloadSchema = z.object({
  signature: z.string().min(1, 'Signature required'),
  authorization: PaymentAuthorizationSchema,
});

// ── x402_verify Input ──────────────────────────────────────────────

export const X402VerifyInputSchema = z.object({
  x402Version: z.number().int().positive().default(1),
  scheme: PaymentSchemeSchema.default('exact'),
  network: SupportedNetworkSchema.describe(
    'Origin network where payment was signed (bsv, base, solana, ethereum)'
  ),
  payload: PaymentPayloadSchema.describe(
    'Payment payload containing signature and authorization'
  ),
  inscribe: z.boolean().default(true).describe(
    'Whether to inscribe verification proof on BSV (default: true)'
  ),
});

export type X402VerifyInput = z.infer<typeof X402VerifyInputSchema>;

// ── x402_settle Input ──────────────────────────────────────────────

export const X402SettleInputSchema = z.object({
  x402Version: z.number().int().positive().default(1),
  scheme: PaymentSchemeSchema.default('exact'),
  network: SupportedNetworkSchema.describe(
    'Origin network where payment was signed'
  ),
  payload: PaymentPayloadSchema.describe(
    'Payment payload containing signature and authorization'
  ),
  paymentRequirements: z.object({
    asset: z.string().optional().describe('Payment asset (e.g., USDC, ETH)'),
    maxAmountRequired: z.string().optional(),
    resource: z.string().optional().describe('Resource being paid for'),
  }).optional().describe('Optional payment requirements context'),
  settleOn: SupportedNetworkSchema.default('bsv').describe(
    'Chain to settle on (default: bsv - cheapest option)'
  ),
});

export type X402SettleInput = z.infer<typeof X402SettleInputSchema>;

// ── x402_inscription Input ─────────────────────────────────────────

export const X402InscriptionInputSchema = z.object({
  inscriptionId: z.string().min(1).describe(
    'Inscription ID to retrieve (format: txid_vout)'
  ),
});

export type X402InscriptionInput = z.infer<typeof X402InscriptionInputSchema>;

// ── x402_stats Input ───────────────────────────────────────────────

export const X402StatsInputSchema = z.object({
  response_format: z.enum(['markdown', 'json']).default('markdown').describe(
    'Output format (markdown for human-readable, json for structured)'
  ),
});

export type X402StatsInput = z.infer<typeof X402StatsInputSchema>;

// ── x402_discover Input ────────────────────────────────────────────

export const X402DiscoverInputSchema = z.object({
  response_format: z.enum(['markdown', 'json']).default('markdown').describe(
    'Output format (markdown for human-readable, json for structured)'
  ),
  facilitator_url: z.string().url().optional().describe(
    'Custom facilitator URL (default: https://path402.com)'
  ),
});

export type X402DiscoverInput = z.infer<typeof X402DiscoverInputSchema>;

// ── x402_compare_fees Input ────────────────────────────────────────

export const X402CompareFeesInputSchema = z.object({
  amount: z.number().positive().describe(
    'Payment amount in satoshis to compare fees for'
  ),
  response_format: z.enum(['markdown', 'json']).default('markdown'),
});

export type X402CompareFeesInput = z.infer<typeof X402CompareFeesInputSchema>;

// ── Export all schemas for tool registration ───────────────────────

export const x402Schemas = {
  verify: X402VerifyInputSchema,
  settle: X402SettleInputSchema,
  inscription: X402InscriptionInputSchema,
  stats: X402StatsInputSchema,
  discover: X402DiscoverInputSchema,
  compareFees: X402CompareFeesInputSchema,
} as const;
