"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CHEMISTRY, DEFAULT_INPUTS, generatePlan } from "@/lib/plan";
import { store } from "@/lib/storage";
import {
  BatteryChemistry,
  ExtractedBillData,
  LoadItem,
  PlanInputs,
} from "@/lib/types";
import SystemDiagram from "@/components/SystemDiagram";
import LoadInventory from "@/components/LoadInventory";
import { VENDOR_DISCLAIMER } from "@/lib/data/vendors";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function PlanPage() {
  const [bill, setBill] = useState<ExtractedBillData | null>(null);
  const [inputs, setInputs] = useState<PlanInputs>(DEFAULT_INPUTS);
  const [loads, setLoads] = useState<LoadItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoads, setShowLoads] = useState(false);

  useEffect(() => {
    setBill(store.getCurrentBill());
    const savedInputs = store.getInputs();
    if (savedInputs) setInputs({ ...DEFAULT_INPUTS, ...savedInputs });
    setLoads(store.getLoads());
    setLoaded(true);
  }, []);

  const plan = useMemo(() => {
    if (!bill || !bill.totalKwh) return null;
    try {
      return generatePlan(bill, inputs, loads);
    } catch {
      return null;
    }
  }, [bill, inputs, loads]);

  useEffect(() => {
    if (plan) {
      store.setCurrentPlan(plan);
      store.setInputs(inputs);
      store.setLoads(loads);
    }
  }, [plan, inputs, loads]);

  if (!loaded) return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">Loading…</div>;

  if (!bill || !bill.totalKwh) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="section-title">Plan generation unavailable</h1>
        <p className="mt-3 text-slate-600">
          We need confirmed bill data (at minimum, total kWh) before we can
          build your plan.
        </p>
        <Link href="/upload" className="btn-primary mt-6">Upload or enter your bill →</Link>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="section-title">Something went wrong generating your plan</h1>
        <p className="mt-3 text-slate-600">Please re-check your bill values and try again.</p>
        <Link href="/review" className="btn-primary mt-6">Back to review →</Link>
      </div>
    );
  }

  const u = plan.usageSummary;
  const set = (patch: Partial<PlanInputs>) => setInputs({ ...inputs, ...patch });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4 no-print">
        <span className="font-semibold text-brand-navy">1. Upload</span>
        <span>→</span>
        <span className="font-semibold text-brand-navy">2. Review</span>
        <span>→</span>
        <span className="font-semibold text-brand-sun">3. Your plan</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="section-title">Your DIY solar roadmap</h1>
          <p className="mt-1 text-slate-600 text-sm">
            All figures are <strong>estimates</strong> built from your confirmed
            bill data and stated assumptions.
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button
            className="btn-secondary !py-2"
            onClick={() => {
              store.savePlan(plan, bill);
              setSaved(true);
              setTimeout(() => setSaved(false), 2500);
            }}
          >
            {saved ? "✓ Saved" : "Save plan"}
          </button>
          <Link href="/print" className="btn-primary !py-2">Export PDF</Link>
        </div>
      </div>

      {/* Usage summary */}
      <section className="card mt-6">
        <h2 className="font-bold text-xl text-brand-navy">1 · Bill analysis</h2>
        <p className="text-sm text-slate-500 mt-1">
          {bill.utilityCompany || "Your utility"}
          {bill.billingDays ? ` · ${bill.billingDays}-day billing period` : ""}
          {bill.serviceZip ? ` · ZIP ${bill.serviceZip}` : ""}
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <Stat label="Avg daily use" value={`${u.averageDailyKwh} kWh`} />
          <Stat label="Monthly (est.)" value={`${u.estimatedMonthlyKwh.toLocaleString()} kWh`} />
          <Stat label="Annual (est.)" value={`${u.estimatedAnnualKwh.toLocaleString()} kWh`} />
          <Stat label="Cost per kWh" value={`$${u.estimatedCostPerKwh.toFixed(3)}`} />
          <Stat label={`Peak load ${u.peakLoadIsEstimated ? "(est.)" : ""}`} value={`${u.estimatedPeakLoadKw} kW`} />
        </div>
        <UsageBar daily={u.averageDailyKwh} />
        {plan.highLoadWarnings.length > 0 && (
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 space-y-1">
            {plan.highLoadWarnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
          </div>
        )}
      </section>

      {/* Assumption controls */}
      <section className="card mt-6 no-print">
        <h2 className="font-bold text-xl text-brand-navy">2 · Tune the assumptions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="field-label">Panel wattage</label>
            <select className="field-input" value={inputs.panelWattage} onChange={(e) => set({ panelWattage: parseInt(e.target.value) })}>
              {[300, 350, 400, 450, 500, 550].map((w) => <option key={w} value={w}>{w} W</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Effective sun hours/day</label>
            <select className="field-input" value={inputs.sunHours} onChange={(e) => set({ sunHours: parseFloat(e.target.value) })}>
              {[3.5, 4, 4.5, 5, 5.5, 6].map((h) => <option key={h} value={h}>{h} h {h <= 4 ? "(northern/cloudy)" : h >= 5.5 ? "(desert SW)" : "(US average)"}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Battery chemistry</label>
            <select className="field-input" value={inputs.chemistry} onChange={(e) => set({ chemistry: e.target.value as BatteryChemistry })}>
              {(Object.keys(CHEMISTRY) as BatteryChemistry[]).map((k) => (
                <option key={k} value={k}>{CHEMISTRY[k].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Backup days (autonomy)</label>
            <select className="field-input" value={inputs.autonomyDays} onChange={(e) => set({ autonomyDays: parseFloat(e.target.value) })}>
              {[0.5, 1, 2, 3].map((d) => <option key={d} value={d}>{d} day{d !== 1 ? "s" : ""}</option>)}
            </select>
          </div>
        </div>
        <button className="btn-ghost mt-4 text-sm border border-slate-200" onClick={() => setShowLoads(!showLoads)}>
          {showLoads ? "Hide" : "Refine with"} appliance load inventory {loads.length > 0 ? `(${loads.length} loads)` : ""}
        </button>
        {showLoads && (
          <div className="mt-4 border-t pt-4">
            <LoadInventory loads={loads} onChange={setLoads} />
          </div>
        )}
      </section>

      {/* Recommended strategy */}
      <section className="card mt-6 border-l-4 !border-l-brand-green">
        <h2 className="font-bold text-xl text-brand-navy">3 · Recommended strategy</h2>
        <p className="mt-2 text-lg font-semibold text-brand-green">{plan.recommendedStrategy}</p>
        <p className="mt-1 text-sm text-slate-600">{plan.recommendedStrategyReason}</p>
      </section>

      {/* Three plan options */}
      <section className="mt-6">
        <h2 className="font-bold text-xl text-brand-navy mb-4">4 · Your three options</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          <PlanCard
            title="Whole-Home Conversion"
            subtitle={`Offsets ~95–100% of your ${u.estimatedMonthlyKwh.toLocaleString()} kWh/mo`}
            sys={plan.wholeHomePlan}
            footnote="Whole-home off-grid is expensive and must be designed carefully — usually best reached via the phased path."
          />
          <PlanCard
            title="Critical Loads Backup"
            subtitle={`Powers ~${plan.criticalLoadsPlan.dailyCriticalKwh} kWh/day of essentials`}
            sys={plan.criticalLoadsPlan}
            highlight
            footnote="Fridge, lights, internet, phones, and specified medical devices. Uses a critical loads panel/transfer switch (electrician-installed)."
          />
          <PlanCard
            title="Budget Starter"
            subtitle={`~${plan.budgetStarterPlan.dailyKwhTarget} kWh/day of emergency essentials`}
            sys={plan.budgetStarterPlan}
            footnote="A small kit cannot run a whole house — it keeps phones, lights, internet, and a fridge going. It's also the best way to learn."
          />
        </div>
      </section>

      {/* Phases */}
      <section className="mt-8">
        <h2 className="font-bold text-xl text-brand-navy mb-1">5 · Phased roadmap</h2>
        <p className="text-sm text-slate-600 mb-4">
          Each phase stands alone — stop, pause, or continue as budget allows.
        </p>
        <div className="space-y-4">
          {plan.phases.map((p) => (
            <div key={p.phaseNumber} className="card print-page">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-white font-bold">
                  {p.phaseNumber}
                </div>
                <h3 className="font-bold text-brand-navy text-lg flex-1">{p.name}</h3>
                <DifficultyBadge level={p.difficulty.level} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{p.goal}</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto]">
                <ul className="text-sm text-slate-700 space-y-1">
                  {p.components.map((c, i) => <li key={i}>• {c}</li>)}
                </ul>
                <div className="text-right min-w-[150px]">
                  <div className="text-xs text-slate-500">Estimated cost</div>
                  <div className="font-bold text-brand-navy">{money(p.estimatedCostLow)}–{money(p.estimatedCostHigh)}</div>
                  <div className="mt-2 text-xs text-slate-500">Usage covered (cumulative)</div>
                  <div className="font-bold text-brand-green">~{p.estimatedUsageOffsetPercent}%</div>
                </div>
              </div>
              <OffsetBar pct={p.estimatedUsageOffsetPercent} />
              <p className="mt-2 text-xs text-slate-500 italic">{p.difficulty.reason}</p>
              {p.notes.map((n, i) => (
                <p key={i} className="mt-1 text-xs text-slate-600">→ {n}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Component list */}
      <section className="card mt-8">
        <h2 className="font-bold text-xl text-brand-navy">6 · Component shopping list (whole-home scale)</h2>
        <p className="text-sm text-slate-600 mt-1">{VENDOR_DISCLAIMER}</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b">
                <th className="py-2 pr-3">Category</th>
                <th className="py-2 pr-3">Item</th>
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">Est. budget</th>
                <th className="py-2">Suggested sources</th>
              </tr>
            </thead>
            <tbody>
              {plan.componentList.map((c, i) => (
                <tr key={i} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-3 font-semibold text-brand-navy whitespace-nowrap">{c.category}</td>
                  <td className="py-2 pr-3">
                    {c.item}
                    <div className="text-xs text-slate-500 mt-0.5">{c.notes}</div>
                  </td>
                  <td className="py-2 pr-3 whitespace-nowrap">{c.quantity}</td>
                  <td className="py-2 pr-3 whitespace-nowrap font-medium">{money(c.budgetLow)}–{money(c.budgetHigh)}</td>
                  <td className="py-2 text-xs text-slate-600">{c.sources.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-right font-bold text-brand-navy">
          Whole-home total: {money(plan.wholeHomePlan.estimatedBudgetLow)}–{money(plan.wholeHomePlan.estimatedBudgetHigh)} (estimated)
        </p>
      </section>

      {/* Diagram */}
      <section className="card mt-8">
        <h2 className="font-bold text-xl text-brand-navy">7 · Conceptual system layout</h2>
        <p className="text-sm text-slate-600 mt-1 mb-4">
          Educational concept only — not a wiring schematic. Exact wire sizes,
          overcurrent protection, and grounding must be calculated for your
          specific equipment and reviewed for code compliance.
        </p>
        <SystemDiagram />
      </section>

      {/* Safety & electrician */}
      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="card border-l-4 !border-l-red-400 print-page">
          <h2 className="font-bold text-xl text-brand-navy">8 · Safety checklist</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {plan.safetyWarnings.map((w, i) => (
              <li key={i} className="flex gap-2"><span className="text-red-500 shrink-0">▲</span>{w}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-5">
          <div className="card print-page">
            <h2 className="font-bold text-xl text-brand-navy">9 · Leave to a licensed electrician</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {plan.electricianRequiredTasks.map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-brand-green shrink-0">⚡</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="card print-page">
            <h2 className="font-bold text-xl text-brand-navy">10 · Permits, inspections & utility</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {plan.permitChecklist.map((t, i) => (
                <li key={i} className="flex gap-2"><span className="shrink-0">☐</span>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Maintenance + assumptions */}
      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="card print-page">
          <h2 className="font-bold text-xl text-brand-navy">11 · Maintenance checklist</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {plan.maintenanceChecklist.map((t, i) => (
              <li key={i} className="flex gap-2"><span className="shrink-0">🔧</span>{t}</li>
            ))}
          </ul>
        </div>
        <div className="card bg-slate-50 print-page">
          <h2 className="font-bold text-xl text-brand-navy">12 · Assumptions & limitations</h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-600">
            {plan.assumptions.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 no-print">
        <Link href="/print" className="btn-primary flex-1 text-center text-lg">Export plan as PDF →</Link>
        <button className="btn-secondary" onClick={() => { store.savePlan(plan, bill); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
          {saved ? "✓ Saved to dashboard" : "Save to dashboard"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-brand-cream p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-bold text-brand-navy text-lg leading-tight mt-0.5">{value}</div>
    </div>
  );
}

function UsageBar({ daily }: { daily: number }) {
  const max = 80;
  const pct = Math.min(100, (daily / max) * 100);
  const markers = [
    { at: 12, label: "Low (12)" },
    { at: 30, label: "US avg (~30)" },
    { at: 60, label: "High (60)" },
  ];
  return (
    <div className="mt-5">
      <div className="text-xs text-slate-500 mb-1">Your daily usage vs. typical homes (kWh/day)</div>
      <div className="relative h-5 rounded-full bg-slate-100 overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-green to-brand-sun" style={{ width: `${pct}%` }} />
      </div>
      <div className="relative h-5 text-[10px] text-slate-400">
        {markers.map((m) => (
          <span key={m.at} className="absolute -translate-x-1/2" style={{ left: `${(m.at / max) * 100}%` }}>
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function OffsetBar({ pct }: { pct: number }) {
  return (
    <div className="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full bg-brand-green" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    Beginner: "bg-brand-greenlight text-brand-green",
    Intermediate: "bg-amber-100 text-amber-800",
    Advanced: "bg-orange-100 text-orange-800",
    "Licensed professional": "bg-red-100 text-red-700",
  };
  return <span className={`badge ${styles[level] || "bg-slate-100 text-slate-600"}`}>{level}</span>;
}

function PlanCard({
  title,
  subtitle,
  sys,
  highlight,
  footnote,
}: {
  title: string;
  subtitle: string;
  sys: {
    solarArrayKw: number;
    panelWattage: number;
    estimatedPanelCount: number;
    estimatedPanelAreaSqFt: number;
    batteryKwhNominal: number;
    batteryKwhUsable: number;
    inverterKwRecommended: number;
    estimatedBudgetLow: number;
    estimatedBudgetHigh: number;
  };
  highlight?: boolean;
  footnote: string;
}) {
  return (
    <div className={`card flex flex-col print-page ${highlight ? "ring-2 ring-brand-sun" : ""}`}>
      {highlight && <span className="badge bg-brand-sun text-brand-navy self-start mb-2">Popular middle path</span>}
      <h3 className="font-bold text-brand-navy text-lg">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      <dl className="mt-4 space-y-2 text-sm flex-1">
        <Row k="Solar array" v={`${sys.solarArrayKw} kW`} />
        <Row k="Panels" v={`${sys.estimatedPanelCount} × ${sys.panelWattage}W (~${sys.estimatedPanelAreaSqFt} sq ft)`} />
        <Row k="Battery (nominal)" v={`${sys.batteryKwhNominal} kWh`} />
        <Row k="Battery (usable)" v={`${sys.batteryKwhUsable} kWh`} />
        <Row k="Inverter" v={`${sys.inverterKwRecommended} kW continuous`} />
      </dl>
      <div className="mt-4 rounded-xl bg-brand-cream p-3 text-center">
        <div className="text-xs text-slate-500">Estimated budget</div>
        <div className="font-bold text-brand-navy">{money(sys.estimatedBudgetLow)}–{money(sys.estimatedBudgetHigh)}</div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{footnote}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-slate-100 pb-1.5">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-semibold text-brand-navy text-right">{v}</dd>
    </div>
  );
}
