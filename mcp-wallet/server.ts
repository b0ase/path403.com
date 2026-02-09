#!/usr/bin/env npx ts-node
/**
 * b0ase MetaWeb Wallet MCP Server
 *
 * Provides wallet tools for AI agents to interact with the MetaWeb.
 *
 * Tools:
 * - resolve_address: Get price/supply info for a $ address
 * - check_balance: Check HandCash wallet balance
 * - pay: Pay for content and receive token
 * - get_tokens: List owned tokens
 * - get_content: Fetch content you own
 *
 * Usage:
 *   npx ts-node mcp-wallet/server.ts
 *
 * Configure in Claude Desktop:
 *   {
 *     "mcpServers": {
 *       "b0ase-wallet": {
 *         "command": "npx",
 *         "args": ["ts-node", "/path/to/b0ase.com/mcp-wallet/server.ts"],
 *         "env": {
 *           "HANDCASH_AUTH_TOKEN": "your-token"
 *         }
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const B0ASE_API_URL = process.env.B0ASE_API_URL || 'https://b0ase.com';
const HANDCASH_AUTH_TOKEN = process.env.HANDCASH_AUTH_TOKEN;

// Create MCP server
const server = new Server(
  {
    name: 'b0ase-wallet',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'resolve_address',
        description: 'Resolve a MetaWeb $ address to get its price, supply, and payment info. Use this before paying to understand the cost.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'The $ address to resolve, e.g., "$BOASE" or "$b0ase.com/blog/article-slug"',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'check_balance',
        description: 'Check your HandCash wallet balance. Returns available balance in USD and satoshis.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'pay',
        description: 'Pay for a MetaWeb token and receive access. Returns an access JWT and token info.',
        inputSchema: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
              description: 'The $ address to pay for, e.g., "$BOASE" or "$b0ase.com/blog/article-slug"',
            },
          },
          required: ['address'],
        },
      },
      {
        name: 'get_tokens',
        description: 'List all MetaWeb tokens you own on b0ase.com.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_content',
        description: 'Fetch content for a token you own. Returns the actual content.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The content path, e.g., "/blog/article-slug"',
            },
            access_jwt: {
              type: 'string',
              description: 'The access JWT from a previous pay operation',
            },
          },
          required: ['path'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'resolve_address': {
        const address = (args as any).address;
        if (!address) {
          return { content: [{ type: 'text', text: 'Error: address is required' }] };
        }

        // Call resolve API
        const resolveUrl = `${B0ASE_API_URL}/api/resolve/${encodeURIComponent(address)}`;
        const response = await fetch(resolveUrl);
        const data = await response.json();

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Error resolving address: ${data.error || 'Unknown error'}` }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'check_balance': {
        if (!HANDCASH_AUTH_TOKEN) {
          return {
            content: [{ type: 'text', text: 'Error: HANDCASH_AUTH_TOKEN not configured' }],
          };
        }

        // Call HandCash balance API via b0ase proxy
        const response = await fetch(`${B0ASE_API_URL}/api/wallet/balance`, {
          headers: {
            'Authorization': `Bearer ${HANDCASH_AUTH_TOKEN}`,
          },
        });

        if (!response.ok) {
          // Try direct HandCash if proxy not available
          return {
            content: [
              {
                type: 'text',
                text: 'Balance check requires HandCash integration. Use HandCash app to check balance.',
              },
            ],
          };
        }

        const data = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'pay': {
        const address = (args as any).address;
        if (!address) {
          return { content: [{ type: 'text', text: 'Error: address is required' }] };
        }

        if (!HANDCASH_AUTH_TOKEN) {
          return {
            content: [{ type: 'text', text: 'Error: HANDCASH_AUTH_TOKEN not configured. Set it in environment.' }],
          };
        }

        // Call pay API
        const response = await fetch(`${B0ASE_API_URL}/api/metaweb/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token_address: address,
            payment_method: 'handcash',
            payment_proof: {
              auth_token: HANDCASH_AUTH_TOKEN,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          return {
            content: [
              {
                type: 'text',
                text: `Payment failed: ${data.error || 'Unknown error'}\nCode: ${data.code || 'UNKNOWN'}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `Payment successful!\n\n${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'get_tokens': {
        if (!HANDCASH_AUTH_TOKEN) {
          return {
            content: [{ type: 'text', text: 'Error: HANDCASH_AUTH_TOKEN not configured' }],
          };
        }

        // Call tokens API
        const response = await fetch(`${B0ASE_API_URL}/api/user/tokens`, {
          headers: {
            'Cookie': `b0ase_handcash_token=${HANDCASH_AUTH_TOKEN}`,
          },
        });

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: 'Failed to fetch tokens. Ensure you are authenticated.' }],
          };
        }

        const data = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }

      case 'get_content': {
        const path = (args as any).path;
        const accessJwt = (args as any).access_jwt;

        if (!path) {
          return { content: [{ type: 'text', text: 'Error: path is required' }] };
        }

        // Fetch content with access token
        const headers: Record<string, string> = {
          'Accept': 'application/json',
          'X-MetaWeb-Client': 'mcp-wallet/1.0',
        };

        if (accessJwt) {
          headers['Cookie'] = `b0ase_token_access=${accessJwt}`;
        }

        const response = await fetch(`${B0ASE_API_URL}${path}`, { headers });

        if (response.status === 402) {
          const data = await response.json();
          return {
            content: [
              {
                type: 'text',
                text: `Payment required for this content.\nAddress: ${data.token_address}\nPrice: ${data.price_sats} sats\n\nUse the 'pay' tool first.`,
              },
            ],
          };
        }

        if (!response.ok) {
          return {
            content: [{ type: 'text', text: `Failed to fetch content: ${response.status}` }],
          };
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          return {
            content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
          };
        }

        const text = await response.text();
        return {
          content: [{ type: 'text', text: text.slice(0, 10000) }], // Limit content size
        };
      }

      default:
        return {
          content: [{ type: 'text', text: `Unknown tool: ${name}` }],
        };
    }
  } catch (error: any) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('b0ase MetaWeb Wallet MCP server running');
}

main().catch(console.error);
