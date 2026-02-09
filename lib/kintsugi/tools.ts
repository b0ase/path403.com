/**
 * Kintsugi Tool Definitions
 *
 * Tools for the Kimi K2.5 agent to interact with the Kintsugi system:
 * - Contract management
 * - Milestone tracking
 * - Payment processing
 * - Escrow operations
 */

import { KimiTool } from './kimi-client'

/**
 * Contract Tools
 */
export const contractTools: KimiTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_contract',
      description: 'Create a new contract between founder, developer, and optionally investor. Returns a contract ID for tracking.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the contract/project'
          },
          description: {
            type: 'string',
            description: 'Detailed description of the work to be done'
          },
          founder_id: {
            type: 'string',
            description: 'User ID of the founder proposing the project'
          },
          developer_id: {
            type: 'string',
            description: 'User ID of the developer accepting the work (optional at creation)'
          },
          investor_id: {
            type: 'string',
            description: 'User ID of the investor funding the project (optional)'
          },
          total_value_usd: {
            type: 'number',
            description: 'Total contract value in USD'
          },
          equity_percentage: {
            type: 'number',
            description: 'Equity offered to developer (0-100)'
          },
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                value_usd: { type: 'number' },
                due_days: { type: 'number' }
              }
            },
            description: 'List of milestones with values and deadlines'
          }
        },
        required: ['title', 'description', 'founder_id', 'total_value_usd']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_contract',
      description: 'Retrieve contract details by ID',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'The contract ID to retrieve'
          }
        },
        required: ['contract_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'sign_contract',
      description: 'Sign a contract as a party (founder, developer, or investor)',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'The contract ID to sign'
          },
          user_id: {
            type: 'string',
            description: 'User ID of the signer'
          },
          role: {
            type: 'string',
            enum: ['founder', 'developer', 'investor'],
            description: 'Role of the signer'
          },
          signature_data: {
            type: 'string',
            description: 'Cryptographic signature or agreement hash'
          }
        },
        required: ['contract_id', 'user_id', 'role']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'list_contracts',
      description: 'List contracts for a user, optionally filtered by status',
      parameters: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            description: 'User ID to list contracts for'
          },
          status: {
            type: 'string',
            enum: ['draft', 'pending_signatures', 'active', 'completed', 'disputed', 'cancelled'],
            description: 'Filter by contract status'
          },
          role: {
            type: 'string',
            enum: ['founder', 'developer', 'investor', 'any'],
            description: 'Filter by user role in contract'
          }
        },
        required: ['user_id']
      }
    }
  }
]

/**
 * Milestone Tools
 */
export const milestoneTools: KimiTool[] = [
  {
    type: 'function',
    function: {
      name: 'submit_milestone',
      description: 'Submit a milestone for review. Developer marks work as complete.',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID containing the milestone'
          },
          milestone_id: {
            type: 'string',
            description: 'Milestone ID being submitted'
          },
          deliverables: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of deliverable URLs/references (GitHub PRs, commits, etc.)'
          },
          notes: {
            type: 'string',
            description: 'Developer notes about the submission'
          }
        },
        required: ['contract_id', 'milestone_id', 'deliverables']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'approve_milestone',
      description: 'Approve a submitted milestone. Founder or investor approves delivery.',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID'
          },
          milestone_id: {
            type: 'string',
            description: 'Milestone ID to approve'
          },
          approver_id: {
            type: 'string',
            description: 'User ID of the approver'
          },
          feedback: {
            type: 'string',
            description: 'Optional feedback on the delivery'
          }
        },
        required: ['contract_id', 'milestone_id', 'approver_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'reject_milestone',
      description: 'Reject a submitted milestone with feedback for revision.',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID'
          },
          milestone_id: {
            type: 'string',
            description: 'Milestone ID to reject'
          },
          rejector_id: {
            type: 'string',
            description: 'User ID of the rejector'
          },
          reason: {
            type: 'string',
            description: 'Detailed reason for rejection'
          },
          required_changes: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specific changes required'
          }
        },
        required: ['contract_id', 'milestone_id', 'rejector_id', 'reason']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_milestone_status',
      description: 'Get current status of all milestones in a contract',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID to check'
          }
        },
        required: ['contract_id']
      }
    }
  }
]

