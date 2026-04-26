# @org/integrations-scraper

Stealth browser automation layer built on `playwright-extra` + `puppeteer-extra-plugin-stealth`. Exports `launchStealthBrowser()` for anti-detection browser sessions and `BlockDetector` for recognising captcha, rate-limit, Cloudflare, and other access-denial signals. Initial browser-launch wiring is part of **M2**; full block-detection heuristics and retry strategies land in **M3**. See the consensus plan in `.omc/plans/` for milestone details.
