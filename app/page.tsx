import Link from "next/link";
import { BRAND } from "@/lib/brand";

const PLAN_EXAMPLES = [
  {
    name: "Budget Starter",
    price: "$500–$2,000",
    desc: "Portable panels, a small battery, and an inverter to keep phones, internet, lights, and a fridge alive. Learn safely at low voltage.",
    badge: "Beginner-friendly",
  },
  {
    name: "Critical Loads Backup",
    price: "$3,000–$12,000",
    desc: "Power the essentials — refrigerator, lights, internet, medical devices — through outages with solar + battery and a proper transfer setup.",
    badge: "Most popular",
  },
  {
    name: "Phased DIY Plan",
    price: "Spread over time",
    desc: "Five stages from load reduction to a full hybrid system. Buy as your budget allows; every phase works on its own.",
    badge: "Recommended path",
  },
  {
    name: "Whole-Home Conversion",
    price: "$15,000–$60,000+",
    desc: "Offset most or all of your usage with a full array, large battery bank, and professional interconnection.",
    badge: "Maximum independence",
  },
];

const STEPS = [
  { n: 1, t: "Upload your bill", d: "PDF, photo, or screenshot — or type your usage in manually." },
  { n: 2, t: "Review the numbers", d: "We show every extracted value with a confidence score. You confirm or fix each one — nothing is blindly trusted." },
  { n: 3, t: "Get your roadmap", d: "Panel counts, battery sizing, budget ranges, a shopping list, safety checklists, and a phase-by-phase plan. Export it as a PDF." },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
          <p className="mb-4 inline-block rounded-full bg-brand-navylight px-4 py-1.5 text-sm text-brand-sunlight font-medium">
            Free, private, educational DIY planning
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight max-w-3xl mx-auto">
            Upload your electric bill.{" "}
            <span className="text-brand-sun">Get a DIY solar roadmap.</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-slate-300">
            {BRAND.shortName} analyzes your real electricity usage and builds a
            practical plan — panels, batteries, inverters, budgets, and safety
            checklists — whether you want a small backup setup or a
            whole-home conversion, all at once or in phases.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/upload" className="btn-primary text-lg px-8">
              Upload My Bill →
            </Link>
            <Link href="/upload?demo=1" className="btn-secondary !border-slate-400 !text-slate-200 hover:!bg-brand-navylight hover:!text-white">
              Try the Demo
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-400 max-w-xl mx-auto">
            In guest mode your bill is processed in your browser and never
            uploaded to a server. Educational planning only — final
            installation may require a licensed electrician, permits, and
            utility approval.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="section-title text-center mb-10">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-sun text-brand-navy font-bold text-lg">
                {s.n}
              </div>
              <h3 className="font-bold text-lg text-brand-navy">{s.t}</h3>
              <p className="mt-2 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan examples */}
      <section className="bg-white border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="section-title text-center">Plans for every budget</h2>
          <p className="text-center text-slate-600 mt-2 mb-10 max-w-2xl mx-auto">
            Budget ranges are estimates — your plan is sized from your actual
            bill. Verify current pricing before purchasing.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_EXAMPLES.map((p) => (
              <div key={p.name} className="card flex flex-col">
                <span className="badge bg-brand-greenlight text-brand-green self-start">
                  {p.badge}
                </span>
                <h3 className="mt-3 font-bold text-brand-navy text-lg">{p.name}</h3>
                <div className="text-brand-sun font-bold mt-1">{p.price}</div>
                <p className="mt-2 text-sm text-slate-600 flex-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety strip */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="card border-l-4 !border-l-brand-sun">
          <h2 className="font-bold text-xl text-brand-navy">
            Built around safety, not shortcuts
          </h2>
          <p className="mt-2 text-slate-600 text-sm leading-relaxed">
            Every plan separates what a careful DIYer can reasonably do
            (planning, load audits, low-voltage assembly with proper fusing,
            racking) from what belongs to a licensed electrician
            (service-panel work, transfer switches, grounding design, utility
            interconnection, inspections). You'll get NEC-aligned checklists,
            UL-listing guidance, and the exact questions to ask your
            electrician and your local building department.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/safety" className="btn-ghost !px-3 !py-1.5 text-sm border border-slate-200">
              Read the Safety &amp; Code guide →
            </Link>
            <Link href="/basics" className="btn-ghost !px-3 !py-1.5 text-sm border border-slate-200">
              New to solar? Start with the basics →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
