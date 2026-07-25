import { COMPONENT_DOCS } from "@/lib/data/components";
import { VENDORS, VENDOR_DISCLAIMER } from "@/lib/data/vendors";

export const metadata = { title: "Component Library — Bill-to-Solar" };

const DIFF_STYLE: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-800",
  Advanced: "bg-orange-100 text-orange-800",
  "Licensed professional": "bg-red-100 text-red-700",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="section-title">Component library</h1>
      <p className="mt-2 text-slate-600 max-w-2xl">
        Plain-English explanations of every part of a solar + battery system:
        what it does, why you need it, the mistakes that hurt people and burn
        houses, and when to call an electrician.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {COMPONENT_DOCS.map((c) => (
          <div key={c.name} className="card">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-bold text-lg text-brand-navy">{c.name}</h2>
              <span className={`badge shrink-0 ${DIFF_STYLE[c.difficulty]}`}>{c.difficulty}</span>
            </div>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-700">What this does</dt>
                <dd className="text-slate-600 mt-0.5">{c.what}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Why you need it</dt>
                <dd className="text-slate-600 mt-0.5">{c.why}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">Common mistakes</dt>
                <dd className="text-slate-600 mt-0.5">
                  <ul className="space-y-0.5">
                    {c.mistakes.map((m, i) => <li key={i}>• {m}</li>)}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-700">When to call an electrician</dt>
                <dd className="text-slate-600 mt-0.5">{c.callElectrician}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>

      {/* Vendors */}
      <h2 className="section-title mt-14">Where to buy (U.S. sources)</h2>
      <p className="mt-2 text-sm text-slate-600">{VENDOR_DISCLAIMER}</p>
      <div className="mt-6 overflow-x-auto card !p-0">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-slate-500 border-b bg-slate-50">
              <th className="py-2.5 px-4">Vendor</th>
              <th className="py-2.5 px-4">Category</th>
              <th className="py-2.5 px-4">Good for</th>
              <th className="py-2.5 px-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            {VENDORS.map((v) => (
              <tr key={v.name} className="border-b border-slate-100 align-top">
                <td className="py-2.5 px-4 font-semibold text-brand-navy whitespace-nowrap">
                  {v.url ? (
                    <a href={v.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-sun underline decoration-slate-300">
                      {v.name}
                    </a>
                  ) : (
                    v.name
                  )}
                </td>
                <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">{v.category}</td>
                <td className="py-2.5 px-4 text-slate-600">{v.goodFor}</td>
                <td className="py-2.5 px-4 text-slate-500 text-xs">{v.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
