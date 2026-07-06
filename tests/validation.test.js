import test from "node:test";
import assert from "node:assert/strict";
import { validateAiSettings, validateDecision, validateProject, validateTask } from "../src/server/validation.js";

test("validateProject requires a title for creates", () => {
  assert.throws(() => validateProject({ status: "idea" }), /Project title is required/);
  assert.equal(validateProject({ title: "Tracker", status: "idea" }).title, "Tracker");
});

test("validateTask rejects invalid status and priority", () => {
  assert.throws(() => validateTask({ title: "Task", status: "unknown" }), /Invalid task status/);
  assert.throws(() => validateTask({ title: "Task", priority: "urgent" }), /Invalid task priority/);
});

test("validateDecision requires a topic", () => {
  assert.throws(() => validateDecision({ selectedOption: "JSON" }), /Decision topic is required/);
  assert.equal(validateDecision({ topic: "Storage" }).topic, "Storage");
});

test("validateAiSettings checks provider and fallback flag", () => {
  assert.throws(() => validateAiSettings({ provider: "bad" }), /Invalid AI provider/);
  assert.throws(() => validateAiSettings({ useCodexFallback: "yes" }), /Codex fallback/);
  assert.equal(validateAiSettings({ provider: "openai", useCodexFallback: true }).provider, "openai");
});

