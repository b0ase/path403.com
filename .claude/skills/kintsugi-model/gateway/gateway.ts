/**
 * Kintsugi Gateway Server
 *
 * Security proxy that sits between the sandboxed agent and external services.
 * - Injects API keys without exposing them to the agent
 * - Rate limits requests to prevent runaway costs
 * - Audit logs all actions
 * - Allowlists permitted operations
 */

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Configuration from environment
const config = {
  port: parseInt(process.env.GATEWAY_PORT || '3001'),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  githubToken: process.env.GITHUB_TOKEN || '',
  pipelineApiUrl: process.env.PIPELINE_API_URL || 'https://www.b0ase.com/api/pipeline',
  pipelineApiKey: process.env.PIPELINE_API_KEY || '',

  // Rate limits
  maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '60'),
  maxTokensPerHour: parseInt(process.env.MAX_TOKENS_PER_HOUR || '100000'),

  // Allowlisted hosts
  allowedHosts: [
    'api.anthropic.com',
    'api.github.com',
    'b0ase.com',
    'registry.npmjs.org',
  ],
};

// Audit logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: '/var/log/kintsugi/audit.log' }),
    new winston.transports.Console(),
  ],
});

// Rate limiting state
const rateLimiter = {
  requests: new Map<string, number[]>(),
  tokens: 0,
  lastTokenReset: Date.now(),
};

// Middleware: Rate limiting
function rateLimit(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${req.ip}-${minute}`;

  const requests = rateLimiter.requests.get(key) || [];
  requests.push(now);
  rateLimiter.requests.set(key, requests);

  // Clean old entries
  for (const [k, v] of rateLimiter.requests.entries()) {
    if (!k.endsWith(`-${minute}`)) {
      rateLimiter.requests.delete(k);
    }
  }

  if (requests.length > config.maxRequestsPerMinute) {
    logger.warn({ event: 'rate_limit_exceeded', ip: req.ip, path: req.path });
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  next();
}

// Middleware: Request logging
function auditLog(req: Request, res: Response, next: NextFunction) {
  const requestId = uuidv4();
  (req as any).requestId = requestId;

  const startTime = Date.now();

  res.on('finish', () => {
    logger.info({
      event: 'request',
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - startTime,
      ip: req.ip,
    });
  });

  next();
}

app.use(rateLimit);
app.use(auditLog);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Proxy to Anthropic API (for Claude Code)
app.post('/anthropic/*', async (req, res) => {
  if (!config.anthropicApiKey) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  const path = req.path.replace('/anthropic', '');

  try {
    const response = await fetch(`https://api.anthropic.com${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json() as { usage?: { input_tokens?: number; output_tokens?: number } };

    // Track token usage
    if (data.usage) {
      rateLimiter.tokens += (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0);

      // Reset hourly
      if (Date.now() - rateLimiter.lastTokenReset > 3600000) {
        rateLimiter.tokens = 0;
        rateLimiter.lastTokenReset = Date.now();
      }

      if (rateLimiter.tokens > config.maxTokensPerHour) {
        logger.warn({ event: 'token_limit_exceeded', tokens: rateLimiter.tokens });
        return res.status(429).json({ error: 'Hourly token limit exceeded' });
      }
    }

    logger.info({
      event: 'anthropic_request',
      path,
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
      totalTokens: rateLimiter.tokens,
    });

    res.status(response.status).json(data);
  } catch (error) {
    logger.error({ event: 'anthropic_error', error: String(error) });
    res.status(500).json({ error: 'Anthropic API request failed' });
  }
});

// Proxy to Pipeline API
app.all('/pipeline/*', async (req, res) => {
  const path = req.path.replace('/pipeline', '');

  try {
    const response = await fetch(`${config.pipelineApiUrl}${path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.pipelineApiKey}`,
        'X-Gateway-Request': 'true',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    logger.info({
      event: 'pipeline_request',
      method: req.method,
      path,
      status: response.status,
    });

    res.status(response.status).json(data);
  } catch (error) {
    logger.error({ event: 'pipeline_error', error: String(error) });
    res.status(500).json({ error: 'Pipeline API request failed' });
  }
});

// Proxy to GitHub API (for issue management)
app.all('/github/*', async (req, res) => {
  if (!config.githubToken) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }

  const path = req.path.replace('/github', '');

  // Allowlist: Only permit specific GitHub operations
  const allowedPatterns = [
    /^\/repos\/[^/]+\/[^/]+\/issues$/,           // List/create issues
    /^\/repos\/[^/]+\/[^/]+\/issues\/\d+$/,      // Get/update issue
    /^\/repos\/[^/]+\/[^/]+\/pulls$/,            // List/create PRs
    /^\/repos\/[^/]+\/[^/]+\/pulls\/\d+$/,       // Get/update PR
    /^\/repos\/[^/]+\/[^/]+\/contents\/.+$/,     // Read file contents
  ];

  const isAllowed = allowedPatterns.some(pattern => pattern.test(path));

  if (!isAllowed) {
    logger.warn({ event: 'github_blocked', path });
    return res.status(403).json({ error: 'GitHub operation not permitted' });
  }

  try {
    const response = await fetch(`https://api.github.com${path}`, {
      method: req.method,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${config.githubToken}`,
        'User-Agent': 'Kintsugi-Agent',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    logger.info({
      event: 'github_request',
      method: req.method,
      path,
      status: response.status,
    });

    res.status(response.status).json(data);
  } catch (error) {
    logger.error({ event: 'github_error', error: String(error) });
    res.status(500).json({ error: 'GitHub API request failed' });
  }
});

// Block all other requests
app.all('*', (req, res) => {
  logger.warn({ event: 'blocked_request', method: req.method, path: req.path });
  res.status(403).json({ error: 'Request not permitted' });
});

// Start server
app.listen(config.port, () => {
  logger.info({ event: 'gateway_started', port: config.port });
  console.log(`Kintsugi Gateway running on port ${config.port}`);
});
