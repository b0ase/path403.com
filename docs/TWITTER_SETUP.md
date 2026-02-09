# Twitter Setup for @b0ase_com

The automated posting system is configured to post to **@b0ase_com** (the official automated b0ase.com account).

## Current Status

- ✅ Database configured for @b0ase_com
- ✅ Queue system ready
- ⚠️  Twitter API credentials need to be updated

## Setup Steps

### 1. Create Twitter Developer Account for @b0ase_com

1. Log in to Twitter as @b0ase_com
2. Go to https://developer.twitter.com/
3. Apply for Developer Access (if not already done)
4. Create a new Project and App

### 2. Get API Credentials

You need these 4 credentials:

1. **API Key** (Consumer Key)
2. **API Key Secret** (Consumer Secret)
3. **Access Token**
4. **Access Token Secret**

### 3. Update Environment Variables

Update these in `.env.local` and Vercel:

```bash
# Twitter API Credentials for @b0ase_com
TWITTER_API_KEY=your_api_key_here
TWITTER_API_KEY_SECRET=your_api_key_secret_here
TWITTER_ACCESS_TOKEN=your_access_token_here
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret_here
```

### 4. Test Posting

Once credentials are set up, test by:

1. Go to `/dashboard/cron-jobs`
2. Click on **b0ase.com**
3. Click **"Post Next in Queue"**

The post should appear on https://x.com/b0ase_com

## Current Queue

The system already has 4 posts queued and ready to go once @b0ase_com credentials are configured.

## Note on @b0ase

The **@b0ase** account (without _com) is separate and not currently connected to this automation system. If you want to post to @b0ase, you would need to:

1. Add it as a separate social_accounts entry
2. Use separate Twitter API credentials for that account
3. Configure which content goes to which account

## Architecture

```
Site/Project → Social Account → Twitter API Credentials
b0ase.com   → @b0ase_com    → TWITTER_API_KEY (in .env)
```

Each site can have multiple social accounts on different platforms (Twitter, LinkedIn, etc).
