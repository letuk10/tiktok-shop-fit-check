<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

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
