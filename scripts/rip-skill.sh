#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST_ROOT="$REPO_ROOT/home/pi-agent/skills"
DEFAULT_SEARCH_ROOTS=(
  "$HOME/.agents/skills"
  "$HOME/.pi/agent/skills"
)

usage() {
  cat <<'EOF'
Usage: rip-skill.sh <skill-name|path>

Copies a skill from machine location into mero-pi source-of-truth.
EOF
}

is_md() { [[ "$1" == *.md || "$1" == *.MD ]]; }

resolve_source() {
  local input="$1"
  if [[ -e "$input" ]]; then
    printf '%s\n' "$input"
    return 0
  fi

  local root candidate
  for root in "${DEFAULT_SEARCH_ROOTS[@]}"; do
    [[ -d "$root" ]] || continue
    candidate="$root/$input"
    if [[ -e "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
    if [[ -d "$candidate" && -f "$candidate/SKILL.md" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
    if [[ -f "$root/$input.md" ]]; then
      printf '%s\n' "$root/$input.md"
      return 0
    fi
    if [[ -f "$root/$input/SKILL.md" ]]; then
      printf '%s\n' "$root/$input/SKILL.md"
      return 0
    fi
  done

  return 1
}

if [[ $# -ne 1 ]]; then
  usage >&2
  exit 1
fi

src="$(resolve_source "$1")" || {
  echo "Skill not found: $1" >&2
  exit 1
}

mkdir -p "$DEST_ROOT"

if [[ -d "$src" ]]; then
  skill_name="$(basename "$src")"
  dest="$DEST_ROOT/$skill_name"
  rm -rf "$dest"
  cp -a "$src" "$dest"
elif [[ -f "$src" && "$(basename "$src")" == "SKILL.md" ]]; then
  skill_name="$(basename "$(dirname "$src")")"
  dest="$DEST_ROOT/$skill_name"
  rm -rf "$dest"
  cp -a "$(dirname "$src")" "$dest"
else
  case "$src" in
  *.md | *.MD)
    skill_name="$(basename "$src" .md)"
    dest="$DEST_ROOT/$skill_name.md"
    rm -f "$dest"
    cp -a "$src" "$dest"
    ;;
  *)
    echo "Unsupported skill source: $src" >&2
    exit 1
    ;;
  esac
fi

echo "Ripped skill -> $dest"

# Runs again the bootstrap-pi-links so new skill symlinks are correct and wont cause conflicts.
"$REPO_ROOT/scripts/bootstrap-pi-links.sh"
