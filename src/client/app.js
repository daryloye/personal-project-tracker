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
  renderKanban(fragment.querySelector("#kanbanBoard"), project.tasks);
  fragment.querySelector("#draftOutput").value = project.planningNotesMarkdown || "";

  fragment.querySelector("#taskForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    await api(`/api/projects/${projectId}/tasks`, { method: "POST", body: payload });
    await loadProject(projectId);
  });

  fragment.querySelector("#draftReadmeButton").addEventListener("click", async () => {
    const output = document.querySelector("#draftOutput");
    output.value = "Drafting...";
    const { draft } = await api(`/api/projects/${projectId}/draft-readme`, { method: "POST", body: {} });
    output.value = `${draft.text}${draft.warning ? `\n\nWarning: ${draft.warning}` : ""}`;
  });

  fragment.querySelector("#planProjectButton").addEventListener("click", async () => {
    const output = document.querySelector("#draftOutput");
    output.value = "Planning with AI...";
    const { draft } = await api(`/api/projects/${projectId}/plan`, { method: "POST", body: {} });
    output.value = `${draft.text}${draft.warning ? `\n\nWarning: ${draft.warning}` : ""}`;
    await loadProjects();
  });

  fragment.querySelector("#downloadMarkdownButton").addEventListener("click", () => {
    const output = document.querySelector("#draftOutput");
    const filename = `${slugify(project.title)}-notes.md`;
    downloadText(filename, output.value || `# ${project.title}\n\nNo notes generated yet.\n`);
  });

  elements.detailContent.innerHTML = "";
  elements.detailContent.append(fragment);

  document.querySelectorAll("[data-task-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      await api(`/api/tasks/${button.dataset.taskId}`, {
        method: "PATCH",
        body: { status: button.dataset.taskStatus, blocker: button.dataset.taskStatus === "blocked" }
      });
      await loadProject(projectId);
      await loadProjects();
    });
  });
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

function renderKanban(container, tasks) {
  const columns = [
    ["todo", "To Do"],
    ["doing", "Doing"],
    ["blocked", "Blocked"],
    ["done", "Done"]
  ];
  container.innerHTML = "";
  for (const [status, label] of columns) {
    const column = document.createElement("section");
    column.className = "kanban-column";
    const items = tasks.filter((task) => task.status === status || (status === "blocked" && task.blocker));
    column.innerHTML = `<h4>${label} <span>${items.length}</span></h4>`;
    const list = document.createElement("div");
    list.className = "kanban-list";
    if (!items.length) {
      list.innerHTML = '<p class="muted">No tasks.</p>';
    }
    for (const task of items) {
      const card = document.createElement("article");
      card.className = "task-card";
      card.innerHTML = `
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.description || "No description.")}</p>
        <span class="project-meta">${escapeHtml(task.priority)} priority</span>
        <div class="task-actions">
          ${taskButton(task, "todo", "To Do")}
          ${taskButton(task, "doing", "Doing")}
          ${taskButton(task, "blocked", "Blocked")}
          ${taskButton(task, "done", "Done")}
        </div>
      `;
      list.append(card);
    }
    column.append(list);
    container.append(column);
  }
}

function taskButton(task, status, label) {
  const disabled = task.status === status ? "disabled" : "";
  return `<button type="button" ${disabled} data-task-id="${escapeHtml(task.id)}" data-task-status="${status}">${label}</button>`;
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

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project";
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
