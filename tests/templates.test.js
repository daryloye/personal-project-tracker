import test from "node:test";
import assert from "node:assert/strict";
import { buildPlanningMarkdown, buildPortfolioNotes, buildReadmeDraft } from "../src/server/templates.js";

test("buildReadmeDraft includes project facts and progress counts", () => {
  const draft = buildReadmeDraft({
    title: "Tracker",
    problem: "Projects are scattered.",
    targetUser: "Solo builders",
    outcome: "A focused tracker.",
    status: "building",
    techStack: "Node.js",
    repoUrl: "",
    demoUrl: "",
    milestones: [{ title: "MVP", status: "planned" }],
    tasks: [
      { title: "Create API", status: "done", priority: "high" },
      { title: "Polish UI", status: "blocked", priority: "medium", blocker: true }
    ],
    planningNotesMarkdown: "Use the kanban board to finish the MVP."
  });

  assert.match(draft, /# Tracker/);
  assert.match(draft, /Projects are scattered/);
  assert.match(draft, /Completed tasks: 1/);
  assert.match(draft, /Blocked tasks: 1/);
  assert.match(draft, /Use the kanban board/);
});

test("buildPortfolioNotes returns structured notes", () => {
  const notes = buildPortfolioNotes({
    title: "Tracker",
    outcome: "A focused tracker.",
    problem: "Projects are scattered.",
    planningNotesMarkdown: "Build the core workflow first."
  });

  assert.equal(notes.headline, "Tracker: A focused tracker.");
  assert.equal(notes.planningNotes, "Build the core workflow first.");
});

test("buildPlanningMarkdown creates kanban-oriented notes", () => {
  const notes = buildPlanningMarkdown({
    title: "Tracker",
    outcome: "A focused tracker.",
    tasks: [
      { title: "Create API", description: "Add routes", status: "todo", priority: "high" },
      { title: "Polish UI", description: "Improve layout", status: "done", priority: "medium" }
    ],
    milestones: []
  });

  assert.match(notes, /# Tracker Planning Notes/);
  assert.match(notes, /To do: 1/);
  assert.match(notes, /Create API: Add routes/);
});
