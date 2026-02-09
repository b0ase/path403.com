# Scaling Knowledge Base - b0ase.com

## Purpose

Document scaling challenges, solutions, and lessons learned as b0ase.com and its incubated projects grow from 0 to millions of users.

**Philosophy**: "Scaling isn't a destination. It's a continuous series of bottleneck discoveries."

Every stage feels like the final architecture. None of them are.

---

## Scaling Milestones & Bottlenecks

### 0 → 1,000 Users (Current: Early Stage)

**Bottlenecks**:
- None yet - single Vercel instance handles everything
- Supabase free tier sufficient
- No caching needed

**What Works**:
- ✅ Next.js App Router on Vercel
- ✅ Supabase PostgreSQL (single instance)
- ✅ Direct database queries
- ✅ Server-side rendering
- ✅ Prisma ORM with connection pooling

**What to Watch**:
- Database connection pool limits (Supabase free tier: 60 connections)
- API route response times (should be <200ms)
- File upload sizes (currently server-handled)
- Build times (currently ~2-3 minutes)

**Prepare For**:
- Database read replicas
- CDN for static assets
- Rate limiting on public APIs

---

### 1,000 → 5,000 Users (Anticipated)

**Expected Bottleneck**: Single database becomes the bottleneck

**Symptoms**:
- Slow query times (>500ms)
- Connection pool exhaustion
- Timeouts on read-heavy pages
- Dashboard loading slowly

**Solution**: Add read replicas
```typescript
// Separate read/write database connections
const writeDb = prisma // Primary database
const readDb = prismaReadReplica // Read replica

// Use read replica for queries
const posts = await readDb.post.findMany()

// Use primary for writes
await writeDb.post.create({ data })
```

**Implementation**:
- Configure Supabase read replicas
- Update Prisma client with multiple data sources
- Route reads to replica, writes to primary
- Monitor replication lag (<100ms acceptable)

**Cost**: ~$25/month for read replica

---

### 5,000 → 20,000 Users

**Expected Bottleneck**: Session storage overwhelms Redis

**Symptoms**:
- Login failures during peak times
- Session data lost
- Redis memory maxed out
- Slow authentication checks

**Solution**: Switch to JWT tokens
```typescript
// Before: Server-side sessions in Redis
session.set('userId', user.id) // Redis storage

// After: Stateless JWT tokens
const token = jwt.sign({ userId: user.id }, secret) // No storage needed
```

**Implementation**:
- Generate JWT on login
- Store in httpOnly cookies
- Verify signature on each request
- No session storage needed

**Benefits**:
- Scales horizontally (no shared state)
- No Redis memory limits
- Faster auth checks (no database/Redis lookup)

**Tradeoffs**:
- Can't invalidate tokens immediately (use short expiry + refresh tokens)
- Larger cookie size (JWT vs session ID)

---

### 20,000 → 50,000 Users

**Expected Bottleneck**: File uploads kill our servers

**Symptoms**:
- Server memory spikes during uploads
- Upload failures
- Slow response times during upload processing
- Vercel function timeouts (10s limit)

**Solution**: Move to S3 with presigned URLs
```typescript
// Before: Upload through server
// app/api/upload/route.ts
const file = await request.formData()
await saveToServer(file) // Server handles file

// After: Direct upload to S3
// app/api/upload/presigned/route.ts
const presignedUrl = await s3.getSignedUrlPromise('putObject', {
  Bucket: 'b0ase-uploads',
  Key: fileName,
  Expires: 300, // 5 minutes
  ContentType: file.type
})

// Client uploads directly to S3
await fetch(presignedUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type }
})
```

**Implementation**:
- Set up S3 bucket (or Cloudflare R2, Backblaze B2)
- Generate presigned URLs via API
- Client uploads directly to S3
- Webhook notifies server when complete
- Store S3 URL in database

**Benefits**:
- Server doesn't handle file data
- Scales infinitely
- Lower bandwidth costs
- Faster uploads (direct to CDN)

**Cost**: ~$0.023/GB stored + $0.09/GB transfer

---

### 50,000 → 75,000 Users

**Expected Bottleneck**: Search becomes unusable

**Symptoms**:
- Full-text search queries take 5+ seconds
- Database CPU spikes during search
- Search results incomplete or timeout
- `LIKE '%query%'` queries cause table scans

**Solution**: Implement Elasticsearch or Algolia

**Option A: Elasticsearch** (Self-hosted)
```typescript
// Index documents
await esClient.index({
  index: 'posts',
  id: post.id,
  body: {
    title: post.title,
    content: post.content,
    tags: post.tags,
    createdAt: post.createdAt
  }
})

// Search
const results = await esClient.search({
  index: 'posts',
  body: {
    query: {
      multi_match: {
        query: searchQuery,
        fields: ['title^3', 'content', 'tags^2']
      }
    }
  }
})
```

**Option B: Algolia** (Managed)
```typescript
const index = algolia.initIndex('posts')

// Index records
await index.saveObjects(posts)

// Search
const results = await index.search(searchQuery)
```