/**
 * Payment & Escrow Tools
 */
export const paymentTools: KimiTool[] = [
  {
    type: 'function',
    function: {
      name: 'fund_escrow',
      description: 'Fund escrow for a contract. Investor or founder deposits funds.',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID to fund'
          },
          funder_id: {
            type: 'string',
            description: 'User ID of the funder'
          },
          amount_usd: {
            type: 'number',
            description: 'Amount in USD to deposit'
          },
          payment_method: {
            type: 'string',
            enum: ['stripe', 'paypal', 'bsv', 'eth', 'sol'],
            description: 'Payment method'
          }
        },
        required: ['contract_id', 'funder_id', 'amount_usd', 'payment_method']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'release_payment',
      description: 'Release payment from escrow for approved milestone',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID'
          },
          milestone_id: {
            type: 'string',
            description: 'Approved milestone ID'
          },
          recipient_id: {
            type: 'string',
            description: 'Developer user ID receiving payment'
          }
        },
        required: ['contract_id', 'milestone_id', 'recipient_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_escrow_balance',
      description: 'Get current escrow balance for a contract',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID to check'
          }
        },
        required: ['contract_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'request_refund',
      description: 'Request refund from escrow (initiates dispute if contested)',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID'
          },
          requester_id: {
            type: 'string',
            description: 'User ID requesting refund'
          },
          reason: {
            type: 'string',
            description: 'Reason for refund request'
          },
          amount_usd: {
            type: 'number',
            description: 'Amount to refund (partial or full)'
          }
        },
        required: ['contract_id', 'requester_id', 'reason']
      }
    }
  }
]

/**
 * Dispute Resolution Tools
 */
