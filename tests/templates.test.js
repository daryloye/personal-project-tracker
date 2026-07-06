import test from "node:test";
import assert from "node:assert/strict";
import { buildPortfolioNotes, buildReadmeDraft } from "../src/server/templates.js";

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
    aiSessions: [{ tool: "Codex", outputSummary: "Suggested API routes." }]
  });

  assert.match(draft, /# Tracker/);
  assert.match(draft, /Projects are scattered/);
  assert.match(draft, /Completed tasks: 1/);
  assert.match(draft, /Blocked tasks: 1/);
  assert.match(draft, /Codex: Suggested API routes/);
});

test("buildPortfolioNotes returns structured notes", () => {
  const notes = buildPortfolioNotes({
    title: "Tracker",
    outcome: "A focused tracker.",
    problem: "Projects are scattered.",
    decisions: [{ topic: "Storage", selectedOption: "JSON", rationale: "Simple local prototype." }],
    aiSessions: [{ tool: "Codex", model: "default", decision: "Accepted route shape." }]
  });

  assert.equal(notes.headline, "Tracker: A focused tracker.");
  assert.equal(notes.technicalDecisions[0].selectedOption, "JSON");
  assert.equal(notes.aiUsage[0].decision, "Accepted route shape.");
});

