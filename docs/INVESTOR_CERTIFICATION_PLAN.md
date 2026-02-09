# Investor Certification System Plan

> **Goal**: Enable compliant share sales to self-certified investors without FCA registration, using UK exemptions.

## UK Exemption Framework

### High Net Worth Investor (HNWI)
To qualify, investor must have EITHER:
- Annual income of £250,000 or more, OR
- Net assets of £1,000,000 or more (excluding primary residence and pension)

### Sophisticated Investor
To qualify, investor must EITHER:
- Be a member of a network of business angels for at least 6 months
- Have made 2+ investments in unlisted companies in past 2 years
- Work/have worked in private equity or SME finance
- Be a director of a company with £1m+ turnover

### Self-Certification Requirements
Both exemptions require the investor to sign a statement:
1. Confirming they meet the criteria
2. Acknowledging they may lose all money invested
3. Acknowledging they should seek professional advice
4. Dated and signed

## System Architecture

### Component 1: Investor Certification Tool

**Location**: `/tools/investor-certification`

**Flow**:
1. User selects certification type (HNWI or Sophisticated)
2. User completes self-certification form
3. User reads and accepts risk warnings
4. User signs statement with BSV wallet
5. Certification inscribed on-chain
6. User receives certification token

**Database**:
```sql
CREATE TABLE investor_certifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  certification_type TEXT NOT NULL, -- 'high_net_worth' | 'sophisticated'

  -- High Net Worth details
  income_threshold_met BOOLEAN,
  assets_threshold_met BOOLEAN,

  -- Sophisticated details
  angel_network_member BOOLEAN,
  previous_investments_count INTEGER,
  relevant_work_experience TEXT,
  director_of_qualifying_company BOOLEAN,

  -- Certification
  statement_text TEXT NOT NULL,
  signed_at TIMESTAMP NOT NULL,
  signature_hash TEXT NOT NULL,
  inscription_txid TEXT,
  certification_token_id TEXT,

  -- Validity
  valid_from TIMESTAMP NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMP NOT NULL, -- 12 months from signing
  revoked_at TIMESTAMP,

  -- Audit
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Component 2: FCA-Compliant Statement Text

**High Net Worth Statement**:
```
STATEMENT FOR HIGH NET WORTH INVESTORS

I declare that I am a high net worth investor because at least one of the following applies to me:

[ ] I had an annual income of £250,000 or more in the last financial year
[ ] I had net assets of £1,000,000 or more (excluding my primary residence and pension) in the last financial year

I accept that the investments to which the promotions will relate may expose me to a significant risk of losing all of the money or other assets invested.

I am aware that it is open to me to seek advice from an authorised person who specialises in advising on non-mainstream pooled investments.

Signed: _______________
Date: _______________
Full Name: _______________
```

**Sophisticated Investor Statement**:
```
STATEMENT FOR SELF-CERTIFIED SOPHISTICATED INVESTORS

I declare that I am a self-certified sophisticated investor because at least one of the following applies to me:

[ ] I am a member of a network or syndicate of business angels and have been so for at least six months
[ ] I have made more than one investment in an unlisted company in the two years prior to the date below
[ ] I am working, or have worked in the two years prior to the date below, in a professional capacity in the private equity sector or in the provision of finance for small and medium enterprises
[ ] I am currently, or have been in the two years prior to the date below, a director of a company with an annual turnover of at least £1 million

I accept that the investments to which the promotions will relate may expose me to a significant risk of losing all of the money or other assets invested.

I am aware that it is open to me to seek advice from an authorised person who specialises in advising on non-mainstream pooled investments.

Signed: _______________
Date: _______________
Full Name: _______________
```

### Component 3: On-Chain Inscription

**What gets inscribed**:
```json
{
  "type": "b0ase_investor_certification",
  "version": "1.0",
  "certification_type": "high_net_worth",
  "statement_hash": "sha256_of_signed_statement",
  "signer_address": "user_bsv_address",
  "signature": "bsv_message_signature",
  "valid_from": "2026-01-24T00:00:00Z",
  "valid_until": "2027-01-24T00:00:00Z"
}
```

**Why inscribe**:
- Immutable proof of certification date
- Verifiable by anyone
- Can't be backdated
- Audit trail for regulators

### Component 4: Optional Veriff Integration

**Purpose**: Add document verification layer for higher-value investors

**When required**:
- Investments over £10,000 (configurable threshold)
- User requests additional verification
- Admin requires verification for specific user

**Integration**:
```typescript
// lib/veriff.ts
const VERIFF_API_KEY = process.env.VERIFF_API_KEY;
const VERIFF_WEBHOOK_SECRET = process.env.VERIFF_WEBHOOK_SECRET;

