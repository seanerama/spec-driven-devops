---
name: vp:start
description: Begin a new or existing VibrationPlan project workflow
argument-hint: "[new|existing] [--from <role>]"
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
  - TodoWrite
  - AskUserQuestion
---
<objective>
Initialize a VibrationPlan workflow. Supports jumping to any role with --from.

Usage:
  /vp:start                    — interactive (asks new/existing)
  /vp:start new                — new project, start from beginning
  /vp:start existing           — existing project, start from retrofit
  /vp:start --from architect   — new project, skip vision, start at architect
  /vp:start --from plan        — skip vision + architect, start at planner
  /vp:start --from build       — skip to build (assumes planning docs exist)
  /vp:start existing --from plan — existing project, skip retrofit
</objective>

<execution_context>
@~/.claude/vibeops/workflows/start-new.md
@~/.claude/vibeops/workflows/start-existing.md
@~/.claude/vibeops/references/workflow-paths.md
@~/.claude/vibeops/references/role-dependency-graph.md
</execution_context>

<context>
Arguments: $ARGUMENTS

Context loaded via: `node "$HOME/.claude/vibeops/bin/vp-tools.cjs" init start`
</context>

<process>
1. **Parse arguments**:
   - Check for `new` or `existing` keyword
   - Check for `--from <role>` flag (role can be a command name like `architect` or role-id like `lead-architect`)
   - Role name mapping: vision→vision-assistant, architect→lead-architect, designer→ui-ux-designer,
     retrofit→retrofit-planner, plan→project-planner, build→stage-manager, test→project-tester,
     deploy→project-deployer, docs→technical-writer, security→security-auditor, sre→sre

2. **Load context**:
   ```bash
   node "$HOME/.claude/vibeops/bin/vp-tools.cjs" init start
   ```

3. **If STATE.md exists**:
   - Show current state summary
   - Ask: "Resume existing workflow or start fresh?"
   - If resume → auto-invoke `/vp:next`
   - If fresh → confirm overwrite, then continue

4. **If no STATE.md** (and no path argument):
   - Ask: "Is this a **new project** or an **existing project** you want to enhance?"

5. **Create vibration-plan/** directory structure and initialize STATE.md + config.json
   (follow start-new or start-existing workflow)

6. **Handle --from** (skip ahead):
   If `--from <role>` is specified:
   a. Determine the workflow sequence for the chosen path (new or existing)
   b. Mark all roles BEFORE the target role as complete (skipped) in STATE.md:
      ```bash
      node "$HOME/.claude/vibeops/bin/vp-tools.cjs" state complete-role <role-id> --output skipped
      ```
   c. Check if the user has existing documents that predecessor roles would have produced:
      - If predecessor outputs exist (e.g., vibration-plan/vision-document.md, project-plan.md),
        note them as available context
      - If predecessor outputs DON'T exist, warn: "Note: <role> normally produces <file> — you may want to provide this context"
   d. Immediately invoke the target role via `/vp:<command>`

7. **If no --from** (normal flow):
   - **New project**: Ask if they want to explore ideas first or skip to architecture
     - Explore → invoke `/vp:vision`
     - Skip → invoke `/vp:architect`
   - **Existing project**: invoke `/vp:retrofit`
   - IMPORTANT: Always auto-invoke the next role directly.
</process>
