# Content Ideas Bucket Database Setup

## Overview
This document contains the SQL schema for the content ideas bucket system. This database stores links to articles, tweets, GitHub repos, and other content that will feed into the auto-blog generation system.

## Schema

### 1. Create content_ideas table

```sql
-- Create content_ideas table
create table if not exists public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text,
  source_type text not null check (source_type in ('article', 'tweet', 'repo', 'manual')),
  tags text[] default '{}',
  notes text,
  used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on user_id for faster queries
create index if not exists content_ideas_user_id_idx on public.content_ideas(user_id);

-- Create index on created_at for sorting
create index if not exists content_ideas_created_at_idx on public.content_ideas(created_at desc);

-- Create index on used for filtering unused ideas
create index if not exists content_ideas_used_idx on public.content_ideas(used);
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS
alter table public.content_ideas enable row level security;

-- Policy: Users can view their own content ideas
create policy "Users can view own content ideas"
  on public.content_ideas
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own content ideas
create policy "Users can insert own content ideas"
  on public.content_ideas
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own content ideas
create policy "Users can update own content ideas"
  on public.content_ideas
  for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own content ideas
create policy "Users can delete own content ideas"
  on public.content_ideas
  for delete
  using (auth.uid() = user_id);
```

### 3. Create updated_at trigger

```sql
-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for content_ideas
create trigger set_updated_at
  before update on public.content_ideas
  for each row
  execute function public.handle_updated_at();
```

## Setup Instructions

1. Open Supabase Studio
2. Navigate to the SQL Editor
3. Copy and paste the SQL above
4. Execute the queries in order
5. Verify tables and policies are created under the "Database" tab

## Table Schema Reference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY | Unique identifier |
| user_id | uuid | FOREIGN KEY, NOT NULL | Reference to auth.users |
| url | text | NOT NULL | URL to the content source |
| title | text | NULLABLE | Title of content (auto-detected or manual) |
| source_type | text | NOT NULL, CHECK | Type: article, tweet, repo, manual |
| tags | text[] | DEFAULT '{}' | Array of tags for categorization |
| notes | text | NULLABLE | User notes about the content |
| used | boolean | DEFAULT false | Whether content has been used in a blog post |
| created_at | timestamptz | NOT NULL | Timestamp when created |
| updated_at | timestamptz | NOT NULL | Timestamp when last updated |

## API Endpoints

After running this SQL, the following API endpoints will be functional:

- `POST /api/content-ideas` - Create new idea
- `GET /api/content-ideas` - Fetch all ideas for current user
- `DELETE /api/content-ideas/[id]` - Delete an idea
- `PATCH /api/content-ideas/[id]` - Update an idea (mark as used, edit fields)

## Integration with Auto-Blog System

The `used` field tracks whether an idea has been incorporated into a blog post. The daily cron job will:

1. Query unused ideas (`used = false`)
2. Process ideas based on tags and source type
3. Generate blog posts
4. Mark ideas as `used = true`

This ensures each idea is only used once while maintaining a history of all processed content.
