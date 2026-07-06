import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { AiDraftService } from "../src/server/aiService.js";

test("draftReadme falls back to template when codex fails", async () => {
  const service = new AiDraftService({
    store: fakeStore({
      provider: "none",
      apiKeyEncrypted: "",
      useCodexFallback: true,
      codexCommand: "codex"
    }),
    appSecret: "secret",
    codexCommand: "codex",
    spawnImpl: failingSpawn
  });

  const result = await service.draftReadme({
    title: "Tracker",
    problem: "Scattered projects.",
    tasks: [],
    milestones: [],
    aiSessions: []
  });

  assert.equal(result.source, "template");
  assert.match(result.text, /# Tracker/);
  assert.match(result.warning, /not logged in/);
});

test("draftReadme uses codex when fallback succeeds", async () => {
  const service = new AiDraftService({
    store: fakeStore({
      provider: "none",
      apiKeyEncrypted: "",
      useCodexFallback: true,
      codexCommand: "codex"
    }),
    appSecret: "secret",
    codexCommand: "codex",
    spawnImpl: successfulSpawn("Codex draft")
  });

  const result = await service.draftReadme({ title: "Tracker", tasks: [], milestones: [], aiSessions: [] });

  assert.equal(result.source, "codex");
  assert.equal(result.text, "Codex draft");
});

function fakeStore(settings) {
  return {
    async getRawAiSettings() {
      return settings;
    }
  };
}

function failingSpawn() {
  const child = new EventEmitter();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => {};
  queueMicrotask(() => {
    child.stderr.write("not logged in");
    child.emit("close", 1);
  });
  return child;
}

function successfulSpawn(output) {
  return () => {
    const child = new EventEmitter();
    child.stdout = new PassThrough();
    child.stderr = new PassThrough();
    child.kill = () => {};
    queueMicrotask(() => {
      child.stdout.write(output);
      child.emit("close", 0);
    });
    return child;
  };
}

