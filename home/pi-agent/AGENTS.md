Pi source-of-truth lives in this repo. Edit repo files, then relink home configs with scripts/bootstrap-pi-links.sh.

Browser policy:
- Prefer `mero-browser` for headed, high-level, interactive browsing flows.
- Prefer `puppeteer` for headless, low-level, fast browser automation.
- Do not use Puppeteer for visible/manual browsing when `mero-browser` is better fit.
