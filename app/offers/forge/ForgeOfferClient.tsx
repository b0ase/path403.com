"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FiCheck, FiArrowRight } from "react-icons/fi";

const problems = [
  {
    id: "cohort-mvp-bottleneck",
    problem: "Your Week 1-4 cohort companies waste time on infrastructure instead of product-market fit",
    context: "You run a 12-week accelerator. Week 1-4 should be rapid MVP iteration. Instead, founders are fighting with auth systems, database schemas, and deployment configs.",
    impact: "Founders spend 60% of Week 1-4 on DevOps. By Week 5, half the cohort doesn't have a working MVP.",
    solution: "I deploy a working Next.js + Supabase starter template to all 12 companies on Day 1",
    deliverables: [
      "Pre-configured auth (OAuth + Magic Link + Wallet)",
      "Database schema with Prisma ORM",
      "Vercel deployment pipeline (CI/CD)",
      "Admin dashboard template",
      "Mobile-responsive UI (Tailwind)",
      "Documentation for founder handoff"
    ],
    timeline: "3 days to deploy cohort-wide. Founders start coding features on Day 4.",
    price: "£3,000",
    priceNote: "fixed, covers all 12 companies",
    guarantee: "If it's not deployed and working by Day 4, full refund."
  },
  {
    id: "cloud-credit-waste",
    problem: "You give companies $100K in credits but they waste 60% on duplicate services",
    context: "Every company sets up their own Supabase, their own Vercel, their own monitoring. Same resources, 12x the cost.",
    impact: "$60K of your $100K credit allocation wasted on redundant infrastructure. Companies still run out of credits by Week 8.",
    solution: "I build a multi-tenant infrastructure that shares resources intelligently",
    deliverables: [
      "Shared Supabase instance (RLS isolation per company)",
      "Centralized monitoring dashboard",
      "Automated backups + disaster recovery",
      "Resource pooling (reduce costs 40%+)",
      "Usage tracking per company",
      "Migration path for post-graduation independence"
    ],
    timeline: "1 week deployment before cohort starts.",
    price: "£4,500",
    priceNote: "saves ~£40K in cloud spend per cohort",
    guarantee: "If you don't save 10x the cost, I refund the difference."
  },
  {
    id: "equity-tracking-chaos",
    problem: "You manage equity stakes in 46+ companies with spreadsheets",
    context: "You take 6-10% equity in each portfolio company. Tracking cap tables, vesting, exits is manual. One mistake could cost millions.",
    impact: "No real-time visibility into portfolio value. M&A events require weeks of spreadsheet archaeology. Audit trail is 'trust me.'",
    solution: "I tokenize your equity stakes on BSV with automated cap table management",
    deliverables: [
      "One token per portfolio company (BSV-20)",
      "Automated cap table dashboard",
      "Vesting schedule tracking (cliff + linear)",
      "Exit event triggers (M&A, IPO detection)",
      "Investor portal (see all holdings)",
      "Compliance export (Companies House format)"
    ],
    timeline: "2 weeks to deploy, 1 day per company to tokenize existing portfolio.",
    price: "£6,000",
    priceNote: "setup + first 12 companies. £200/company after that.",
    guarantee: "If one token transaction fails, I fix it for free."
  },
  {
    id: "demo-day-quality-variance",
    problem: "Your Demo Day has 12 companies but only 3 have professional pitch materials",
    context: "Week 12 is make-or-break. 500+ investors attending. But half your cohort can't afford designers. Their pitches look amateur.",
    impact: "Good founders with bad slides get passed over. You lose credibility. Companies blame you for not getting funded.",
    solution: "I build an AI pitch generator that creates professional decks for all 12 companies",
    deliverables: [
      "AI-powered pitch deck builder (company-specific)",
      "Live demo hosting (subdomain per company)",
      "Investor portal (all pitches in one place)",
      "Real-time engagement tracking",
      "Automated CRM follow-ups",
      "Video recording + transcription"
    ],
    timeline: "1 week before Demo Day. Generate all 12 decks in 48 hours.",
    price: "£5,000",
    priceNote: "includes hosting for Demo Day + 30 days after",
    guarantee: "Every company gets a professional deck or I refund proportionally."
  },
  {
    id: "annalise-missing-winners",
    problem: "Annalise screens applicants but you're still missing great founders",
    context: "You built an AI to filter applications. But your acceptance rate vs. success rate suggests it's missing patterns.",
    impact: "You reject founders who would've succeeded. You accept founders who flop. Your cohort quality is inconsistent.",
    solution: "I upgrade Annalise to multi-agent evaluation with historical learning",
    deliverables: [
      "Multi-agent screening (technical + business + founder fit)",
      "Historical cohort analysis (learn from your 46 companies)",
      "Bias detection + fairness scoring",
      "Predictive success modeling",
      "Automated interview questions (per applicant)",
      "Video interview sentiment analysis"
    ],
    timeline: "3 weeks to deploy. Train on your historical data. Live for next application cycle.",
    price: "£8,000",
    priceNote: "includes 6 months of iteration based on results",
    guarantee: "If selection quality doesn't improve by 20%, I refund 50%."
  }
];

