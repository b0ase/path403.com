/**
 * POST /api/kintsugi/chat
 *
 * Public chat endpoint for Kintsugi conversations.
 * No authentication required - anyone can describe their problems.
 * Uses streaming for real-time responses.
 *
 * Rate limited: 50 requests per IP per hour
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory rate limiting (resets on server restart)
// In production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 50; // requests per hour per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

const KINTSUGI_SYSTEM_PROMPT = `You are the Kintsugi Engine - b0ase.com's AI architect that helps founders turn ideas into real projects.

You are a CONSULTANT, not a salesperson. Your job is to:
1. Deeply understand what someone wants to build
2. Explore what resources they already have
3. Figure out what SPECIFIC help they need
4. Negotiate a custom arrangement that works for both sides

## CRITICAL: No Fixed Packages

NEVER push a fixed £999 or any other fixed price package. Every project is different:
- Some people just need technical advice (free or low-cost)
- Some need a small prototype (maybe £200-500)
- Some need a full MVP (negotiable based on scope)
- Some want equity-only arrangements
- Some want to pay monthly as they go
- Some want to do most work themselves with guidance

ASK about their budget, timeline, and what they can contribute before proposing anything.

## What b0ase CAN Offer (but only if relevant)

- Token creation and listing
- Website/app development
- Social media setup
- KYC integration for fundraising
- Ongoing development support
- Technical consulting and architecture

BUT NOT EVERYONE NEEDS ALL OF THIS. Many people just need a conversation to clarify their thinking.

## Your Role

Be genuinely curious. Don't rush to a proposal. The goal is to understand:

1. **The Idea** - What are they actually trying to build?
2. **Their Resources** - What do they already have? Skills, time, money, team?
3. **Their Constraints** - Budget? Timeline? Technical ability?
4. **What Help They Need** - Maybe they just need advice, not a full build
5. **How We Might Work Together** - Only after you understand all of the above

## Core Behaviors regarding Project Naming
If the user's first message is "Yes" (in response to naming prompt):
1. Ask them what name they would like to use.
2. Once they provide a name, reply: "Great. Project renamed to [Name]." AND Include the tag 'PROJECT_NAME: [Name]' at the end of your message (on a new line). This tag is invisible to the user but updates the UI.

If the user says "No":
1. Acknowledge that the Session ID will be the codename.
2. Proceed to Phase 1: Discovery.

When the user agrees to proceed with the Proposal (e.g., they say "Let's do it" or "Create repo"), check if you have a Project Name.
If yes, reply: "Initializing your repository..." AND Include the tag 'CREATE_REPO' on a new line.

## Core Behaviors regarding Chat Inscription
Your secondary mission is to ensure the "Historical Integrity" of the project.
1. After every 5-6 messages, or when a major decision is reached (e.g., Repo Created), tell the user: "Recording our progress to the blockchain..." AND Include the tag 'INSCRIBE_CHAT' on a new line.
2. This creates an encrypted, immutable log of the conversation.
3. If the user asks for "Proof of provenance" or "On-chain logs", trigger 'INSCRIBE_CHAT'.
4. Note: This tag is only processed if the user has connected their wallet. If not connected, the UI will simply skip it.

## Conversation Flow

### Phase 1: Deep Discovery (5-10 exchanges minimum)
Really understand:
- What's the core idea? What problem does it solve?
- Who would use it? Who would pay for it?
- What exists today? What have they tried?
- Why are they the right person to build this?
- What skills/resources do they already have?
- **What's their budget/timeline?** (Ask this explicitly)
- What can they contribute themselves?

### Phase 2: Clarifying Needs
Before ANY proposal, understand:
- Do they want a full build or just guidance?
- Are they looking for a co-founder/partner or a vendor?
- What's their comfort with paying upfront vs. equity vs. monthly?
- What's the MINIMUM viable thing to test their idea?

### Phase 3: Custom Proposal (only when you truly understand)
When proposing, ALWAYS:
- Tailor the scope to what they ACTUALLY need
- Offer multiple payment options if applicable
- Make it clear prices are negotiable
- Start with the SMALLEST useful thing, not the biggest package

---
## PROPOSAL: [Product Name]

**Understanding So Far**
[Summarize what you learned about their idea, resources, and constraints]

**What You Could Build First**
[Describe a minimal, focused first step - NOT a huge package]

**Possible Arrangement**
[Be specific but flexible - e.g., "We could do X for around £Y, or structure it as equity, or break it into phases..."]

**Questions Before We Proceed**
[What else do you need to know to finalize this?]

**Payment Options** (discuss these, don't just pick one)
- Upfront payment (one-time for defined scope)
- Monthly retainer (ongoing work)
- Equity arrangement (no cash, trade for tokens)
- Hybrid (smaller upfront + equity)

---

## NEVER Do This
- Don't push £999 or any fixed package
- Don't assume everyone needs tokens, websites, AND social media
- Don't rush to a proposal before understanding budget
- Don't make it feel like a sales pitch

## DO This
- Ask about their budget explicitly and early
- Suggest the SMALLEST useful thing first
- Make them feel like a partner, not a customer
- Be honest if b0ase might not be the right fit
- Get their email before finalizing any proposal

## Accepting Proposals

When the user agrees to move forward (says "yes", "let's do it", "I want to proceed", etc.):

1. Make sure you have their email. If not, ask for it first.
2. Summarize the key terms you discussed.
3. Include this tag on a new line:

ACCEPT_PROPOSAL: {"type": "new_project", "title": "[Project Name]", "email": "[their email]", "terms": {"scope": "[what we'll build]", "paymentType": "[upfront|monthly|equity|hybrid]", "priceGbp": [if discussed], "timeline": "[if discussed]"}}

The UI will detect this tag and record the proposal.

## Important Rules

1. **Be encouraging** - People sharing ideas are vulnerable
2. **Ask one question at a time** - Keep it conversational
3. **Use their language** - Mirror their terminology
4. **Be concrete** - Show them what it would look like
5. **Only present PROPOSAL when you understand the idea**
6. **Token symbols should be memorable** - Related to the product, 4-8 chars

## Example Ideas → Products

- "An app for tracking gym workouts" → GymTrack ($GYMT)
- "A tool to manage client invoices" → InvoiceFlow ($INVF)
- "A community for crypto traders" → TradeCircle ($TCIR)
- "An AI that writes social posts" → PostPilot ($PILOT)

If any requirement is missing, revise before finalising.
Do not explain the rules in the output.
Do not apologise.
Do not add commentary outside the document.

## Handling Project Naming Conflicts
Before confirming a project name, check if it's already in use. If a user suggests a name like "Silver Surfer" and it exists in the database, DO NOT set the PROJECT_NAME tag. Instead, say something like: "It looks like a project named 'Silver Surfer' already exists in our archives. Would you like to add a unique number (e.g., 'Silver Surfer 07') or choose a different name?"`;

const CONTRIBUTION_SYSTEM_PROMPT = `You are the Kintsugi Engine - b0ase.com's AI architect that helps people contribute to existing b0ase portfolio projects.

The user has selected an existing b0ase project to contribute to. Your role is to understand what they want to do:

## Three Contribution Paths

### 1. Developer Path
They want to fix something, build a feature, or improve the product.
- Understand what they want to build/fix
- Discuss the scope and complexity
- Help them propose a price and equity request for the work
- Present a developer contribution proposal

### 2. Investor Path
They want to fund development in exchange for equity.
- Understand what they want to see fixed/built
- Discuss the investment amount
- Help them understand token economics and equity
- Present an investor contribution proposal

### 3. Feedback Path
They just want to report an issue or suggest an improvement.
- Thank them for the feedback
- Summarize the issue/suggestion
- Explain how they could become a developer or investor to help fix it

## Conversation Flow

1. **Discover** - What do they want to do with this project? Fix something? Invest? Just provide feedback?
2. **Define** - Get specific about the work, investment, or feedback
3. **Propose** - Present a contribution proposal

## Developer Proposal Format

---
## PROPOSAL: Developer Contribution to [Project Name]

**The Work**
[Description of what they'll build/fix]

**Estimated Scope**
[Small/Medium/Large - with rough hours]

**Their Ask**
| Item | Value |
|------|-------|
| Payment | £[amount] |
| Equity | [X]% of [TOKEN] |

**Next Steps**
1. Accept this proposal
2. Sign developer agreement
3. Begin work
---

## Investor Proposal Format

---
## PROPOSAL: Investment in [Project Name]

**The Investment**
£[amount] to fund [specific work]

**What You Get**
| Item | Value |
|------|-------|
| Tokens | [X] [TOKEN] |
| Equity | [X]% of project |
| Voting | Rights on feature priorities |

**What Gets Built**
[Description of what their investment funds]

**Next Steps**
1. Accept this proposal
2. Complete KYC
3. Transfer funds
---

## Important Rules

1. **Ask about their intent first** - Developer, investor, or feedback?
2. **Be specific about the project** - Reference its current state, features, issues
3. **Price fairly** - Developer work: £50-150/hour equivalent. Investor equity: based on project valuation.
4. **Only present PROPOSAL when you understand their contribution**
5. **Get their contact info** - Before finalizing, ask for their email so we can follow up

## Accepting Proposals

When the user accepts a proposal (says "yes", "let's do it", "accept", "I'm in", etc.):

1. First, make sure you have their email address. If not, ask for it.
2. Summarize the agreement one more time.
3. Include this tag on a new line:

ACCEPT_PROPOSAL: {"type": "[developer|investor|feedback]", "title": "[Brief title]", "projectSlug": "[slug if existing project]", "issueNumber": [number if specific issue], "terms": {"priceGbp": [amount], "equityPercent": [percent], "timeline": "[timeline]"}}

The UI will detect this tag and create the proposal record.

## Project Context (provided at runtime)
The selected project details will be injected below.`;


interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface SelectedProject {
  title: string;
  slug: string;
  description: string;
  status: string;
  tokenName?: string;
  liveUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check API keys - try Kimi first (cheapest at $0.50/M), then Gemini, Deepseek, Anthropic, OpenAI
    const kimiKey = process.env.KIMI_API_KEY;
    const googleKey = process.env.GOOGLE_AI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_AI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!kimiKey && !googleKey && !deepseekKey && !anthropicKey && !openaiKey) {
      console.error('No AI API key configured (need KIMI_API_KEY, GOOGLE_AI_API_KEY, DEEPSEEK_AI_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY)');
      return new Response(JSON.stringify({ error: 'Chat service is not configured. Please contact support.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Provider priority (configurable via cookie/header)
    // Default: Anthropic > Kimi > Gemini > Deepseek > OpenAI
    const hasKimi = !!kimiKey;
    const hasGemini = !!googleKey;
    const hasDeepseek = !!deepseekKey;
    const hasAnthropic = !!anthropicKey;
    const hasOpenAI = !!openaiKey;

    // Check for model preference override (from /kintsugi-model command)
    const preferredProvider = request.headers.get('x-kintsugi-provider') ||
                              request.cookies.get('kintsugi-provider')?.value ||
                              'anthropic'; // Default to Anthropic

    console.log('API Keys status:', { hasKimi, hasGemini, hasDeepseek, hasAnthropic, hasOpenAI });
    console.log('Preferred provider:', preferredProvider);
    console.log('Using AI provider:', hasKimi ? 'Kimi K2.5' : hasGemini ? 'Gemini' : hasDeepseek ? 'Deepseek' : hasAnthropic ? 'Anthropic' : 'OpenAI');

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': '0',
        },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { message, history = [], selectedProject, sessionCode } = body as {
      message: string;
      history: ChatMessage[];
      selectedProject: SelectedProject | null;
      sessionCode?: string;
    };

    console.log('Kintsugi Chat Request:', { message, historyLength: history.length, selectedProject: selectedProject?.title });

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Choose system prompt based on whether a project is selected
    let systemPrompt = KINTSUGI_SYSTEM_PROMPT;
    if (selectedProject) {
      // Fetch real GitHub issues for this project
      let issuesContext = '';
      try {
        const { portfolioData } = await import('@/lib/data');
        const project = portfolioData.find((p: any) => p.slug === selectedProject.slug);

        if (project?.githubUrl && project.githubUrl !== '#') {
          const match = project.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          if (match) {
            const [, owner, repo] = match;
            const { fetchGitHubIssues } = await import('@/lib/github-issue-sync');
            const token = process.env.GITHUB_TOKEN || null;

            try {
              const issues = await fetchGitHubIssues(owner, repo, token);
              const openIssues = issues.filter(i => i.state === 'open').slice(0, 10);

              if (openIssues.length > 0) {
                issuesContext = `\n\n## Open GitHub Issues (${issues.filter(i => i.state === 'open').length} total)\n\nThese are REAL issues from the repo that need work:\n\n`;
                openIssues.forEach((issue, i) => {
                  const labels = issue.labels.map(l => l.name).join(', ');
                  issuesContext += `${i + 1}. **#${issue.number}: ${issue.title}**\n`;
                  if (labels) issuesContext += `   Labels: ${labels}\n`;
                  if (issue.body) issuesContext += `   ${issue.body.slice(0, 200)}${issue.body.length > 200 ? '...' : ''}\n`;
                  issuesContext += `   URL: ${issue.html_url}\n\n`;
                });
                issuesContext += `When someone wants to help, reference these REAL issues. Don't make up work.`;
              }
            } catch (e) {
              console.log('Could not fetch GitHub issues:', e);
            }
          }
        }
      } catch (e) {
        console.log('Project lookup failed:', e);
      }

      const projectContext = `
## Selected Project: ${selectedProject.title}

**Description:** ${selectedProject.description}
**Status:** ${selectedProject.status}
**Token:** ${selectedProject.tokenName || 'Not yet assigned'}
**Live URL:** ${selectedProject.liveUrl || 'Not yet deployed'}
${issuesContext}

The user is interested in contributing to this specific project. Ask them what they want to do:
- Pick one of the GitHub issues above to work on?
- Propose a new feature?
- Invest in development of specific issues?
- Just provide feedback?

IMPORTANT: When discussing work, reference the REAL GitHub issues listed above. Don't invent fictional tasks.`;
      systemPrompt = CONTRIBUTION_SYSTEM_PROMPT + projectContext;
    }

    // If this is the start of a new session, inject the welcome intro instructions
    let userMessageContent = message;
    if (history.length === 0) {
      userMessageContent = `[SYSTEM NOTE: This is the start of a new session. Please start your response with a welcome message: "Welcome to Kintsugi. I am an AI Agent designed to build your entire app from concept to code." and mention that their current Session ID is ${sessionCode || 'unknown'}. Then ask "Would you like to give your project a name? (Y/N)". After they respond, we can move into the Discovery phase. Now, here is the user's first message: ]\n\n${message}`;
    } else {
      // Check if user is trying to name the project and check for collisions
      const previousMsg = history[history.length - 1];
      if (previousMsg && previousMsg.role === 'assistant' && previousMsg.content.toLowerCase().includes('give your project a name')) {
        const potentialName = message.trim().replace(/^yes, let's call it ['"]?|['"]?\.?$/gi, '').replace(/^yes,? /i, '');
        if (potentialName.length > 2 && potentialName.length < 50 && !['yes', 'no', 'y', 'n'].includes(potentialName.toLowerCase())) {
          // We can't easily wait for a DB call here without making the whole thing async/sync
          // But actually, we ARE in an async POST handler.
          try {
            const prisma = (await import('@/lib/prisma')).getPrisma();
            const existing = await prisma.kintsugi_chat_sessions.findFirst({
              where: { title: { equals: potentialName, mode: 'insensitive' } }
            });
            if (existing) {
              userMessageContent = `[SYSTEM NOTE: The user wants to name the project "${potentialName}" but this name is ALREADY TAKEN in the database. Please inform them of this collision and ask for a unique name.]\n\n${message}`;
            }
          } catch (e) { console.error('Name check failed', e); }
        }
      }
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map((msg: ChatMessage) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessageContent },
    ];

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let providerUsed = false;

          // Helper functions for each provider
          const tryKimi = async (): Promise<boolean> => {
            if (!hasKimi) return false;
            const kimiModels = ['moonshot-v1-128k', 'moonshot-v1-32k', 'moonshot-v1-8k'];
            const kimiClient = new OpenAI({
              apiKey: kimiKey,
              baseURL: 'https://api.moonshot.cn/v1',
            });

            for (const modelName of kimiModels) {
              try {
                console.log(`Trying Moonshot model: ${modelName}`);
                const response = await kimiClient.chat.completions.create({
                  model: modelName,
                  messages,
                  max_tokens: 4096,
                  temperature: 0.7,
                  stream: true,
                });

                for await (const chunk of response) {
                  const content = chunk.choices[0]?.delta?.content;
                  if (content) {
                    const data = JSON.stringify({ type: 'content', text: content, provider: 'kimi' });
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                  }
                  if (chunk.choices[0]?.finish_reason === 'stop') {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', provider: 'kimi' })}\n\n`));
                  }
                }
                console.log(`Moonshot ${modelName} response complete`);
                return true;
              } catch (kimiError: any) {
                console.log(`Moonshot ${modelName} failed:`, kimiError?.message || kimiError);
                continue;
              }
            }
            return false;
          };

          const tryAnthropic = async (): Promise<boolean> => {
            if (!hasAnthropic) return false;
            try {
              console.log('Trying Anthropic Claude');
              const anthropic = new Anthropic({ apiKey: anthropicKey! });
              const chatStream = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 4096,
                system: systemPrompt,
                messages: [
                  ...history.map((msg: ChatMessage) => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                  })),
                  { role: 'user', content: userMessageContent },
                ],
                stream: true,
              });

              for await (const chunk of chatStream) {
                if (chunk.type === 'content_block_delta' && (chunk as any).delta?.text) {
                  const text = (chunk as any).delta.text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text, provider: 'anthropic' })}\n\n`));
                } else if (chunk.type === 'message_delta' && (chunk as any).delta?.stop_reason === 'end_turn') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', provider: 'anthropic' })}\n\n`));
                }
              }
              return true;
            } catch (e) {
              console.log('Anthropic failed:', (e as Error).message);
              return false;
            }
          };

          const tryGemini = async (): Promise<boolean> => {
            if (!hasGemini) return false;
            const geminiModels = ['gemini-flash-latest', 'gemini-pro'];
            const genAI = new GoogleGenerativeAI(googleKey!);

            for (const modelName of geminiModels) {
              try {
                console.log(`Trying Gemini model: ${modelName}`);
                const model = genAI.getGenerativeModel({
                  model: modelName,
                  systemInstruction: systemPrompt
                });

                const chat = model.startChat({
                  history: history.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                  })),
                });

                const result = await chat.sendMessageStream(userMessageContent);

                for await (const chunk of result.stream) {
                  const text = chunk.text();
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text, provider: 'gemini' })}\n\n`));
                  }
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', provider: 'gemini' })}\n\n`));
                return true;
              } catch (modelError: any) {
                console.log(`Gemini model ${modelName} failed:`, modelError?.message || modelError);
                continue;
              }
            }
            return false;
          };

          const tryDeepseek = async (): Promise<boolean> => {
            if (!hasDeepseek) return false;
            try {
              console.log('Trying Deepseek');
              const client = new OpenAI({
                apiKey: deepseekKey,
                baseURL: 'https://api.deepseek.com',
              });

              const response = await client.chat.completions.create({
                model: 'deepseek-chat',
                messages,
                max_tokens: 4096,
                stream: true,
              });

              for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                  const data = JSON.stringify({ type: 'content', text: content, provider: 'deepseek' });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
                if (chunk.choices[0]?.finish_reason === 'stop') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', provider: 'deepseek' })}\n\n`));
                }
              }
              return true;
            } catch (e) {
              console.log('Deepseek failed:', (e as Error).message);
              return false;
            }
          };

          const tryOpenAI = async (): Promise<boolean> => {
            if (!hasOpenAI) return false;
            try {
              console.log('Trying OpenAI');
              const client = new OpenAI({ apiKey: openaiKey });

              const response = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages,
                max_tokens: 4096,
                stream: true,
              });

              for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                  const data = JSON.stringify({ type: 'content', text: content, provider: 'openai' });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
                if (chunk.choices[0]?.finish_reason === 'stop') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', provider: 'openai' })}\n\n`));
                }
              }
              return true;
            } catch (e) {
              console.log('OpenAI failed:', (e as Error).message);
              return false;
            }
          };

          // Build provider order based on preference
          // Default order: preferred first, then others as fallbacks
          type ProviderFn = () => Promise<boolean>;
          const providerMap: Record<string, ProviderFn> = {
            anthropic: tryAnthropic,
            kimi: tryKimi,
            gemini: tryGemini,
            deepseek: tryDeepseek,
            openai: tryOpenAI,
          };

          // Start with preferred provider, then try others
          const allProviders = ['anthropic', 'kimi', 'gemini', 'deepseek', 'openai'];
          const orderedProviders = [
            preferredProvider,
            ...allProviders.filter(p => p !== preferredProvider)
          ];

          console.log('Provider order:', orderedProviders);

          // Try each provider in order
          for (const providerName of orderedProviders) {
            const tryProvider = providerMap[providerName];
            if (tryProvider) {
              providerUsed = await tryProvider();
              if (providerUsed) {
                console.log(`Successfully used provider: ${providerName}`);
                break;
              }
            }
          }

          // DEMO MODE: Final fallback when all providers fail
            if (!providerUsed) {
              console.log('All providers exhausted - using demo mode');

              // 1. Extract context from history + current message
              const fullConversation = [...history.map((m: any) => m.content), userMessageContent].join(' ').toLowerCase();

              const context = {
                industry: '',
                solutionType: 'solution',
                target: ''
              };

              // Detect Industry
              if (/(crypto|token|blockchain|web3|wallet|decentralized|nft|defi)/.test(fullConversation)) context.industry = 'Web3';
              else if (/(finance|money|bank|payment|invest|trading|fintech)/.test(fullConversation)) context.industry = 'Fintech';
              else if (/(health|doctor|patient|medical|wellness|fitness)/.test(fullConversation)) context.industry = 'HealthTech';
              else if (/(learn|teach|school|education|course|training|student)/.test(fullConversation)) context.industry = 'EdTech';
              else if (/(shop|store|buy|sell|marketplace|commerce)/.test(fullConversation)) context.industry = 'E-commerce';
              else if (/(estate|property|house|rent|landlord)/.test(fullConversation)) context.industry = 'Real Estate';
              else if (/(game|gaming|esports|player)/.test(fullConversation)) context.industry = 'Gaming';

              // Detect Solution Type
              if (/(app|mobile|ios|android)/.test(fullConversation)) context.solutionType = 'mobile app';
              else if (/(platform|portal|dashboard)/.test(fullConversation)) context.solutionType = 'platform';
              else if (/(marketplace|network)/.test(fullConversation)) context.solutionType = 'marketplace';
              else if (/(ai|bot|automation|intelligence|gpt|llm)/.test(fullConversation)) context.solutionType = 'AI tool';
              else if (/(token|coin|dao)/.test(fullConversation)) context.solutionType = 'token project';

              // Detect Target (Basic)
              if (/(business|company|enterprise|b2b)/.test(fullConversation)) context.target = 'businesses';
              else if (/(consumer|people|user|b2c)/.test(fullConversation)) context.target = 'consumers';

              // 2. Dynamic Response Templates - Consultative approach, no fixed packages
              const getStageResponse = (stage: number, ctx: typeof context) => {
                const industryStr = ctx.industry ? ` in ${ctx.industry}` : '';
                const typeStr = ctx.solutionType;

                switch (stage) {
                  case 0: return "Welcome to Kintsugi. I'm here to help you figure out what you want to build and whether we can help. No sales pitch - just a conversation. What's the idea you're exploring?";
                  case 1: return `Interesting${industryStr ? ` - ${ctx.industry} is a space with real problems to solve` : ''}. Tell me more about why this matters to you. Is this something you've experienced personally, or an opportunity you've spotted?`;
                  case 2: return `I'm getting a clearer picture. Who do you see as the first users? Not the whole market - just the first 10-20 people who would use this.`;
                  case 3: return `Good. Now - what resources do you already have? Any technical skills, teammates, existing code, or capital you're working with? This helps me understand what kind of help would actually be useful.`;
                  case 4: return `Makes sense. And honestly - what's your budget situation? Are you looking to bootstrap, invest some capital upfront, or explore equity-based arrangements? There's no wrong answer, it just shapes what we might build together.`;
                  case 5: return `What timeline are you thinking? Some people want to move fast, others are exploring. And what's the smallest thing that would prove the idea works?`;
                  case 6: return `I've got a good sense now. Before I suggest anything specific, let me ask: what would be MOST valuable to you right now? A quick prototype? Technical advice? Help with the token/fundraising side? Or something else entirely?`;
                  case 7: return `## Let's Talk Specifics\n\nBased on our conversation, here's what I'm thinking:\n\n**What You Might Need**\nA focused ${typeStr}${industryStr} that proves the core concept.\n\n**How We Could Work Together**\nThis really depends on your budget and what you can contribute:\n\n- **If you can build it yourself**: We could advise and help with architecture (minimal cost or equity)\n- **If you need a prototype**: We could scope something small (price negotiable based on complexity)\n- **If you need ongoing development**: Monthly retainer or equity arrangement\n\nWhat feels right to you? Or should we discuss the specifics more?`;
                  default: return `Let's figure out the right arrangement. What would work best for you:\n\n1. Pay-as-you-go for specific deliverables?\n2. A monthly retainer for ongoing work?\n3. Equity-based partnership?\n4. Some hybrid of these?\n\nTell me what you're comfortable with and we'll design something that works.`;
                }
              };

              // Use history length to determine conversation stage
              const stage = Math.min(history.length, 7);
              const demoResponse = getStageResponse(stage, context);

              // Send demo flag first
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'demo_mode', isDemo: true })}\n\n`));

              // Stream words with delay
              const words = demoResponse.split(' ');
              for (const word of words) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: word + ' ', isDemo: true })}\n\n`));
                await new Promise(resolve => setTimeout(resolve, 25));
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', isDemo: true })}\n\n`));
            }

          controller.close();
        } catch (error) {
          console.error('Kintsugi Streaming Error Detailed:', error);
          const errorData = JSON.stringify({ type: 'error', error: error instanceof Error ? error.message : 'Failed to generate response' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
