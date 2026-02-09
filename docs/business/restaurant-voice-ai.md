# Restaurant Voice Agent - 30 Day Plan to £2K

**Goal:** Build the product, sign 3 clients, make £2,000 in 30 days

**Revenue Model:**
- £500 setup (one-time)
- £200/month recurring (covers API costs + profit)
- Target: 3 clients in month 1 = £1,500 setup + £600/month recurring

---

## Week 1: Build the MVP (Jan 18-24)

### Day 1-2: Technical Setup
- [ ] Create n8n workflow (or use Vapi.ai if faster)
- [ ] Integrate OpenAI Whisper (speech-to-text)
- [ ] Integrate OpenAI GPT-4 (conversation logic)
- [ ] Integrate ElevenLabs (text-to-speech, natural voice)
- [ ] Test basic conversation flow

### Day 3-4: Restaurant Logic
- [ ] Build order-taking flow (menu items, modifications, quantities)
- [ ] Add upsell prompts ("Would you like to add chips?")
- [ ] Collect customer details (name, phone, address)
- [ ] Send order via webhook to restaurant (SMS/email/Slack)
- [ ] Handle edge cases (repeat order, cancel, change)

### Day 5: Testing
- [ ] Call it 20 times yourself
- [ ] Fix breaking issues
- [ ] Record successful call for demo
- [ ] Calculate cost per call (should be £0.10-0.30)

### Day 6-7: Packaging
- [ ] Create simple landing page at b0ase.com/offers/restaurant-ai
- [ ] Record 2-minute demo video (screen recording of call)
- [ ] Write one-page explainer PDF
- [ ] Set up payment link (Stripe)

---

## Week 2: Get First Client (Jan 25-31)

### Target: Small independent restaurants in London

