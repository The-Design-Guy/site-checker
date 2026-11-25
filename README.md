# Website Checker

Pre-launch website checker + keyword research. One page (`index.html`) plus three small server functions in `api/` that run on Vercel.

## Two versions, one deployment

- `/` — Design Guy (dark, ATLAS colours)
- `/web3d` — Web3D (light, Web3D red and logo). The developer report, the keyword report and the popups the bookmarklet shows on the checked site all follow the brand.

Both share the same keys and password. Each keeps its own saved work in the browser, so a check saved in one doesn't show up in the other. For local testing, `index.html?brand=web3d` opens the Web3D version.

## Vercel setup

Settings → Environment Variables (Production, Preview, Development), then **Redeploy**:

| Variable | What | Required |
|---|---|---|
| `APP_PASSWORD` | Password that unlocks the tool. Without it the server refuses every AI/PageSpeed call. | yes |
| `ANTHROPIC_API_KEY` | Claude key for keyword research, document reading, the SEO plan | yes |
| `PAGESPEED_API_KEY` | Google PageSpeed Insights key | no — works without, with a small quota |

Keys never reach the browser. The browser only stores the password (once per browser).

## How it runs

- **On Vercel** — the page asks for the password, then every AI and PageSpeed request goes through `/api/claude` and `/api/pagespeed` with the keys from the environment.
- **Opened from disk** (or any host without `/api`) — the old in-browser mode: keys are entered in the tool and stay in that browser.

Limits to know: a request to the server can be up to ~4.5MB (Vercel), so very large PDFs for "read document with AI" may not go through. `api/claude.js` may run up to 300s (`vercel.json`).

## Files

- `index.html` — the tool
- `api/status.js`, `api/claude.js`, `api/pagespeed.js` — server functions (`api/_lib.js` is shared code, not a route)
- `docs/keyword-research-methodology.md` — the reasoning behind the keyword research
