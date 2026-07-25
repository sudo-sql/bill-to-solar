"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { store } from "@/lib/storage";
import { ExtractedBillData, SolarPlan } from "@/lib/types";

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

export default function DashboardPage() {
  const [plans, setPlans] = useState<SolarPlan[]>([]);
  const [bills, setBills] = useState<ExtractedBillData[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = () => {
    setPlans(store.getSavedPlans());
    setBills(store.getSavedBills());
  };

  useEffect(() => {
    refresh();
    setLoaded(true);
  }, []);

  if (!loaded) return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-500">Loading…</div>;

  const seasonalWarning =
    bills.length === 1
      ? "You have one bill saved. One bill may not represent annual usage — summer AC or winter heating can double it. Upload bills from other seasons for a more accurate plan."
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="section-title">Saved plans</h1>
      <p className="mt-2 text-slate-600">
        Stored on this device (guest mode). Compare plans across seasons and
        assumptions, or delete anything you no longer want kept.
      </p>

      {seasonalWarning && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-900">
          ⚠ {seasonalWarning}
        </div>
      )}

      {plans.length === 0 ? (
        <div className="card mt-8 text-center py-14">
          <p className="text-slate-500">No saved plans yet.</p>
          <Link href="/upload" className="btn-primary mt-5">Create your first plan →</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {plans.map((p) => {
            const bill = bills.find((b) => b.id === p.billId);
            return (
              <div key={p.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-brand-navy">
                      {bill?.utilityCompany || "Manual entry"} ·{" "}
                      {p.usageSummary.averageDailyKwh} kWh/day
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Saved {new Date(p.createdAt).toLocaleDateString()} ·{" "}
                      {bill?.billingStartDate ? `Bill period ${bill.billingStartDate}–${bill.billingEndDate}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary !py-1.5 !px-3 text-sm"
                      onClick={() => {
                        if (bill) store.setCurrentBill(bill);
                        store.setCurrentPlan(p);
                        store.setInputs(p.inputs);
                        window.location.href = "/plan";
                      }}
                    >
                      Open
                    </button>
                    <button
                      className="btn-ghost !py-1.5 !px-3 text-sm text-red-600 border border-red-200"
                      onClick={() => {
                        store.deletePlan(p.id);
                        if (bill) store.deleteBill(bill.id);
                        refresh();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <MiniStat label="Strategy" value={p.recommendedStrategy.split("(")[0]} />
                  <MiniStat label="Whole-home array" value={`${p.wholeHomePlan.solarArrayKw} kW`} />
                  <MiniStat label="Battery" value={`${p.wholeHomePlan.batteryKwhNominal} kWh`} />
                  <MiniStat
                    label="Whole-home budget"
                    value={`${money(p.wholeHomePlan.estimatedBudgetLow)}–${money(p.wholeHomePlan.estimatedBudgetHigh)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card mt-10 bg-slate-50">
        <h2 className="font-bold text-brand-navy">Your data, your device</h2>
        <p className="mt-2 text-sm text-slate-600">
          In guest mode everything lives in this browser's local storage —
          nothing is uploaded. Deleting here removes it permanently. Account
          sync with secure cloud storage (Supabase) is available to developers
          in the README.
        </p>
        <button
          className="btn-ghost mt-3 text-sm text-red-600 border border-red-200"
          onClick={() => {
            if (confirm("Delete ALL saved bills and plans from this device?")) {
              store.clearAll();
              refresh();
            }
          }}
        >
          Delete all my data
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-brand-cream p-2.5">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="font-semibold text-brand-navy text-sm leading-tight mt-0.5">{value}</div>
    </div>
  );
}
