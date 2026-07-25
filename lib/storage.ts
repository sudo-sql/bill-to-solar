"use client";

import type { ExtractedBillData, LoadItem, PlanInputs, SolarPlan } from "./types";

/**
 * Guest-mode persistence (localStorage). Bills and plans stay on the user's
 * device. When Supabase is configured this module is the single seam to
 * replace with authenticated, RLS-protected storage (see README).
 *
 * Privacy: customerName is intentionally stripped before persisting.
 */

const K = {
  currentBill: "b2s.currentBill",
  currentLoads: "b2s.currentLoads",
  currentInputs: "b2s.currentInputs",
  currentPlan: "b2s.currentPlan",
  savedPlans: "b2s.savedPlans",
  savedBills: "b2s.savedBills",
};

function get<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function set(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full/blocked — non-fatal */
  }
}

function redactBill(bill: ExtractedBillData): ExtractedBillData {
  const { customerName, ...rest } = bill;
  return rest as ExtractedBillData;
}

export const store = {
  setCurrentBill(bill: ExtractedBillData) {
    set(K.currentBill, redactBill(bill));
  },
  getCurrentBill(): ExtractedBillData | null {
    return get<ExtractedBillData>(K.currentBill);
  },
  setLoads(loads: LoadItem[]) {
    set(K.currentLoads, loads);
  },
  getLoads(): LoadItem[] {
    return get<LoadItem[]>(K.currentLoads) ?? [];
  },
  setInputs(inputs: PlanInputs) {
    set(K.currentInputs, inputs);
  },
  getInputs(): PlanInputs | null {
    return get<PlanInputs>(K.currentInputs);
  },
  setCurrentPlan(plan: SolarPlan) {
    set(K.currentPlan, plan);
  },
  getCurrentPlan(): SolarPlan | null {
    return get<SolarPlan>(K.currentPlan);
  },
  savePlan(plan: SolarPlan, bill: ExtractedBillData) {
    const plans = get<SolarPlan[]>(K.savedPlans) ?? [];
    set(K.savedPlans, [plan, ...plans.filter((p) => p.id !== plan.id)].slice(0, 25));
    const bills = get<ExtractedBillData[]>(K.savedBills) ?? [];
    set(
      K.savedBills,
      [redactBill(bill), ...bills.filter((b) => b.id !== bill.id)].slice(0, 25)
    );
  },
  getSavedPlans(): SolarPlan[] {
    return get<SolarPlan[]>(K.savedPlans) ?? [];
  },
  getSavedBills(): ExtractedBillData[] {
    return get<ExtractedBillData[]>(K.savedBills) ?? [];
  },
  deletePlan(id: string) {
    set(K.savedPlans, (get<SolarPlan[]>(K.savedPlans) ?? []).filter((p) => p.id !== id));
  },
  deleteBill(id: string) {
    set(K.savedBills, (get<ExtractedBillData[]>(K.savedBills) ?? []).filter((b) => b.id !== id));
  },
  clearAll() {
    Object.values(K).forEach((k) => {
      try {
        window.localStorage.removeItem(k);
      } catch {}
    });
  },
};
