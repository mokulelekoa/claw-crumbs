# Claw Crumbs

Claw Crumbs gives OpenClaw durable per-project memory.

It keeps a short crumb file at each project root so the agent can quickly recover current state, important files, decisions, known issues, next steps, and proven commands before resuming work. That makes interrupted sessions, long-running projects, and cross-day handoffs much cleaner.

## Why it exists
Normal chat context is temporary. Projects are not.

Claw Crumbs stores the small amount of durable context that future sessions actually need, without turning your repo into a diary.

## What it does
- stores a short crumb file in each project root
- preserves project state and operational context
- detects resume-style prompts and returns a matching bootstrap brief
- exposes optional tools to inspect crumb coverage and refresh crumb files

## Mental model
- **Crumb** = durable project + operational context
- **BOOTSTRAP.md** = temporary session guidance

The most valuable things to preserve are usually:
- current state
- key files
- decisions
- next steps
- deploy/release flow
- service or infra access notes
- commands that worked
- commands that failed

## Default crumb filename
`.claw-crumbs.md`

## Runtime requirement
Claw Crumbs is designed to run inside OpenClaw. It is not intended to operate as a standalone Node package outside the OpenClaw plugin runtime.

## Quick start
1. Install and enable the plugin:
   ```bash
   openclaw plugins install ./claw-crumbs --link
   openclaw plugins enable claw-crumbs
   ```
2. Create a crumb file at the root of a project using `.claw-crumbs.md`.
3. Add a few high-value sections such as:
   - Current State
   - Important Files
   - Next Steps
   - Durable Operations
   - Deploy / Release
4. Return later with prompts like:
   - `continue the billing portal`
   - `work on the clinic scheduler project`
   - `resume the renovation estimate`
5. OpenClaw can use the crumb as a short bootstrap brief before resuming work.

## Local install
```bash
openclaw plugins install ./claw-crumbs --link
openclaw plugins enable claw-crumbs
```

## Example prompts
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

## End-of-session refresh prompt
Near the end of a session, say:

**"Update the claw crumbs for this project before we stop."**

For a richer refresh, say:

**"Update the claw crumbs for this project with current state, important files, next steps, deploy flow, and any gotchas."**

## Config
Configure under `plugins.entries.claw-crumbs.config`.

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

## Safety
- never store raw secrets in a crumb
- store **paths**, not secret values
- store exact commands when useful
- keep crumbs short, durable, and readable by both humans and OpenClaw

## One-line usage rule
**Use Claw Crumbs so future sessions can resume the real project, not just the memory of a chat.**
