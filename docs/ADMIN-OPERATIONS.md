# Admin Operations

Quick reference for common admin tasks.

## AI Executive Suite

Enable/disable AI Executive (Claude, OpenAI, Gemini connections) for users.

### Via API (Recommended)

**Enable for a user:**
```bash
curl -X POST https://b0ase.com/api/admin/ai-executive \
  -H "Content-Type: application/json" \
  -H "Cookie: <your-admin-session-cookie>" \
  -d '{"email": "user@example.com", "enabled": true}'
```

**Disable for a user:**
```bash
curl -X POST https://b0ase.com/api/admin/ai-executive \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "enabled": false}'
```

**Check status:**
```bash
curl "https://b0ase.com/api/admin/ai-executive?email=user@example.com"
```

**List all AI Executive users:**
```bash
curl "https://b0ase.com/api/admin/ai-executive"
```

### Via Supabase SQL (Direct)

```sql
-- Enable for specific user
UPDATE unified_users
SET ai_executive_enabled = true, updated_at = NOW()
WHERE primary_email = 'user@example.com';

-- Enable by user ID
UPDATE unified_users
SET ai_executive_enabled = true, updated_at = NOW()
WHERE id = 'uuid-here';

-- List all AI Executive users
SELECT id, display_name, primary_email, created_at
FROM unified_users
WHERE ai_executive_enabled = true;

-- Disable for a user
UPDATE unified_users
SET ai_executive_enabled = false, updated_at = NOW()
WHERE primary_email = 'user@example.com';
```

## Pricing

- AI Executive Suite: +£150/month on any automation tier
- Users bring their own API keys (BYOK model)
- Revenue is from orchestration layer, not API usage

## Environment Variables

Required for API key encryption:
```
API_KEY_ENCRYPTION_SECRET=<64-char-hex-key>
```

Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
