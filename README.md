# mero-pi

This repository serves as a rigorous experimental platform for the systematic study of coding agents and DevOps practices. Its primary aim is to engineer a super‑efficient, pragmatic, and portable agent capable of shared memory and session management across diverse execution contexts.

## Layout
- `home/config/mcp/mcp.json` -> shared MCP config
- `home/pi-agent/mcp.json` -> Pi global MCP override
- `home/pi-agent/settings.json` -> Pi global settings
- `home/pi-agent/models.json` -> Pi provider/model config
- `home/pi-agent/keybindings.json` -> Pi global keybindings
- `home/pi-agent/AGENTS.md` -> top-level Pi agent policy
- `home/pi-agent/{prompts,skills,extensions,themes}` -> global custom surfaces + skill source-of-truth
- `project/mcp.json` -> project-local MCP config source
- `bin/mcp-puppeteer-chromium` -> Puppeteer MCP wrapper using Chromium
- `scripts/bootstrap-pi-links.sh` -> relink home configs to repo
- `scripts/rip-skill.sh` -> copy machine skill into repo

## Install

---

## Mero‑Browser skill

The **`mero-browser`** skill provides a high‑level, headed browser interface for Pi. It works only when the **`mero‑browser`** project is checked out on the same machine at the path:

```
$HOME/projects/mero-browser
```

The skill implementation lives in `home/pi-agent/skills/mero-browser`. When you invoke `$mero-browser` (or `[$mero-browser]` in the picker) the skill reads the source files from that external project to drive the browser actions. If the project directory is missing, the skill will fail with a *“project not found”* error.

### How to set it up
1. Clone the repository:
   ```bash
   cd $HOME/projects
   git clone https://github.com/your‑username/mero-browser.git
   ```
2. Ensure the directory exists exactly at `$HOME/projects/mero-browser`.
3. Run the Pi install script (or simply reload the session) so the skill can locate the path.

### Reference
For a deeper look at how the skill works, see the **`mero-browser`** skill files in this repository (`home/pi-agent/skills/mero-browser`). They contain the concrete commands that invoke the external project, useful if you need to modify or extend the behavior.

---

Linux only. Supported: Debian/Ubuntu and Arch.

```bash
./scripts/install-linux.sh
```

What it does:
- installs `pi` via npm
- installs base deps via apt/pacman
- links home Pi config back to this repo

## Notes
- Generated data stays in home: auth, cache, sessions.
- Edit repo files only; relink after changes.
