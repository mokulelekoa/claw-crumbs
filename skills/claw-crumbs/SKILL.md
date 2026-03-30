---
name: claw-crumbs
description: Create and maintain short per-project crumb files that act as durable bootstrap context before session-specific BOOTSTRAP.md instructions.
---

# Claw Crumbs

Use this skill when the user wants durable **per-project notes** that OpenClaw can read before resuming work.

## Goal
Keep a short project-root note file (a “crumb”) that captures:
- current state
- important files
- durable decisions
- known issues
- next steps
- durable operations (run / build / test / commit)
- deploy / release flow
- data / infra access notes
- known gotchas
- commands that worked
- commands that failed

## File convention
Prefer one of these filenames at the project root:
- `.claw-crumbs.md` (default)
- `CLAW_CRUMBS.md`
- `claw-crumbs.md`

## Rules
- Keep crumbs short and skimmable.
- Do **not** turn crumbs into diaries.
- Prefer durable context over chat recap.
- BOOTSTRAP.md is temporary session guidance; crumbs are durable project guidance.
- Update crumbs after meaningful milestones, not every tiny step.

## Suggested sections
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
- Last Updated
