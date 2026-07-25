# Bill-to-Solar DIY Planner

**Upload your electric bill. Get a DIY solar roadmap.**

A production-ready Next.js web app that analyzes a homeowner's real electric bill and generates an educational DIY solar conversion plan — whole-home, critical-loads backup, and a five-phase incremental path — with component shopping lists, budget ranges, battery comparisons, conceptual system diagrams, safety checklists, and PDF export.

> ⚠️ **Safety framing (baked into the product):** This app provides educational planning only. It never instructs users to open energized panels, backfeed the grid, or bypass meters. Every plan separates DIY-appropriate work from tasks that require a licensed electrician, permits, inspections, and utility approval.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS (custom brand tokens) |
| Bill parsing | pdf.js (PDF text) + Tesseract.js (image OCR), loaded from CDN on demand, **runs entirely in the browser** |
| Persistence | localStorage guest mode (default); Supabase schema included for auth/cloud upgrade |
| PDF export | Dedicated print-optimized route + browser "Save as PDF" |

**Zero API keys are required to run the MVP.** Guest mode processes bills client-side; the user's bill never leaves their device.

## Quick start

```bash
git clone https://github.com/sudo-sql/bill-to-solar.git
cd bill-to-solar
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve production build
```

Try it without a bill: click **"Try the Demo"** on the home page (or visit `/upload?demo=1`) to load realistic sample data.

## Pages

| Route | Purpose |
|---|---|
| `/` | Home: headline, how-it-works, plan examples, safety disclaimer |
| `/upload` | Drag-and-drop / camera / PDF upload, manual entry fallback, demo mode, privacy note |
| `/review` | "Review Your Bill Data" — every extracted field editable with confidence badges; nothing is blindly trusted |
| `/plan` | Generated roadmap: usage analysis, tunable assumptions, load inventory, 3 system options, 5 phases with difficulty ratings, shopping list, conceptual diagram, safety/permit/maintenance checklists, assumptions |
| `/print` | Print-optimized full plan → browser "Save as PDF" |
| `/library` | Component library (what/why/mistakes/difficulty/when-to-call-an-electrician) + editable U.S. vendor table |
| `/batteries` | LiFePO4 vs flooded vs AGM vs gel vs marine comparison |
| `/basics` | Watts, kWh, voltage, surge, DoD, sun hours, derating — plain English |
| `/safety` | NEC/code reminders, permit & interconnection checklists, battery/fire/roof safety |
| `/dashboard` | Saved plans (device-local), seasonal-accuracy warnings, delete-my-data |

## Architecture

```
app/                  # Next.js App Router pages
components/           # Nav, Footer, SystemDiagram, LoadInventory
lib/
  brand.ts            # ← rebrand here (name/tagline; colors in tailwind.config.ts)
  types.ts            # ExtractedBillData, SolarPlan, PlanPhase, etc. (structured JSON shapes)
  parse.ts            # bill text → structured data + confidence scores
  extract.ts          # pdf.js / Tesseract pipeline (client-side, CDN-loaded)
  plan.ts             # all sizing math, budget model, phases, checklists
  storage.ts          # guest-mode persistence seam (swap for Supabase here)
  data/               # vendors, component docs, battery profiles, demo bill
supabase/schema.sql   # full DB schema + RLS policies for the cloud upgrade
```

### Planning formulas (shown to users as assumptions)

- Daily kWh = total kWh ÷ billing days (or ÷ 30.44)
- Array kW = daily kWh ÷ (sun hours × derating factor [default 0.75])
- Battery nominal kWh = daily kWh × autonomy days ÷ (DoD × round-trip efficiency), per chemistry
- Inverter kW = peak load × 1.25 headroom; surge = 2× continuous
- Peak load: measured value > load-inventory estimate > conservative 4.5× average-load heuristic (floor 3.5 kW)

The app **never hallucinates precision**: estimated values are labeled estimated, unknown site factors (roof, shade, orientation, local code) are stated as unknown, and every plan ends with assumptions & limitations.

## Rebranding

1. `lib/brand.ts` — name, short name, tagline (or set `NEXT_PUBLIC_APP_NAME`).
2. `tailwind.config.ts` — the `brand.*` color tokens restyle the entire app.
3. Deploy under any domain; no hardcoded URLs.

## Security & privacy model

- **Guest mode (default):** bill files are read in-browser and discarded; only extracted numbers are kept, in localStorage. Customer name is stripped before any persistence. Users can delete everything from the dashboard.
- **File validation:** type allow-list (PDF/JPEG/PNG/WEBP/HEIC) + 15 MB cap before processing.
- **Text sanitization:** extracted text is stripped of control characters and markup before parsing/display.
- **Cloud upgrade path:** `supabase/schema.sql` ships row-level security on every user table, a private storage bucket policy (signed URLs only), and deliberately has **no columns for customer name or account number**.
- Server-only keys (service role, AI) use non-`NEXT_PUBLIC` env vars — see `.env.example`.

## Deployment

**Vercel (recommended):** push to GitHub → import in Vercel → deploy. No env vars needed for the MVP.

**Anywhere with Node:** `npm run build && npm start` behind any reverse proxy.

## Upgrade paths (pre-wired seams)

| Integration | Where it plugs in |
|---|---|
| Supabase auth + cloud storage | Replace `lib/storage.ts`; run `supabase/schema.sql`; set env vars |
| AI bill parsing (Claude API) | Add `app/api/parse-bill/route.ts` that returns the structured JSON in `lib/types.ts` (`ExtractedBillData` matches the required schema incl. per-field `confidence` and `needsUserReview`); keep `lib/parse.ts` as fallback |
| NREL PVWatts sun-hours by ZIP | Replace the `sunHours` selector default in `/plan` using `serviceZip` |
| DSIRE incentives, utility rate APIs, live prices, affiliate links | Extend `lib/data/vendors.ts` / new API routes |
| Stripe premium, contractor marketplace, AI chat | Standard Next.js API routes; schema already has `plan_exports` |

## Error states handled

Upload failure · unsupported file type · file too large · OCR unreadable → manual entry · missing kWh (blocks generation with guidance) · no plan data on `/plan` or `/print` · HEIC unsupported browser · offline CDN (falls back to manual entry).

## License / disclaimer

Educational planning tool. Not engineering, electrical, or legal advice. Final installation, interconnection, service-panel work, grounding/bonding, permits, and inspections may require a licensed electrician and AHJ approval. Verify current pricing, shipping, warranty, and compatibility before purchasing any component.
