# Kintsugi Gateway Container
# Has secrets, proxies requests from the sandboxed agent
# Never exposes secrets to the agent container

FROM node:20-alpine

WORKDIR /gateway

# Install dependencies (retry for transient DNS issues)
RUN for i in 1 2 3 4 5; do \
    apk add --no-cache git openssh-client curl jq \
    && break || sleep 5; \
    done

# Copy gateway code
COPY package.json ./
COPY gateway.ts ./
COPY tsconfig.json ./

# Install and build
RUN npm install && npm run build

# Create non-root user for gateway
RUN adduser -D -u 1001 gateway
USER gateway

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

CMD ["node", "dist/gateway.js"]
