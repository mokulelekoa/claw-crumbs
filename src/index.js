import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { Type } from "@sinclair/typebox";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

const DEFAULT_CRUMB_FILENAMES = [
  ".claw-crumbs.md",
  "CLAW_CRUMBS.md",
  "claw-crumbs.md"
];

const DEFAULT_TRIGGER_PHRASES = [
  "resume",
  "continue",
  "pick back up",
  "open this project",
  "work on",
  "back to",
  "project"
];

function expandHome(input) {
  if (!input || typeof input !== "string") return input;
  return input.startsWith("~/") ? path.join(os.homedir(), input.slice(2)) : input;
}

function normalizeConfig(raw) {
  return {
    enabled: raw?.enabled !== false,
    crumbFilenames: Array.isArray(raw?.crumbFilenames) && raw.crumbFilenames.length > 0 ? raw.crumbFilenames : DEFAULT_CRUMB_FILENAMES,
    projectRoots: Array.isArray(raw?.projectRoots) && raw.projectRoots.length > 0
      ? raw.projectRoots.map(expandHome)
      : [path.join(os.homedir(), "projects"), path.join(os.homedir(), "work")],
    triggerPhrases: Array.isArray(raw?.triggerPhrases) && raw.triggerPhrases.length > 0 ? raw.triggerPhrases : DEFAULT_TRIGGER_PHRASES,
    maxReadBytes: Number.isFinite(raw?.maxReadBytes) ? raw.maxReadBytes : 12000,
    maxSectionChars: Number.isFinite(raw?.maxSectionChars) ? raw.maxSectionChars : 4000
  };
}

