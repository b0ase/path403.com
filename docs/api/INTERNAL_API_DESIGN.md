# b0ase.com Internal API Design

This document outlines the design for an internal API for b0ase.com. This API will serve as a layer of business logic on top of the Supabase backend, providing a more abstract and LLM-friendly interface for platform operations.

The API endpoints will be built as Next.js API Routes (likely under `/app/api/v1/...` or `/app/api/internal/...`).

## Guiding Principles

*   **LLM-Friendly:** Endpoints should accept structured data that's easy for an LLM to generate and should return responses that are easy for an LLM to parse.
*   **Business Logic Encapsulation:** Complex operations or those requiring multiple database interactions should be handled within a single API call.
*   **Idempotency (where applicable):** Design operations to be idempotent if they might be retried.
*   **Clear Error Handling:** Consistent error response formats.
*   **User-Centric:** Operations are generally performed in the context of an authenticated user.

## API Endpoint Ideas

---

### 1. User & Profile Operations

*   **`GET /users/me`**
    *   **Description:** Fetches the profile, skills, and teams for the currently authenticated user.
    *   **Auth:** Required.
    *   **Response:**
        ```json
        {
          "id": "user-uuid",
          "display_name": "User Name",
          "avatar_url": "url",
          "email": "user@example.com",
          "skills": [{"id": "skill-uuid", "name": "Skill Name"}, ...],
          "teams": [{"id": "team-uuid", "name": "Team Name", "slug": "team-slug", "icon_name": "icon", "color_scheme": "color"}, ...]
        }
        ```

*   **`PUT /users/me/profile`**
    *   **Description:** Updates the profile of the currently authenticated user.
    *   **Auth:** Required.
    *   **Request Body:**
        ```json
        {
          "display_name": "New User Name", // optional
          "avatar_url": "new_url" // optional (or handle avatar upload separately)
        }
        ```
    *   **Response:** Updated user profile object.

*   **`POST /users/me/skills`**
    *   **Description:** Adds a skill to the user's profile.
    *   **Auth:** Required.
    *   **Request Body:** `{"skill_id": "skill-uuid"}`
    *   **Response:** Success/failure message.

*   **`DELETE /users/me/skills/{skill_id}`**
    *   **Description:** Removes a skill from the user's profile.
    *   **Auth:** Required.
    *   **Response:** Success/failure message.

---

### 2. Diary & Task Operations

*   **`POST /diary/entries`**
    *   **Description:** Creates a new diary entry with optional action items.
    *   **Auth:** Required.
    *   **Request Body:**
        ```json
        {
          "title": "Diary Entry Title",
          "summary": "Diary summary text.",
          "action_items": ["Action Item 1 Text", "Action Item 2 Text"] // optional
        }
        ```
    *   **Response:** Created diary entry object with nested action items.

*   **`GET /diary/entries`**
    *   **Description:** Lists diary entries for the user, with their action items.
    *   **Auth:** Required.
    *   **Query Params:** `limit`, `offset`, `date_range_start`, `date_range_end`
    *   **Response:** Paginated list of diary entries.

*   **`POST /diary/action-items/{action_item_id}/send-to-wip`**
    *   **Description:** Sends a specific diary action item to the Work In Progress (WIP) task list.
    *   **Auth:** Required.
    *   **Request Body:** (Optional) `{"project_scope_id": "scope-uuid"}` if scope is known.
    *   **Response:**
        ```json
        {
          "message": "Action item sent to WIP.",
          "wip_task_id": "new-wip-task-uuid",
          "diary_action_item_id": "action-item-uuid",
          "updated_action_item_status": "completed"
        }
        ```

