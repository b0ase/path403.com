# b0ase MetaWeb Wallet MCP Server

An MCP (Model Context Protocol) server that provides wallet tools for AI agents to interact with the MetaWeb.

## Tools

| Tool | Description |
|------|-------------|
| `resolve_address` | Get price, supply, and payment info for any `$` address |
| `check_balance` | Check your HandCash wallet balance |
| `pay` | Pay for a MetaWeb token and receive access |
| `get_tokens` | List all MetaWeb tokens you own |
| `get_content` | Fetch content for a token you own |

## Setup

### 1. Install dependencies

```bash
cd mcp-wallet
pnpm install
```

### 2. Configure Claude Desktop

Add to `~/.config/claude/claude_desktop_config.json` (or macOS equivalent):

```json
{
  "mcpServers": {
    "b0ase-wallet": {
      "command": "npx",
      "args": ["ts-node", "/path/to/b0ase.com/mcp-wallet/server.ts"],
      "env": {
        "HANDCASH_AUTH_TOKEN": "your-handcash-auth-token",
        "B0ASE_API_URL": "https://b0ase.com"
      }
    }
  }
}
```

### 3. Get HandCash Auth Token

1. Visit https://b0ase.com/paywall
2. Connect your HandCash wallet
3. Check browser cookies for `b0ase_handcash_token`
4. Use that value as `HANDCASH_AUTH_TOKEN`

## Usage Examples

### Resolve a token address

```
Agent: Use resolve_address to check the price of $b0ase.com/blog/metaweb-first-native-consumer
```

### Pay for content

```
Agent: Use pay to purchase $b0ase.com/blog/metaweb-first-native-consumer
```

### Fetch owned content

```
Agent: Use get_content to read /blog/metaweb-first-native-consumer
```

## How It Works

1. **Resolve**: Agent discovers a `$` address and calls `resolve_address` to get pricing
2. **Evaluate**: Agent checks if price is within budget (using `check_balance`)
3. **Pay**: Agent calls `pay` with the address, receives access JWT
4. **Access**: Agent can now fetch content with `get_content`

This implements the MetaWeb protocol where AI agents can autonomously pay for and access content at machine speed.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HANDCASH_AUTH_TOKEN` | Your HandCash auth token | Required |
| `B0ASE_API_URL` | b0ase.com API base URL | `https://b0ase.com` |

## API Endpoints Used

- `GET /api/resolve/{address}` - Resolve `$` addresses
- `POST /api/metaweb/pay` - Process payments
- `GET /api/user/tokens` - List owned tokens

## License

MIT
