Pi source-of-truth lives in this repo. Edit repo files, then relink home configs with scripts/bootstrap-pi-links.sh.

Browser policy:
- Prefer `mero-browser` for headed, high-level, interactive browsing flows.
- Prefer `puppeteer` for headless, low-level, fast browser automation.
- Do not use Puppeteer for visible/manual browsing when `mero-browser` is better fit.

RTK policy:
- When running inside Pi, shell work should go through Pi's own `bash` tool so `home/pi-agent/extensions/rtk.ts` can rewrite commands.
- Do not bypass the extension path with ad-hoc shell execution for normal agent work.
- Disable RTK for a session only by starting Pi with `RTK_DISABLED=1`.
