# resources-api-fast

Speed layer for the `assets-api` Worker, which serves **`assets.codersoft.xyz`** (the
"Resources RenderDragon API" that backs the resources catalog in dev and for partners).

## Why it exists

The original handler built `/all` by fetching the whole git tree from the GitHub API and
assembling a 3.6 MB pretty-printed payload, and it re-parsed and re-serialised that payload
on every cache hit. On the Workers **Free** plan (10 ms CPU per request, zone
`codersoft.xyz` is `Free Website`) that tripped Cloudflare error **1102**
("Worker exceeded resource limits") most of the time:

```
wrangler tail assets-api
outcome: exceededCpu  ->  Error: Worker exceeded CPU time limit.
cpu: 10, 18, 20, 20, 20, 20, 21, 39, 106 ms   (6 of 9 killed)
```

Uptime Kuma measured ~49% uptime over 24 h (84 of the last 100 checks down).

## What it does

`index.js` wraps the original bundle (`orig.js`) and intercepts only the two cacheable
routes, `/all` and `/category/*`:

- `/all` is assembled from the per-category `RESOURCES_KV` values by string
  concatenation. No `JSON.parse`, no `JSON.stringify`, no GitHub API call.
- A cache hit streams the stored body back untouched, so the payload never enters JS.
- A KV miss or any error falls through to the original handler, which keeps every other
  route (`/`, `/categories`, `/ui`, `/docs`, `/api/credits`, the webhook, rate limiting,
  `/mcicons`, `/fonts`) byte-for-byte unchanged.

Measured after deploy, same route, same clients:

| path | before | after |
| --- | --- | --- |
| `/all` cache hit | 20-106 ms CPU, ~2/3 killed | **0-1 ms CPU**, 200 |
| `/all` cold build | ~100 ms + GitHub API | **~20 ms** from KV |
| payload size | 3.63 MB (indented) | 2.71 MB (compact) |

## Applied to both scripts

The same bundle is deployed twice, and both were patched:

| script | serves | config | deployed version | rollback version |
| --- | --- | --- | --- | --- |
| `assets-api` | `assets.codersoft.xyz` | `wrangler.toml` (rate limiter `1002`) | `80d5b0da-240b-4398-8e91-020a5e23898d` | `be6bab9d-7cbc-4423-8f47-9b5c0dbe2a45` |
| `hamburger-api` | the router's resources pool (`RESOURCES_ORIGINS`) | `wrangler.hamburger-api.toml` (rate limiter `1001`) | `2ed11384-c639-4fb1-88a8-fcd63ccfa3a4` | `56afd97c-0b31-4acd-8e51-2f9126b41b0d` |

## Deploy

```sh
cd workers/resources-api-fast
pnpm exec wrangler versions upload -c wrangler.toml                 # assets-api
pnpm exec wrangler versions upload -c wrangler.hamburger-api.toml   # hamburger-api
pnpm exec wrangler versions deploy <version-id>@100 --yes --message "..."
```

A version upload only includes the bindings the config declares, so both files declare all
of them. Verify the version has seven bindings (`ADMIN_KEY`, `API_KEY`, `CREDITS_KV`,
`GITHUB_TOKEN`, `RATE_LIMITER`, `RESOURCES_KV`, `WEBHOOK_SECRET`) before deploying; secrets
are inherited from the deployed version, but a missing KV or rate-limit binding is dropped
silently and breaks credits and rate limiting.

Rollback: `wrangler versions deploy <rollback version>@100 --yes`.

## Caveats

- `orig.js` is the deployed bundle as downloaded from Cloudflare
  (`GET /accounts/<acc>/workers/scripts/assets-api/content/v2`), not the original source.
  **The worker's source repository is not known.** If someone deploys `assets-api` from
  its real source, this wrapper is replaced and `/all` regresses; the same two changes need
  to be made there instead.
- `/all` now reports `"source": "kv"` (was `"github-api-optimized"`) and is compact JSON.
  Fields, category names and counts are unchanged.
- Data comes from `RESOURCES_KV`, which the catalog rebuild updates. The cache TTL is 1 h.
