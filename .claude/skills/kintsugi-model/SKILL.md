# Kintsugi Model Selection

Switch the AI provider for Kintsugi chat sessions.

## Usage

```
/kintsugi-model [provider]
```

### Available Providers

| Provider | Model | Description | Pricing |
|----------|-------|-------------|---------|
| `anthropic` | Claude 3.5 Sonnet | Best quality, complex reasoning | $3/M in, $15/M out |
| `kimi` | Moonshot K2.5 | 1T params, excellent value | $0.50/M in, $2.80/M out |
| `gemini` | Gemini Pro/Flash | Free tier available | Free, then $0.35/M |
| `deepseek` | Deepseek Chat | Very cheap, good for Chinese | $0.14/M in, $0.28/M out |
| `openai` | GPT-4o-mini | Fast, reliable fallback | $0.15/M in, $0.60/M out |

### Examples

```bash
# Set Claude as primary (default, best quality)
/kintsugi-model anthropic

# Use Kimi for cost savings (25x cheaper)
/kintsugi-model kimi

# Check current provider
/kintsugi-model
```

## How It Works

1. Sets a `kintsugi-provider` cookie (30 day expiry)
2. The `/api/kintsugi/chat` endpoint reads this cookie
3. Tries your preferred provider first, then falls back to others

## API Endpoint

```bash
# Get current provider
curl https://b0ase.com/api/kintsugi/model

# Set provider
curl -X POST https://b0ase.com/api/kintsugi/model \
  -H "Content-Type: application/json" \
  -d '{"provider": "anthropic"}'
```

## Cost Comparison

For 1M tokens:
- **Anthropic**: ~$9.00 (best quality)
- **Kimi**: ~$1.65 (25x cheaper, very good)
- **Gemini**: ~$0.35 (free tier first)
- **Deepseek**: ~$0.21 (cheapest)
- **OpenAI**: ~$0.37 (reliable)

**Recommendation**: Start with `anthropic` for quality, switch to `kimi` for volume.