export async function createVeriffSession(userId: string, certificationId: string) {
  const response = await fetch('https://stationapi.veriff.com/v1/sessions', {
    method: 'POST',
    headers: {
      'X-AUTH-CLIENT': VERIFF_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      verification: {
        callback: `https://b0ase.com/api/veriff/webhook`,
        person: {
          firstName: '', // Filled by Veriff
          lastName: ''
        },
        vendorData: certificationId // Link back to our certification
      }
    })
  });

  return response.json();
}
```

**Webhook handler**:
```typescript
// app/api/veriff/webhook/route.ts
export async function POST(request: Request) {
  const signature = request.headers.get('x-hmac-signature');
  const body = await request.text();

  // Verify webhook signature
  if (!verifyVeriffSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const certificationId = event.verification.vendorData;

  if (event.verification.status === 'approved') {
    await supabase
      .from('investor_certifications')
      .update({
        veriff_status: 'approved',
        veriff_verified_at: new Date()
      })
      .eq('id', certificationId);
  }

  return NextResponse.json({ received: true });
}
```

### Component 5: Share Purchase Gate

**Check before purchase**:
```typescript
async function canPurchaseShares(userId: string, amount: number): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  // 1. Check for valid certification
  const certification = await getCertification(userId);

  if (!certification) {
    return { allowed: false, reason: 'No investor certification found' };
  }

  if (certification.valid_until < new Date()) {
    return { allowed: false, reason: 'Certification expired - please recertify' };
  }

  if (certification.revoked_at) {
    return { allowed: false, reason: 'Certification revoked' };
  }

  // 2. Check Veriff status for high-value purchases
  if (amount > 10000 && certification.veriff_status !== 'approved') {
    return { allowed: false, reason: 'Veriff verification required for purchases over £10,000' };
  }

  // 3. Check wallet setup
  const wallet = await getMultisigWallet(userId);

  if (!wallet) {
    return { allowed: false, reason: 'Please set up your 2-of-3 wallet first' };
  }

  return { allowed: true };
}
```

## Implementation Phases

### Phase 1: Self-Certification Tool (1 week)
- Build `/tools/investor-certification` page
- Create database table
- Implement BSV signing
- On-chain inscription
- Basic admin view

### Phase 2: Integration with Share Purchases (1 week)
- Add certification check to purchase flow
- Link certification to cap_table_shareholders
- Implement expiry/renewal reminders
- Add to investor dashboard

### Phase 3: Optional Veriff Integration (1 week)
- Veriff API integration
- Webhook handler
- Threshold configuration
- Admin override capability

### Phase 4: Compliance Reporting (ongoing)
- Export certifications for audit
- Track purchase patterns
- Geographic distribution reports
- Exemption usage tracking

## Cost Analysis

| Item | Cost | Notes |
|------|------|-------|
| Self-certification | ~$0.01 | BSV inscription only |
| Veriff verification | ~£1.50 | Per verification |
| Infrastructure | $0 | Uses existing BSV/Supabase |
| Ongoing compliance | $0 | Self-service, automated |

**Break-even**: Even with Veriff on every investor, cost is trivial vs traditional compliance.

## Risk Mitigation

### Risk: Investor lies on self-certification
**Mitigation**:
- Clear statement that false certification is fraud
- On-chain record of what they claimed
- We relied on their certification in good faith

### Risk: FCA challenges our exemption use
**Mitigation**:
- Complete audit trail
- FCA-compliant statement wording
- Proper risk warnings
- Small offers + restricted persons exemptions as backup

### Risk: Investor loses money and complains
**Mitigation**:
- Multiple risk warnings
- Clear "may lose everything" language
- Record of all warnings shown
- Investor signed acknowledgment

## Open Questions

1. Should certification expire after 12 months? (FCA guidance suggests yes)
2. Should we require re-certification before each purchase? (Conservative approach)
3. At what threshold should Veriff be mandatory? (£10k? £50k? Never?)
4. Should we limit total raised per investor? (Concentration risk)
5. Should we geo-block non-UK investors? (Simpler compliance)

## Files to Create

```
app/tools/investor-certification/
  page.tsx                    # Main certification UI
  components/
    CertificationForm.tsx     # Form component
    SignatureCapture.tsx      # BSV signing
    RiskWarnings.tsx          # FCA-compliant warnings

app/api/certifications/
  route.ts                    # Create certification
  [id]/route.ts               # Get/update certification
  verify/route.ts             # Admin verification

app/api/veriff/
  create-session/route.ts     # Start Veriff flow
  webhook/route.ts            # Handle Veriff callbacks

lib/
  certification.ts            # Certification utilities
  veriff.ts                   # Veriff API client
```

## Database Migrations

```sql
-- Add to existing schema
ALTER TABLE cap_table_shareholders
ADD COLUMN certification_id UUID REFERENCES investor_certifications(id),
ADD COLUMN certification_type TEXT,
ADD COLUMN certified_at TIMESTAMP;

-- Add index for expiry checks
CREATE INDEX idx_cert_valid_until ON investor_certifications(valid_until);
CREATE INDEX idx_cert_user ON investor_certifications(user_id);
```

---

*This plan enables compliant share sales using UK exemptions without FCA registration. The on-chain certification provides audit trail. Optional Veriff adds document verification for high-value purchases. All achieved with minimal cost and existing infrastructure.*
