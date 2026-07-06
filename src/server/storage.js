import fs from "node:fs/promises";
import path from "node:path";
import { createId, nowIso } from "./id.js";

const emptyState = {
  projects: [],
  milestones: [],
  tasks: [],
  aiSessions: [],
  decisions: [],
  aiSettings: {
    id: "ai_settings",
    provider: "none",
    model: "",
    apiKeyEncrypted: "",
    useCodexFallback: true,
    codexCommand: "codex",
    lastTestStatus: "not_tested",
    lastTestedAt: null,
    createdAt: null,
    updatedAt: null
  }
};

export class JsonStore {
  constructor(dataDir) {
    this.filePath = path.join(dataDir, "app-data.json");
  }

  async read() {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      return { ...structuredClone(emptyState), ...JSON.parse(raw) };
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      const state = structuredClone(emptyState);
      const timestamp = nowIso();
      state.aiSettings.createdAt = timestamp;
      state.aiSettings.updatedAt = timestamp;
      return state;
    }
  }

  async write(state) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, `${JSON.stringify(state, null, 2)}\n`);
  }

  async listProjects() {
    const state = await this.read();
    return state.projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async createProject(input) {
    const state = await this.read();
    const timestamp = nowIso();
    const project = {
      id: createId("project"),
      title: input.title,
      problem: input.problem || "",
      targetUser: input.targetUser || "",
      outcome: input.outcome || "",
      status: input.status || "idea",
      deadline: input.deadline || "",
      techStack: input.techStack || "",
      repoUrl: input.repoUrl || "",
      demoUrl: input.demoUrl || "",
      category: input.category || "",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    state.projects.push(project);
    await this.write(state);
    return project;
  }

  async getProject(id) {
    const state = await this.read();
    const project = state.projects.find((item) => item.id === id);
    if (!project) return null;
    return {
      ...project,
      milestones: state.milestones.filter((item) => item.projectId === id),
      tasks: state.tasks.filter((item) => item.projectId === id),
      aiSessions: state.aiSessions.filter((item) => item.projectId === id),
      decisions: state.decisions.filter((item) => item.projectId === id)
    };
  }

  async updateProject(id, input) {
    const state = await this.read();
    const project = state.projects.find((item) => item.id === id);
    if (!project) return null;
    Object.assign(project, {
      title: input.title ?? project.title,
      problem: input.problem ?? project.problem,
      targetUser: input.targetUser ?? project.targetUser,
      outcome: input.outcome ?? project.outcome,
      status: input.status ?? project.status,
      deadline: input.deadline ?? project.deadline,
      techStack: input.techStack ?? project.techStack,
      repoUrl: input.repoUrl ?? project.repoUrl,
      demoUrl: input.demoUrl ?? project.demoUrl,
      category: input.category ?? project.category,
      updatedAt: nowIso()
    });
    await this.write(state);
    return project;
  }

  async createMilestone(projectId, input) {
    const state = await this.read();
    if (!state.projects.some((item) => item.id === projectId)) return null;
    const timestamp = nowIso();
    const milestone = {
      id: createId("milestone"),
      projectId,
      title: input.title,
      description: input.description || "",
      dueDate: input.dueDate || "",
      status: input.status || "planned",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    state.milestones.push(milestone);
    await this.touchProject(state, projectId);
    await this.write(state);
    return milestone;
  }

  async createTask(projectId, input) {
    const state = await this.read();
    if (!state.projects.some((item) => item.id === projectId)) return null;
    const timestamp = nowIso();
    const task = {
      id: createId("task"),
      projectId,
      milestoneId: input.milestoneId || "",
      title: input.title,
      description: input.description || "",
      status: input.status || "todo",
      priority: input.priority || "medium",
      blocker: Boolean(input.blocker),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    state.tasks.push(task);
    await this.touchProject(state, projectId);
    await this.write(state);
    return task;
  }

  async updateTask(id, input) {
    const state = await this.read();
    const task = state.tasks.find((item) => item.id === id);
    if (!task) return null;
    Object.assign(task, {
      title: input.title ?? task.title,
      description: input.description ?? task.description,
      status: input.status ?? task.status,
      priority: input.priority ?? task.priority,
      blocker: input.blocker ?? task.blocker,
      updatedAt: nowIso()
    });
    await this.touchProject(state, task.projectId);
    await this.write(state);
    return task;
  }

  async createAiSession(projectId, input) {
    const state = await this.read();
    if (!state.projects.some((item) => item.id === projectId)) return null;
    const timestamp = nowIso();
    const session = {
      id: createId("ai_session"),
      projectId,
      tool: input.tool || "",
      model: input.model || "",
      prompt: input.prompt || "",
      outputSummary: input.outputSummary || "",
      reviewNotes: input.reviewNotes || "",
      decision: input.decision || "",
      createdAt: timestamp
    };
    state.aiSessions.push(session);
    await this.touchProject(state, projectId);
    await this.write(state);
    return session;
  }

  async getAiSettings() {
    const state = await this.read();
    const { apiKeyEncrypted, ...safeSettings } = state.aiSettings;
    return { ...safeSettings, hasApiKey: Boolean(apiKeyEncrypted) };
  }

  async getRawAiSettings() {
    const state = await this.read();
    return state.aiSettings;
  }

  async updateAiSettings(input) {
    const state = await this.read();
    const timestamp = nowIso();
    state.aiSettings = {
      ...state.aiSettings,
      provider: input.provider ?? state.aiSettings.provider,
      model: input.model ?? state.aiSettings.model,
      apiKeyEncrypted: input.apiKeyEncrypted ?? state.aiSettings.apiKeyEncrypted,
      useCodexFallback: input.useCodexFallback ?? state.aiSettings.useCodexFallback,
      codexCommand: input.codexCommand ?? state.aiSettings.codexCommand,
      lastTestStatus: input.lastTestStatus ?? state.aiSettings.lastTestStatus,
      lastTestedAt: input.lastTestedAt ?? state.aiSettings.lastTestedAt,
      updatedAt: timestamp
    };
    await this.write(state);
    return this.getAiSettings();
  }

  async touchProject(state, projectId) {
    const project = state.projects.find((item) => item.id === projectId);
    if (project) project.updatedAt = nowIso();
  }
}

