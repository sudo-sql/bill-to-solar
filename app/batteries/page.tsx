import { BATTERY_PROFILES } from "@/lib/data/batteries";

export const metadata = { title: "Battery Comparison — Bill-to-Solar" };

export default function BatteriesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="section-title">Battery comparison</h1>
      <p className="mt-2 text-slate-600 max-w-2xl">
        The battery bank is usually the biggest cost of energy independence —
        and the easiest place to waste money. Compare the real trade-offs.
      </p>

      <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
        <strong>Never mix battery chemistries, capacities, or ages in one bank.</strong>{" "}
        Mismatched batteries charge unevenly, which kills the bank early and
        can create dangerous overcharging. Flooded batteries also vent
        explosive hydrogen while charging — they need a ventilated enclosure,
        correct charge profiles, temperature awareness, and a properly rated
        main fuse.
      </div>

      {/* Quick comparison table */}
      <div className="mt-8 overflow-x-auto card !p-0">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b bg-slate-50">
              <th className="py-2.5 px-4">Chemistry</th>
              <th className="py-2.5 px-4">Usable capacity</th>
              <th className="py-2.5 px-4">Cycle life</th>
              <th className="py-2.5 px-4">Lifetime cost</th>
              <th className="py-2.5 px-4">Maintenance</th>
              <th className="py-2.5 px-4">Ventilation</th>
            </tr>
          </thead>
          <tbody>
            {BATTERY_PROFILES.map((b) => (
              <tr key={b.key} className="border-b border-slate-100 align-top">
                <td className="py-2.5 px-4 font-semibold text-brand-navy">{b.chemistry}</td>
                <td className="py-2.5 px-4">{b.usableDoD}</td>
                <td className="py-2.5 px-4">{b.cycleLife}</td>
                <td className="py-2.5 px-4">{b.costPerUsableKwh}</td>
                <td className="py-2.5 px-4">{b.maintenance}</td>
                <td className="py-2.5 px-4 text-xs">{b.ventilation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail cards */}
      <div className="mt-8 space-y-5">
        {BATTERY_PROFILES.map((b) => (
          <div key={b.key} className="card">
            <h2 className="font-bold text-lg text-brand-navy">{b.chemistry}</h2>
            <p className="mt-1 text-sm font-medium text-brand-green">{b.bestFor}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">Pros</h3>
                <ul className="text-slate-600 space-y-1">
                  {b.pros.map((p, i) => <li key={i}>+ {p}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">Cons</h3>
                <ul className="text-slate-600 space-y-1">
                  {b.cons.map((c, i) => <li key={i}>− {c}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-700 mb-1">Safety essentials</h3>
                <ul className="text-slate-600 space-y-1">
                  {b.safety.map((s, i) => <li key={i}>▲ {s}</li>)}
                </ul>
                <p className="mt-2 text-xs text-slate-500">Temperature: {b.temperature}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card bg-brand-cream">
        <h2 className="font-bold text-brand-navy">A note on marine batteries</h2>
        <p className="mt-2 text-sm text-slate-600">
          Marine "deep-cycle" batteries are a fine way to build a cheap
          learning/emergency setup — they're available everywhere and low
          risk to experiment with (with proper fusing and ventilation). But
          their plates are a compromise between starting and cycling duty, so
          they deliver few cycles and little usable capacity. For a system you
          cycle every day, LiFePO4 almost always costs less per kWh actually
          delivered over its life. Use marine batteries to learn; upgrade the
          bank when you get serious — and never mix the old ones into the new bank.
        </p>
      </div>
    </div>
  );
}
