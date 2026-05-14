# mero-pi

Source of truth for Pi config on this machine.

## Layout
- `home/config/mcp/mcp.json` -> shared MCP config
- `home/pi-agent/mcp.json` -> Pi global MCP override
- `home/pi-agent/settings.json` -> Pi global settings
- `home/pi-agent/models.json` -> Pi provider/model config
- `home/pi-agent/keybindings.json` -> Pi global keybindings
- `home/pi-agent/AGENTS.md` -> top-level Pi agent policy
- `home/pi-agent/{prompts,skills,extensions,themes}` -> global custom surfaces
- `project/mcp.json` -> project-local MCP config source
- `bin/mcp-puppeteer-chromium` -> Puppeteer MCP wrapper using Chromium
- `scripts/bootstrap-pi-links.sh` -> relink home configs to repo

## Install

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
