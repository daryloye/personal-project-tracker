export function buildReadmeDraft(project) {
  const tasks = project.tasks || [];
  const milestones = project.milestones || [];
  const blockedTasks = tasks.filter((task) => task.blocker || task.status === "blocked");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return `# ${safe(project.title)}

## Overview

${safe(project.title)} is a personal project created for ${safe(project.targetUser, "an individual user")}. It helps address this problem:

${safe(project.problem, "Problem statement not recorded yet.")}

## Outcome

${safe(project.outcome, "Target outcome not recorded yet.")}

Current status: ${safe(project.status)}

## Technology Stack

${safe(project.techStack, "Technology stack not recorded yet.")}

## Progress

- Milestones: ${milestones.length}
- Tasks: ${tasks.length}
- Completed tasks: ${doneTasks.length}
- Blocked tasks: ${blockedTasks.length}

## Milestones

${listItems(milestones.map((item) => `${item.title} (${item.status})`))}

## Current Tasks

${listItems(tasks.map((item) => `${item.title} (${item.status}, ${item.priority})${item.description ? ` - ${item.description}` : ""}`))}

## Planning Notes

${safe(project.planningNotesMarkdown, "Planning notes not generated yet.")}

## Links

- Repository: ${safe(project.repoUrl, "Not added yet.")}
- Demo: ${safe(project.demoUrl, "Not added yet.")}
`;
}

export function buildPortfolioNotes(project) {
  return {
    headline: `${project.title}: ${project.outcome || "personal project tracker entry"}`,
    problem: project.problem || "Problem statement not recorded yet.",
    contribution: "Planned, implemented, tracked, and documented the project workflow.",
    planningNotes: project.planningNotesMarkdown || ""
  };
}

export function buildPlanningMarkdown(project) {
  const tasks = project.tasks || [];
  const milestones = project.milestones || [];
  const todo = tasks.filter((task) => task.status === "todo");
  const doing = tasks.filter((task) => task.status === "doing");
  const blocked = tasks.filter((task) => task.status === "blocked" || task.blocker);
  const done = tasks.filter((task) => task.status === "done");

  return `# ${safe(project.title)} Planning Notes

## Goal

${safe(project.outcome || project.problem, "Project goal not recorded yet.")}

## Suggested Milestones

${milestones.length ? listItems(milestones.map((item) => `${item.title} (${item.status})`)) : buildMilestoneSuggestions(tasks)}

## Kanban Summary

- To do: ${todo.length}
- Doing: ${doing.length}
- Blocked: ${blocked.length}
- Done: ${done.length}

## Next Actions

${listItems(nextActions(tasks))}

## Task Notes

${listItems(tasks.map((task) => `${task.title}: ${task.description || "No description recorded."}`))}
`;
}

function buildMilestoneSuggestions(tasks) {
  if (!tasks.length) return "- Define the first milestone after adding tasks.";
  return [
    "- Foundation: clarify scope and prepare the project structure.",
    "- Build: complete the main user workflow.",
    "- Polish: test, document, and prepare the project for sharing."
  ].join("\n");
}

function nextActions(tasks) {
  const active = tasks.filter((task) => task.status !== "done" && task.status !== "blocked");
  const source = active.length ? active : tasks.filter((task) => task.status !== "done");
  return source.slice(0, 5).map((task) => `${task.title} (${task.priority || "medium"} priority)`);
}

function listItems(items) {
  if (!items.length) return "- Not recorded yet.";
  return items.map((item) => `- ${item}`).join("\n");
}

function safe(value, fallback = "") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}
