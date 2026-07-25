"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { store } from "@/lib/storage";
import { ExtractedBillData } from "@/lib/types";

function ConfidenceBadge({ score }: { score: number | undefined }) {
  if (score === undefined) return null;
  const pct = Math.round(score * 100);
  if (score >= 0.8)
    return <span className="badge bg-brand-greenlight text-brand-green">✓ {pct}% confident</span>;
  if (score >= 0.5)
    return <span className="badge bg-amber-100 text-amber-800">⚠ {pct}% — please verify</span>;
  return <span className="badge bg-red-100 text-red-700">✗ {pct}% — check this</span>;
}

interface FieldDef {
  key: keyof ExtractedBillData;
  label: string;
  type: "text" | "number" | "money" | "bool";
  confKey?: string;
  hint?: string;
}

const FIELDS: FieldDef[] = [
  { key: "utilityCompany", label: "Utility company", type: "text", confKey: "utilityCompany" },
  { key: "serviceZip", label: "Service ZIP code", type: "text", confKey: "serviceZip", hint: "Used only to estimate sun hours later" },
  { key: "billingStartDate", label: "Billing period start", type: "text" },
  { key: "billingEndDate", label: "Billing period end", type: "text" },
  { key: "billingDays", label: "Billing days", type: "number", confKey: "billingDays", hint: "Usually 28–33" },
  { key: "totalKwh", label: "Total kWh used", type: "number", confKey: "totalKwh", hint: "The single most important number" },
  { key: "previousKwh", label: "Previous period kWh", type: "number" },
  { key: "totalBillAmount", label: "Total bill amount ($)", type: "money", confKey: "totalBillAmount" },
  { key: "energyCharges", label: "Energy charges ($)", type: "money" },
  { key: "deliveryCharges", label: "Delivery charges ($)", type: "money" },
  { key: "demandCharge", label: "Demand charges ($)", type: "money" },
  { key: "taxesFees", label: "Taxes & fees ($)", type: "money" },
  { key: "ratePlan", label: "Rate plan", type: "text" },
  { key: "timeOfUse", label: "Time-of-use rate?", type: "bool" },
  { key: "peakRate", label: "Peak rate ($/kWh)", type: "money" },
  { key: "offPeakRate", label: "Off-peak rate ($/kWh)", type: "money" },
  { key: "netMetering", label: "Net metering mentioned?", type: "bool" },
  { key: "solarCredits", label: "Existing solar credits ($)", type: "money" },
];

export default function ReviewPage() {
  const router = useRouter();
  const [bill, setBill] = useState<ExtractedBillData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setBill(store.getCurrentBill());
    setLoaded(true);
  }, []);

  if (!loaded) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-500">Loading…</div>;

  if (!bill) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="section-title">No bill data yet</h1>
        <p className="mt-3 text-slate-600">Upload a bill or enter your usage first.</p>
        <Link href="/upload" className="btn-primary mt-6">Go to Upload →</Link>
      </div>
    );
  }

  const update = (key: keyof ExtractedBillData, value: any) => {
    const next = { ...bill, [key]: value };
    // editing a field means the human verified it
    if (next.confidence && key in next.confidence) {
      next.confidence = { ...next.confidence, [key]: 1 };
    }
    setBill(next);
  };

  const canGenerate = !!bill.totalKwh && bill.totalKwh > 0;
  const mainFields = FIELDS.slice(0, 8);
  const extraFields = FIELDS.slice(8);
  const visible = showAll ? FIELDS : mainFields;

  const generate = () => {
    const confirmed = { ...bill, needsUserReview: false };
    store.setCurrentBill(confirmed);
    router.push("/plan");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <span className="font-semibold text-brand-navy">1. Upload</span>
        <span>→</span>
        <span className="font-semibold text-brand-sun">2. Review</span>
        <span>→</span>
        <span>3. Your plan</span>
      </div>

      <h1 className="section-title">Review your bill data</h1>
      <p className="mt-2 text-slate-600">
        We don't blindly trust OCR — and neither should you. Check each value
        (especially the flagged ones) and fix anything that's wrong. Editing a
        field marks it verified.
      </p>

      {bill.notes.length > 0 && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900 space-y-1">
          {bill.notes.map((n, i) => (
            <p key={i}>• {n}</p>
          ))}
        </div>
      )}

      <div className="card mt-6">
        <div className="text-xs text-slate-500 mb-4">
          Source: {bill.source === "demo" ? "Demo data" : bill.source === "manual" ? "Manual entry" : bill.source === "pdf" ? `PDF text (${bill.fileName})` : `Photo OCR (${bill.fileName})`}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((f) => (
            <div key={f.key as string}>
              <label className="field-label flex items-center justify-between gap-2">
                <span>{f.label}</span>
                {f.confKey && <ConfidenceBadge score={bill.confidence?.[f.confKey]} />}
              </label>
              {f.type === "bool" ? (
                <select
                  className="field-input"
                  value={bill[f.key] ? "yes" : "no"}
                  onChange={(e) => update(f.key, e.target.value === "yes")}
                >
                  <option value="no">No / not shown</option>
                  <option value="yes">Yes</option>
                </select>
              ) : (
                <input
                  className="field-input"
                  inputMode={f.type === "text" ? "text" : "decimal"}
                  value={bill[f.key] === null || bill[f.key] === undefined ? "" : String(bill[f.key])}
                  placeholder={f.type === "text" ? "—" : "not found"}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (f.type === "text") update(f.key, v);
                    else update(f.key, v === "" ? null : parseFloat(v) || 0);
                  }}
                />
              )}
              {f.hint && <p className="text-xs text-slate-400 mt-1">{f.hint}</p>}
            </div>
          ))}
        </div>
        <button
          className="btn-ghost mt-4 text-sm border border-slate-200"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Hide" : "Show"} {extraFields.length} more fields (charges, rates, net metering)
        </button>
      </div>

      {!canGenerate && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          <strong>Total kWh is required.</strong> It's the foundation of every
          calculation. Find it on your bill (often "kWh used" or "total
          usage") and enter it above.
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button className="btn-primary flex-1 text-lg" disabled={!canGenerate} onClick={generate}>
          Confirm and Generate Plan →
        </button>
        <Link href="/upload" className="btn-secondary">Upload a different bill</Link>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Privacy: your name and account number are not needed and are not
        stored. Data stays on this device in guest mode.
      </p>
    </div>
  );
}
