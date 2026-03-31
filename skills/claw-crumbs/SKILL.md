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

## Staleness Prevention
Crumb files can drift from the actual project state. Follow these rules to keep them trustworthy:
- **Verify before trusting.** When resuming a project, spot-check crumb claims against reality (e.g., do listed files still exist? does the stated "current state" match?). If anything is wrong, fix the crumbs immediately.
- **Last Updated is mandatory.** Always include and update the `Last Updated` date. If it's more than 2 weeks old, treat the crumbs as potentially stale and verify key claims before relying on them.
- **Prune dead items.** When updating crumbs, remove completed next steps, resolved issues, and decisions that are now obvious from the code itself. Don't accumulate — replace.
- **Flag uncertainty.** If you're unsure whether a crumb entry is still accurate, mark it with `⚠️ UNVERIFIED` rather than silently passing it along.
- **Rebuild over patch.** If more than half the crumbs look outdated, delete and regenerate from the current project state rather than trying to patch.

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
