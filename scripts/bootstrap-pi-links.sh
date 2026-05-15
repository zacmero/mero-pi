#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOME_DIR="${HOME}"

link_file() {
  local src="$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"
  rm -f "$dst"
  ln -s "$src" "$dst"
}

link_dir() {
  local src="$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"
  rm -rf "$dst"
  ln -s "$src" "$dst"
}

# Shared MCP config
link_file "$REPO_ROOT/home/config/mcp/mcp.json" "$HOME_DIR/.config/mcp/mcp.json"

# Pi global overrides
link_file "$REPO_ROOT/home/pi-agent/mcp.json" "$HOME_DIR/.pi/agent/mcp.json"
link_file "$REPO_ROOT/home/pi-agent/settings.json" "$HOME_DIR/.pi/agent/settings.json"
link_file "$REPO_ROOT/home/pi-agent/models.json" "$HOME_DIR/.pi/agent/models.json"
link_file "$REPO_ROOT/home/pi-agent/keybindings.json" "$HOME_DIR/.pi/agent/keybindings.json"
link_file "$REPO_ROOT/home/pi-agent/AGENTS.md" "$HOME_DIR/.pi/agent/AGENTS.md"
link_dir "$REPO_ROOT/home/pi-agent/prompts" "$HOME_DIR/.pi/agent/prompts"
link_dir "$REPO_ROOT/home/pi-agent/skills" "$HOME_DIR/.pi/agent/skills"
link_dir "$REPO_ROOT/home/pi-agent/skills" "$HOME_DIR/.agents/skills"
link_dir "$REPO_ROOT/home/pi-agent/extensions" "$HOME_DIR/.pi/agent/extensions"
link_dir "$REPO_ROOT/home/pi-agent/themes" "$HOME_DIR/.pi/agent/themes"

printf 'linked Pi config files from %s\n' "$REPO_ROOT"
