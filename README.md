# Personal Project Tracker

## Overview

Personal Project Tracker is an individual-use web app for students and independent builders who are managing multiple personal software projects while learning with AI tools. It helps one person turn rough ideas into scoped projects, track implementation progress, capture technical decisions, and prepare portfolio-ready documentation.

### Problem

- Who is affected?
  - Students, solo developers, and self-directed learners who are building several personal projects at the same time.
  - Builders who use AI tools but struggle to keep a clear record of prompts, decisions, blockers, and progress.

- What is the issue?
  - Personal projects often become scattered across chat histories, notes, GitHub issues, and half-finished README files.
  - AI-assisted development can move quickly, but it is easy to lose the reasoning behind technical choices.
  - Project submissions, portfolio pages, and demos require clear explanation of problem, outcome, stack, demo flow, and AI usage. These artifacts are often written late instead of captured during development.

### Outcome

- A working fullstack web app for one user to manage personal projects from idea to demo.
- The app will help the user:
  - Create and prioritize project ideas.
  - Break each project into milestones and tasks.
  - Track status, blockers, and next actions.
  - Record AI prompts, AI outputs, human review decisions, and final technical decisions.
  - Generate draft README sections and portfolio notes for each project.

Planned measurable results:

- Reduce time needed to prepare a project README from several hours to under 30 minutes by reusing captured project data.
- Maintain a complete AI development log for each tracked project.
- Keep every active project linked to at least one milestone, one next action, and one recorded technical decision.

---

## Demo

Planned user flow:

1. The user signs in or opens their local personal workspace.
2. The dashboard shows active projects, upcoming deadlines, blocked tasks, and recent AI-assisted decisions.
3. The user creates a new project with title, problem, target outcome, stack, deadline, and project category.
4. The user breaks the project into milestones and tasks.
5. While building, the user adds AI session entries with prompt, tool used, AI suggestion, review notes, and final decision.
6. The user updates task status and marks blockers or completed work.
7. The app generates draft README sections and portfolio notes from the stored project information.

Planned screenshots or demo media:

- Dashboard with active projects and deadlines.
- Project detail page with milestones and tasks.
- AI development log page.
- Generated README draft page.
- Screenshots showing project creation, task tracking, AI log entry, and README generation.

---

## Technology Stack

### Frontend components:

- Static HTML, CSS, and browser JavaScript.
- A dashboard-style UI for creating projects, viewing project details, adding milestones, tasks, AI sessions, and technical decisions.
- Native `fetch` calls to the backend API.

### Backend components:

- Node.js HTTP server for API endpoints and static file serving.
- JSON-file persistence for local-first storage.
- Small validation helpers for request payloads.
- Configurable AI drafting provider:
  - External API when the user enters an API key.
  - Local `codex exec` fallback when Codex CLI is installed and authenticated.
  - Deterministic local templates when neither AI option is available.

Planned core API endpoints:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `POST /api/projects/:id/milestones`
- `POST /api/projects/:id/tasks`
- `POST /api/projects/:id/decisions`
- `PATCH /api/tasks/:id`
- `POST /api/projects/:id/ai-sessions`
- `GET /api/settings/ai`
- `PUT /api/settings/ai`
- `POST /api/settings/ai/test`
- `POST /api/projects/:id/draft-readme`

---

## Installation

Planned setup:

```bash
npm run dev
```

The app uses only Node.js built-in modules, so there are no package dependencies to install for the current MVP. The frontend and backend run from the same local server. JSON data files are stored in `data/` and excluded from version control.

---

## Usage

Planned commands:

```bash
npm run dev          # start local development server
npm run start        # run production server
npm run test         # run automated tests
```

Expected behaviour:

- Creating a project stores the project in the local database.
- Adding tasks and milestones updates project progress.
- AI development log entries remain linked to the relevant project.
- Generated README sections and portfolio notes are editable drafts, not blindly accepted final content.
- If an API key is configured, drafting uses the selected external AI provider.
- If no API key is configured, drafting attempts local `codex exec`.
- If Codex CLI is unavailable or fails, drafting falls back to local templates.

---

## Project Structure

Planned structure:

```text
project/
├ README.md
├ .gitignore
├ package.json
├ src/
│  ├ client/
│  │  ├ index.html
│  │  ├ styles.css
│  │  └ app.js
│  ├ server/
│  │  ├ aiService.js
│  │  ├ server.js
│  │  ├ storage.js
│  │  ├ templates.js
│  │  └ validation.js
├ tests/
├ docs/
│  └ ai-dev/
│     └ README.md
├ assets/
├ data/
└ Extra/
```

Key folders:

- `src/client`: frontend application screens and reusable UI components.
- `src/server`: backend routes, data access, AI provider fallback, and template drafting.
- `tests`: focused unit tests for storage, validation, encryption, templates, and AI fallback behaviour.
- `docs/ai-dev`: documentation of AI tools, prompts, review decisions, and reflection.
- `Extra`: exported logs of AI chat sessions used during development.

---

## MVP Scope

Must have:

- Project CRUD.
- Milestone and task tracking.
- Status fields for `idea`, `planned`, `building`, `blocked`, `demo-ready`, and `submitted`.
- AI session log with prompt, tool, model, output summary, human review, and final decision.
- Dashboard with active projects, blockers, and upcoming deadlines.
- AI settings page for selecting provider, entering an API key, testing the provider, and seeing fallback status.
- README drafting with provider fallback: configured API key, then local `codex exec`, then local templates.

Should have:

- Portfolio-note generator.
- Project priority scoring.
- Simple search and filtering.
- Export project data as Markdown or JSON.

Could have:

- Calendar view.
- GitHub repository link checks.
- Attachment support for screenshots and demo GIFs.
- Local-only mode and cloud-sync mode.

---

## Data Model

Planned entities:

- `Project`
  - `id`
  - `title`
  - `problem`
  - `targetUser`
  - `outcome`
  - `status`
  - `deadline`
  - `techStack`
  - `repoUrl`
  - `demoUrl`
  - `createdAt`
  - `updatedAt`

- `Milestone`
  - `id`
  - `projectId`
  - `title`
  - `description`
  - `dueDate`
  - `status`

- `Task`
  - `id`
  - `projectId`
  - `milestoneId`
  - `title`
  - `description`
  - `status`
  - `priority`
  - `blocker`

- `AISession`
  - `id`
  - `projectId`
  - `tool`
  - `model`
  - `prompt`
  - `outputSummary`
  - `reviewNotes`
  - `decision`
  - `createdAt`

- `Decision`
  - `id`
  - `projectId`
  - `topic`
  - `optionsConsidered`
  - `selectedOption`
  - `rationale`
  - `aiContribution`

- `AISettings`
  - `id`
  - `provider`
  - `model`
  - `apiKeyEncrypted`
  - `useCodexFallback`
  - `codexCommand`
  - `lastTestStatus`
  - `lastTestedAt`
  - `createdAt`
  - `updatedAt`

Provider values:

- `openai`
- `anthropic`
- `gemini`
- `none`

Drafting fallback order:

1. Use the configured external provider when `provider` is not `none` and an API key is available.
2. Use local `codex exec` when `useCodexFallback` is enabled.
3. Use deterministic templates when no AI provider is available.

---

## Development Milestones

1. Foundation
   - Set up dependency-free Node server, static frontend, JSON persistence, and tests.
   - Create initial storage schema.

2. Project Tracking
   - Build dashboard.
   - Add project create, edit, detail, and list views.
   - Add basic API tests.

3. Milestones and Tasks
   - Add milestone and task APIs.
   - Build task board or task table.
   - Add filters for status and blockers.

4. AI Development Log
   - Add AI session entity and forms.
   - Link logs to project detail view.
   - Add decision record support.

5. AI Provider Configuration
   - Add AI settings page.
   - Save provider, model, encrypted API key, and Codex fallback preference.
   - Add provider test endpoint.

6. Documentation Generator
   - Generate README draft from project data.
   - Generate portfolio notes from project data.
   - Keep generated content editable and reviewable.

7. Polish and Submission Prep
   - Add screenshots or demo GIF.
   - Finalize README and `docs/ai-dev/README.md`.
   - Export AI chat logs into `Extra`.

---

## Technical Decisions

Initial decisions:

- Use JSON-file persistence for the first MVP because it avoids dependency setup and keeps the prototype easy to run.
- Use the Node.js HTTP module instead of a framework for the first implementation slice so the app runs without installing packages.
- Let the user configure an external API key for higher-quality AI drafting.
- Fall back to local `codex exec` when no API key is configured, so a logged-in local Codex CLI can still assist with drafting.
- Keep local templates as the final fallback so documentation drafting always works.
- Use AI generation only for drafting, not for silently changing project data.
- Run `codex exec` with argument arrays, not shell-interpolated commands, and use non-interactive settings so the server does not hang waiting for approval.
- Store AI outputs with human review notes so the user can explain what AI did and what they accepted, rejected, or modified.

---

## Risks and Mitigations

- Risk: The app becomes too broad.
  - Mitigation: Keep MVP focused on project tracking, AI logs, and README generation.

- Risk: AI-generated documentation is inaccurate.
  - Mitigation: Treat generated text as a draft and require human review before export.

- Risk: The user does not have API tokens.
  - Mitigation: Try local `codex exec` when available, then fall back to deterministic templates.

- Risk: `codex exec` is unavailable, not logged in, or hangs.
  - Mitigation: Add a provider test button, enforce server timeouts, use non-interactive execution, and fall back to templates on failure.

- Risk: API keys are exposed.
  - Mitigation: Never expose the key back to the frontend after saving. Store encrypted keys locally, redact logs, and allow clearing the key.

- Risk: Sensitive data is pasted into AI prompts.
  - Mitigation: Add a reminder before AI generation and avoid sending private notes unless explicitly selected.

- Risk: The demo flow is unclear.
  - Mitigation: Prepare a seeded sample project so screenshots and walkthrough notes can show the main workflow quickly.