*   **`GET /tasks` (WIP Tasks)**
    *   **Description:** Fetches WIP tasks for the user.
    *   **Auth:** Required.
    *   **Query Params:** `status`, `project_scope_id`, `due_date_start`, `due_date_end`, `sort_by`, `limit`, `offset`
    *   **Response:** Paginated list of tasks.
        ```json
        // Task structure similar to DatabaseTask in app/workinprogress/page.tsx
        {
          "id": "task-uuid",
          "text": "Task description",
          "status": "TO_DO",
          "project_scope_id": "scope-uuid", // or null
          "project_scope_name": "Scope Name", // denormalized for convenience
          "source_diary_action_item_id": "action-item-uuid", // or null
          "created_at": "timestamp",
          "updated_at": "timestamp",
          "due_date": "date" // or null
        }
        ```

*   **`POST /tasks` (WIP Tasks)**
    *   **Description:** Creates a new WIP task directly.
    *   **Auth:** Required.
    *   **Request Body:**
        ```json
        {
          "text": "New task description",
          "status": "TO_DO", // optional, defaults to TO_DO
          "project_scope_id": "scope-uuid" // optional
          // other fields like due_date
        }
        ```
    *   **Response:** Created task object.

*   **`PUT /tasks/{task_id}` (WIP Tasks)**
    *   **Description:** Updates a WIP task (status, scope, text, etc.).
    *   **Auth:** Required.
    *   **Request Body:** Partial task object with fields to update.
    *   **Response:** Updated task object.

*   **`DELETE /tasks/{task_id}` (WIP Tasks)**
    *   **Description:** Deletes a WIP task.
    *   **Auth:** Required.
    *   **Response:** Success/failure message.

---

### 3. Team Operations

*   **`GET /teams`**
    *   **Description:** Lists teams the current user is a member of.
    *   **Auth:** Required.
    *   **Response:** List of team objects (id, name, slug, icon_name, color_scheme).

*   **`POST /teams/join`**
    *   **Description:** Allows user to join an existing team (e.g., by team ID or slug).
    *   **Auth:** Required.
    *   **Request Body:** `{"team_id": "team-uuid"}` or `{"team_slug": "team-slug"}`
    *   **Response:** Team membership details or success/error.

*   **`GET /teams/{team_id_or_slug}/messages`**
    *   **Description:** Fetches messages for a specific team.
    *   **Auth:** Required (user must be a member).
    *   **Query Params:** `limit`, `before_message_id` (for pagination)
    *   **Response:** List of message objects.
        ```json
        // Message structure similar to app/teams/[slug]/page.tsx
        {
          "id": "message-uuid",
          "content": "Message text",
          "created_at": "timestamp",
          "user_id": "user-uuid",
          "author": {
            "display_name": "Author Name",
            "avatar_url": "url"
          }
        }
        ```

*   **`POST /teams/{team_id_or_slug}/messages`**
    *   **Description:** Posts a new message to a team.
    *   **Auth:** Required (user must be a member).
    *   **Request Body:** `{"content": "New message text"}`
    *   **Response:** Created message object.

---

### 4. Project Operations (Clients)

*   **`GET /projects`**
    *   **Description:** Lists client projects associated with the user.
    *   **Auth:** Required.
    *   **Response:** List of project objects (id, name).

*   **`POST /projects/{project_id}/members/invite`** (Placeholder - invitation form is disabled)
    *   **Description:** Invites a new member to a project.
    *   **Auth:** Required (user must have permissions).
    *   **Request Body:** `{"email_to_invite": "invitee@example.com", "role": "editor"}`
    *   **Response:** Invitation status.

---

### 5. Project Scopes

*   **`GET /project-scopes`**
    *   **Description:** Lists all available project scopes for the user (combining user's clients and their general scopes).
    *   **Auth:** Required.
    *   **Response:** List of scope objects `{"id": "scope-uuid", "name": "Scope Name"}`.

*   **`POST /project-scopes`**
    *   **Description:** Creates a new general project scope for the user.
    *   **Auth:** Required.
    *   **Request Body:** `{"name": "New Scope Name", "description": "Optional description"}`
    *   **Response:** Created scope object. 