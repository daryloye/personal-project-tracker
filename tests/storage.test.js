import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { JsonStore } from "../src/server/storage.js";

test("JsonStore creates projects and related tasks", async () => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "ppt-storage-"));
  const store = new JsonStore(dataDir);

  const project = await store.createProject({ title: "Tracker", status: "idea" });
  const task = await store.createTask(project.id, { title: "Create API", priority: "high" });
  const loaded = await store.getProject(project.id);

  assert.equal(loaded.title, "Tracker");
  assert.equal(loaded.tasks.length, 1);
  assert.equal(loaded.tasks[0].id, task.id);
  assert.equal(loaded.tasks[0].priority, "high");
});

test("JsonStore saves planning notes on a project", async () => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "ppt-storage-"));
  const store = new JsonStore(dataDir);

  const project = await store.createProject({ title: "Tracker" });
  await store.savePlanningNotes(project.id, { markdown: "# Notes", source: "codex" });
  const loaded = await store.getProject(project.id);

  assert.equal(loaded.planningNotesMarkdown, "# Notes");
  assert.equal(loaded.planningSource, "codex");
});

test("JsonStore redacts API key in public settings", async () => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "ppt-storage-"));
  const store = new JsonStore(dataDir);

  await store.updateAiSettings({ provider: "openai", apiKeyEncrypted: "encrypted" });
  const settings = await store.getAiSettings();

  assert.equal(settings.provider, "openai");
  assert.equal(settings.hasApiKey, true);
  assert.equal("apiKeyEncrypted" in settings, false);
});
