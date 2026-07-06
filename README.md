# Personal Project Tracker

## Overview

Personal Project Tracker is an individual-use web app for planning personal software projects with AI assistance. It lets one person create projects, add tasks with descriptions, track work on a kanban board, ask AI for planning help, and generate Markdown notes or README drafts.

### Problem

- Who is affected?
  - Students, solo developers, and independent builders managing several personal projects.

- What is the issue?
  - Project ideas, tasks, next actions, and notes often get scattered across chats, documents, and memory.
  - AI can help with planning, but the output needs to be attached to the actual project and tasks.
  - Builders need lightweight project notes they can export as Markdown.

### Outcome

- A local fullstack web app for one user to manage projects from idea to working plan.
- The app helps the user:
  - Create projects.
  - Add tasks with title, description, priority, and status.
  - Track tasks in a kanban board: `todo`, `doing`, `blocked`, `done`.
  - Send the project and tasks to AI for planning.
  - Generate Markdown planning notes and README drafts.
  - Download generated notes as a `.md` file.

---

## Demo

Planned user flow:

1. Create a project with title, problem, outcome, and stack.
2. Add tasks with title and description.
3. Move tasks across the kanban board.
4. Click **Plan with AI**.
5. Review the generated Markdown planning notes.
6. Download the notes as a `.md` file or generate a README draft.

---

## Technology Stack

### Frontend components:

- Static HTML, CSS, and browser JavaScript.
- Dashboard-style UI for projects, task entry, kanban tracking, AI planning, and Markdown download.
- Native `fetch` calls to the backend API.

### Backend components:

- Node.js HTTP server for API endpoints and static file serving.
- JSON-file persistence for local-first storage.
- Configurable AI drafting provider:
  - External API when the user enters an API key.
  - Local `codex exec` fallback when Codex CLI is installed and authenticated.
  - Deterministic local templates when neither AI option is available.

Core API endpoints:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PATCH /api/projects/:id`
- `POST /api/projects/:id/tasks`
- `PATCH /api/tasks/:id`
- `POST /api/projects/:id/plan`
- `POST /api/projects/:id/draft-readme`
- `GET /api/settings/ai`
- `PUT /api/settings/ai`
- `POST /api/settings/ai/test`

---

## Installation

```bash
npm run dev
```

The current MVP uses only Node.js built-in modules. JSON data files are stored in `data/` and excluded from version control.

---

## Usage

```bash
npm run dev          # start local development server
npm run start        # run production server
npm run test         # run automated tests
```

Expected behaviour:

- Creating a project stores it locally.
- Adding tasks updates the kanban board.
- Task status buttons move tasks between `todo`, `doing`, `blocked`, and `done`.
- **Plan with AI** sends project/task context to the configured AI provider.
- If no API key is configured, planning uses local `codex exec`.
- If AI is unavailable, planning falls back to deterministic Markdown templates.

---

## Project Structure

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
│  └ server/
│     ├ aiService.js
│     ├ server.js
│     ├ storage.js
│     ├ templates.js
│     └ validation.js
├ tests/
├ docs/
│  └ ai-dev/
│     └ README.md
├ data/
└ Extra/
```

---

## MVP Scope

Must have:

- Project creation and project detail view.
- Task creation with title, description, priority, and status.
- Kanban board for task tracking.
- AI settings page for provider, API key, Codex fallback, and provider test.
- AI planning endpoint with provider fallback.
- Generated Markdown notes.
- README draft generation.
- Markdown download from the browser.

Should have:

- Better milestone suggestions from task groups.
- Export project data as JSON.
- Search and filtering.

Could have:

- Calendar view.
- GitHub repository link checks.
- Drag-and-drop kanban movement.

---

## Data Model

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
  - `planningNotesMarkdown`
  - `planningSource`
  - `createdAt`
  - `updatedAt`

- `Task`
  - `id`
  - `projectId`
  - `title`
  - `description`
  - `status`
  - `priority`
  - `blocker`
  - `createdAt`
  - `updatedAt`

- `AISettings`
  - `id`
  - `provider`
  - `model`
  - `apiKeyEncrypted`
  - `useCodexFallback`
  - `codexCommand`
  - `lastTestStatus`
  - `lastTestedAt`

Provider fallback order:

1. Use configured external provider when an API key is available.
2. Use local `codex exec` when Codex fallback is enabled.
3. Use deterministic templates when no AI provider is available.

---

## Technical Decisions

- Use JSON-file persistence for the first MVP because it avoids dependency setup and keeps the prototype easy to run.
- Use the Node.js HTTP module so the app runs without installing packages.
- Make AI planning the main AI workflow instead of manual AI logs.
- Keep generated notes editable and downloadable as Markdown.
- Run `codex exec` with argument arrays and ignored stdin to avoid shell injection and hanging processes.

