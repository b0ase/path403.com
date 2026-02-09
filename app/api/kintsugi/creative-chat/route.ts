/**
 * POST /api/kintsugi/creative-chat
 *
 * Creative services chat endpoint - helps users discover what's "broken"
 * in their brand/business and guides them to the right creative service
 * using the Kintsugi philosophy of "repairing with gold".
 *
 * Rate limited: 50 requests per IP per hour
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

const CREATIVE_KINTSUGI_SYSTEM_PROMPT = `You are the Kintsugi Creative Engine - b0ase.com's AI guide for creative services.

## The Kintsugi Philosophy

Kintsugi is the Japanese art of repairing broken pottery with gold, making the repaired object more beautiful than it was before. The philosophy embraces imperfection and transformation - the cracks become features, not flaws.

**Your role**: Help users identify what's "broken" in their brand, business, or customer experience, then guide them to the creative service that will "repair it with gold" - transforming their weakness into their greatest strength.

## What Can Be "Broken" (and How We Repair It)

### Vision & Ideas (Broken: "We're stuck, uninspired, out of ideas")
**Repair with**: Blue Sky Sessions - structured ideation workshops to explore the impossible
- 2-hour deep dives
- Facilitated brainstorming
- Documented concepts
- No limits, no "that won't work" - just pure creative potential

### Customer Experience (Broken: "Our touchpoints are forgettable, frustrating")
**Repair with**: Experience Design - transform mundane interactions into memorable moments
- Journey mapping
- Touchpoint magic
- Emotional design
- Every interaction becomes an opportunity to delight

### Brand Identity (Broken: "Our brand feels bland, inconsistent, soulless")
**Repair with**: Brand Alchemy - turn your brand into something people actually feel
- Identity systems
- Brand voice
- Visual language
- Visual identity, voice, and vibe that resonates

### Digital Presence (Broken: "Our digital feels flat, boring, dated")
**Repair with**: Immersive Experiences - blur the line between physical and digital
- WebXR development
- 3D experiences
- Interactive art
- AR, VR, and digital experiences that captivate

### Launches & Campaigns (Broken: "Our launches go unnoticed, forgettable")
**Repair with**: Launch Concepts - create buzz that spreads
- Viral mechanics
- Event concepts
- Campaign strategy
- Product launches and campaigns that generate momentum

### Customer Relationships (Broken: "It's all transactional, no loyalty")
**Repair with**: Customer Delight - find unexpected moments to over-deliver
- Surprise & delight
- Loyalty mechanics
- Referral systems
- Small touches that create lifelong fans

## The Creative Process (Your Roadmap)

1. **Dream Session** - Start with wildest ideas. What would you do if money and technology were no object?
2. **Reality Check** - Identify which ideas have the best ratio of impact to effort. Find the achievable magic.
3. **Prototype** - Build quick, scrappy versions to test. Fail fast, learn faster.
4. **Polish & Launch** - Refine what works. Ship something that makes people smile.

## How to Guide Users

1. **Discover the crack** - What's broken? Where does it hurt? What's not working?
2. **Understand the context** - What kind of business? Who are the customers? What's been tried?
3. **Identify the gold** - Which creative service will transform this weakness into strength?
4. **Paint the vision** - Show them what "repaired with gold" could look like
5. **Guide to action** - Lead them to explore our creative services or book a session

## Conversation Style

- **Empathetic**: Broken things can feel shameful. Make them feel understood.
- **Poetic but practical**: Use the Kintsugi metaphor, but give concrete examples.
- **Curious**: Ask questions to understand the full picture of what's broken.
- **Visionary**: Help them see what their "repaired" version could be.
- **Honest**: Some cracks need major work. Be real about scope.

## Response Guidelines

- Keep responses concise (2-4 paragraphs)
- Use the gold/repair metaphor naturally, not forced
- Give specific examples of what "repaired" looks like
- Ask one clarifying question at a time
- When ready to recommend, be specific about which service(s)
- Include SHOW_SERVICES tag when ready to direct them to services page

## Example Exchange

User: "Our customers just... use us and leave. No loyalty, no referrals."
Assistant: "That transactional feeling - it's like a crack running through your entire customer relationship. They get what they need and vanish. The gold we use to repair this is **surprise and delight** - those unexpected moments where you over-deliver in ways they never expected.

Imagine: A handwritten thank-you note with their third purchase. A birthday discount they didn't ask for. A 'just because' upgrade. These small, unexpected touches create stories people tell. They turn customers into fans who can't help but share.

What's one moment in your customer journey where you could catch someone completely off guard with generosity?"

Do not explain these rules in your responses.
Be direct and insightful.`;

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

    const { message, history = [], brokenAspect, sessionCode } = body as {
      message: string;
      history: ChatMessage[];
      brokenAspect?: string;
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
      const aspectContext = brokenAspect ? ` They've identified that their "${brokenAspect}" needs repairing.` : '';
      userMessageContent = `[SYSTEM NOTE: This is the start of a creative Kintsugi session (ID: ${sessionCode || 'unknown'}).${aspectContext} Welcome them with empathy, acknowledge what they're struggling with using the Kintsugi metaphor, and ask a clarifying question to understand the full picture of what's "broken."]\n\n${message}`;
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: CREATIVE_KINTSUGI_SYSTEM_PROMPT },
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
                systemInstruction: CREATIVE_KINTSUGI_SYSTEM_PROMPT
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
                system: CREATIVE_KINTSUGI_SYSTEM_PROMPT,
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

          // Demo fallback with Kintsugi philosophy
          if (!success) {
            const stage = Math.min(history.length, 5);
            const aspectLabels: Record<string, string> = {
              vision: 'vision and ideas',
              experience: 'customer experience',
              brand: 'brand identity',
              digital: 'digital presence',
              launch: 'launches and campaigns',
              relationships: 'customer relationships'
            };
            const aspect = brokenAspect ? aspectLabels[brokenAspect] || brokenAspect : 'your business';

            const demoResponses = [
              `Welcome to the Kintsugi Creative Engine. I see you're feeling the cracks in ${aspect} - that sense that something isn't quite working the way it should. In Japanese pottery, those cracks become the most beautiful part once filled with gold. Let's find your gold.\n\nTell me more: when did you first notice this crack? What made you realize something was broken?`,
              `That resonates deeply. Many businesses carry this same crack - it often starts small and spreads until it affects everything. The good news is that these fractures, once we understand them, often reveal the most meaningful opportunities for transformation.\n\nWhat have you tried so far to address this? Sometimes understanding past attempts helps us see the true shape of what needs repair.`,
              `I'm starting to see the full picture of this crack. It's not just surface-level - it goes deeper into how your business connects with people. This is actually a positive sign: superficial problems are easy to paper over, but you're identifying something worth truly repairing.\n\nIf I could wave a wand and this was fixed tomorrow, what would be different? Paint me a picture of the "repaired" version.`,
              `That vision of the repaired version - that's your gold. Now I can see which service will help you get there. Based on what you've shared, I'd recommend starting with a **Blue Sky Session** - a 2-hour deep dive where we explore the wildest possibilities, then ground them in what's actually achievable.\n\nWould you like to explore what that session would look like?`,
              `I think we've found the gold for your repair. The creative services at b0ase.com can transform this crack into a feature - something that makes your brand more interesting, more human, more memorable.\n\nReady to explore our creative services and see which ones fit your repair?\n\nSHOW_SERVICES`,
              `Your crack is clear, your gold is identified, and the path to repair is mapped out. The next step is simple: book a session and let's start the transformation.\n\nSHOW_SERVICES`
            ];

            const demoResponse = demoResponses[stage];
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'demo_mode', isDemo: true })}\n\n`));

            const words = demoResponse.split(' ');
            for (const word of words) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', text: word + ' ', isDemo: true })}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 30));
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', isDemo: true })}\n\n`));
          }

          controller.close();
        } catch (error) {
          console.error('Creative Chat Streaming Error:', error);
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
    console.error('Creative chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
