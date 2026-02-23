# $402 Token Custody & Staking Guide

## For Token Holders

This guide explains how your $402 tokens are stored, secured, and how you can stake them with $401 identity verification to earn serving revenue.

---

## How Token Custody Works

### The Short Version

When you acquire $402 tokens:

1. **You pay** via HandCash (or Yours Wallet)
2. **We send tokens** to an address **you control**
3. **You can withdraw** anytime with your signature
4. **We never hold** your private keys

**Your tokens are bearer instruments.** Like cash in your wallet, whoever controls the private key controls the tokens.

---

## Your Derived Address

### What It Is

When you connect your wallet, we create a unique BSV address just for you. This address is **derived from your HandCash signature**, which means:

- Only YOU can authorize transactions from it
- We store an encrypted version that only your signature can unlock
- You can export the private key anytime
- Even if we get hacked, attackers can't spend your tokens

### How to View Your Address

1. Connect your wallet at [path402.com](https://path402.com)
2. Go to **Account**
3. Your ordinals address is displayed
4. Click **Export Private Key** to get your WIF

### Can I Use a Different Address?

Yes. You can withdraw tokens to any BSV address you control. Your derived address is just the default destination for convenience.

---

## Token States

Your tokens can be in three states:

| State | Location | Revenue Share | $401 KYC Required |
|-------|----------|---------------|-------------------|
| **Unstaked** | Your address | No | No |
| **Staked** | Your address (same!) | Yes (100% serving revenue) | Yes |
| **Withdrawn** | External address | No | No |

**Key insight:** Staking does NOT move your tokens. It's a signed declaration that grants you additional rights.

---

## How to Buy Tokens

### Step 1: Connect Wallet

- Click **Connect Wallet** in the navbar
- Choose **HandCash** or **Yours Wallet**
- Authorize the connection

### Step 2: Choose Amount

- Go to the **Token** page
- Enter how much BSV you want to spend
- See how many tokens you'll receive (sqrt_decay pricing)

### Step 3: Confirm Purchase

- Click **Buy Tokens**
- Approve the payment in your wallet
- Tokens are credited to your account immediately

### Step 4: Verify On-Chain

- Go to **Account** to see your balance
- Click **View on Explorer** to verify on blockchain
- Tokens are at YOUR derived address, not ours

---

## How to Stake Tokens

Staking gives you:
- 100% of serving revenue (proportional to your stake)
- Listing on the public cap table

### Step 1: Prerequisites

- Have tokens in your account
- Be ready to complete $401 identity verification (name, email, jurisdiction)

### Step 2: Initiate Staking

- Go to **Account**
- Click **Stake Tokens**
- Enter the amount to stake

### Step 3: Sign the Declaration

Your wallet will ask you to sign a message like:

```
I am staking 1,000,000 $402 tokens.
I agree to complete $401 identity verification.
Timestamp: 2026-02-03T12:00:00Z
```

This signature proves you authorized the stake.

### Step 4: Complete $401 Identity Verification

- Enter your legal name
- Enter your email address
- Select your jurisdiction

### Step 5: Confirmation

Once $401 KYC is complete:
- You're added to the cap table
- You start earning serving revenue (100%, proportional to stake)

---

## How to Unstake

You can unstake anytime. Unstaking:
- Suspends your revenue share
- Keeps you on the cap table (until tokens change hands)
- Does NOT move your tokens

### Steps

1. Go to **Account**
2. Click **Unstake**
3. Sign the unstaking message
4. Rights are suspended immediately

---

## How to Withdraw

Withdrawal moves tokens to an external address you control.

### Steps

1. Go to **Account**
2. Click **Withdraw**
3. Enter destination BSV address
4. Enter amount
5. Sign the withdrawal message
6. Tokens are transferred on-chain

### What Happens to Your Cap Table Entry?

- You stay on the cap table until a NEW owner stakes those tokens
- When the new owner stakes + KYC's, you're removed and they're added
- This maintains an accurate registry of beneficial owners

---

## Serving Revenue

### How It Works

The facilitator (PATH402.com) earns fees from:
- Payment verification services
- Inscription fees
- Settlement fees

100% of serving revenue goes to staked $402 holders. When distributed:

```
Your Share = (Your Staked Tokens / Total Staked Tokens) × Serving Revenue Pool
```

### How to Claim

1. Go to **Account**
2. See **Pending Revenue** amount
3. Click **Claim Revenue**
4. Sign the claim message
5. BSV is sent to your derived address

### Distribution Schedule

- Revenue accumulates continuously
- Distributions happen monthly (or on-demand)
- Only ACTIVE stakers with $401 KYC qualify (not suspended/unstaked)

---

## Security

### What We Control

- Treasury address (receives payments)
- Encrypted key storage
- Cap table and stake records
- Revenue distribution

### What You Control

- Your private key (via signature)
- Decision to stake/unstake
- Decision to withdraw
- Your tokens (bearer instruments)

### What If We Get Hacked?

Attackers would need YOUR signature to spend YOUR tokens. We never have your unencrypted private key. Your tokens are safe.

### What If We Go Rogue?

You can withdraw anytime with your signature. We cannot prevent withdrawals. Your tokens are always under your control.

### What If I Lose Access?

If you can sign with your HandCash account, you can recover everything:
1. Sign the same derivation message
2. Get your private key back
3. Export to any wallet

---

## FAQ

### Q: Do I need to stake to hold tokens?

**No.** Staking is optional. You can hold unstaked tokens indefinitely. You just won't receive serving revenue.

### Q: Can I stake partial amounts?

**Yes.** Stake any amount up to your balance. You can stake more later or unstake partially.

### Q: What's the minimum stake?

**1 token.** There's no minimum, but revenue share may be negligible for very small stakes.

### Q: Is revenue automatic?

**No.** You must claim revenue when distributions occur. Unclaimed revenue accumulates until claimed.

### Q: Can I transfer staked tokens?

**Yes**, but if you transfer tokens while staked:
- Your stake is automatically suspended (tokens left your address)
- You stay on cap table until new owner stakes
- The new owner can stake + $401 KYC to get revenue share

### Q: Is my name public on the cap table?

**Yes.** The cap table shows:
- Your handle (e.g., @b0ase)
- Your KYC name
- Amount staked
- Date staked

This is required for regulatory compliance and transparency.

### Q: What $401 KYC is required?

- Legal name
- Email address
- Jurisdiction (country/state)

We do NOT collect:
- ID documents (unless required by law)
- Bank details
- Social security numbers

### Q: Can I use a different wallet?

**Yes.** You can export your private key and import to any BSV wallet that supports ordinals. The tokens are BSV-21 (PoW20 HTM).

---

## Technical Details

### Address Derivation

Your address is derived deterministically:

```
1. You sign: "I am creating my $402 wallet for @{handle}. Timestamp: {time}"
2. We compute: seed = HMAC-SHA256(key: "$402-v1", data: signature + handle)
3. Private key = seed (first 32 bytes)
4. Address = P2PKH(publicKey(privateKey))
```

This means:
- Same signature always produces same address
- Different handles produce different addresses
- You can recover by re-signing the same message

### Token Standard

$402 uses the BSV-21 PoW20 Hash-to-Mint standard:
- Protocol: `bsv-21` (BRC-116 Proof of Indexing)
- Total supply: 21,000,000 (mirrors Bitcoin)
- Decimal places: 8 (same as Bitcoin satoshis)
- Distribution: 100% mined, 0% pre-mine
- Mining: 50 tokens per mint, halving every 210,000 mints

### On-Chain Verification

Verify your tokens on any BSV explorer:
- [WhatsOnChain](https://whatsonchain.com)
- [GorillaPool](https://ordinals.gorillapool.io)

Enter your address to see BSV-21 token holdings.

---

## Support

**Questions?**
- Email: hello@path402.com
- Twitter: @path402
- Discord: discord.gg/path402

**Found a bug?**
- GitHub: github.com/path402/path402-com/issues

---

**Last Updated**: February 8, 2026
