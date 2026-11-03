# Dr-SKILLs

<p align="center">
  <img src="assets/dr_skills_banner_ponytail.png" alt="Dr-SKILLs banner" width="100%" />
</p>

<p align="center">
  A practical collection of reusable skills, plugins, rules, and MCP integrations for AI coding tools.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dr-skills"><img src="https://img.shields.io/npm/v/dr-skills?logo=npm&color=CB3837" alt="npm version" /></a>
  <a href="https://github.com/amanpal3/Dr-SKILLs/releases"><img src="https://img.shields.io/github/v/release/amanpal3/Dr-SKILLs?logo=github" alt="GitHub release" /></a>
  <a href="https://github.com/amanpal3/Dr-SKILLs/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" /></a>
</p>

Dr-SKILLs gives AI coding agents a shared set of instructions and tools for common development work. It is designed for Google Antigravity, Claude Code, Cursor, and OpenAI Codex CLI, with support for installing the same collection globally or inside a project.

## The problem

AI coding tools are useful, but every tool has its own configuration, folder layout, and way of loading instructions. Without a shared system, developers often end up with:

- the same rules copied into several tools;
- inconsistent coding and review practices between projects;
- useful skills that are difficult to discover or reuse;
- manual setup whenever a new computer or agent is added; and
- no simple way to check whether an installation is complete and up to date.

## The solution

Dr-SKILLs keeps reusable developer guidance in one maintained collection. The CLI installs the appropriate skills, plugins, and rules for the agent you use, while the manifest and diagnostic commands help keep the installation predictable.

With Dr-SKILLs, you can:

- install the collection with one `npx` command;
- target Antigravity, Claude Code, Cursor, Codex CLI, or a local project;
- reuse skills for backend work, code review, security, testing, UI, documentation, planning, and more;
- connect supported MCP tools from the included configuration; and
- verify the package, manifest, installation, and security checks with `doctor`.

## Quick start

Install the complete collection for all supported agents:

```bash
npx -y dr-skills install all
```

Or install only what you need:

```bash
# Google Antigravity / AGY CLI
npx -y dr-skills install antigravity

# Claude Code
npx -y dr-skills install claude

# Cursor
npx -y dr-skills install cursor

# OpenAI Codex CLI
npx -y dr-skills install codex

# A local project
npx -y dr-skills install ./my-project
```

Check the installation afterwards:

```bash
npx -y dr-skills doctor
```

## Supported tools

| Tool | Install command | Main location |
| --- | --- | --- |
| Google Antigravity / AGY CLI | `npx -y dr-skills install antigravity` | `~/.gemini/config/` |
| Claude Code | `npx -y dr-skills install claude` | `~/.agent/` |
| Cursor | `npx -y dr-skills install cursor` | `~/.agent/` |
| OpenAI Codex CLI | `npx -y dr-skills install codex` | `~/.codex/` |
| Any supported project | `npx -y dr-skills install ./path/to/project` | `<project>/.agent/` |

## What is included

The current catalog contains **54 skills**, **6 plugins**, shared agent rules, and MCP configurations. The collection covers areas such as:

- backend and API development;
- code review, testing, and debugging;
- security reviews and OWASP practices;
- UI design, design systems, and frontend styling;
- project planning, PRDs, and delivery workflows;
- codebase mapping and knowledge graphs;
- documentation and current library references;
- Sentry, Firebase, and other integrations; and
- reducing unnecessary complexity with the Ponytail tools.

See the [complete catalog](ECOSYSTEM.md) for the full list and the capabilities of each skill.

## Skill catalog

The current catalog contains 54 skills. Each skill is a self-contained `SKILL.md` that can be installed and reused by supported agents.

| Skill |
| --- |
| **`antigravity-agents`** |
| **`archify`** |
| **`banner-design`** |
| **`brainstorming-ideas`** |
| **`brand`** |
| **`brand-identity`** |
| **`building-backend`** |
| **`code-review`** |
| **`context7-mcp`** |
| **`creating-skills`** |
| **`defend-what-you-ship`** |
| **`design`** |
| **`design-system`** |
| **`designing-with-stitch`** |
| **`dev-browser`** |
| **`error-handling-patterns`** |
| **`graphify`** |
| **`gsd`** |
| **`gsd-codebase-mapper`** |
| **`gsd-context-compressor`** |
| **`gsd-context-fetch`** |
| **`gsd-context-health-monitor`** |
| **`gsd-debugger`** |
| **`gsd-empirical-validation`** |
| **`gsd-executor`** |
| **`gsd-plan-checker`** |
| **`gsd-planner`** |
| **`gsd-subagent-delegation`** |
| **`gsd-token-budget`** |
| **`gsd-verifier`** |
| **`gtm-strategy`** |
| **`humanizer`** |
| **`integrating-sentry`** |
| **`managing-firebase`** |
| **`owasp-security`** |
| **`planning-strategy`** |
| **`ponytail`** |
| **`ponytail-audit`** |
| **`ponytail-debt`** |
| **`ponytail-gain`** |
| **`ponytail-help`** |
| **`ponytail-review`** |
| **`project-management`** |
| **`ralph-loop`** |
| **`ralph-prd`** |
| **`security-audit`** |
| **`seo-optimizer`** |
| **`slides`** |
| **`testing-code`** |
| **`ui-styling`** |
| **`ui-ux-pro-max`** |
| **`unified-build-pipeline`** |
| **`using-codex-cli`** |
| **`using-remotion`** |

## Everyday commands

```bash
# Check package, manifest, security, and installation health
npx -y dr-skills doctor

# Update installed skills and plugins
npx -y dr-skills update

# Remove only Dr-SKILLs-managed files
npx -y dr-skills uninstall antigravity
npx -y dr-skills uninstall all

# Restore a previous installation backup
npx -y dr-skills rollback
```

The uninstall command is intended to leave unrelated user files untouched. Review the command output before confirming any operation.

## For contributors

Clone the repository and install the development dependencies:

```bash
git clone https://github.com/amanpal3/Dr-SKILLs.git
cd Dr-SKILLs
npm install
```

Useful checks:

```bash
npm run doctor
npm test
npm run verify:catalog
npm pack --dry-run
```

When adding or changing a skill, update the relevant catalog documentation and run the checks before opening a pull request.

## Documentation

- [Ecosystem catalog](ECOSYSTEM.md)
- [Plugins and MCP configuration](PLUGINS_AND_MCP_README.md)
- [Security policy](SECURITY.md)
- [Security audit notes](SECURITY_AUDIT.md)
- [Contributing guide](CONTRIBUTING.md)
- [Release checklist](RELEASE_CHECKLIST.md)
- [Changelog](CHANGELOG.md)

## Report a problem or request a feature

Please [open an issue](https://github.com/amanpal3/Dr-SKILLs/issues) with the command you ran, your operating system, Node.js version, and the relevant output. For security vulnerabilities, follow the private reporting instructions in [SECURITY.md](SECURITY.md) instead of posting sensitive details publicly.

## License

Dr-SKILLs is released under the [MIT License](LICENSE).

Maintained by [Aman Pal](https://github.com/amanpal3).
