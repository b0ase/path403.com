# Unused Vercel Environment Variables

These environment variables were found in the Vercel dashboard but are not actively used in the codebase and can be safely removed:

## ❌ UNUSED (Safe to remove):

1. **DEEPSEEK_AI_API_KEY** - Only in stuff.txt (not code)
2. **GOOGLE_AI_PRO_API_KEY** - Only in scripts/docs, not active code
3. **GROQ_API_KEY** - Not found in codebase
4. **PERPLEXITY_API_KEY** - Not found in codebase
5. **GITHUB_TOKEN** - Only in docs
6. **SUNO_SESSION_ID** - Not found in codebase
7. **NEXT_PUBLIC_GOOGLE_AI_PRO_API_KEY** - Not found in codebase
8. **DATABASE_URL** - Not found in codebase
9. **DISCORD_BOT_TOKEN** - Not found in codebase
10. **OPENROUTER_API_KEY** - Not found in codebase
11. **NOTION_TOKEN** - Not found in codebase
12. **STRIPE_SECRET_KEY** - Not found in codebase
13. **STRIPE_WEBHOOK_SECRET** - Not found in codebase
14. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** - Not found in codebase
15. **RESEND_API_KEY** - Not found in codebase
16. **UPLOADTHING_SECRET** - Not found in codebase
17. **UPLOADTHING_APP_ID** - Not found in codebase
18. **WEBHOOK_SECRET** - Not found in codebase
19. **NEXT_PUBLIC_WEBHOOK_URL** - Not found in codebase
20. **VERCEL_URL** - Not found in codebase
21. **NEXTAUTH_SECRET** - Only in stuff.txt (not active code)
22. **NEXTAUTH_URL** - Only in stuff.txt (not active code)

## Note

These variables are candidates for deletion but are being left in place for now unless there's a clear conflict. We'll be setting up Stripe integration, so Stripe-related variables may become active again.

## Audit Date
December 24, 2025