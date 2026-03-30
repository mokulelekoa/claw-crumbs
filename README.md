# Claw Crumbs

Claw Crumbs adds durable per-project note files that OpenClaw can read before resuming work on a project.

## What it does
- stores a short crumb file in each project root
- preserves both project state and operational context
- can detect project-resume prompts and return a matching bootstrap brief
- exposes optional tools to list crumbs and refresh a crumb file

## Recommended mental model
- **Crumb** = durable project + operational context
- **BOOTSTRAP.md** = temporary session instructions

The critical path Claw Crumbs should preserve is:
- code
- commit
- deploy
- service / infra access

## Default crumb filename
`.claw-crumbs.md`

## Runtime requirement
This plugin is meant to run inside an OpenClaw environment that provides the plugin runtime and SDK.
It is not intended to run as a standalone Node package outside OpenClaw.

## Quick Start
1. Install and enable the plugin:
   ```bash
   openclaw plugins install ./claw-crumbs --link
   openclaw plugins enable claw-crumbs
   ```
2. Create a project crumb at the root of a project using `.claw-crumbs.md`.
3. Add a few high-value sections such as:
   - Current State
   - Important Files
   - Next Steps
   - Durable Operations
   - Deploy / Release
4. Return to the project with a prompt like:
   - `continue the billing portal`
   - `work on the clinic scheduler project`
5. OpenClaw can use the crumb as a short project bootstrap brief.

## Install locally
```bash
openclaw plugins install ./claw-crumbs --link
openclaw plugins enable claw-crumbs
```

## Example prompts it can intercept
- "continue the billing portal"
- "back to the analytics dashboard"
- "resume the renovation estimate"
- "work on the scheduler project"

## Recommended crumb sections
- Project
- Current State
- Important Files
- Decisions
- Known Issues
- Next Steps
- Durable Operations
- Deploy / Release
- Data / Infra Access
- Known Gotchas
- Commands That Worked
- Commands That Failed

## End-of-session update prompt
Near the end of a session, say:

**"Update the claw crumbs for this project before we stop."**

If you want a richer refresh, say:

**"Update the claw crumbs for this project with current state, important files, next steps, deploy flow, and any gotchas."**

## Config
Configured under `plugins.entries.claw-crumbs.config`.

Key options:
- `crumbFilenames`: filenames to recognize (default prefers `.claw-crumbs.md`)
- `projectRoots`: directories to scan for candidate projects
- `triggerPhrases`: phrases that trigger project bootstrap matching
- `maxReadBytes`: maximum bytes read from a crumb file
- `maxSectionChars`: maximum characters returned in the bootstrap brief

Example:
```json
{
  "plugins": {
    "entries": {
      "claw-crumbs": {
        "enabled": true,
        "config": {
          "projectRoots": [
            "~/work/projects",
            "~/work/estimates"
          ],
          "crumbFilenames": [".claw-crumbs.md"],
          "triggerPhrases": ["resume", "continue", "work on"]
        }
      }
    }
  }
}
```

## Safety rules
- never store raw secrets in the crumb
- store **paths**, not secret values
- store exact commands when useful
- keep it readable by both humans and OpenClaw

## One-line usage rule
**Use Claw Crumbs to make sure future sessions never forget how the project actually works.**
