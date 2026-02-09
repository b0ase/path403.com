# Project To-Do List

- [x] ~~**Database:** Apply migrations to add `status` and `preview_deployment_url` columns to `clients` table and create `site_settings` table.~~
- [x] ~~**Workflow:** Test the preview deployment workflow:~~
    - [x] ~~Add an external preview URL (e.g., Vercel) to a project via `/admin/projects`.~~
    - [x] ~~Verify the "Next (1-4 Weeks)" iframe on `/projects/[slug]` loads this URL correctly.~~
    - [x] ~~Verify the "Now (Live)" iframe on `/projects/[slug]` still loads the `website` URL.~~
- [x] ~~**Cleanup:** Remove the `/previews/*` route and related files (`app/previews/layout.tsx`, `app/previews/[slug]/page.tsx`).~~
- [x] ~~**Git:** Resolve the Git push issue (local branch behind remote). Fetch/pull from `origin main` and then push.~~
- [x] ~~**Bug:** Investigate and fix the "Invalid <Link> with <a> child" error (Checked `/projects/[slug]` page - Link is correct there. Monitor if error reappears elsewhere).~~ - **RESOLVED** Feature duplication issue fixed.
- [ ] **Google Sheets Integration:** Debug the `POST /api/google/export-transactions` 401 "invalid_grant" error. This might be related to OAuth scope changes or token issues.
- [ ] **Team Page - Add New Member:** Investigate why the user selection dropdown in the "Add New Member" form on `/team` is appearing empty despite users being present in the `profiles` table (e.g., `ninjapunkgirls`). Check data fetching in `fetchPlatformUsers` and the rendering logic in `app/team/page.tsx`.

# Critical Unresolved Bugs
- [ ] **`/teams/join` Page Failure (PGRST200):**
    - [ ] **Symptom:** Page shows "Oops! Something went wrong. Could not load teams."
    - [ ] **Error:** Console shows `PGRST200` - "Could not find a relationship between 'teams' and 'created_by' in the schema cache" despite FK `teams_created_by_fkey` on `public.teams.created_by` referencing `auth.users(id)` being verified, and multiple attempts to refresh schema cache (NOTIFY, RLS touch, FK drop/re-add).
    - [ ] **Status:** Persistently blocked. Requires fresh investigation or alternative approaches.
- [ ] **`/projects/join` Page Failure:**
    - [ ] **Symptom:** Page shows "Oops! Something went wrong. Could not load available projects. Please ensure RLS policies on \"clients\" and \"profiles\" allow reads."
    - [ ] **Error:** Suggests RLS issues on `public.clients` or `public.profiles`, or issues with the data fetching query.
    - [ ] **UI Bug:** Page also displays a double navigation bar.
- [ ] **Avatar Display Instability:**
    - [ ] Sidebar avatar sometimes shows Google default instead of uploaded custom avatar, or there's a flicker.
    - [ ] Ensure consistent and stable display of the correct user avatar across all components (Sidebar, Profile Page, Chat, etc.) after login and avatar updates.

# New Feature Requests & Enhancements

## User & Team Management
- [x] ~~**Profile Pictures:** Implement profile picture upload, storage (e.g., Supabase Storage), and display for users.~~ (Core functionality implemented, see "Avatar Display Instability" bug above)
- [x] ~~**"Start a New Project" from Profile Page:**~~
    - [x] ~~Add a prominent "Start a New Project" button/CTA on the user's profile page (`/profile`), especially visible if they have no existing projects.~~
    - [x] ~~This button should lead to a new page/form (e.g., `/projects/new`).~~
    - [ ] The form should allow users to define their project, including:
        - Project Name/Title.
        - Project Type (e.g., dropdown: Website, Mobile App, Software, Book, AI Solution, Other/Anything).
        - A description field to articulate their ideas, needs, and desired features.
    - [ ] Upon submission, this should create a new entry in the `public.clients` table (or your equivalent projects table) and associate it with the user (e.g., in `public.project_users` as the client or owner).
- [-] **Profile Page Action Buttons:**
    - [x] ~~Add "Join A Team" button to profile page (linking to `/teams/join`).~~
    - [x] ~~Add "Start New Team" button to profile page (linking to `/teams/new`).~~
    - [-] Add "Join A Project" button to profile page (linking to `/projects/join`). <!-- Page created, but has loading/RLS errors and UI bugs. See "Critical Unresolved Bugs". -->
- [ ] **Team Functionality - Phase 1 (DB Setup & Initial Page):**
    - [x] ~~Database Schema: `teams` and `user_team_memberships` tables with RLS.~~
    - [x] ~~Seed `teams` table with initial data (including "Database Divas").~~
    - [-] ~~Update `/teams/join` page to fetch from DB.~~ <!-- Page created but critically broken. See "Critical Unresolved Bugs". -->
- [ ] **Team Functionality - Phase 2: Dynamic Team Pages & Join Logic**
    - [ ] Create dynamic route `app/teams/[teamSlug]/page.tsx`.
    - [ ] Display team details and member list on `app/teams/[teamSlug]/page.tsx`.
    - [ ] Implement actual "Join Team" functionality on `/teams/join` (inserts into `user_team_memberships`) - **BLOCKED by `/teams/join` page failure.**
    - [ ] Implement "Leave Team" functionality.
- [ ] **Team Functionality - Phase 3: Profile Team Badges**
    - [ ] Fetch and display team badges on user profiles (`/profile`).

