---
name: mero-browser
description: Control browser-harness only through the Mero Browser workspace contract. Use this for agent browser automation so all durable evolution flows through the tracked, reviewable Mero Browser layer.
---

# Mero Browser

Mero Browser is the control layer around `browser-harness`.

Its job is to keep browser automation:

- reviewable
- git-trackable
- update-friendly with upstream `browser-harness`
- consistent across local agent harnesses

`browser-harness` is the runtime substrate. `mero-browser` is the required agent interface.
Agents should not bypass Mero Browser and call upstream `browser-harness` directly for normal work.

## Core contract

- Do not treat this repo as a fork of `browser-harness`.
- Keep the official `browser-harness` checkout clean and updatable.
- Put mutable agent behavior in this repo's `agent-workspace/`.
- Always point `browser-harness` at this workspace with `BH_AGENT_WORKSPACE`.
- Prefer extending `agent-workspace/agent_helpers.py` and `agent-workspace/domain-skills/` over editing upstream core files.

## Global harness links

The canonical Mero Browser skill file lives in this repo.

Machine-global skill entries for the following harnesses should symlink to the appropriate repo-owned skill file:

- Codex
- Open Code
- OpenClaw
- Pi Agent
- Gemini CLI

For Codex specifically, `~/.codex/skills/mero-browser/SKILL.md` should symlink to this file.

For the other harnesses, keep the same pattern: each harness loads a symlink to the canonical Mero Browser skill owned by this repo or by that harness's equivalent repo integration point.

## Invocation rule

This interface is for AI agents, not for end users as a primary workflow.

Agents should invoke the local wrapper:

```bash
bin/mero-browser 'python snippet here'
```

Default mode is the dedicated Mero Browser Chromium profile.

If the task needs the user's already-authenticated main browser session instead, use:

```bash
bin/mero-browser-current 'python snippet here'
```

The equivalent raw form exists only to describe the contract:

```bash
BH_AGENT_WORKSPACE=/absolute/path/to/mero-browser/agent-workspace browser-harness -c 'python snippet here'
```

For normal operation, prefer `bin/mero-browser` so the agent is using the repo-defined interface instead of reaching for upstream directly.

Session modes:

- `bin/mero-browser`: dedicated automation session
- `bin/mero-browser-current`: attach to the current/main browser session when remote debugging is available there
- `bin/mero-browser-cloud`: Browser Use Cloud session for weak or GUI-less machines

Current mode only works if the browser was started with `--remote-debugging-port` and the same profile directory that holds the logged-in cookies and session. If the main browser was started normally, the agent cannot recover that session from Mero Browser alone.

If no real browser session is already available, start the dedicated automation browser first:

```bash
bin/mero-browser-chromium about:blank
```

The workspace `.env` can point the harness at that dedicated browser with:

```bash
BU_CDP_URL=http://127.0.0.1:9222
```

For the current/main session mode, do not force `BU_CDP_URL`. Let upstream detect the live remote-debugging browser from the user's main session.

For weak or GUI-less machines, prefer `bin/mero-browser-cloud` and keep local Chromium out of the loop unless there is a hard requirement to use it.

`BROWSER_USE_API_KEY` is only for Browser Use Cloud. It is not the agent's model key. The agent model key is configured in the harness that runs the model, such as Pi Agent.

## Behavior rules

- Read `agent-workspace/RULES.md` before making durable changes to helpers, domain skills, memory, or state promotion.
- Read `docs/mutation-policy.md` before touching mutation surfaces.
- High-impact actions require user confirmation.
- If upstream `browser-harness` reports an update, prefer updating the official checkout, not this repo.
- If a task reveals missing reusable capability, first consider adding or refining a reusable helper or domain skill in this repo.
- Domain skills discovery is always on. `goto_url(...)` should surface a small, curated hint list for the host, and the agent should load only the matching host or global skill that is relevant to the task.
- Global skills take priority. Use host-specific skills only when the task clearly needs them.

## Mutation boundaries

Preferred order:

1. `agent-workspace/domain-skills/`
2. `agent-workspace/agent_helpers.py`
3. curated memory or promotion records in this repo
4. upstream `browser-harness` core only when the problem cannot be solved cleanly in the workspace layer

## Reporting requirement

When promoting anything durable, report:

- what changed
- why it was promoted
- where it was stored
- what remained ephemeral and why
