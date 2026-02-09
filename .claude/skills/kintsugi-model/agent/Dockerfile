# Kintsugi Agent Container
# Sandboxed environment for Claude Code - NO SECRETS BAKED IN
# All API access goes through the Gateway proxy

FROM node:20-alpine

# Install development tools (no secrets here)
# Retry logic for transient DNS issues
RUN for i in 1 2 3 4 5; do \
    apk add --no-cache \
      git \
      curl \
      jq \
      bash \
      openssh-client \
      python3 \
      py3-pip \
    && break || sleep 5; \
    done

# Install pnpm globally
RUN npm install -g pnpm@9

# Create project directory (using existing node user, UID 1000)
RUN mkdir -p /home/node/projects && \
    mkdir -p /home/node/.claude && \
    chown -R node:node /home/node

# Install Claude Code CLI (latest)
RUN npm install -g @anthropic-ai/claude-code

# Switch to unprivileged node user
USER node
WORKDIR /home/node

# Copy agent configuration
COPY --chown=node:node agent-config.json /home/node/.claude/settings.json
COPY --chown=node:node system-prompt.md /home/node/system-prompt.md

# Environment variables (non-secret configuration only)
ENV HOME=/home/node
ENV CLAUDE_CODE_GATEWAY=http://gateway:3001
ENV NODE_ENV=production

# The entrypoint script handles startup
COPY --chown=node:node entrypoint.sh /home/node/entrypoint.sh
RUN chmod +x /home/node/entrypoint.sh

ENTRYPOINT ["/home/node/entrypoint.sh"]
