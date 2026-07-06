import { spawn } from "node:child_process";
import { decryptSecret } from "./crypto.js";
import { buildReadmeDraft } from "./templates.js";

export class AiDraftService {
  constructor({ store, appSecret, codexCommand, fetchImpl = fetch, spawnImpl = spawn, timeoutMs = 20000 }) {
    this.store = store;
    this.appSecret = appSecret;
    this.codexCommand = codexCommand;
    this.fetchImpl = fetchImpl;
    this.spawnImpl = spawnImpl;
    this.timeoutMs = timeoutMs;
  }

  async draftReadme(project) {
    const settings = await this.store.getRawAiSettings();
    const prompt = buildReadmePrompt(project);

    if (settings.provider !== "none" && settings.apiKeyEncrypted) {
      try {
        const text = await this.callExternalProvider(settings, prompt);
        return { source: settings.provider, text };
      } catch (error) {
        if (!settings.useCodexFallback) {
          return { source: "template", text: buildReadmeDraft(project), warning: error.message };
        }
      }
    }

    if (settings.useCodexFallback) {
      try {
        const text = await this.runCodex(settings.codexCommand || this.codexCommand, prompt);
        return { source: "codex", text };
      } catch (error) {
        return { source: "template", text: buildReadmeDraft(project), warning: error.message };
      }
    }

    return { source: "template", text: buildReadmeDraft(project) };
  }

  async testProvider() {
    const settings = await this.store.getRawAiSettings();
    const prompt = "Reply with exactly: ok";
    try {
      if (settings.provider !== "none" && settings.apiKeyEncrypted) {
        await this.callExternalProvider(settings, prompt);
        return { ok: true, source: settings.provider };
      }
      if (settings.useCodexFallback) {
        await this.runCodex(settings.codexCommand || this.codexCommand, prompt, 6000);
        return { ok: true, source: "codex" };
      }
      return { ok: true, source: "template" };
    } catch (error) {
      return {
        ok: false,
        source: settings.provider !== "none" && settings.apiKeyEncrypted ? settings.provider : "codex",
        error: error.message
      };
    }
  }

  async callExternalProvider(settings, prompt) {
    const apiKey = decryptSecret(settings.apiKeyEncrypted, this.appSecret);
    if (settings.provider === "openai") {
      return this.callOpenAi(apiKey, settings.model || "gpt-4.1-mini", prompt);
    }
    throw new Error(`${settings.provider} provider is not implemented yet.`);
  }

  async callOpenAi(apiKey, model, prompt) {
    const response = await this.fetchImpl("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: prompt
      })
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${text.slice(0, 200)}`);
    }
    const data = await response.json();
    const output = data.output_text || extractResponsesText(data);
    if (!output) throw new Error("OpenAI response did not include text.");
    return output.trim();
  }

  runCodex(command, prompt, timeoutMs = this.timeoutMs) {
    return new Promise((resolve, reject) => {
      const child = this.spawnImpl(
        command,
        ["exec", "--sandbox", "read-only", "--ephemeral", prompt],
        { shell: false, stdio: ["ignore", "pipe", "pipe"] }
      );
      let stdout = "";
      let stderr = "";
      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error("codex exec timed out."));
      }, timeoutMs);

      child.stdout?.on("data", (chunk) => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        if (code === 0 && stdout.trim()) resolve(stdout.trim());
        else reject(new Error(stderr.trim() || `codex exec exited with code ${code}`));
      });
    });
  }
}

export function buildReadmePrompt(project) {
  return `Draft concise README sections for this personal software project. Use only the facts provided. Mark missing information as "Not recorded yet." Return Markdown only.

Project:
${JSON.stringify(project, null, 2)}
`;
}

function extractResponsesText(data) {
  const chunks = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n");
}