## Team Functionality - Phase X: Messaging Debug & Completion
- [ ] **Resolve/Re-evaluate Team Messaging (`app/teams/[slug]/page.tsx`):**
    - [ ] Current implementation has faced multiple issues (messages not displaying, errors, RLS complexities, real-time stability).
    - [ ] **Decision Point:** Stabilize current custom implementation OR investigate robust third-party/plug-and-play chat solutions compatible with Supabase/Next.js.
    - [ ] **If Stabilizing Current:**
        - [ ] Investigate why posted messages are not displayed, despite successful insertion.
        - [ ] Diagnose and fix the "Error: Failed to load messages." error.
        - [ ] **RLS Policies:**
            - [ ] Double-check `SELECT` RLS policy on `team_messages` to ensure team members can read messages.
            - [ ] Verify `SELECT` RLS policy on `profiles` allows joined data (sender's name/avatar) to be read.
        - [ ] **Data Integrity:**
            - [ ] Confirm `team_id` in `team_messages` correctly links to the `teams` table.
            - [ ] Ensure `user_team_memberships` accurately reflects user membership for the specific `team_id` being viewed.
        - [ ] **Schema & Caching:**
            - [ ] Ensure `created_at` column in `team_messages` is consistently accessible and not affected by caching.
        - [ ] **Frontend Logic:**
            - [ ] Add client-side logging in `fetchMessages` and `fetchTeamDetails` to trace `teamId` and API responses.
            - [ ] Verify real-time subscription for new messages is functioning correctly.
    - [ ] Implement "Delete Own Message" functionality (RLS was added, frontend needed).

## Authentication & Authorization
- [ ] **Additional OAuth Providers:**
    - [ ] Investigate and integrate more Supabase OAuth login options (e.g., GitHub, X.com, wallet-based logins). Prioritize those with straightforward setup.
- [ ] **Cross-Browser Auth Issues (Safari/Brave):**
    - [ ] Investigate and fix OAuth login/logout inconsistencies in Safari and Brave browsers.
    - [ ] Specifically address the issue where, after logout, re-login automatically selects the previous Google profile without prompting.

## UI & UX Improvements
- [ ] **Logout Button Relocation:** Move the "Logout" button in `UserSidebar.tsx` to a more prominent, non-scrolling position (e.g., top of the sidebar or user menu in a header).
- [ ] **Revert "My " Prefix in Menu:** Remove "My " from sidebar menu items (e.g., "My Diary" -> "Diary", "My Finances" -> "Finances") for general user clarity.
- [ ] **"My Projects" Page - Drag & Drop Prioritization:**
    - [ ] Implement drag-and-drop reordering for projects listed on the `/myprojects` page.
    - [ ] The order should visually signify priority/urgency ("hotness").
- [ ] **Work In Progress (WIP) Page Enhancements:**
    - [ ] **Editable Tasks:** Allow users to edit their tasks directly on the WIP page (e.g., inline editing or via a modal).
    - [ ] **Dynamic Scope Dropdown:** Ensure the "scope" dropdown for new WIP tasks populates with all projects from the current user's "My Projects" list.
    - [ ] **Visual Priority from "My Projects":** Link the project order/urgency from "My Projects" to visual cues (e.g., color-coding, highlighting) for related tasks in the WIP list.
- [ ] **Diary Entry CRUD:** Add "Edit" and "Delete" buttons/functionality to each diary entry.
- [ ] **Develop/Enhance 'My Teams' page to list user's teams and link to individual team pages.**

## Project & Task Management Flow
- [ ] **Streamline Diary -> WIP Workflow**
    - [x] ~~Analyze current diary entry process and `/workinprogress` page.~~ (Done through conversation & code review)
    - [ ] Define ideal flow for converting diary plans to actionable WIP items.
    - [ ] Implement UI/backend changes to support the new workflow (e.g., button in diary to create WIP tasks, UI for itemizing).
- [ ] **Automatic Project Listing for Team Members:** If a user is added to a project team (via `project_users`), ensure that project automatically appears on their `/myprojects` page.

## Onboarding & Signup Flow
- [ ] **Join Existing Project During Signup:** Modify the new client/user signup flow (`/signup` or similar) to allow users to select and join an *existing* project (e.g., one pre-created by an admin for them) instead of always creating a new project. This will prevent duplicate project entries like the "Robust-AE" case.

## Data Integrity & Cleanup
- [ ] **Consolidate Duplicate Client Entries:**
    - [ ] **"Robust-AE" vs "robust-ae.com":**
        - Investigate and consolidate duplicate entries for "Robust-AE" / "robust-ae.com" in the `public.clients` table.
        - Ensure the canonical entry (likely "robust-ae.com") is correctly linked in `public.project_users` for all relevant users.
        - Clean up any corresponding duplicate/incorrect entries in `public.project_scopes`.
    - [ ] **"Ninja Punk Girls" vs "ninjapunkgirls.com":**
        - Investigate and consolidate entries for "Ninja Punk Girls" / "ninjapunkgirls.com" in `public.clients` to the canonical name (likely "ninjapunkgirls.com").
        - Ensure correct linkage in `public.project_users`.
        - Clean up corresponding entries in `public.project_scopes`.
- [ ] **Align "b0ase.com Platform" as a Client Project:**
    - [ ] Ensure an entry exists in `public.clients` for "b0ase.com Platform" (or similar canonical name).
    - [ ] Ensure `richardwboase@gmail.com` is linked to this client entry in `public.project_users`.
    - [ ] Verify the existing "b0ase.com Platform" `project_scope` aligns with this client entry by name.
- [ ] **Run Project Scopes Catch-up Script:** After the above data cleanup in `clients` and `project_users`, re-run the SQL script to populate/update `public.project_scopes` to ensure consistency for the WIP dropdown.

## Planning & Admin
- [ ] **Admin Diary/WIP Population:** (For `richardwboase@gmail.com`) Review recent development and populate personal diary and WIP board with tasks and plans for "tomorrow." (Meta-task for user/AI collaboration) 