# Projects System Setup

## Issue
The `/auth/projects` page is failing because the `projects` table doesn't exist and is missing the `created_by` column.

## Solution
We need to create the complete projects system with proper database schema.

## Step 1: Apply the Projects Migration

Run the migration to create all necessary tables:

```bash
npx supabase migration new create_projects_system
```

Then copy the content from `supabase/migrations/20250101000003_create_projects_system.sql` and apply it:

```bash
npx supabase db push
```

## Step 2: Get Your User UUID

First, find your user UUID by running this query in the Supabase SQL editor:

```sql
SELECT id, email FROM auth.users WHERE email = 'richardwboase@gmail.com';
```

Copy your UUID for the next step.

## Step 3: Seed Projects Data

1. Open `scripts/seed-projects.sql`
2. Replace all instances of `'YOUR_USER_UUID_HERE'` with your actual UUID from Step 2
3. Run the modified script in the Supabase SQL editor

## Database Schema Created

### Tables Created:
- **`projects`** - Main projects table with `created_by` column
- **`teams`** - Teams associated with projects  
- **`user_project_memberships`** - User roles in projects
- **`join_requests`** - Requests to join projects
- **`clients`** - Client information for projects

### Key Features:
- **Project Ownership**: Every project has a `created_by` field (you as the creator)
- **Transfer Capability**: Projects can be transferred via `owner_user_id`
- **Team Management**: Users can request to join projects
- **Role-Based Access**: Different roles (Owner, Admin, Developer, etc.)
- **Public/Private Projects**: Control project visibility

## Project Management Flow

1. **You create all projects** - `created_by` = your UUID
2. **Users can request to join** - via the join requests system
3. **You can invite users** - add them as team members
4. **You can transfer ownership** - change `owner_user_id`

## After Setup

Once the migration is applied and data is seeded:

1. Visit `/auth/projects` - should now load all your projects
2. You'll see all projects where `created_by` = your UUID
3. You can manage team members and join requests
4. Users can request to join your projects

## Troubleshooting

If you still get errors:

1. Check that the migration was applied: `SELECT * FROM projects LIMIT 1;`
2. Verify your UUID is correct: `SELECT auth.uid();` (when logged in)
3. Check RLS policies are working: Try querying projects while authenticated

## Next Steps

After the projects system is working:

1. Test the `/auth/projects` page
2. Create some test join requests
3. Test inviting users to projects
4. Verify the team management features work 