function findCrumb(projectRoot, cfg) {
  for (const name of cfg.crumbFilenames) {
    const candidate = path.join(projectRoot, name);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function listProjectCandidates(cfg) {
  const roots = [];
  for (const root of cfg.projectRoots) {
    try {
      if (!fs.existsSync(root)) continue;
      const entries = fs.readdirSync(root, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        roots.push(path.join(root, entry.name));
      }
    } catch {}
  }
  return roots;
}

function scoreProject(projectRoot, text) {
  const normalized = text.toLowerCase();
  const base = path.basename(projectRoot).toLowerCase();
  let score = 0;
  if (normalized.includes(base)) score += 5;
  for (const token of base.split(/[-_\s]+/g).filter(Boolean)) {
    if (token.length >= 3 && normalized.includes(token)) score += 1;
  }
  return score;
}

function detectProject(text, cfg) {
  const candidates = listProjectCandidates(cfg);
  let best = null;
  for (const candidate of candidates) {
    const crumbPath = findCrumb(candidate, cfg);
    if (!crumbPath) continue;
    const score = scoreProject(candidate, text);
    if (!best || score > best.score) best = { projectRoot: candidate, crumbPath, score };
  }
  return best && best.score > 0 ? best : null;
}

function shouldIntercept(text, cfg) {
  const normalized = text.toLowerCase();
  return cfg.triggerPhrases.some((phrase) => normalized.includes(String(phrase).toLowerCase()));
}

function trimForReply(text, maxChars) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n\n[truncated]`;
}

function extractPrioritySections(raw, cfg) {
  const lines = raw.split(/\r?\n/);
  const keep = [];
  let current = null;
  const wanted = new Set([
    "Project",
    "Current State",
    "Important Files",
    "Decisions",
    "Next Steps",
    "Durable Operations",
    "Deploy / Release",
    "Data / Infra Access",
    "Known Gotchas"
  ]);
  for (const line of lines) {
    const m = /^##\s+(.*)$/.exec(line.trim());
    if (m) current = m[1].trim();
    if (line.startsWith("# Claw Crumbs")) {
      keep.push(line);
      continue;
    }
    if (current && wanted.has(current)) keep.push(line);
  }
  return trimForReply(keep.join("\n").trim() || raw, cfg.maxSectionChars);
}

function buildBootstrapReply(match, cfg) {
  const raw = fs.readFileSync(match.crumbPath, "utf8");
  const trimmed = extractPrioritySections(raw.slice(0, cfg.maxReadBytes), cfg);
  return [
    `Claw Crumbs bootstrap for ${path.basename(match.projectRoot)}:`,
    `Source: ${match.crumbPath}`,
    "",
    trimmed,
    "",
    "Use this as the project operating brief. Preserve code → commit → deploy continuity."
  ].join("\n");
}

function renderStatus(cfg) {
  const rows = [];
  for (const root of cfg.projectRoots) {
    if (!fs.existsSync(root)) continue;
    const entries = fs.readdirSync(root, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const projectRoot = path.join(root, entry.name);
      const crumbPath = findCrumb(projectRoot, cfg);
      if (crumbPath) rows.push(`- ${entry.name}: ${crumbPath}`);
    }
  }
  return rows.length > 0 ? rows.join("\n") : "No crumb files found under configured project roots.";
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeCrumb(projectRoot, crumbFilename, sections) {
  ensureDir(projectRoot);
  const crumbPath = path.join(projectRoot, crumbFilename);
  const content = [
    "# Claw Crumbs",
    "",
    "## Project",
    `- Root: ${projectRoot}`,
    ...(sections.projectName ? [`- Name: ${sections.projectName}`] : []),
    "",
    "## Current State",
    ...(sections.currentState?.length ? sections.currentState.map((x) => `- ${x}`) : ["- Fill this in"]),
    "",
    "## Important Files",
    ...(sections.importantFiles?.length ? sections.importantFiles.map((x) => `- ${x}`) : ["- Fill this in"]),
    "",
    "## Decisions",
    ...(sections.decisions?.length ? sections.decisions.map((x) => `- ${x}`) : ["- Fill this in"]),
    "",
    "## Known Issues",
    ...(sections.knownIssues?.length ? sections.knownIssues.map((x) => `- ${x}`) : ["- Fill this in"]),
    "",
    "## Next Steps",
    ...(sections.nextSteps?.length ? sections.nextSteps.map((x) => `- ${x}`) : ["- Fill this in"]),
    "",
    "## Durable Operations",
    ...(sections.durableOperations?.length ? sections.durableOperations.map((x) => `- ${x}`) : ["- Record install / dev / build / test / commit commands"]),
    "",
    "## Deploy / Release",
    ...(sections.deployRelease?.length ? sections.deployRelease.map((x) => `- ${x}`) : ["- Record exact deploy flow and target"]),
    "",
    "## Data / Infra Access",
    ...(sections.dataInfraAccess?.length ? sections.dataInfraAccess.map((x) => `- ${x}`) : ["- Record service entry points, secret file paths, and infra touchpoints (never secrets)"]),
    "",
    "## Known Gotchas",
    ...(sections.knownGotchas?.length ? sections.knownGotchas.map((x) => `- ${x}`) : ["- Record what fresh sessions reliably forget or break"]),
    "",
    "## Commands That Worked",
    ...(sections.commandsWorked?.length ? sections.commandsWorked.map((x) => `- ${x}`) : ["- Fill this in"]),
    "",
    "## Commands That Failed",
    ...(sections.commandsFailed?.length ? sections.commandsFailed.map((x) => `- ${x}`) : ["- ${command} — ${reason}"] ),
    "",
    "## Last Updated",
    `- ${new Date().toISOString()}`,
    ""
  ].join("\n");
  fs.writeFileSync(crumbPath, content, "utf8");
  return crumbPath;
}

export default definePluginEntry({
  id: "claw-crumbs",
  name: "Claw Crumbs",
  description: "Per-project durable context crumbs plus before-dispatch bootstrap routing.",
  register(api) {
    const cfg = normalizeConfig(api.pluginConfig ?? {});

    api.registerTool({
      name: "claw_crumbs_status",
      description: "List discovered project crumb files.",
      parameters: Type.Object({}),
      async execute() {
        return { content: [{ type: "text", text: renderStatus(cfg) }] };
      }
    }, { optional: true });

    api.registerTool({
      name: "claw_crumbs_refresh",
      description: "Create or refresh a project crumb file.",
      parameters: Type.Object({
        projectRoot: Type.String(),
        crumbFilename: Type.Optional(Type.String()),
        projectName: Type.Optional(Type.String()),
        currentState: Type.Optional(Type.Array(Type.String())),
        importantFiles: Type.Optional(Type.Array(Type.String())),
        decisions: Type.Optional(Type.Array(Type.String())),
        knownIssues: Type.Optional(Type.Array(Type.String())),
        nextSteps: Type.Optional(Type.Array(Type.String())),
        durableOperations: Type.Optional(Type.Array(Type.String())),
        deployRelease: Type.Optional(Type.Array(Type.String())),
        dataInfraAccess: Type.Optional(Type.Array(Type.String())),
        knownGotchas: Type.Optional(Type.Array(Type.String())),
        commandsWorked: Type.Optional(Type.Array(Type.String())),
        commandsFailed: Type.Optional(Type.Array(Type.String()))
      }),
      async execute(_id, params) {
        const crumbPath = writeCrumb(params.projectRoot, params.crumbFilename || cfg.crumbFilenames[0], params);
        return { content: [{ type: "text", text: `Updated ${crumbPath}` }] };
      }
    }, { optional: true });

    api.registerHook("before_dispatch", async (event) => {
      if (!cfg.enabled) return;
      const text = `${event.content || ""}\n${event.body || ""}`.trim();
      if (!text || !shouldIntercept(text, cfg)) return;
      const match = detectProject(text, cfg);
      if (!match) return;
      return {
        handled: true,
        text: buildBootstrapReply(match, cfg)
      };
    }, {
      priority: 50,
      name: "claw-crumbs-before-dispatch",
      description: "Read matching per-project crumb files before normal model dispatch."
    });
  }
});
