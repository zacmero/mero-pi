#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUDO_CMD=""

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
  if command -v sudo >/dev/null 2>&1; then
    SUDO_CMD="sudo"
  else
    echo "Need root or sudo for package install." >&2
    exit 1
  fi
fi

have() { command -v "$1" >/dev/null 2>&1; }

install_apt() {
  local apt_get="$1"
  $SUDO_CMD "$apt_get" update
  $SUDO_CMD "$apt_get" install -y git nodejs npm python3
  if ! have chromium; then
    $SUDO_CMD "$apt_get" install -y chromium || $SUDO_CMD "$apt_get" install -y chromium-browser || true
  fi
}

install_pacman() {
  local pacman="$1"
  $SUDO_CMD "$pacman" -Sy --noconfirm --needed git nodejs npm python chromium
}

install_pi() {
  if ! have pi; then
    $SUDO_CMD npm install -g @earendil-works/pi-coding-agent
  else
    echo "pi already installed: $(pi --version 2>/dev/null || true)"
  fi
}

bootstrap_links() {
  bash "$REPO_ROOT/scripts/bootstrap-pi-links.sh"
}

case "$(. /etc/os-release 2>/dev/null; echo "${ID:-}")" in
  ubuntu|debian)
    install_apt "$(have apt-get && echo apt-get || echo apt)"
    ;;
  arch)
    install_pacman "$(have pacman && echo pacman || echo pacman)"
    ;;
  *)
    echo "Unsupported distro. Use Debian/Ubuntu or Arch Linux." >&2
    exit 1
    ;;
esac

install_pi
bootstrap_links

echo "Done. Restart shell, then run pi inside repo."
