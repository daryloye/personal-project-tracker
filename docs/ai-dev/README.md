# AI Development Documentation

## AI Tools

Planned tools, services, models, and purposes:

- ChatGPT or Codex
  - Plan project scope, generate implementation checklists, review architecture, and debug code.
- GitHub Copilot or Cursor
  - Assist with repetitive component code, API route scaffolding, and test generation.
- Local templates
  - Generate editable README drafts and portfolio notes from stored project data without external API tokens.
- Optional external AI API
  - Improve draft wording when credentials are available.
- Local Codex CLI fallback
  - Run `codex exec` from the server when no external API key is configured and the local Codex CLI is installed and authenticated.
- Node.js documentation and built-in test runner
  - Validate HTTP server behaviour, storage logic, and unit tests without external dependencies.

Planned AI agents, roles, and skills:

- Product planning agent
  - Converts vague project ideas into problem statements, target users, outcomes, and milestones.
- Fullstack implementation agent
  - Helps scaffold browser JavaScript, Node.js API routes, local storage, and tests.
- Reviewer agent
  - Reviews generated code for correctness, security, edge cases, and maintainability.
- Documentation agent
  - Produces README drafts, portfolio notes, and technical decision summaries from approved project data.

---

## Development Approach with AI

Planned workflow:

1. Ask AI to clarify the product scope and convert the personal project workflow into project requirements.
2. Ask AI to propose data models and API routes.
3. Human reviews the proposed architecture and removes features outside MVP scope.
4. Ask AI to generate small pieces of implementation.
5. Run tests and inspect behaviour manually.
6. Ask AI to help debug specific errors with command output and relevant code snippets.
7. Record each meaningful prompt, AI suggestion, review note, and final decision in the app and in `Extra`.

Planned runtime AI provider order:

1. External API provider if the user has configured a provider, model, and API key.
2. Local `codex exec` if no API key is configured and Codex CLI is available.
3. Local deterministic templates if both AI options are unavailable.

Key prompts to use:

```text
You are helping me build an individual-use fullstack web app for tracking personal software projects and AI-assisted development work. Convert this requirement into a small MVP with user stories, data models, and API routes. Keep the scope realistic for a student prototype.
```

```text
Review this JSON storage schema for a local-first project tracker. Point out missing relationships, weak field names, and risks for future README generation.
```

```text
Generate a Node.js HTTP route and validation helper for creating a project. Keep the code simple and testable without external dependencies.
```

```text
Review this browser JavaScript UI flow for usability issues, missing states, and mobile layout problems. Do not rewrite unless needed; list concrete fixes first.
```

```text
Given this project data and AI session log, draft the README Overview, Demo, Technology Stack, and Usage sections. Mark assumptions clearly and avoid claiming completed results that are not supported by the data.
```

```text
Review this Node.js service that runs codex exec as a local fallback. Check for shell injection risks, hanging processes, missing timeouts, leaked secrets, and poor error handling.
```

Key review points and corresponding decisions:

- Review point: Should the app support teams?
  - Decision: No. This is an individual-use project, so the app focuses on one user's personal project workflow.

- Review point: Should the app require cloud authentication?
  - Decision: No for MVP. Local-first storage keeps the setup simpler and avoids unnecessary user data exposure.

- Review point: Should AI automatically edit project records?
  - Decision: No. AI may draft documentation, but the user must review and accept changes.

- Review point: Should API tokens be required?
  - Decision: No. Drafting should use an API key when configured, otherwise try local `codex exec`, then fall back to local templates.

- Review point: Should the server call `codex exec`?
  - Decision: Yes, but only as a local fallback. It must use safe process execution, timeouts, non-interactive settings, and a template fallback.

- Review point: Should every AI chat be stored in the database?
  - Decision: Store structured summaries in the app and export full chat logs to `Extra`.

- Review point: Should the first prototype include advanced analytics?
  - Decision: No. Use simple counts for active projects, blockers, and upcoming deadlines.

---

## Reflection

Planned reflection topics:

- What worked:
  - AI is useful for converting a vague personal workflow into a structured product scope.
  - AI can quickly produce candidate data models, routes, and README sections.

- What failed or may fail:
  - AI may over-scope the product by suggesting team features, complex analytics, or integrations too early.
  - Generated documentation may sound complete before the prototype is actually implemented.

- Changes made:
  - Keep the MVP focused on one user's project planning, task tracking, AI logs, and documentation drafting.
  - Add configurable AI provider settings with API-key support and local Codex fallback.
  - Require human review for generated documentation.
  - Separate structured AI session summaries from full raw chat logs.

- Rationale:
  - The app should make the builder's thinking, AI usage, review process, and improvements visible, not hide them behind automation.
