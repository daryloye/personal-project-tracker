const state = {
  projects: [],
  selectedProjectId: null
};

const elements = {
  projectForm: document.querySelector("#projectForm"),
  projectList: document.querySelector("#projectList"),
  projectCount: document.querySelector("#projectCount"),
  detailTitle: document.querySelector("#detailTitle"),
  detailStatus: document.querySelector("#detailStatus"),
  detailContent: document.querySelector("#detailContent"),
  detailTemplate: document.querySelector("#projectDetailTemplate"),
  refreshButton: document.querySelector("#refreshButton"),
  settingsForm: document.querySelector("#settingsForm"),
  settingsStatus: document.querySelector("#settingsStatus"),
  testProviderButton: document.querySelector("#testProviderButton")
};

elements.projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(elements.projectForm));
  const { project } = await api("/api/projects", { method: "POST", body: payload });
  elements.projectForm.reset();
  state.selectedProjectId = project.id;
  await loadProjects();
  await loadProject(project.id);
});

elements.refreshButton.addEventListener("click", async () => {
  await loadProjects();
  if (state.selectedProjectId) await loadProject(state.selectedProjectId);
});

elements.settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(elements.settingsForm);
  const payload = Object.fromEntries(formData);
  payload.useCodexFallback = formData.get("useCodexFallback") === "on";
  payload.clearApiKey = formData.get("clearApiKey") === "on";
  const { settings } = await api("/api/settings/ai", { method: "PUT", body: payload });
  renderSettings(settings, "Settings saved.");
});

elements.testProviderButton.addEventListener("click", async () => {
  elements.settingsStatus.textContent = "Testing provider...";
  try {
    const { result } = await api("/api/settings/ai/test", { method: "POST", body: {} });
    if (result.ok) {
      elements.settingsStatus.classList.remove("error");
      elements.settingsStatus.textContent = `Provider test ok via ${result.source}.`;
    } else {
      elements.settingsStatus.classList.add("error");
      elements.settingsStatus.textContent = `Provider test failed via ${result.source}: ${result.error}`;
    }
  } catch (error) {
    elements.settingsStatus.textContent = error.message;
    elements.settingsStatus.classList.add("error");
  }
});

await loadProjects();
await loadSettings();

async function loadProjects() {
  const { projects } = await api("/api/projects");
  state.projects = projects;
  elements.projectCount.textContent = String(projects.length);
  elements.projectList.innerHTML = "";

  if (!projects.length) {
    elements.projectList.innerHTML = '<p class="muted">No projects yet.</p>';
    return;
  }

  for (const project of projects) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "project-item";
    button.innerHTML = `
      <span class="project-title">${escapeHtml(project.title)}</span>
      <span class="project-meta">${escapeHtml(project.status)} · ${escapeHtml(project.updatedAt.slice(0, 10))}</span>
    `;
    button.addEventListener("click", () => loadProject(project.id));
    elements.projectList.append(button);
  }
}

async function loadProject(projectId) {
  state.selectedProjectId = projectId;
  const { project } = await api(`/api/projects/${projectId}`);
  elements.detailTitle.textContent = project.title;
  elements.detailStatus.textContent = project.status;

  const fragment = elements.detailTemplate.content.cloneNode(true);
  fragment.querySelector('[data-field="problem"]').textContent = project.problem || "Not recorded yet.";
  fragment.querySelector('[data-field="outcome"]').textContent = project.outcome || "Not recorded yet.";
  fragment.querySelector('[data-field="techStack"]').textContent = project.techStack || "Not recorded yet.";
  renderMiniList(fragment.querySelector('[data-list="milestones"]'), project.milestones, (milestone) => `${milestone.title} (${milestone.status})`);
  renderMiniList(fragment.querySelector('[data-list="tasks"]'), project.tasks, (task) => `${task.title} (${task.status})`);
  renderMiniList(
    fragment.querySelector('[data-list="aiSessions"]'),
    project.aiSessions,
    (session) => `${session.tool || "AI"}: ${session.outputSummary || session.decision || "Logged"}`
  );
  renderMiniList(
    fragment.querySelector('[data-list="decisions"]'),
    project.decisions,
    (decision) => `${decision.topic}: ${decision.selectedOption || "Not selected yet"}`
  );

  fragment.querySelector("#milestoneForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    await api(`/api/projects/${projectId}/milestones`, { method: "POST", body: payload });
    await loadProject(projectId);
  });

  fragment.querySelector("#taskForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    await api(`/api/projects/${projectId}/tasks`, { method: "POST", body: payload });
    await loadProject(projectId);
  });

  fragment.querySelector("#aiSessionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    await api(`/api/projects/${projectId}/ai-sessions`, { method: "POST", body: payload });
    await loadProject(projectId);
  });

  fragment.querySelector("#decisionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    await api(`/api/projects/${projectId}/decisions`, { method: "POST", body: payload });
    await loadProject(projectId);
  });

  fragment.querySelector("#draftReadmeButton").addEventListener("click", async () => {
    const output = document.querySelector("#draftOutput");
    output.value = "Drafting...";
    const { draft } = await api(`/api/projects/${projectId}/draft-readme`, { method: "POST", body: {} });
    output.value = `${draft.text}${draft.warning ? `\n\nWarning: ${draft.warning}` : ""}`;
  });

  elements.detailContent.innerHTML = "";
  elements.detailContent.append(fragment);
}

async function loadSettings() {
  const { settings } = await api("/api/settings/ai");
  renderSettings(settings);
}

function renderSettings(settings, message = "") {
  elements.settingsForm.provider.value = settings.provider;
  elements.settingsForm.model.value = settings.model || "";
  elements.settingsForm.useCodexFallback.checked = settings.useCodexFallback;
  elements.settingsForm.clearApiKey.checked = false;
  elements.settingsForm.codexCommand.value = settings.codexCommand || "codex";
  elements.settingsForm.apiKey.value = "";
  elements.settingsStatus.classList.remove("error");
  elements.settingsStatus.textContent = message || `API key saved: ${settings.hasApiKey ? "yes" : "no"}. Last test: ${settings.lastTestStatus}.`;
}

function renderMiniList(container, items, labelFor) {
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = '<p class="muted">None yet.</p>';
    return;
  }
  for (const item of items) {
    const div = document.createElement("div");
    div.className = "mini-item";
    div.textContent = labelFor(item);
    container.append(div);
  }
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char];
  });
}
