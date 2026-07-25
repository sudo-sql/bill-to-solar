import type { ExtractedBillData, LoadItem } from "../types";

/** Realistic fake bill so the whole UI can be tested with no upload/OCR/AI. */
export function demoBill(): ExtractedBillData {
  return {
    id: `bill_demo_${Date.now().toString(36)}`,
    source: "demo",
    fileName: "demo-bill.pdf",
    utilityCompany: "Georgia Power",
    serviceZip: "30301",
    billingStartDate: "05/14/2026",
    billingEndDate: "06/13/2026",
    billingDays: 30,
    totalKwh: 1180,
    previousKwh: 1050,
    totalBillAmount: 187.42,
    energyCharges: 128.5,
    deliveryCharges: 38.6,
    demandCharge: null,
    taxesFees: 20.32,
    estimatedCostPerKwh: 0.159,
    ratePlan: "R-22 Residential",
    timeOfUse: false,
    peakRate: null,
    offPeakRate: null,
    netMetering: false,
    solarCredits: null,
    confidence: {
      utilityCompany: 0.95,
      billingDays: 0.9,
      totalKwh: 0.88,
      totalBillAmount: 0.92,
      serviceZip: 0.8,
    },
    needsUserReview: true,
    notes: [
      "This is DEMO data — realistic but fake, for exploring the app.",
      "One bill may not represent your annual usage. Upload bills from different seasons for better accuracy.",
    ],
    createdAt: new Date().toISOString(),
  };
}

export const COMMON_LOADS: Omit<LoadItem, "id">[] = [
  { name: "Refrigerator", watts: 150, hoursPerDay: 8, quantity: 1, critical: true },
  { name: "Chest freezer", watts: 100, hoursPerDay: 7, quantity: 1, critical: true },
  { name: "LED lights (whole house)", watts: 120, hoursPerDay: 5, quantity: 1, critical: true },
  { name: "Internet modem/router", watts: 20, hoursPerDay: 24, quantity: 1, critical: true },
  { name: "Phone/laptop charging", watts: 60, hoursPerDay: 4, quantity: 1, critical: true },
  { name: "Microwave", watts: 1100, hoursPerDay: 0.25, quantity: 1, critical: true },
  { name: "TV", watts: 100, hoursPerDay: 4, quantity: 1, critical: false },
  { name: "Well pump (1 HP)", watts: 1000, hoursPerDay: 1, quantity: 1, critical: false },
  { name: "Window AC", watts: 900, hoursPerDay: 6, quantity: 1, critical: false },
  { name: "Central HVAC (3-ton)", watts: 3500, hoursPerDay: 6, quantity: 1, critical: false },
  { name: "Heat pump", watts: 3000, hoursPerDay: 6, quantity: 1, critical: false },
  { name: "Electric water heater", watts: 4500, hoursPerDay: 2.5, quantity: 1, critical: false },
  { name: "Electric stove/oven", watts: 2500, hoursPerDay: 1, quantity: 1, critical: false },
  { name: "Washer", watts: 500, hoursPerDay: 0.5, quantity: 1, critical: false },
  { name: "Electric dryer", watts: 3000, hoursPerDay: 0.75, quantity: 1, critical: false },
  { name: "Medical equipment (CPAP etc.)", watts: 60, hoursPerDay: 8, quantity: 1, critical: true },
  { name: "EV charger (Level 2)", watts: 7200, hoursPerDay: 2, quantity: 1, critical: false },
  { name: "Power tools (shop)", watts: 1200, hoursPerDay: 1, quantity: 1, critical: false },
];