**Implementation**:
- Choose Elasticsearch (flexible, cheaper at scale) or Algolia (easier, faster setup)
- Sync database changes to search index
- Use search index for all search queries
- Keep database as source of truth

**Cost**:
- Elasticsearch: ~$50/month (AWS OpenSearch)
- Algolia: ~$1/1000 searches (can get expensive)

---

### 75,000 → 100,000 Users

**Expected Bottleneck**: DNS becomes single point of failure

**Symptoms**:
- Site inaccessible during DNS provider outages
- Slow DNS resolution in some regions
- No failover if primary region goes down
- High latency for international users

**Solution**: Multi-region with Route53 failover
```typescript
// Multi-region setup
Primary Region: us-east-1 (Vercel)
Failover Region: eu-west-1 (Vercel)
Backup Region: ap-southeast-1 (Netlify)

// Route53 health checks
Health Check → Primary (us-east-1)
If fails → Failover (eu-west-1)
If fails → Backup (ap-southeast-1)
```

**Implementation**:
- Deploy to multiple regions (Vercel, Cloudflare, Netlify)
- Configure Route53 health checks
- Set up DNS failover routing
- Monitor health check status
- Sync database across regions (read replicas)

**Benefits**:
- High availability (99.99% uptime)
- Geographic load balancing
- Faster response times globally
- Disaster recovery built-in

**Cost**: ~$0.50/health check + $0.50/million queries

---

## Architecture Evolution

### Stage 1: Monolith (0-5K users)
```
Next.js App (Vercel)
    ↓
Supabase PostgreSQL (single instance)
    ↓
Supabase Storage
```

**Good for**: Early stage, fast iteration, low cost

### Stage 2: Replicated Database (5K-20K users)
```
Next.js App (Vercel)
    ↓
PostgreSQL Primary (writes)
    ↓
PostgreSQL Replicas (reads)
```

**Good for**: Read-heavy workloads, growing traffic

### Stage 3: Stateless Architecture (20K-50K users)
```
Next.js App (Vercel, JWT auth)
    ↓
PostgreSQL Primary + Replicas
    ↓
S3 (file storage)
```

**Good for**: Horizontal scaling, file-heavy apps

### Stage 4: Microservices (50K-100K users)
```
Next.js Frontend (Vercel)
    ↓
API Gateway (Vercel Edge Functions)
    ↓
Services:
    - Auth Service
    - Content Service (Elasticsearch)
    - File Service (S3)
    - Payment Service
    ↓
PostgreSQL Primary + Replicas
```

**Good for**: Team scaling, service isolation, fault tolerance

### Stage 5: Multi-Region (100K+ users)
```
Global Load Balancer (Route53)
    ↓
Regional Deployments:
    - us-east-1 (Primary)
    - eu-west-1 (Failover)
    - ap-southeast-1 (Backup)
    ↓
Distributed Database (PostgreSQL + Read Replicas per region)
    ↓
Global CDN (Cloudflare)
```

**Good for**: Global scale, high availability, low latency worldwide

---

## Cost Evolution

| Users | Monthly Cost | Primary Costs |
|-------|-------------|---------------|
| 0-1K | $0-50 | Vercel Hobby + Supabase Free |
| 1K-5K | $50-200 | Vercel Pro + Supabase Pro |
| 5K-20K | $200-500 | + Read replicas + Redis |
| 20K-50K | $500-2K | + S3 storage + More compute |
| 50K-75K | $2K-5K | + Elasticsearch + CDN |
| 75K-100K | $5K-10K | + Multi-region + Health checks |
| 100K+ | $10K+ | + Dedicated infrastructure |

**Cost Optimization Tips**:
- Use Cloudflare for CDN (free tier generous)
- Self-host Elasticsearch vs Algolia (1/10th cost at scale)
- Use object storage (S3/R2/B2) vs server storage
- Optimize images/videos (save 70% bandwidth costs)
- Cache aggressively (reduce database load)

---

## Monitoring & Alerts

### Key Metrics to Track

**At every scale**:
- Response time (p50, p95, p99)
- Error rate (%)
- Request volume (req/s)
- Database connection pool usage (%)

**As you scale**:
- Database query time (ms)
- Cache hit rate (%)
- Search response time (ms)
- File upload success rate (%)
- Regional latency (ms per region)

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Response time (p95) | >500ms | >2s |
| Error rate | >1% | >5% |
| Database connections | >80% | >95% |
| Cache hit rate | <70% | <50% |
| Search time | >200ms | >1s |
| Uptime | <99.9% | <99% |

**Tools**:
- Vercel Analytics (built-in)
- Supabase Metrics (built-in)
- Sentry (error tracking)
- Datadog or New Relic (advanced monitoring)

---

## Performance Optimization Checklist

### Before 5K Users
- [ ] Enable Next.js incremental static regeneration (ISR)
- [ ] Add database indexes for common queries
- [ ] Implement API response caching
- [ ] Optimize images with Next.js Image component
- [ ] Use React Server Components where possible

### Before 20K Users
- [ ] Set up database read replicas
- [ ] Implement Redis caching layer
- [ ] Move static assets to CDN
- [ ] Add rate limiting to public APIs
- [ ] Optimize database queries (remove N+1 patterns)

