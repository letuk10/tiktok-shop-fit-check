# Kalodata-driven market reports and plans

## What changes
- Keep the current order: choose relevant competing products, see market numbers, interest gate, then qualification.
- Enrich the five highest-revenue selected competitors with product details, top videos, newly published video counts and creators. Show completion per product and retain cached results on the submission.
- Add competitor benchmarks, top ten videos, creator follower/revenue distributions and ads insights to both the market screen and report. Every benchmark includes its Kalodata source.
- Make client market numbers and plan assumptions read-only. Keep their product costs, dimensions, own fulfillment cost and qualification inputs.
- Build commission, affiliates, samples, video output, ads budgets and six-month scenarios from measured competitor benchmarks.
- After an existing shop is selected, scan its products with the same endpoints, add “You vs market average” comparisons and initialize its projection from measured current performance.
- Add passcode-protected team adjustments and Refresh data. Save overrides and label adjusted reports.
- Skip unavailable endpoint data; fewer than two usable competitors gets a broader-keyword message and keyword editing, not invented numbers.

## Calculation interpretations
- The top five are chosen from the competitors the visitor confirms, not irrelevant excluded products.
- GMV per video uses product video revenue divided by videos with exposure; GMV per affiliate uses product GMV divided by active affiliates. Missing denominators remain unavailable.
- Conservative/Base/Strong use the 25th/50th/75th percentile GMV per video. ROAS multipliers are 0.75/1/1.25 respectively; 1.25 is the assumed Strong multiplier since only Conservative was specified.
- Month-three ads budget is derived from pre-ad projected month-three GMV, avoiding a circular calculation. Missing measured ad ROAS is shown as unavailable and does not generate fabricated ad sales.
- “Market average” uses medians for counts/rates; channel comparisons use measured revenue shares. Video-count caps display 100+ or 300+ as applicable.

## Technical approach
- Extend cached submission JSON, preserving existing rows; no new database schema is needed.
- Use incremental server-function calls for each product so progress is visible and long scans stay within request limits. Space rank calls at least 1.1 seconds and cache successful endpoint results independently.
- Keep pure benchmark/projection logic covered by concrete tests. Protect team-only refresh and override operations server-side; public saves cannot modify protected assumptions.
- Verify competitor selection, enrichment, report caching, locked client controls, own-shop comparison and team adjustments through tests and the live app.

## Existing limitation
Optional report emails remain saved only; email delivery still needs a verified sender domain.