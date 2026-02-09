# Kintsugi Task Queue

**Owner:** Kintsugi Agent
**Focus:** N8N Social Media Automation Packages
**Goal:** Generate £5K MRR from automation subscriptions

---

## PHASE 1: Make Automation Packages Sellable (Week 1-2)

### Task 1.1: Audit Current Automation Offering
- [ ] Review /automation page for clarity and conversion
- [ ] Verify checkout flow at /automation/packages/[tier]/checkout works
- [ ] Test Stripe integration (or document what's missing)
- [ ] Identify gaps between promise and delivery capability

### Task 1.2: Create Demo/Proof
- [ ] Record Loom video showing N8N workflow in action
- [ ] Create case study (even if hypothetical) with metrics
- [ ] Build a live demo workflow prospects can see

### Task 1.3: Simplify the Offer
- [ ] Focus messaging on ONE pain point: "Post 3x more, work 90% less"
- [ ] Create landing page variant focused purely on automation ROI
- [ ] Add testimonials (or "founding customer" discount offer)

### Task 1.4: Payment Integration (BLOCKER)
**Status:** ✅ CODE COMPLETE - Needs Stripe Dashboard setup

**Current state (UPDATED 2026-01-23):**
- ✅ `lib/stripe-marketplace.ts` extended with `AUTOMATION_PACKAGES`, `createAutomationCheckout()`
- ✅ `/api/automation/subscribe/route.ts` CREATED - handles tier selection and Stripe redirect
- ✅ `/automation/packages/[tier]/checkout` REPLACED - now redirects to Stripe Checkout
- ✅ `/automation/success/page.tsx` CREATED - post-payment success page

**Code changes complete:**
- [x] Create `/api/automation/subscribe/route.ts` using `createAutomationCheckout`
- [x] Create functions for Starter (£297), Professional (£597), Enterprise (£1,497)
- [x] Replace mock checkout form with redirect to Stripe Checkout
- [x] Create success page at `/automation/success`

**Still needed (manual Stripe setup):**
- [ ] Verify STRIPE_SECRET_KEY is set in production environment
- [ ] Products will auto-create on first checkout attempt
- [ ] Set up webhook at `/api/automation/webhooks/stripe` for subscription events (optional)
- [ ] Create database table `automation_subscriptions` to track subscribers (optional)

---

## PHASE 2: Sales Pipeline (Week 3-4)

### Task 2.1: Lead Generation
- [ ] Create lead magnet: "Social Media Automation Checklist"
- [ ] Set up email capture on /automation page
- [ ] Write 5-email nurture sequence

### Task 2.2: Outbound
- [ ] Identify 50 creators spending too much time on content
- [ ] Create personalized outreach template
- [ ] Send 10 outreach messages per day

### Task 2.3: Content Marketing
- [ ] Write blog post: "How I Automated My Social Media (and Saved 20 Hours/Week)"
- [ ] Create Twitter thread showing automation workflow
- [ ] Record YouTube tutorial on N8N for creators

---

## PHASE 3: Delivery System (Week 5-6)

### Task 3.1: N8N Workflow Templates
- [ ] Create standard Twitter posting workflow
- [ ] Create Instagram content repurposing workflow
- [ ] Create cross-platform scheduling workflow
- [ ] Document each workflow for client handoff

### Task 3.2: Onboarding Process
- [ ] Create client intake form
- [ ] Build onboarding checklist (platform access, brand voice, etc.)
- [ ] Set up client dashboard at /user/account/automations

### Task 3.3: Support System
- [ ] Create FAQ document for common issues
- [ ] Set up support ticket flow
- [ ] Define SLA for each tier

---

## PHASE 4: Scale (Week 7+)

### Task 4.1: Optimize Conversion
- [ ] A/B test landing page headlines
- [ ] Add live chat for sales questions
- [ ] Create urgency (limited spots, founding price)

### Task 4.2: Referral Program
- [ ] Offer 1 month free for referrals
- [ ] Create affiliate link system
- [ ] Reach out to creators with audiences

### Task 4.3: Case Studies
- [ ] Document results from first 3 paying customers
- [ ] Create video testimonials
- [ ] Write detailed case study blog posts

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| MRR | £5,000 | £0 |
| Paying Customers | 10-15 | 0 |
| Conversion Rate | 5% | - |
| Churn Rate | <10% | - |
| Lead Gen/Week | 50 | 0 |

---

## How Kintsugi Uses This File

1. Read this file at start of work session
2. Find first unchecked `[ ]` task
3. Work on that task until complete
4. Mark as `[x]` when done
5. Commit progress
6. Loop to step 2

**To mark complete:** Change `- [ ]` to `- [x]`

---

*Last Updated: 2026-01-23*
*Next Review: Weekly on Mondays*
