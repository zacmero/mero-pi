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

The `pi` executable on this system is a symlink to a globally installed **npm** package:

```bash
ls -l /usr/bin/pi
# → /usr/lib/node_modules/pi/packages/coding-agent/dist/cli.js
```

Because the executable lives outside of a git checkout, the built‑in `pi update` command cannot self‑update it (it reports *"this installation is not managed by a global npm install"*).  To upgrade the core `pi` binary you must use the package manager that installed it.

### 1. Update via npm (the typical installation method)
```bash
# Update the global npm package
sudo npm install -g pi
```
This will pull the latest version from the npm registry and replace the files under `/usr/lib/node_modules/pi`.

### 2. Update via a system package manager (apt, dnf, brew, …)
If `pi` was installed from a distribution package, reinstall it with the appropriate manager, e.g.:
```bash
# Debian/Ubuntu
sudo apt-get install --reinstall pi

# Fedora
sudo dnf reinstall pi

# macOS (Homebrew)
brew reinstall pi
```

### 3. Update from source (custom builds)
When `pi` is built from source you can pull the latest commits and reinstall:
```bash
git clone https://github.com/pi-dev/pi.git ~/src/pi
cd ~/src/pi
npm install -g .
```
After any of these steps, verify the version:
```bash
pi --version
```

---

## Updating extensions (e.g., `pi-mcp-adapter`, `ponytail`)
Extensions are managed by `pi` itself.  Run:
```bash
pi update           # updates all installed extensions
# or update a specific one
pi update pi-mcp-adapter
pi update ponytail
```
The `ponytail` extension was already refreshed by the previous `pi update` run.

---

## About the `rtk` extension
The `rtk` extension is installed in this repository at `home/pi-agent/extensions/rtk.ts` and the binary is available in the PATH (`which rtk`).  It rewrites bash commands to use `rtk` for token savings.

If you ever need to reinstall or upgrade `rtk`, use its own installer (e.g. `cargo install rtk` or your OS package manager).  After updating, restart any Pi sessions to load the new version.


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