### Before 50K Users
- [ ] Migrate to JWT authentication
- [ ] Implement presigned URLs for uploads
- [ ] Add Elasticsearch for search
- [ ] Set up monitoring and alerting
- [ ] Load test critical paths

### Before 100K Users
- [ ] Multi-region deployment
- [ ] Database sharding (if needed)
- [ ] CDN at edge (Cloudflare)
- [ ] Advanced caching strategies
- [ ] Chaos engineering tests

---

## Database Scaling Strategies

### Vertical Scaling (Easiest)
**What**: Upgrade database instance size
**When**: 0-20K users
**Cost**: 2x size = 2x cost
**Limit**: Eventually hit max instance size

### Read Replicas (Common)
**What**: Add read-only database copies
**When**: 5K-100K users
**Cost**: +$25/replica/month
**Limit**: Replication lag, write bottleneck remains

### Connection Pooling (Essential)
**What**: Reuse database connections
**When**: Always (day 1)
**Cost**: Free
**Limit**: Can't solve slow queries

### Caching (High Impact)
**What**: Cache query results in Redis/memory
**When**: 5K+ users
**Cost**: ~$10-50/month
**Limit**: Cache invalidation complexity

### Sharding (Complex)
**What**: Split data across multiple databases
**When**: 100K+ users
**Cost**: High (engineering + infrastructure)
**Limit**: Complex queries across shards

---

## Lessons from Real Scaling

### Lesson 1: Optimize Before Scaling
> "We spent $5K/month on infrastructure before fixing a single slow query. Turns out, adding an index saved us $4K/month."

**Action**: Profile and optimize before throwing money at the problem.

### Lesson 2: Cache Wisely
> "We cached everything. Except we forgot cache invalidation. Users saw stale data for hours."

**Action**: Design cache invalidation strategy from day 1.

### Lesson 3: Monitor Everything
> "Our database was at 95% CPU for 3 days before we noticed. No alerts configured."

**Action**: Set up monitoring and alerts before you need them.

### Lesson 4: Load Test Early
> "First time we hit 10K concurrent users was during a launch. Everything crashed. We never tested it."

**Action**: Load test critical paths before launch.

### Lesson 5: Database Indexes Are Magic
> "Added 3 indexes. Response time dropped from 3s to 30ms. Why did we wait so long?"

**Action**: Profile queries, add indexes for frequent patterns.

---

## Scaling Roadmap for b0ase.com

### Phase 1: Foundation (Current)
**Users**: 0-1K
**Focus**: Product-market fit, core features
**Infrastructure**: Vercel + Supabase (free tier)
**Cost**: $0-50/month

### Phase 2: Growth (Next 6 months)
**Users**: 1K-5K
**Focus**: User acquisition, feature expansion
**Infrastructure**: Vercel Pro + Supabase Pro + CDN
**Cost**: $50-200/month
**Prepare**: Read replicas, caching strategy

### Phase 3: Scale (6-12 months)
**Users**: 5K-20K
**Focus**: Retention, optimization, monetization
**Infrastructure**: Multi-database, Redis, S3
**Cost**: $200-500/month
**Prepare**: JWT auth, presigned uploads

### Phase 4: Enterprise (12-24 months)
**Users**: 20K-100K
**Focus**: Enterprise features, high availability
**Infrastructure**: Elasticsearch, multi-region, advanced caching
**Cost**: $2K-10K/month
**Prepare**: Microservices, global distribution

---

## Quick Reference: Bottleneck Solutions

| Bottleneck | Symptom | Solution |
|------------|---------|----------|
| Slow database reads | Query time >500ms | Add read replicas + indexes |
| Slow database writes | Write queue backup | Vertical scaling + sharding |
| Session storage | Login failures | Switch to JWT tokens |
| File uploads | Server memory spikes | Presigned S3 URLs |
| Search | Search time >2s | Elasticsearch or Algolia |
| API rate limits | 429 errors | Rate limiting + CDN |
| High latency | Slow in some regions | Multi-region deployment |
| Downtime | Single point of failure | Load balancer + failover |

---

## Resources

**Books**:
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "The Art of Scalability" by Abbott & Fisher

**Articles**:
- [Discord: How We Scaled to Millions of Users](https://discord.com/blog/how-discord-stores-billions-of-messages)
- [Instagram: Scaling to 1M Users](https://instagram-engineering.com/what-powers-instagram-hundreds-of-instances-dozens-of-technologies-adf2e22da2ad)

**Tools**:
- k6 (load testing)
- pganalyze (database performance)
- Datadog (monitoring)

---

## Contributing

As b0ase.com scales, add lessons learned here:

```markdown
### [Users Range]

**Bottleneck**: [What broke]

**Symptoms**:
- [Observable issue 1]
- [Observable issue 2]

**Solution**: [How we fixed it]

**Code Example**:
[Code snippet]

**Results**:
- [Improvement metric 1]
- [Improvement metric 2]

**Cost**: [Monthly cost change]

**Date**: [When this happened]
```

---

**Last Updated**: January 16, 2026
**Status**: Preparatory (0-1K users)
**Next Review**: At 1K users
