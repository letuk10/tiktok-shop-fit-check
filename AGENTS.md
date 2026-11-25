## Hosting (moved off Lovable, Nov 2026)
- Code lives in GitHub `letuk10/tiktok-shop-fit-check`; every push to `main` deploys to Vercel (`tiktok-shop-fit-check.vercel.app`). The build targets Vercel through `nitro: { preset: "vercel" }` in vite.config.ts.
- Database: Supabase project `uosgevckftrhjalzjqvi`. The server uses the publishable key plus a private `x-app-secret` header (`APP_DB_SECRET`); RLS only admits requests carrying it. Schema changes go through Supabase migrations.
- AI: Vercel AI Gateway (`src/lib/market-ai.server.ts`), authenticated by the project's OIDC token. Every AI step has a deterministic fallback.
- Secrets live in Vercel environment variables, never in the repo: KALODATA_API_KEY, TEAM_PASSCODE, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_DB_SECRET, and optionally HUB_API_URL / HUB_API_KEY / KEEPA_API_KEY for the ASIN lookup.

## Project rules
- All database access goes through server functions in `src/lib/fit.functions.ts` using the admin client; the `submissions` table has RLS on with no policies, so the browser never reads it directly.
- Kalodata is called only from server functions (never the browser); scan results are cached in `submissions.kalodata`.
- Discovery retains one last-30-day snapshot per unique listing; historical rank pulls discover IDs only and aggregates flatten before summation to prevent inflated niche GMV.
- Business rules (fees, projection, verdict) live in pure `src/lib/calc.ts`, covered by `src/test/calc.test.ts`.

- Market analysis uses the shared product-only market component on the wizard and report; submission answers hold flow version, exact resume step, and interest so existing rows remain compatible.
- Competing-market search uses product/rank; incremental enrichment uses product/detail, video/rank and creator/rank for the selected top five, cached independently to keep progress visible and requests bounded.
- Own-shop products use the same enrichment cache in a separate namespace so own performance never contaminates competitor benchmarks.
- Public saves accept own fulfillment cost only; team overrides and cache refresh require a verified server-side passcode so client controls cannot alter market assumptions.
- Scenario ordering and visual identity are presentation-only; preserve calculation ordering so Base economics and narratives remain consistent.
- Required qualification rules are shared between the wizard and server saves so incomplete answers cannot advance through direct requests.
- External video and booking players load only inside user-visible dialogs, with fixed provider URLs and validated video identifiers.
- Keyword search broadens each phrase (filler removal, then shorter variants) until enough selling products appear; the variant used is cached in `kalodata.keywordInfo` so the report can show it.
- Visitors confirm at most five competitors (`answers.selectedProducts`); `selectedCompetitors` is the single source for enrichment, benchmarks and scan progress, with a fallback for older rows.
- The report and in-wizard plan render the same `Story` component so both follow one section order; role values in the database stay stable and only display labels change.
- The full report renders as a slide deck (`src/components/fit/deck.tsx`) fed by pure `src/lib/deck.ts`; headlines and tiles derive from cached data and skip missing values, so keep new slide logic in `deck.ts` with tests.
- Category totals (`category/detail`, 30 and 90 days, plus parent) are fetched once per submission by `enrichCategory` and cached in `kalodata.category`; it also backfills 90-day product details for older scans.
