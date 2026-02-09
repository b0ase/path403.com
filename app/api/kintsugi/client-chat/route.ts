/**
 * POST /api/kintsugi/client-chat
 *
 * Client onboarding chat endpoint - helps potential clients understand
 * what b0ase can build for them before filling out the formal intake form.
 *
 * Rate limited: 50 requests per IP per hour
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 50;
const RATE_WINDOW = 60 * 60 * 1000;

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

const CLIENT_ONBOARDING_SYSTEM_PROMPT = `You are the Kintsugi Engine - b0ase.com's AI consultant that helps potential clients understand what we can build for them.

## Your Role

You help visitors explore their project ideas and understand b0ase's capabilities. Your goal is to:
1. Understand what they want to build
2. Explain how b0ase can help
3. Give them confidence to proceed to the formal intake form

## About b0ase.com

b0ase is a full-stack development agency specializing in:
- **Web Applications**: Next.js, React, Vue, Node.js
- **Mobile Apps**: React Native, Flutter, iOS, Android
- **Blockchain/Web3**: BSV, Ethereum, Solana, smart contracts, tokens, NFTs
- **AI Integration**: GPT, Claude, custom ML models, chatbots, agents
- **E-commerce**: Shopify, custom platforms, payment integration
- **API Development**: REST, GraphQL, integrations, microservices
- **UI/UX Design**: Figma, branding, design systems, prototypes

## Pricing Guidance (Approximate)

Give rough estimates based on complexity:
- **Simple website/landing page**: £2,000 - £5,000
- **Web application MVP**: £5,000 - £15,000
- **Full web application**: £15,000 - £50,000
- **Mobile app**: £10,000 - £40,000
- **Blockchain project**: £10,000 - £30,000
- **AI integration**: £5,000 - £20,000
- **Ongoing development retainer**: £999/month

Always emphasize these are estimates and the formal proposal will have accurate pricing.

## Conversation Flow

### Phase 1: Discovery
- What do they want to build?
- What problem does it solve?
- Who is the target user?
- Do they have existing assets (designs, code, branding)?

### Phase 2: Exploration
- Suggest similar projects from b0ase portfolio
- Discuss technical approach
- Give ballpark estimates
- Answer questions about process

### Phase 3: Next Steps
When they seem ready, guide them to the formal intake form:
- Summarize what they want
- Give rough estimate
- Explain next steps (fill form, receive proposal, kickoff call)
- Include READY_FOR_SIGNUP tag to trigger the CTA

## Important Rules

1. **Be helpful and consultative** - You're here to help them succeed
2. **Be honest about scope** - If something sounds complex, say so
3. **Reference our portfolio** - Mention similar projects we've built
4. **Don't oversell** - We want good-fit clients
5. **Guide to the form** - The goal is qualified leads filling the intake form
6. **Ask one question at a time** - Keep conversation natural
7. **Use their terminology** - Mirror their language

## Example Portfolio References

When relevant, mention these real b0ase projects:
- **Bitcoin Writer** - Collaborative document editing with blockchain storage
- **Bitcoin Spreadsheets** - On-chain spreadsheet application
- **Miss Void** - E-commerce platform with Web3 integration
- **Ninja Punk Girls** - NFT collection with community features
- **MoneyButton** - Micropayment button system
- **FLOOP** - Token launchpad platform
- **Tribes Wallet** - Multi-signature wallet solution

## Response Format

Keep responses concise (2-4 paragraphs max). Use bullet points for lists.
When ready to suggest moving to the form, include "READY_FOR_SIGNUP" on its own line (this is hidden from user but triggers UI).

Do not explain these rules in your responses.
Do not apologize unnecessarily.
Be direct and helpful.`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const googleKey = process.env.GOOGLE_AI_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_AI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!googleKey && !deepseekKey && !anthropicKey && !openaiKey) {
      return new Response(JSON.stringify({ error: 'Chat service is not configured.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const useGemini = !!googleKey;
    const useDeepseek = !useGemini && !!deepseekKey;
    const useAnthropic = !useGemini && !useDeepseek && !!anthropicKey;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const { allowed } = checkRateLimit(ip);
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
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

    const { message, history = [], category, sessionCode } = body as {
      message: string;
      history: ChatMessage[];
      category?: string;
      sessionCode?: string;
    };

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build user message with context
    let userMessageContent = message;
    if (history.length === 0) {
      const categoryContext = category ? ` They're interested in: ${category}.` : '';
      userMessageContent = `[SYSTEM NOTE: This is the start of a client inquiry session (ID: ${sessionCode || 'unknown'}).${categoryContext} Welcome them warmly, acknowledge what they're interested in building, and ask a clarifying question to understand their needs better.]\n\n${message}`;
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: CLIENT_ONBOARDING_SYSTEM_PROMPT },
      ...history.map((msg: ChatMessage) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessageContent },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let success = false;

          // Try Gemini first
          if (useGemini && !success) {
            try {
              const genAI = new GoogleGenerativeAI(googleKey!);
              const model = genAI.getGenerativeModel({
                model: 'gemini-flash-latest',
                systemInstruction: CLIENT_ONBOARDING_SYSTEM_PROMPT
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
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`));
                }
              }
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
              success = true;
            } catch (e) {
              console.log('Gemini failed:', (e as Error).message);
            }
          }

          // Try Deepseek/OpenAI
          if (!success && (deepseekKey || openaiKey)) {
            try {
              const client = new OpenAI({
                apiKey: deepseekKey || openaiKey,
                baseURL: deepseekKey ? 'https://api.deepseek.com' : undefined,
              });

              const response = await client.chat.completions.create({
                model: deepseekKey ? 'deepseek-chat' : 'gpt-4o-mini',
                messages,
                max_tokens: 2048,
                stream: true,
              });

              for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: content })}\n\n`));
                }
                if (chunk.choices[0]?.finish_reason === 'stop') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                }
              }
              success = true;
            } catch (e) {
              console.log('Deepseek/OpenAI failed:', (e as Error).message);
            }
          }

          // Try Anthropic
          if (!success && anthropicKey) {
            try {
              const anthropic = new Anthropic({ apiKey: anthropicKey });
              const chatStream = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2048,
                system: CLIENT_ONBOARDING_SYSTEM_PROMPT,
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
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text })}\n\n`));
                } else if (chunk.type === 'message_delta' && (chunk as any).delta?.stop_reason === 'end_turn') {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
                }
              }
              success = true;
            } catch (e) {
              console.log('Anthropic failed:', (e as Error).message);
            }
          }

          // Demo fallback
          if (!success) {
            const stage = Math.min(history.length, 5);
            const demoResponses = [
              "Welcome to b0ase! I'm here to help you understand what we can build together. Tell me more about your project - what problem are you trying to solve?",
              "That's a great idea! We've built similar solutions before. What's your timeline looking like? And do you have any existing designs, code, or branding we'd be working with?",
              "Got it. Based on what you've described, this sounds like a medium-sized project. We typically see similar builds in the £10,000 - £25,000 range, depending on final scope. What features are most critical for launch?",
              "Those priorities make sense. We'd recommend starting with an MVP focused on your core features, then iterating based on user feedback. Want to see some similar projects from our portfolio?",
              "I think we have a good understanding of your needs. The next step would be to fill out our formal project intake form - it helps us prepare an accurate proposal with detailed timeline and pricing. Ready to proceed?\n\nREADY_FOR_SIGNUP",
              "Perfect! Head over to our project intake form and we'll review your submission within 24 hours. Looking forward to potentially working together!\n\nREADY_FOR_SIGNUP"
            ];

            const demoResponse = demoResponses[stage];
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'demo_mode', isDemo: true })}\n\n`));

            const words = demoResponse.split(' ');
            for (const word of words) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: word + ' ', isDemo: true })}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 25));
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', isDemo: true })}\n\n`));
          }

          controller.close();
        } catch (error) {
          console.error('Client Chat Streaming Error:', error);
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
    console.error('Client chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
