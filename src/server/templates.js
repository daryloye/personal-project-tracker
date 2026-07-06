export function buildReadmeDraft(project) {
  const tasks = project.tasks || [];
  const milestones = project.milestones || [];
  const aiSessions = project.aiSessions || [];
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
- AI sessions logged: ${aiSessions.length}

## Milestones

${listItems(milestones.map((item) => `${item.title} (${item.status})`))}

## Current Tasks

${listItems(tasks.map((item) => `${item.title} (${item.status}, ${item.priority})`))}

## AI Development Notes

${listItems(aiSessions.map((item) => `${item.tool || "AI tool"}: ${item.outputSummary || item.decision || "Session logged."}`))}

## Links

- Repository: ${safe(project.repoUrl, "Not added yet.")}
- Demo: ${safe(project.demoUrl, "Not added yet.")}
`;
}

export function buildPortfolioNotes(project) {
  return {
    headline: `${project.title}: ${project.outcome || "personal project tracker entry"}`,
    problem: project.problem || "Problem statement not recorded yet.",
    contribution: "Planned, implemented, reviewed, and documented the project workflow.",
    technicalDecisions: (project.decisions || []).map((decision) => ({
      topic: decision.topic,
      selectedOption: decision.selectedOption,
      rationale: decision.rationale
    })),
    aiUsage: (project.aiSessions || []).map((session) => ({
      tool: session.tool,
      model: session.model,
      decision: session.decision
    }))
  };
}

function listItems(items) {
  if (!items.length) return "- Not recorded yet.";
  return items.map((item) => `- ${item}`).join("\n");
}

function safe(value, fallback = "") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

