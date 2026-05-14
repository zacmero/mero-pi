# mero-pi

Source of truth for Pi config on this machine.

## Layout
- `home/.config/mcp/mcp.json` -> shared MCP config
- `home/.pi/agent/mcp.json` -> Pi global MCP override
- `home/.pi/agent/settings.json` -> Pi global settings
- `home/.pi/agent/models.json` -> Pi provider/model config
- `bin/mcp-puppeteer-chromium` -> Puppeteer MCP wrapper using Chromium
- `scripts/bootstrap-pi-links.sh` -> relink home configs to repo

## Notes
- Generated data stays in home: auth, cache, sessions.
- Edit repo files only; relink after changes.
