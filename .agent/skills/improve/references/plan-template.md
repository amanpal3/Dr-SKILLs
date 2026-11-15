# Plan Template — Standardized Implementation Contract

Every plan produced by `/improve` must follow this exact template structure. The plan must be fully self-contained so that a cheaper downstream model or junior engineer can execute it with zero ambiguity.

---

```markdown
# Plan NNN: <Imperative title — what will be true after this plan>

> **Executor Instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before advancing to the next step. If anything in the "STOP Conditions" section occurs, stop immediately and report back — do not improvise. When finished, update the plan status in `plans/README.md`.
>
> **Drift Check (Run First)**: `git diff --stat <planned-at-sha>..HEAD`

---

## Overview
- **Finding Ref**: #<ID from audit table>
- **Target Files**:
  - `path/to/file1.ext` (modify)
  - `path/to/file2.ext` (create)
- **Goal**: <1-2 sentences stating the exact functional change and why it is made>

---

## Context & Code Excerpts

### Current State (`path/to/file1.ext`)
\`\`\`typescript
// Exact current lines to be replaced or modified
\`\`\`

### Target State (`path/to/file1.ext`)
\`\`\`typescript
// Exact expected code shape after modification
\`\`\`

---

## Step-by-Step Execution Plan

### Step 1: <Description of single atomic change>
- **Action**: <Precise instruction: what to create, edit, or delete>
- **Files**: `path/to/file.ext`
- **Verify**: `<terminal command>` → <expected exit code and output>

### Step 2: <Description of next atomic change>
- **Action**: <Precise instruction>
- **Files**: `path/to/file.ext`
- **Verify**: `<terminal command>` → <expected exit code and output>

---

## Test Plan
- **New Test Files**: `tests/unit/...` or `__tests__/...`
- **Scenarios to Cover**:
  1. Happy path: <expected behavior under normal inputs>
  2. Edge case / Regression: <input that previously triggered bug/vulnerability>
  3. Failure path: <expected error handling on invalid input>
- **Structural Model**: Model after existing pattern in `tests/fixtures/sample.test.ts`.
- **Verification Command**: `<npm test / pytest / cargo test>` → All tests pass with 0 exit code.

---

## Done Criteria
All of the following machine-checkable criteria must hold:
- [ ] `<typecheck command>` exits 0 with zero diagnostic errors.
- [ ] `<test command>` exits 0; all existing and new unit tests pass.
- [ ] `git status` shows no modifications outside the declared target files.
- [ ] `git diff` shows clean, targeted changes matching the target state pattern.
- [ ] `plans/README.md` status row updated from `TODO` to `DONE`.

---

## STOP Conditions
Stop execution immediately and report back if:
1. The codebase has drifted: lines in "Current State" do not match the actual file contents.
2. Any verification command fails with unexpected errors or compiler rejections.
3. A required external dependency, export, or environment variable is missing.
4. Completing a step would require touching files outside the declared file list.
```
