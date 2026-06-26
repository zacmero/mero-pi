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

## Updating the pi‑agent on this machine

This machine’s `pi` binary is AUR-owned, not official pacman repo-owned:

```bash
pacman -Qo /usr/bin/pi
# pi 0.77.0-1 owns /usr/bin/pi and /usr/lib/node_modules/pi/...
```

Use the AUR helper that owns the install:

```bash
# Arch/AUR: update only pi (no full system upgrade)
yay -S pi

# If yay already built the newer package and you only want the local artifact
sudo pacman -U ~/.cache/yay/pi/pi-*.pkg.tar.zst

# Generic npm install is NOT the path on this machine
# (only use it on npm-based installs)
sudo npm install -g @earendil-works/pi-coding-agent@latest
```

If `pi update` reports "cannot self-update this installation", that is expected here.

### Update extensions

Use the exact package IDs from `pi list`:

```bash
pi update npm:pi-mcp-adapter
pi update git:github.com/DietrichGebert/ponytail
```

### rtk extension

`home/pi-agent/extensions/rtk.ts` is the agent-first hook. `scripts/bootstrap-pi-links.sh` symlinks `home/pi-agent/extensions` into `~/.pi/agent/extensions`, so Pi loads it on startup.

What it does:
- probes `rtk --version` at load time
- logs `[rtk] active; rewrite hook enabled (...)` on startup when loaded
- on every Pi `bash` tool call, runs `rtk rewrite "<command>"`
- replaces the command if `rtk` returns a rewrite
- skips only commands already starting with `rtk `

How you know it is active:
1. Restart Pi.
2. Look for the startup log from `home/pi-agent/extensions/rtk.ts`.
3. Run a Pi bash tool call; the hook will rewrite it before execution.

Quick local check:
```bash
rtk --version
rtk rewrite "ls -l"
```

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
- installs `pi` via `yay` on Arch when available; npm fallback elsewhere
- installs base deps via apt/pacman
- links home Pi config back to this repo

## Notes
- Generated data stays in home: auth, cache, sessions.
- Edit repo files only; relink after changes.
