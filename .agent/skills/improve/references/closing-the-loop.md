# Closing the Loop — Execution, Review, and Reconcile Protocols

This reference outlines the workflow after implementation plans are written: executing plans safely, conducting tech lead diff reviews, reconciling backlog drift, and optional issue tracking.

---

## 1. The Core Execution Boundary

> **The Advisor Never Edits Source Code Directly.**
> Execution must be delegated to:
> 1. An isolated subagent in a git worktree (`/improve execute <plan>`)
> 2. A cheaper downstream model running on the plan file
> 3. The human developer

---

## 2. `/improve execute <plan-path>` Protocol

When executing an approved plan:

### Step A: Precondition Checks
1. **Repository Cleanliness**: Ensure git working tree has no uncommitted changes (`git status --porcelain`).
2. **Plan Validation**: Confirm the plan file exists under `plans/` and matches [plan-template.md](plan-template.md).
3. **Drift Check**: Verify that target files have not been modified since the plan was created (`git log -1 --stat <files>`).

### Step B: Worktree Isolation
Do not execute directly on the user's primary working branch. Create an isolated worktree:
```bash
git worktree add -b chore/improve-plan-NNN .worktrees/plan-NNN main
```
Or dispatch a native subagent with `workspace: 'branch'`.

### Step C: Sequential Execution
1. The executor reads the plan file step-by-step.
2. For each step, it makes the modification and runs the specified step verification command.
3. Tests are implemented and verified against the criteria in `## Test Plan`.
4. If any condition in `## STOP Conditions` triggers, the executor aborts and returns an incident report.

### Step D: Tech Lead Review Gate
Once execution completes, the Advisor conducts a rigorous review before merging:
1. **Diff Audit**: Run `git diff main..chore/improve-plan-NNN`. Verify no extraneous files were modified.
2. **Verification Gate**: Execute typecheck, linter, and full test suite on the branch.
3. **Verdict**:
   - **Approve**: Fast-forward merge or squash merge into target branch, remove worktree.
   - **Request Changes**: Provide concrete feedback to the executor to address discrepancies.
   - **Reject**: Abort worktree, log rationale in `plans/README.md`.

---

## 3. `/improve reconcile` Backlog Protocol

Codebases change constantly. The `reconcile` command ensures `plans/README.md` stays synchronized with actual codebase reality:

### Scan Every Entry in `plans/README.md`:
1. **Plans marked `TODO`**:
   - Re-check the original `filepath:line` finding.
   - If the code has already been fixed or refactored away in passing, mark status as `RESOLVED_EXTERNALLY` and log the commit SHA that addressed it.
   - If target code has drifted, flag the plan as `NEEDS_DRIFT_UPDATE`.
2. **Plans marked `IN_PROGRESS`**:
   - Check if an active worktree or branch exists. If none is found and no recent commits exist, reset status to `TODO` or mark as `ABANDONED`.
3. **Plans marked `DONE`**:
   - Run the plan's Done Criteria checks on current `HEAD`.
   - If all hold, mark verified.
4. **Plans marked `BLOCKED`**:
   - Check if the blocker has been resolved. If so, return to `TODO`.

---

## 4. GitHub Issues Integration (`--issues`)

If `--issues` is requested when running `/improve`:
1. Inspect repo visibility via GitHub CLI:
   ```bash
   gh repo view --json visibility -q .visibility
   ```
2. **Public Repo Guardrail**:
   - If the repository is public and any findings involve **Security** or sensitive vulnerabilities, **prompt the user for explicit confirmation** before posting issues to GitHub to prevent zero-day leakages.
3. Format the GitHub issue with:
   - Issue title: `[Improve] <imperative title>`
   - Labels: `improve`, track label (e.g. `security`, `performance`, `tech-debt`)
   - Body: Summary, target files, and link or excerpt from `plans/NNN.md`.
