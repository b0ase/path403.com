# $bWriter Staking User Guide

**Version**: 1.0
**Updated**: 2026-01-26
**Status**: Complete and Ready

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [How Staking Works](#how-staking-works)
3. [Step-by-Step Staking](#step-by-step-staking)
4. [Understanding Dividends](#understanding-dividends)
5. [Managing Your Stake](#managing-your-stake)
6. [Tax & Compliance](#tax--compliance)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Getting Started

### What You Need

1. **$bWriter Tokens**: Earned from platform usage or purchased
2. **KYC Verification**: Identity verification (required by UK law)
3. **BSV Wallet**: Where dividend payments will be sent
4. **Internet Connection**: To access the staking dashboard

### Creating an Account

1. Visit [b0ase.com](https://b0ase.com) or [Bitcoin Writer](https://bitcoin-writer.com)
2. Click "Sign In" or "Create Account"
3. Choose your authentication method (email, Google, or wallet)
4. Complete your profile

---

## How Staking Works

### The Concept

Staking means locking your $bWriter tokens to earn a share of platform revenue.

**Simple Version:**
- You lock up tokens
- Platform generates revenue
- Revenue is split: 75% to stakers, 25% platform fee
- You get your proportional share

**Example:**
- Total staked: 100 million tokens
- You stake: 1 million tokens (1% of total)
- Monthly revenue: 10 million satoshis
- Dividend pool: 7.5 million satoshis (75%)
- Your dividend: 75,000 satoshis (1% of pool)

### Timeline

```
Day 1: You stake 1M tokens
  ↓
Within 24 hours: Deposit confirms on blockchain
  ↓
Your tokens locked, dividends start accumulating
  ↓
Daily at midnight UTC: Dividend distribution calculated
  ↓
Your share sent to BSV wallet automatically
```

### Key Principles

- **No Minimum**: Stake any amount
- **No Lockup Period**: Unstake anytime (accumulated dividends preserved)
- **Automatic Distribution**: Dividends sent to your address daily
- **Transparent**: View all transactions in cap table
- **Secure**: Tokens held in multisig address you can verify

---

## Step-by-Step Staking

### Step 1: Complete KYC Verification

Before staking, you must verify your identity.

**Why KYC?**
- UK financial regulations
- Protect your dividends legally
- Prevent fraud and money laundering

**How:**
1. Go to [dashboard](/bwriter/dashboard)
2. Click "Complete KYC"
3. Upload:
   - Government-issued ID (passport/license)
   - Proof of address (utility bill/bank statement)
4. Wait for manual review (typically 1-2 hours)
5. You'll receive email confirmation

### Step 2: Set BSV Withdrawal Address

This is where your dividend payments will be sent.

**How:**
1. Go to [dashboard](/bwriter/dashboard)
2. Find "Dividend Withdrawal Address"
3. Enter your BSV address (starts with 1 or 3)
4. Verify format: `1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2`
5. Click "Save Address"

**BSV Address Help:**
- Use a wallet you control (e.g., HandCash, Electrum, CoinSpark)
- Do NOT use exchange addresses (you won't receive dividends)
- Safe to use the same address for multiple payments

### Step 3: Request to Stake

**How:**
1. Go to [dashboard](/bwriter/dashboard)
2. Find "Stake $bWriter Tokens"
3. Enter amount to stake
4. Review balance (don't exceed available)
5. Click "Request to Stake"

**After Clicking:**
- System generates a multisig address
- You have 24 hours to send tokens
- Display shows your deadline

### Step 4: Send Tokens to Multisig Address

**Important**: This is an on-chain transaction on Bitcoin SV

**How:**
1. Copy the multisig address shown in dashboard
2. Open your BSV wallet (HandCash, Electrum, etc.)
3. Send EXACTLY the amount of tokens requested
4. Confirm the transaction
5. Wait for blockchain confirmation

**Example Address:**
```
1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6
```

### Step 5: Wait for Confirmation

Once you send tokens to the multisig address:

- **Within 10 minutes**: Transaction appears in blockchain
- **Within 1 hour**: Our system detects it
- **Next hourly job**: Stake automatically confirmed
- **Status changes**: "pending_deposit" → "confirmed"

You'll see status update in dashboard.

### Step 6: Earn Dividends

Once confirmed:
- Your stake appears in cap table
- Dividends start accumulating
- Daily at midnight: Dividends calculated and sent

---

## Understanding Dividends

### How Dividends Are Calculated

**Daily Process:**

```
1. Calculate total staked tokens globally
   Example: 500 million tokens staked

2. Calculate your ownership percentage
   Your stake: 1 million / 500 million = 0.2%

3. Get daily revenue
   Example: Revenue today = 5 million satoshis

4. Calculate dividend pool
   Dividend pool = 5M × 0.75 = 3.75 million satoshis

5. Calculate your dividend
   Your dividend = 3.75M × 0.2% = 7,500 satoshis

6. Send to your BSV address
   Transaction: Multisig → Your address (7,500 sats)
```

### Dividend Frequency

- **Calculated**: Daily at midnight UTC
- **Distributed**: Immediately after calculation
- **Frequency**: Every 24 hours (automatically recurring)

### What Affects Dividend Amount

**Increases your dividend:**
- More platform revenue
- Stake longer (compounding)
- More tokens staked

**Decreases your dividend:**
- Less platform revenue
- Unstaking (stops future dividends but doesn't lose accumulated)
- More total stakers (your % decreases)

### Viewing Your Dividends

Dashboard shows:
- **Dividends Pending**: BSV waiting to be sent
- **Dividends Claimed**: Historical amount received
- **Your Share**: Percentage of total staked

---

## Managing Your Stake

### Viewing Your Stake

Dashboard displays:
- Current balance (not staked)
- Active stakes (amount, status, date staked)
- Pending deposits (if applicable)
- Accumulated dividends

### Updating Your Withdrawal Address

1. Go to dashboard
2. Find "Dividend Withdrawal Address"
3. Click "Edit Address"
4. Enter new BSV address
5. Click "Save"

**Note**: Dividends already earned go to old address; new dividends go to new address.

### Unstaking Tokens

**How:**
1. Find your active stake in dashboard
2. Click "Unstake" button
3. Review accumulated dividends (they stay with you)
4. Confirm unstaking
5. Tokens returned to your balance

**What happens:**
- Stake removed from cap table
- Dividends stop accumulating (but don't disappear)
- Tokens available in your balance again
- Can re-stake anytime

**Accumulated Dividends:**
- You keep ALL dividends earned while staked
- Can claim them anytime (sent to BSV address)
- Automatically sent if you have address configured

---

## Tax & Compliance

### Legal Status

$bWriter staking is:
- **Utility Token**: No securities regulations apply
- **Dividend-Bearing**: You earn BSV from platform revenue
- **Optional**: You choose to stake (not required)

### Tax Implications

**Important**: Consult a tax professional for your jurisdiction

**Potential tax events:**
- **Earning tokens**: May be taxable income
- **Staking**: Usually no immediate tax
- **Receiving dividends**: Taxable income (likely)
- **Selling tokens**: Capital gains/losses (if applicable)

**Documentation You'll Need:**
- Token acquisition date and amount
- Dividend history (available in dashboard)
- Sale/unstaking records
- BSV transaction IDs

### Compliance

We comply with:
- **UK Financial Conduct Authority (FCA)** - Utility token exemption
- **Anti-Money Laundering (AML)** - KYC requirements
- **Know Your Customer (KYC)** - Identity verification
- **GDPR** - Data protection (EU)

---

## Troubleshooting

### "My deposit hasn't confirmed after 24 hours"

**What to do:**
1. Check BSV transaction ID
2. Verify it reached the multisig address: `1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6`
3. Check blockchain confirmations at [WhatsOnChain](https://whatsonchain.com)
4. Contact support with transaction ID

### "I sent tokens but dashboard still says 'pending'"

**Possible causes:**
- Transaction not yet confirmed (wait 10+ minutes)
- Not sent to correct multisig address
- Wrong amount sent

**Solution:**
1. Verify transaction in [WhatsOnChain](https://whatsonchain.com)
2. Check multisig address is correct
3. Verify amount matches

### "I can't complete KYC"

**Why it might fail:**
- Document not clear or blurry
- Document expired
- Address proof too old (>3 months)
- Multiple KYC attempts in short time

**What to do:**
1. Re-upload clear photos
2. Use recent documents
3. Use address proof dated within 3 months
4. Wait 24 hours before retrying

### "Dividends didn't arrive in my wallet"

**Check:**
1. Is your BSV address set in dashboard?
2. Has withdrawal address verification completed?
3. Check blockchain at [WhatsOnChain](https://whatsonchain.com)
4. Allow time for blockchain confirmation

### "I want to unstake but scared of losing dividends"

**Don't worry!**
- Accumulated dividends NEVER disappear
- Unstaking does NOT delete dividend history
- Dividends already earned stay with you
- Can claim them anytime (send to BSV address)

---

## FAQ

### General Questions

**Q: What is $bWriter?**
A: A utility token representing ownership in the Bitcoin Writer ecosystem. Holders can stake tokens to earn dividends from platform revenue.

**Q: What's the difference between tokens and BSV?**
A: $bWriter tokens are what you stake. BSV (Bitcoin SV) is the actual money you earn as dividends. Dividends are paid in satoshis (smallest BSV unit).

**Q: Do I have to stake?**
A: No, staking is optional. You can hold tokens without staking.

**Q: How many people are staking?**
A: Check the [dashboard](/bwriter/dashboard) for real-time stats.

### Staking Questions

**Q: What's the minimum to stake?**
A: Any amount. No minimum requirement.

**Q: What if I want to unstake?**
A: You can anytime. Click "Unstake" and tokens return to your balance.

**Q: Can I stake on multiple platforms?**
A: Yes! Stake on b0ase.com, Bitcoin Writer, or The Bitcoin Corporation. All stakes count toward dividends.

**Q: What if platform revenue is $0?**
A: No dividends that period. But your stake remains active and ready when revenue resumes.

### Dividend Questions

**Q: When do I get paid?**
A: Daily at midnight UTC. Dividends automatically sent to your BSV address.

**Q: How much will I earn?**
A: Depends on platform revenue and your stake size. Check dashboard for estimates.

**Q: What if I unstake mid-month?**
A: You get dividends up to the unstaking date. They don't disappear.

**Q: Can I withdraw dividends before unstaking?**
A: Yes. Dividends are continuously sent to your BSV address. You don't need to do anything.

**Q: What if I don't have a withdrawal address set?**
A: Dividends accumulate but won't be sent. Set address in dashboard and they'll be sent immediately.

### Technical Questions

**Q: Where are my tokens stored?**
A: In a multisig address: `1Dd3iSFQEM8spmdLbqwxMenWEryNnBBHM6`. You can verify on the blockchain.

**Q: Can the platform steal my tokens?**
A: No. Multisig requires multiple signatures. Tokens are secure by design.

**Q: What network is this on?**
A: Bitcoin SV (BSV). All transactions are on-chain and verifiable.

**Q: How do I verify my stake?**
A: Visit [WhatsOnChain](https://whatsonchain.com) and search the multisig address.

### Security & Safety

**Q: Is it safe to stake?**
A: Your tokens are in a multisig wallet (very secure). Dividends come from platform revenue (transparent).

**Q: What are the risks?**
A: **Volatility**: BSV price can change. **Platform risk**: If platform closes, dividends stop (but tokens remain yours). **Market risk**: Token value fluctuates.

**Q: Should I stake everything?**
A: No. Diversify. Only stake what you can afford to leave locked up.

**Q: Can I use a custodial wallet (exchange)?**
A: Only for sending tokens to multisig. For receiving dividends, use a self-custody wallet you control.

### Compliance Questions

**Q: Why do I need KYC?**
A: UK financial regulations require identity verification for dividend recipients.

**Q: Is my data safe?**
A: Yes. We follow GDPR and UK data protection laws. Data is encrypted.

**Q: Can I stake anonymously?**
A: No. KYC verification is required for dividend eligibility.

**Q: What documents do you keep?**
A: ID and address proof only. Stored securely, deleted after verification.

---

## Getting Help

### Support Channels

- **Email**: support@b0ase.com
- **Documentation**: `/docs/BWRITER_STAKING.md`
- **Dashboard**: [b0ase.com/bwriter/dashboard](https://b0ase.com/bwriter/dashboard)
- **Blog**: Latest articles and updates

### Additional Resources

- **Technical Reference**: [BWRITER_STAKING.md](/docs/BWRITER_STAKING.md)
- **Quick Start**: [BWRITER_QUICK_START.md](/docs/BWRITER_QUICK_START.md)
- **Implementation**: [BWRITER_PHASE1_SUMMARY.md](/BWRITER_PHASE1_SUMMARY.md)

---

## Version History

- **v1.0** (2026-01-26): Initial release with Phase 1 features

---

**Last Updated**: 2026-01-26
**Maintained By**: b0ase team
**Status**: Complete and ready for users
