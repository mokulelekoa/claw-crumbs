# Claw Crumbs Best Practices

## Keep crumbs short
A crumb should be a compact project operating brief, not a diary.
Aim for the smallest amount of context that reliably helps a future session resume work correctly.

## Prefer durable context
Write down things that will still matter later:
- current state
- important files
- stable decisions
- next steps
- deploy/build/test commands
- infrastructure entry points
- known gotchas

Avoid storing temporary chat recap unless it changes durable project understanding.

## Keep global memory global
Use crumbs for project-specific or skill-specific context.
Use `MEMORY.md` only for global rules, cross-project truths, and durable operator preferences.

## Store paths, not secrets
Good:
- secret file path
- service name
- dashboard URL
- deploy command

Bad:
- API keys
- passwords
- token values
- copied secret blobs

## Record exact commands when useful
If a command matters and has already been proven to work, record it exactly.
That reduces rediscovery cost and prevents future mistakes.

## Record important failures too
When a command or approach fails in a repeatable way, note it briefly so future sessions do not repeat the same mistake.

## Update at milestones
Update crumbs after meaningful progress:
- major implementation change
- successful deploy
- important bug discovered
- workflow clarified
- handoff or session end

Do not update crumbs after every tiny action.

## Keep sections predictable
Use consistent section names when possible so both humans and OpenClaw can scan quickly.
Recommended sections:
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

## Review the crumb before risky actions
Before coding, committing, deploying, or resuming a project after a gap, read the crumb first.

## Treat the crumb as the local source of truth
For project-specific notes, prefer the crumb over global memory.
Keep the crumb close to the code it describes.