export default function ForgeOfferClient() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="px-4 md:px-8 py-16 md:py-24 border-b border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-6 block">
              Applied AI Problem Solver
            </span>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none mb-8">
              I SOLVE<br />
              <span className="text-zinc-800">ACCELERATOR</span><br />
              PROBLEMS
            </h1>

            <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mb-12 leading-relaxed">
              You run AI Forge. 12-week program. 46+ portfolio companies. $100K in credits. Demo Day with 500 investors.
              <br /><br />
              I don't want a partnership. I want to solve your specific problems with working code.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#problems"
                className="px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all text-center"
              >
                See Problems I Solve
              </Link>
              <Link
                href="mailto:richard@b0ase.com?subject=AI Forge Problem: [describe it]"
                className="px-8 py-4 bg-transparent border-2 border-zinc-800 text-white text-sm font-bold uppercase tracking-[0.2em] hover:border-white transition-all text-center"
              >
                Email Your Problem
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How This Works */}
      <section className="px-4 md:px-8 py-16 bg-zinc-950/50 border-b border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-8">
            How We Work Together
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="border-l-2 border-zinc-800 pl-4">
              <div className="text-4xl font-black text-zinc-700 mb-2">01</div>
              <h3 className="text-sm font-bold uppercase mb-2">You Describe Problem</h3>
              <p className="text-xs text-zinc-500">Not the solution. The actual problem blocking you.</p>
            </div>

            <div className="border-l-2 border-zinc-800 pl-4">
              <div className="text-4xl font-black text-zinc-700 mb-2">02</div>
              <h3 className="text-sm font-bold uppercase mb-2">I Say Yes or No</h3>
              <p className="text-xs text-zinc-500">Within 24 hours. If no, I'll tell you who can.</p>
            </div>

            <div className="border-l-2 border-zinc-800 pl-4">
              <div className="text-4xl font-black text-zinc-700 mb-2">03</div>
              <h3 className="text-sm font-bold uppercase mb-2">Fixed Price, Fixed Timeline</h3>
              <p className="text-xs text-zinc-500">You pay for the outcome, not my time.</p>
            </div>

            <div className="border-l-2 border-white pl-4">
              <div className="text-4xl font-black text-white mb-2">04</div>
              <h3 className="text-sm font-bold uppercase mb-2">Problem Solved</h3>
              <p className="text-xs text-zinc-500">Working code. In your environment. Done.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section id="problems" className="px-4 md:px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-12">
            Problems I Can Solve for AI Forge
          </h2>

          <div className="space-y-12">
            {problems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border-2 border-zinc-900 hover:border-zinc-700 transition-all"
              >
                {/* Problem Header */}
                <div className="p-8 bg-zinc-950 border-b border-zinc-900">
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 leading-tight">
                        {item.problem}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-4xl font-black text-white mb-1">{item.price}</div>
                      <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
                        {item.priceNote}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm text-zinc-400">
                    <div>
                      <span className="text-zinc-600 uppercase text-xs font-bold tracking-wider">Context:</span>
                      <p className="mt-1">{item.context}</p>
                    </div>
                    <div>
                      <span className="text-zinc-600 uppercase text-xs font-bold tracking-wider">Impact:</span>
                      <p className="mt-1 text-red-400">{item.impact}</p>
                    </div>
                  </div>
                </div>

                {/* Solution */}
                <div className="p-8">
                  <div className="mb-6">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-600 mb-3">
                      My Solution
                    </h4>
                    <p className="text-lg font-bold text-white mb-4">{item.solution}</p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-600 mb-3">
                      What You Get
                    </h4>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {item.deliverables.map((deliverable, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                          <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-zinc-900">
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-600 mb-2">
                        Timeline
                      </h4>
                      <p className="text-sm text-zinc-400">{item.timeline}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-600 mb-2">
                        Guarantee
                      </h4>
                      <p className="text-sm text-green-400">{item.guarantee}</p>
                    </div>
                  </div>

                  <Link
                    href={`mailto:richard@b0ase.com?subject=Solve This: ${item.problem.slice(0, 50)}...&body=I need this solved:%0D%0A%0D%0AProblem: ${item.problem}%0D%0A%0D%0AWhen I need it: %0D%0A%0D%0AAdditional context: `}
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all"
                  >
                    Email: I Need This Solved
                    <FiArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Not Your Problem? */}
      <section className="px-4 md:px-8 py-24 bg-zinc-950/50 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">
            Different Problem?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto text-lg">
            These are problems I've identified based on AI Forge's public info.
            You know your problems better than I do.
          </p>

          <div className="bg-black border-2 border-zinc-900 p-8 text-left max-w-2xl mx-auto">
            <h3 className="text-sm font-bold uppercase mb-4 text-zinc-500">
              Email Format That Gets Fast Responses:
            </h3>
            <div className="space-y-3 text-sm text-zinc-400 font-mono">
              <div>
                <span className="text-zinc-600">Subject:</span>
                <span className="text-white ml-2">AI Forge Problem: [one line description]</span>
              </div>
              <div className="pt-4 border-t border-zinc-900">
                <p className="text-zinc-600 mb-2">Body:</p>
                <p className="text-white">The problem: [what's broken/stuck/blocking you]</p>
                <p className="text-white mt-2">What we've tried: [so I don't repeat it]</p>
                <p className="text-white mt-2">When we need it: [realistic deadline]</p>
                <p className="text-white mt-2">Budget: [if you have one]</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="mailto:richard@b0ase.com?subject=AI Forge Problem: [describe it]"
              className="inline-block px-10 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all"
            >
              richard@b0ase.com
            </Link>
          </div>

          <p className="text-xs text-zinc-600 mt-6">
            I'll respond within 24 hours: "Yes, I can solve this for $X in Y days" or "No, here's who can."
          </p>
        </div>
      </section>

      {/* Why This Works */}
      <section className="px-4 md:px-8 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-12">
            Why This Works Better Than Alternatives
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-950 border border-zinc-900">
              <h3 className="text-sm font-bold uppercase mb-3 text-red-400">Traditional Consultant</h3>
              <ul className="text-xs text-zinc-500 space-y-2">
                <li>• 2-week discovery phase</li>
                <li>• 40-page report</li>
                <li>• "Recommendations"</li>
                <li>• No working code</li>
                <li>• $40K invoice</li>
              </ul>
            </div>

            <div className="p-6 bg-zinc-950 border border-zinc-900">
              <h3 className="text-sm font-bold uppercase mb-3 text-yellow-400">Typical Developer</h3>
              <ul className="text-xs text-zinc-500 space-y-2">
                <li>• Estimates 3 weeks</li>
                <li>• Delivers in 8 weeks</li>
                <li>• Bugs left for "phase 2"</li>
                <li>• Goes over budget</li>
                <li>• Ghosts you after payment</li>
              </ul>
            </div>

            <div className="p-6 bg-black border-2 border-white">
              <h3 className="text-sm font-bold uppercase mb-3 text-green-400">Applied AI Approach</h3>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li>• Start solving Day 1</li>
                <li>• Working code, not reports</li>
                <li>• Fixed price, fixed timeline</li>
                <li>• Money-back guarantee</li>
                <li>• Problem solved or refund</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What I Don't Do */}
      <section className="px-4 md:px-8 py-16 bg-zinc-950/50 border-y border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 mb-8">
            Boundaries (So We're Both Clear)
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-red-400">I DON'T:</h3>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• Attend your daily standups</li>
                <li>• Manage your team</li>
                <li>• Do open-ended "consulting"</li>
                <li>• Provide 24/7 support</li>
                <li>• Build your entire platform from scratch</li>
                <li>• Work hourly with vague scope</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase mb-4 text-green-400">I DO:</h3>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• Solve specific, scoped problems</li>
                <li>• Fix critical blockers fast</li>
                <li>• Build working MVPs quickly</li>
                <li>• Migrate, integrate, optimize</li>
                <li>• Debug impossible bugs</li>
                <li>• Ship working code</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 md:px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
            Got a Problem?
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            I don't want a meeting. I don't want a partnership. I want to solve your problem.
            <br /><br />
            Describe it. I'll tell you if I can fix it and for how much.
          </p>

          <Link
            href="mailto:richard@b0ase.com?subject=AI Forge Problem"
            className="inline-block px-12 py-5 bg-white text-black text-sm font-bold uppercase tracking-[0.25em] hover:bg-zinc-200 transition-all"
          >
            richard@b0ase.com
          </Link>

          <p className="text-xs text-zinc-600 mt-8 uppercase tracking-widest">
            Response time: &lt; 24 hours · Fixed prices · Working code · Guaranteed
          </p>

          <div className="mt-16 pt-8 border-t border-zinc-900">
            <p className="text-xs text-zinc-600 uppercase tracking-widest">
              Note: This page is a demo · Not linked from main site · Based on public AI Forge info
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