export const disputeTools: KimiTool[] = [
  {
    type: 'function',
    function: {
      name: 'raise_dispute',
      description: 'Raise a formal dispute on a contract',
      parameters: {
        type: 'object',
        properties: {
          contract_id: {
            type: 'string',
            description: 'Contract ID'
          },
          disputer_id: {
            type: 'string',
            description: 'User ID raising the dispute'
          },
          dispute_type: {
            type: 'string',
            enum: ['quality', 'timeline', 'scope', 'payment', 'communication', 'other'],
            description: 'Type of dispute'
          },
          description: {
            type: 'string',
            description: 'Detailed description of the dispute'
          },
          evidence: {
            type: 'array',
            items: { type: 'string' },
            description: 'URLs to evidence (messages, commits, screenshots)'
          }
        },
        required: ['contract_id', 'disputer_id', 'dispute_type', 'description']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'respond_to_dispute',
      description: 'Submit response to a dispute',
      parameters: {
        type: 'object',
        properties: {
          dispute_id: {
            type: 'string',
            description: 'Dispute ID'
          },
          responder_id: {
            type: 'string',
            description: 'User ID responding'
          },
          response: {
            type: 'string',
            description: 'Response to the dispute'
          },
          counter_evidence: {
            type: 'array',
            items: { type: 'string' },
            description: 'URLs to counter-evidence'
          },
          proposed_resolution: {
            type: 'string',
            description: 'Proposed resolution'
          }
        },
        required: ['dispute_id', 'responder_id', 'response']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'resolve_dispute',
      description: 'AI-mediated dispute resolution (requires both parties consent or timeout)',
      parameters: {
        type: 'object',
        properties: {
          dispute_id: {
            type: 'string',
            description: 'Dispute ID'
          },
          resolution_type: {
            type: 'string',
            enum: ['mutual_agreement', 'mediated', 'timeout_default'],
            description: 'How the resolution was reached'
          },
          outcome: {
            type: 'object',
            properties: {
              refund_percentage: { type: 'number' },
              continue_contract: { type: 'boolean' },
              notes: { type: 'string' }
            },
            description: 'Resolution outcome'
          }
        },
        required: ['dispute_id', 'resolution_type', 'outcome']
      }
    }
  }
]

/**
 * Negotiation Tools
 */
export const negotiationTools: KimiTool[] = [
  {
    type: 'function',
    function: {
      name: 'propose_terms',
      description: 'Propose contract terms during negotiation',
      parameters: {
        type: 'object',
        properties: {
          negotiation_id: {
            type: 'string',
            description: 'Ongoing negotiation ID'
          },
          proposer_id: {
            type: 'string',
            description: 'User ID making the proposal'
          },
          terms: {
            type: 'object',
            properties: {
              total_value_usd: { type: 'number' },
              equity_percentage: { type: 'number' },
              timeline_days: { type: 'number' },
              payment_schedule: { type: 'string' },
              scope_changes: { type: 'string' }
            },
            description: 'Proposed terms'
          },
          rationale: {
            type: 'string',
            description: 'Explanation for the proposed terms'
          }
        },
        required: ['negotiation_id', 'proposer_id', 'terms']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'accept_terms',
      description: 'Accept proposed terms',
      parameters: {
        type: 'object',
        properties: {
          negotiation_id: {
            type: 'string',
            description: 'Negotiation ID'
          },
          accepter_id: {
            type: 'string',
            description: 'User ID accepting'
          }
        },
        required: ['negotiation_id', 'accepter_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'counter_terms',
      description: 'Counter-propose modified terms',
      parameters: {
        type: 'object',
        properties: {
          negotiation_id: {
            type: 'string',
            description: 'Negotiation ID'
          },
          proposer_id: {
            type: 'string',
            description: 'User ID counter-proposing'
          },
          counter_terms: {
            type: 'object',
            properties: {
              total_value_usd: { type: 'number' },
              equity_percentage: { type: 'number' },
              timeline_days: { type: 'number' },
              payment_schedule: { type: 'string' },
              scope_changes: { type: 'string' }
            },
            description: 'Counter-proposed terms'
          },
          rationale: {
            type: 'string',
            description: 'Explanation for counter-proposal'
          }
        },
        required: ['negotiation_id', 'proposer_id', 'counter_terms']
      }
    }
  }
]

/**
 * Exchange Matching Tools
 */
export const exchangeTools: KimiTool[] = [
  {
    type: 'function',
    function: {
      name: 'match_exchange_orders',
      description: 'Find and execute matching buy/sell orders for a token. Uses price-time priority algorithm.',
      parameters: {
        type: 'object',
        properties: {
          token_id: {
            type: 'string',
            description: 'BSV-20 token ID to match orders for'
          },
          max_matches: {
            type: 'number',
            description: 'Maximum number of matches to execute (default: 10)'
          }
        },
        required: ['token_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'execute_trade',
      description: 'Execute a specific trade between matched buy and sell orders',
      parameters: {
        type: 'object',
        properties: {
          buy_order_id: {
            type: 'string',
            description: 'UUID of the buy order'
          },
          sell_order_id: {
            type: 'string',
            description: 'UUID of the sell order'
          },
          amount: {
            type: 'number',
            description: 'Amount of tokens to trade'
          }
        },
        required: ['buy_order_id', 'sell_order_id', 'amount']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_order_book',
      description: 'Get the current order book for a token showing aggregated bids and asks',
      parameters: {
        type: 'object',
        properties: {
          token_id: {
            type: 'string',
            description: 'BSV-20 token ID'
          }
        },
        required: ['token_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_exchange_trades',
      description: 'Get recent trades for a token',
      parameters: {
        type: 'object',
        properties: {
          token_id: {
            type: 'string',
            description: 'BSV-20 token ID'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of trades to return (default: 20)'
          }
        },
        required: ['token_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'process_match_queue',
      description: 'Process pending orders in the match queue for a token',
      parameters: {
        type: 'object',
        properties: {
          token_id: {
            type: 'string',
            description: 'BSV-20 token ID to process queue for'
          }
        },
        required: ['token_id']
      }
    }
  }
]

/**
 * All Kintsugi tools combined
 */
export const allKintsugiTools: KimiTool[] = [
  ...contractTools,
  ...milestoneTools,
  ...paymentTools,
  ...disputeTools,
  ...negotiationTools,
  ...exchangeTools
]

/**
 * Tool categories for selective loading
 */
export const toolCategories = {
  contract: contractTools,
  milestone: milestoneTools,
  payment: paymentTools,
  dispute: disputeTools,
  negotiation: negotiationTools,
  exchange: exchangeTools,
  all: allKintsugiTools
}
