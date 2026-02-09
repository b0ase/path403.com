# b0ase.com Model Context Protocol (MPC) Design

This document outlines a conceptual design for a Model Context Protocol (MPC) to enable LLM agents to interact with the b0ase.com internal API. The goal is to define how capabilities are exposed, context is managed, and interactions are structured.

## Core Principles

*   **Discoverability:** An LLM agent should be able to understand the available capabilities of the b0ase.com platform.
*   **Clarity:** Instructions and data passed between LLMs should be unambiguous.
*   **Contextual Awareness:** The b0ase.com agent/API should receive sufficient context to fulfill requests accurately.
*   **Structured I/O:** Interactions should rely on well-defined schemas (e.g., JSON) for requests and responses.
*   **Error Handling:** LLM-friendly error messages that can guide retries or clarification.

## Components of the MPC

### 1. Capability Manifest / Function Definitions

The b0ase.com platform will expose its capabilities (corresponding to the internal API endpoints) as a set of "functions" or "tools" that an LLM can call. This manifest would be accessible to authorized LLM agents.

Each function definition would include:

*   **`name`**: A unique, descriptive name (e.g., `create_diary_entry`, `get_user_tasks`).
*   **`description`**: A natural language description of what the function does, intended for the LLM to understand its purpose.
*   **`parameters`**: A JSON Schema object defining the expected input parameters, their types, whether they are required, and descriptions for each parameter.
    *   Example for `create_diary_entry`:
        ```json
        {
          "type": "object",
          "properties": {
            "title": {"type": "string", "description": "The title of the diary entry."},
            "summary": {"type": "string", "description": "The main content/summary of the diary entry."},
            "action_items": {
              "type": "array",
              "items": {"type": "string"},
              "description": "A list of action item texts related to this entry. Optional."
            }
          },
          "required": ["title", "summary"]
        }
        ```
*   **`returns`**: (Optional but recommended) A JSON Schema object describing the expected structure of the successful response.

This is very similar to OpenAI's Function Calling or tool usage patterns.

### 2. Interaction Flow (Example)

1.  **User to User's LLM:** "Hey LLM, tell b0ase.com to create a new diary entry for today's meeting about the Q3 roadmap. The summary is 'Discussed key milestones and potential blockers.' And add an action item: 'Draft Q3 roadmap document by EOW.'"
2.  **User's LLM to b0ase.com LLM Gateway (which uses the MPC):**
    *   The User's LLM identifies the intent: `create_diary_entry`.
    *   It consults the b0ase.com capability manifest.
    *   It formats a request (e.g., a JSON payload for an API call, or a structured prompt if b0ase.com has its own LLM agent).
    *   **Context Passed:**
        *   Authenticated User Token (handled by the underlying API call).
        *   Function call: `create_diary_entry`
        *   Arguments:
            ```json
            {
              "title": "Today's Meeting: Q3 Roadmap",
              "summary": "Discussed key milestones and potential blockers.",
              "action_items": ["Draft Q3 roadmap document by EOW."]
            }
            ```

3.  **b0ase.com Internal API Execution:** The internal API endpoint for creating a diary entry is invoked.
4.  **b0ase.com LLM Gateway to User's LLM:** Returns a structured response.
    *   **Success:**
        ```json
        {
          "status": "success",
          "operation": "create_diary_entry",
          "data": { /* ... created diary entry object ... */ },
          "message": "Diary entry 'Today's Meeting: Q3 Roadmap' created successfully with 1 action item."
        }
        ```
    *   **Error:**
        ```json
        {
          "status": "error",
          "operation": "create_diary_entry",
          "error_code": "VALIDATION_ERROR", // or "PERMISSION_DENIED", "INTERNAL_ERROR"
          "message": "Title is required for a diary entry.",
          "details": { /* ... optional further details ... */ }
        }
        ```
5.  **User's LLM to User:** "Okay, I've told b0ase.com to create the diary entry 'Today's Meeting: Q3 Roadmap' with your action item."

### 3. Context Management

*   **User Identification:** All interactions are tied to an authenticated user. The internal API would handle this via tokens.
*   **Session/Conversation Context (Advanced):** For more complex, multi-turn interactions initiated by an LLM, the MPC might need to define how conversational state or context is passed back and forth if the b0ase.com agent needs to remember previous turns of *its specific interaction with the calling LLM*. This could be managed via session IDs or by having the calling LLM summarize and pass relevant history.
*   **User Preferences/Platform State:** The b0ase.com agent should have access to relevant user preferences and current platform state (e.g., current project, last viewed team) via the internal API to provide more contextual responses and actions, even if not explicitly stated in every LLM request.

### 4. Authentication & Authorization

*   LLM agent interactions with the b0ase.com internal API must be securely authenticated (e.g., API keys for trusted LLM services, or OAuth for user-delegated LLM actions).
*   Authorization will be enforced by the internal API based on the authenticated user's permissions.

## Example LLM "Tool" Definition (for b0ase.com)

An LLM interacting with b0ase.com would be configured with tools like this:

```json
{
  "type": "function",
  "function": {
    "name": "b0ase_send_diary_action_item_to_wip",
    "description": "Sends a specific action item from a user's diary to their Work In Progress (WIP) task list on b0ase.com. The action item is then typically marked as completed in the diary.",
    "parameters": {
      "type": "object",
      "properties": {
        "action_item_id": {
          "type": "string",
          "description": "The unique identifier (UUID) of the diary action item to send to WIP."
        },
        "project_scope_id": {
          "type": "string",
          "description": "Optional. The unique identifier (UUID) of the project scope to associate with the new WIP task."
        }
      },
      "required": ["action_item_id"]
    }
  }
}
```

This MPC design provides a foundational sketch. It would evolve with more detailed schemas and interaction patterns as specific use cases are developed. 