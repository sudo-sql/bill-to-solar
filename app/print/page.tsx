"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { store } from "@/lib/storage";
import { ExtractedBillData, SolarPlan } from "@/lib/types";
import SystemDiagram from "@/components/SystemDiagram";
import { BRAND } from "@/lib/brand";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

const ELECTRICIAN_QUESTIONS = [
  "Do you do owner-assisted installs where I do the mounting/low-voltage work and you handle panel connections?",
  "What will the critical loads subpanel / transfer switch install cost for my panel?",
  "Is my service panel and grounding system adequate, or does it need upgrades first?",
  "What does our utility require for interconnection, and have you done their process before?",
  "Which permits does our AHJ require, and can a homeowner pull any of them here?",
  "Will you review my equipment list (inverter, batteries) for listings the inspector will accept (UL 1741, UL 9540)?",
  "Where should disconnects and rapid shutdown equipment go for our layout?",
  "Can you inspect my DIY low-voltage work before it's energized?",
];

export default function PrintPage() {
  const [plan, setPlan] = useState<SolarPlan | null>(null);
  const [bill, setBill] = useState<ExtractedBillData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPlan(store.getCurrentPlan());
    setBill(store.getCurrentBill());
    setLoaded(true);
  }, []);

  if (!loaded) return <div className="p-16 text-center text-slate-500">Loading…</div>;

  if (!plan || !bill) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="section-title">PDF export failed — no plan found</h1>
        <p className="mt-3 text-slate-600">Generate a plan first, then export it.</p>
        <Link href="/upload" className="btn-primary mt-6">Start with your bill →</Link>
      </div>
    );
  }

  const u = plan.usageSummary;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 bg-white">
      <div className="no-print mb-6 rounded-xl bg-brand-greenlight p-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-700">
          This is the printable version. Use your browser's print dialog and
          choose <strong>"Save as PDF"</strong>.
        </p>
        <div className="flex gap-2">
          <button className="btn-primary !py-2" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
          <Link href="/plan" className="btn-secondary !py-2">← Back to plan</Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b-4 border-brand-sun pb-4">
        <h1 className="text-3xl font-extrabold text-brand-navy">{BRAND.name}</h1>
        <p className="text-slate-600 mt-1">
          DIY Solar Conversion Plan · Generated {new Date(plan.createdAt).toLocaleDateString()}
        </p>
      </header>

      {/* 1 Usage */}
      <Section n={1} title="Confirmed usage summary">
        <table className="w-full text-sm">
          <tbody>
            <TR k="Utility" v={bill.utilityCompany || "—"} />
            <TR k="Billing period" v={`${bill.billingStartDate || "—"} to ${bill.billingEndDate || "—"} (${bill.billingDays ?? "~30"} days)`} />
            <TR k="Total usage" v={`${bill.totalKwh?.toLocaleString()} kWh`} />
            <TR k="Average daily usage" v={`${u.averageDailyKwh} kWh/day`} />
            <TR k="Estimated monthly / annual" v={`${u.estimatedMonthlyKwh.toLocaleString()} kWh / ${u.estimatedAnnualKwh.toLocaleString()} kWh`} />
            <TR k="Estimated cost per kWh" v={`$${u.estimatedCostPerKwh.toFixed(3)}`} />
            <TR k={`Estimated peak load${u.peakLoadIsEstimated ? " (conservative estimate)" : ""}`} v={`${u.estimatedPeakLoadKw} kW`} />
          </tbody>
        </table>
      </Section>

      {/* 2 Strategy */}
      <Section n={2} title="Recommended strategy">
        <p className="font-bold text-brand-green">{plan.recommendedStrategy}</p>
        <p className="text-sm text-slate-600 mt-1">{plan.recommendedStrategyReason}</p>
      </Section>

      {/* 3 Options */}
      <Section n={3} title="System options">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b-2 border-brand-navy">
              <th className="py-1.5 pr-2"></th>
              <th className="py-1.5 pr-2">Whole-Home</th>
              <th className="py-1.5 pr-2">Critical Loads</th>
              <th className="py-1.5">Budget Starter</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Solar array", `${plan.wholeHomePlan.solarArrayKw} kW`, `${plan.criticalLoadsPlan.solarArrayKw} kW`, `${plan.budgetStarterPlan.solarArrayKw} kW`],
              ["Panels", `${plan.wholeHomePlan.estimatedPanelCount}`, `${plan.criticalLoadsPlan.estimatedPanelCount}`, `${plan.budgetStarterPlan.estimatedPanelCount}`],
              ["Battery nominal", `${plan.wholeHomePlan.batteryKwhNominal} kWh`, `${plan.criticalLoadsPlan.batteryKwhNominal} kWh`, `${plan.budgetStarterPlan.batteryKwhNominal} kWh`],
              ["Inverter", `${plan.wholeHomePlan.inverterKwRecommended} kW`, `${plan.criticalLoadsPlan.inverterKwRecommended} kW`, `${plan.budgetStarterPlan.inverterKwRecommended} kW`],
              ["Est. budget", `${money(plan.wholeHomePlan.estimatedBudgetLow)}–${money(plan.wholeHomePlan.estimatedBudgetHigh)}`, `${money(plan.criticalLoadsPlan.estimatedBudgetLow)}–${money(plan.criticalLoadsPlan.estimatedBudgetHigh)}`, `${money(plan.budgetStarterPlan.estimatedBudgetLow)}–${money(plan.budgetStarterPlan.estimatedBudgetHigh)}`],
            ].map((row, i) => (
              <tr key={i} className="border-b border-slate-200">
                <td className="py-1.5 pr-2 font-semibold text-brand-navy">{row[0]}</td>
                <td className="py-1.5 pr-2">{row[1]}</td>
                <td className="py-1.5 pr-2">{row[2]}</td>
                <td className="py-1.5">{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* 4 Phases */}
      <Section n={4} title="Phased roadmap">
        {plan.phases.map((p) => (
          <div key={p.phaseNumber} className="print-page mb-4 rounded-lg border border-slate-200 p-3">
            <div className="flex justify-between flex-wrap gap-1">
              <strong className="text-brand-navy">Phase {p.phaseNumber}: {p.name}</strong>
              <span className="text-sm">{money(p.estimatedCostLow)}–{money(p.estimatedCostHigh)} · ~{p.estimatedUsageOffsetPercent}% covered · {p.difficulty.level}</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{p.goal}</p>
            <ul className="mt-1 text-sm text-slate-700">
              {p.components.map((c, i) => <li key={i}>• {c}</li>)}
            </ul>
          </div>
        ))}
      </Section>

      {/* 5 Components */}
      <Section n={5} title="Component shopping list (whole-home scale)">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left border-b-2 border-brand-navy">
              <th className="py-1 pr-2">Category</th>
              <th className="py-1 pr-2">Item</th>
              <th className="py-1 pr-2">Qty</th>
              <th className="py-1 pr-2">Est. budget</th>
              <th className="py-1">Sources</th>
            </tr>
          </thead>
          <tbody>
            {plan.componentList.map((c, i) => (
              <tr key={i} className="border-b border-slate-200 align-top">
                <td className="py-1 pr-2 font-semibold">{c.category}</td>
                <td className="py-1 pr-2">{c.item}</td>
                <td className="py-1 pr-2">{c.quantity}</td>
                <td className="py-1 pr-2 whitespace-nowrap">{money(c.budgetLow)}–{money(c.budgetHigh)}</td>
                <td className="py-1">{c.sources.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-slate-500 mt-2">
          Verify current pricing, shipping, warranty, and compatibility before purchasing.
        </p>
      </Section>

      {/* 6 Diagram */}
      <Section n={6} title="Conceptual system layout (educational only)">
        <SystemDiagram />
      </Section>

      {/* 7 Safety */}
      <Section n={7} title="Safety checklist">
        <ul className="text-sm space-y-1">
          {plan.safetyWarnings.map((w, i) => <li key={i}>▲ {w}</li>)}
        </ul>
      </Section>

      {/* 8 Electrician */}
      <Section n={8} title="Tasks for a licensed electrician">
        <ul className="text-sm space-y-1">
          {plan.electricianRequiredTasks.map((t, i) => <li key={i}>⚡ {t}</li>)}
        </ul>
      </Section>

      {/* 9 Questions */}
      <Section n={9} title="Questions to ask your electrician">
        <ul className="text-sm space-y-1">
          {ELECTRICIAN_QUESTIONS.map((q, i) => <li key={i}>☐ {q}</li>)}
        </ul>
      </Section>

      {/* 10 Permits */}
      <Section n={10} title="Permits, inspections & utility checklist">
        <ul className="text-sm space-y-1">
          {plan.permitChecklist.map((t, i) => <li key={i}>☐ {t}</li>)}
        </ul>
      </Section>

      {/* 11 Assumptions */}
      <Section n={11} title="Assumptions & limitations">
        <ul className="text-xs text-slate-600 space-y-1">
          {plan.assumptions.map((a, i) => <li key={i}>• {a}</li>)}
        </ul>
        <p className="mt-4 text-xs text-slate-500 border-t pt-3">
          {BRAND.name} provides educational planning only — not engineering,
          electrical, or legal advice. Final installation, utility
          interconnection, service-panel work, transfer switches,
          grounding/bonding, code compliance, permits, and inspections may
          require a licensed electrician and approval from your local
          authority having jurisdiction.
        </p>
      </Section>
    </div>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 print-page">
      <h2 className="font-bold text-lg text-brand-navy border-b border-slate-200 pb-1 mb-3">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

function TR({ k, v }: { k: string; v: string }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="py-1.5 pr-3 text-slate-500 w-64">{k}</td>
      <td className="py-1.5 font-semibold text-brand-navy">{v}</td>
    </tr>
  );
}
