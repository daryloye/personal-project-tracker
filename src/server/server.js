import http from "node:http";
import { pathToFileURL } from "node:url";
import { config } from "./config.js";
import { encryptSecret } from "./crypto.js";
import { AiDraftService } from "./aiService.js";
import { readJson, sendError, sendJson, serveStatic } from "./http.js";
import { JsonStore } from "./storage.js";
import {
  HttpError,
  validateAiSession,
  validateDecision,
  validateAiSettings,
  validateMilestone,
  validateProject,
  validateTask
} from "./validation.js";

const store = new JsonStore(config.dataDir);
const aiDraftService = new AiDraftService({
  store,
  appSecret: config.appSecret,
  codexCommand: config.codexCommand
});

export function createServer({ store, aiDraftService, publicDir }) {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname.startsWith("/api/")) {
        await routeApi(req, res, url, store, aiDraftService);
        return;
      }
      await serveStatic(req, res, publicDir);
    } catch (error) {
      sendError(res, error);
    }
  });
}

async function routeApi(req, res, url, store, aiDraftService) {
  const method = req.method || "GET";
  const segments = url.pathname.split("/").filter(Boolean);

  if (method === "GET" && url.pathname === "/api/projects") {
    sendJson(res, 200, { projects: await store.listProjects() });
    return;
  }

  if (method === "POST" && url.pathname === "/api/projects") {
    const project = await store.createProject(validateProject(await readJson(req)));
    sendJson(res, 201, { project });
    return;
  }

  if (segments[1] === "projects" && segments[2]) {
    const projectId = segments[2];

    if (method === "GET" && segments.length === 3) {
      const project = await requireProject(store, projectId);
      sendJson(res, 200, { project });
      return;
    }

    if (method === "PATCH" && segments.length === 3) {
      const project = await store.updateProject(projectId, validateProject(await readJson(req), true));
      if (!project) throw new HttpError(404, "Project not found.");
      sendJson(res, 200, { project });
      return;
    }

    if (method === "POST" && segments[3] === "milestones") {
      const milestone = await store.createMilestone(projectId, validateMilestone(await readJson(req)));
      if (!milestone) throw new HttpError(404, "Project not found.");
      sendJson(res, 201, { milestone });
      return;
    }

    if (method === "POST" && segments[3] === "tasks") {
      const task = await store.createTask(projectId, validateTask(await readJson(req)));
      if (!task) throw new HttpError(404, "Project not found.");
      sendJson(res, 201, { task });
      return;
    }

    if (method === "POST" && segments[3] === "ai-sessions") {
      const aiSession = await store.createAiSession(projectId, validateAiSession(await readJson(req)));
      if (!aiSession) throw new HttpError(404, "Project not found.");
      sendJson(res, 201, { aiSession });
      return;
    }

    if (method === "POST" && segments[3] === "decisions") {
      const decision = await store.createDecision(projectId, validateDecision(await readJson(req)));
      if (!decision) throw new HttpError(404, "Project not found.");
      sendJson(res, 201, { decision });
      return;
    }

    if (method === "POST" && segments[3] === "draft-readme") {
      const project = await requireProject(store, projectId);
      const draft = await aiDraftService.draftReadme(project);
      sendJson(res, 200, { draft });
      return;
    }
  }

  if (method === "PATCH" && segments[1] === "tasks" && segments[2]) {
    const task = await store.updateTask(segments[2], validateTask(await readJson(req), true));
    if (!task) throw new HttpError(404, "Task not found.");
    sendJson(res, 200, { task });
    return;
  }

  if (method === "GET" && url.pathname === "/api/settings/ai") {
    sendJson(res, 200, { settings: await store.getAiSettings() });
    return;
  }

  if (method === "PUT" && url.pathname === "/api/settings/ai") {
    const body = validateAiSettings(await readJson(req));
    const update = {
      provider: body.provider,
      model: body.model,
      useCodexFallback: body.useCodexFallback,
      codexCommand: body.codexCommand
    };
    if (body.clearApiKey) {
      update.apiKeyEncrypted = "";
    } else if (body.apiKey && body.apiKey.trim()) {
      update.apiKeyEncrypted = encryptSecret(body.apiKey.trim(), config.appSecret);
    }
    const settings = await store.updateAiSettings(update);
    sendJson(res, 200, { settings });
    return;
  }

  if (method === "POST" && url.pathname === "/api/settings/ai/test") {
    const result = await aiDraftService.testProvider();
    await store.updateAiSettings({ lastTestStatus: "ok", lastTestedAt: new Date().toISOString() });
    sendJson(res, 200, { result });
    return;
  }

  throw new HttpError(404, "Route not found.");
}

async function requireProject(store, id) {
  const project = await store.getProject(id);
  if (!project) throw new HttpError(404, "Project not found.");
  return project;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createServer({ store, aiDraftService, publicDir: config.publicDir }).listen(config.port, () => {
    console.log(`Personal Project Tracker running at http://localhost:${config.port}`);
  });
}
