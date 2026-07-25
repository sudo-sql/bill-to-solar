// ── Bill extraction ────────────────────────────────────────────────────────

export type BillSource = "pdf" | "ocr" | "manual" | "demo";

export interface BillConfidence {
  utilityCompany: number;
  billingDays: number;
  totalKwh: number;
  totalBillAmount: number;
  serviceZip: number;
  [key: string]: number;
}

export interface ExtractedBillData {
  id: string;
  source: BillSource;
  fileName?: string;
  utilityCompany: string;
  /** Kept in memory for the review screen only; never persisted by default. */
  customerName?: string;
  serviceZip: string;
  billingStartDate: string;
  billingEndDate: string;
  billingDays: number | null;
  totalKwh: number | null;
  previousKwh: number | null;
  totalBillAmount: number | null;
  energyCharges: number | null;
  deliveryCharges: number | null;
  demandCharge: number | null;
  taxesFees: number | null;
  estimatedCostPerKwh: number | null;
  ratePlan: string;
  timeOfUse: boolean;
  peakRate: number | null;
  offPeakRate: number | null;
  netMetering: boolean;
  solarCredits: number | null;
  confidence: BillConfidence;
  needsUserReview: boolean;
  notes: string[];
  createdAt: string;
}

// ── Load inventory ─────────────────────────────────────────────────────────

export interface LoadItem {
  id: string;
  name: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
  critical: boolean;
}

// ── Plan generation ────────────────────────────────────────────────────────

export type BatteryChemistry = "lifepo4" | "flooded" | "agm" | "gel" | "marine";

export type PlanType =
  | "wholeHome"
  | "criticalLoads"
  | "phased"
  | "budgetStarter"
  | "offGridCabin";

export interface PlanInputs {
  panelWattage: number;
  sunHours: number;
  deratingFactor: number;
  autonomyDays: number;
  chemistry: BatteryChemistry;
  /** kWh/day for critical loads; derived from load inventory when available */
  criticalDailyKwh: number;
  /** user-supplied measured peak load in kW, if known */
  knownPeakKw: number | null;
  planType: PlanType;
}

export interface DifficultyRating {
  level: "Beginner" | "Intermediate" | "Advanced" | "Licensed professional";
  reason: string;
}

export interface PlanPhase {
  phaseNumber: number;
  name: string;
  goal: string;
  components: string[];
  estimatedCostLow: number;
  estimatedCostHigh: number;
  estimatedUsageOffsetPercent: number;
  difficulty: DifficultyRating;
  notes: string[];
}

export interface ComponentLine {
  category: string;
  item: string;
  quantity: string;
  budgetLow: number;
  budgetHigh: number;
  notes: string;
  sources: string[];
}

export interface SizedSystem {
  solarArrayKw: number;
  panelWattage: number;
  estimatedPanelCount: number;
  estimatedPanelAreaSqFt: number;
  batteryKwhNominal: number;
  batteryKwhUsable: number;
  inverterKwRecommended: number;
  inverterSurgeKw: number;
  chargeControllerNote: string;
  estimatedBudgetLow: number;
  estimatedBudgetHigh: number;
}

export interface SolarPlan {
  id: string;
  billId: string;
  createdAt: string;
  inputs: PlanInputs;
  usageSummary: {
    averageDailyKwh: number;
    estimatedMonthlyKwh: number;
    estimatedAnnualKwh: number;
    estimatedCostPerKwh: number;
    estimatedPeakLoadKw: number;
    peakLoadIsEstimated: boolean;
  };
  recommendedStrategy: string;
  recommendedStrategyReason: string;
  wholeHomePlan: SizedSystem;
  criticalLoadsPlan: SizedSystem & { dailyCriticalKwh: number };
  budgetStarterPlan: SizedSystem & { dailyKwhTarget: number };
  phases: PlanPhase[];
  componentList: ComponentLine[];
  safetyWarnings: string[];
  electricianRequiredTasks: string[];
  permitChecklist: string[];
  maintenanceChecklist: string[];
  assumptions: string[];
  highLoadWarnings: string[];
}
