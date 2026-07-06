const projectStatuses = new Set(["idea", "planned", "building", "blocked", "demo-ready", "submitted"]);
const taskStatuses = new Set(["todo", "doing", "blocked", "done"]);
const priorities = new Set(["low", "medium", "high"]);
const providers = new Set(["openai", "anthropic", "gemini", "none"]);

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function requireObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "Expected a JSON object.");
  }
  return value;
}

export function validateProject(input, partial = false) {
  const body = requireObject(input);
  if (!partial && !stringPresent(body.title)) throw new HttpError(400, "Project title is required.");
  if (body.status && !projectStatuses.has(body.status)) throw new HttpError(400, "Invalid project status.");
  return body;
}

export function validateMilestone(input) {
  const body = requireObject(input);
  if (!stringPresent(body.title)) throw new HttpError(400, "Milestone title is required.");
  return body;
}

export function validateTask(input, partial = false) {
  const body = requireObject(input);
  if (!partial && !stringPresent(body.title)) throw new HttpError(400, "Task title is required.");
  if (body.status && !taskStatuses.has(body.status)) throw new HttpError(400, "Invalid task status.");
  if (body.priority && !priorities.has(body.priority)) throw new HttpError(400, "Invalid task priority.");
  return body;
}

export function validateAiSession(input) {
  const body = requireObject(input);
  if (!stringPresent(body.prompt) && !stringPresent(body.outputSummary)) {
    throw new HttpError(400, "AI session requires a prompt or output summary.");
  }
  return body;
}

export function validateAiSettings(input) {
  const body = requireObject(input);
  if (body.provider && !providers.has(body.provider)) throw new HttpError(400, "Invalid AI provider.");
  if (body.apiKey && typeof body.apiKey !== "string") throw new HttpError(400, "API key must be a string.");
  if (body.useCodexFallback !== undefined && typeof body.useCodexFallback !== "boolean") {
    throw new HttpError(400, "Codex fallback must be true or false.");
  }
  return body;
}

function stringPresent(value) {
  return typeof value === "string" && value.trim().length > 0;
}