**Why small independents:**
- Owner answers phone
- Can make decisions immediately
- Desperate for help (can't afford full-time staff)
- Price-sensitive but ROI is obvious

### Day 8-10: Cold Outreach (Walk-In)
- [ ] List 50 restaurants within 5 miles (Google Maps)
- [ ] Visit 10 per day (lunch/dinner rush times)
- [ ] Ask to speak to owner/manager
- [ ] Pitch: "I built an AI that answers your phone and takes orders while you're busy. Want to see it work?"
- [ ] Demo live: call the demo number on speaker phone
- [ ] Close: "£500 to set it up for your menu, £200/month. I can have it live by Friday."

**Script:**
> "Hi, I'm Richard. I built an AI phone agent for restaurants. It answers calls, takes orders, upsells, and sends everything to you via SMS. Mind if I show you real quick?"
>
> [Demo on speaker phone]
>
> "I can set this up for you this week. £500 one-time to build it for your menu, then £200/month to keep it running. Every call it answers is a call you don't miss. Interested?"

### Day 11-12: Follow-Up
- [ ] Email the 5 most interested from walk-ins
- [ ] Offer discount for first client: "£300 setup if you sign today"
- [ ] Close at least 1 client by end of week

### Day 13-14: Deliver First Client
- [ ] Get their menu (PDF or website)
- [ ] Build custom workflow with their items
- [ ] Set up forwarding number (Twilio)
- [ ] Test with owner
- [ ] Go live
- [ ] Invoice £300-500 + £200/month (set up Stripe subscription)

---

## Week 3: Refine & Scale (Feb 1-7)

### Day 15-17: Fix Issues from Client 1
- [ ] Monitor first 50 calls
- [ ] Fix misunderstood orders
- [ ] Improve voice clarity
- [ ] Add any missing menu items
- [ ] Get testimonial from owner

### Day 18-21: Sign Client 2 & 3
- [ ] Use Client 1 as case study
- [ ] Visit another 20 restaurants
- [ ] Demo + show Client 1 results
- [ ] Close 2 more clients at £500 setup + £200/month

**Improved pitch with proof:**
> "I built an AI phone agent for restaurants. [Restaurant Name] has been using it for 2 weeks and it's answered 87 calls, taken £1,200 in orders. Want to see it work?"

### Day 22-23: Deliver Client 2 & 3
- [ ] Clone workflow from Client 1
- [ ] Customize menu
- [ ] Test and deploy
- [ ] Invoice

---

## Week 4: Systemize (Feb 8-14)

### Day 24-26: Build Faster Onboarding
- [ ] Create menu template (standard structure)
- [ ] Automate menu upload (CSV or scrape from website)
- [ ] Reduce setup time from 4 hours to 1 hour
- [ ] Document deployment process

### Day 27-28: Content Marketing
- [ ] Post case study on LinkedIn: "I built an AI phone agent for restaurants. Here's how it works."
- [ ] Post demo video on Twitter/X
- [ ] Submit to IndieHackers, Hacker News
- [ ] Email local restaurant associations

### Day 29-30: Next 10 Clients Plan
- [ ] Calculate churn risk (what if they cancel after 1 month?)
- [ ] Plan upsells (AI table reservations, AI customer service)
- [ ] Target other local businesses (dentists, salons, estate agents)
- [ ] Decide: stay local or go remote?

---

## Revenue Projection

**Month 1:**
- 3 clients × £500 setup = £1,500
- 3 clients × £200/month = £600
- **Total Month 1: £2,100**

**Month 2 (if no churn):**
- 5 new clients × £500 = £2,500
- 8 clients × £200/month = £1,600
- **Total Month 2: £4,100**

**Month 3:**
- 7 new clients × £500 = £3,500
- 15 clients × £200/month = £3,000
- **Total Month 3: £6,500**

**By Month 6:**
- 5 new clients/month × £500 = £2,500
- 40 clients × £200/month = £8,000
- **Total Month 6: £10,500/month**

---

## Technical Stack

**Voice AI:**
- Option 1: Vapi.ai ($0.05/min) — fastest, pre-built
- Option 2: Twilio + OpenAI + ElevenLabs (custom, cheaper at scale)

**Recommended: Start with Vapi.ai, switch to custom at 10+ clients**

**Order Delivery:**
- SMS via Twilio
- Email via SendGrid
- Slack webhook (for tech-savvy owners)
- Optional: integrate with their POS (Toast, Square, etc.)

**Cost per call (estimated):**
- 3-minute call
- £0.15 (Vapi.ai) or £0.10 (custom stack)
- 100 calls/month = £10-15 in costs
- Margin: £200 - £15 = £185/month per client

---

## Critical Success Factors

1. **Demo has to work flawlessly** — if it fails during pitch, you lose the sale
2. **Fast setup** — promise 48 hours, deliver in 24
3. **Owner testimonial** — get Client 1 to rave about it
4. **Handle objections:**
   - "What if it gets the order wrong?" → "I monitor the first 50 calls and fix issues immediately. Plus customers can always call back."
   - "£200/month is expensive" → "How many orders do you miss per week when you're busy? If it captures 5 extra orders/month at £20 each, it's paid for itself."
   - "I don't trust AI" → "Let me call it right now and you listen."

---

## Expansion Opportunities (Month 2+)

Once you have 5-10 restaurant clients:

1. **AI Table Reservations** — add-on for £50/month more
2. **Customer Database** — track repeat customers, send marketing SMS
3. **Multi-location** — restaurant chains (£200/month per location)
4. **Other Local Businesses:**
   - Dental offices (appointment booking)
   - Estate agents (property inquiries)
   - Salons (appointment booking)
   - Plumbers/electricians (job booking)

---

## Exit Strategy

Build to 50 clients (£10K MRR), then either:
1. **Sell the business** — 3-5x MRR = £30-50K
2. **Hire someone to run it** — pay £2K/month, keep £8K/month passive
3. **Build it into an agency** — hire salespeople, scale to 200+ clients

---

## Day 1 Action Items (Start Tomorrow)

- [ ] Sign up for Vapi.ai (free trial)
- [ ] Build basic "pizza restaurant" demo agent
- [ ] Test it 10 times
- [ ] Create landing page at b0ase.com/offers/restaurant-ai
- [ ] List 50 restaurants in your area
- [ ] Visit first 10 tomorrow afternoon

---

## Questions?

None. Start building tomorrow. First sale by Day 14. £2K by Day 30.

**This is the plan. Execute it.**
