import type {
  BatteryChemistry,
  ComponentLine,
  ExtractedBillData,
  LoadItem,
  PlanInputs,
  PlanPhase,
  SizedSystem,
  SolarPlan,
} from "./types";

// ── Chemistry characteristics (planning-level, not engineering data) ──────
export const CHEMISTRY: Record<
  BatteryChemistry,
  {
    label: string;
    depthOfDischarge: number;
    roundTripEfficiency: number;
    costPerKwhLow: number;
    costPerKwhHigh: number;
    cycleLife: string;
    ventilation: string;
  }
> = {
  lifepo4: {
    label: "LiFePO4 (lithium iron phosphate)",
    depthOfDischarge: 0.85,
    roundTripEfficiency: 0.95,
    costPerKwhLow: 250,
    costPerKwhHigh: 500,
    cycleLife: "3,000–6,000+ cycles",
    ventilation: "No off-gassing; keep above freezing when charging",
  },
  flooded: {
    label: "Flooded lead-acid",
    depthOfDischarge: 0.5,
    roundTripEfficiency: 0.8,
    costPerKwhLow: 150,
    costPerKwhHigh: 300,
    cycleLife: "500–1,200 cycles",
    ventilation:
      "REQUIRED — vents hydrogen gas while charging; needs a ventilated enclosure",
  },
  agm: {
    label: "AGM (sealed lead-acid)",
    depthOfDischarge: 0.5,
    roundTripEfficiency: 0.85,
    costPerKwhLow: 200,
    costPerKwhHigh: 400,
    cycleLife: "400–800 cycles",
    ventilation: "Minimal; sealed but avoid unventilated hot spaces",
  },
  gel: {
    label: "Gel (sealed lead-acid)",
    depthOfDischarge: 0.5,
    roundTripEfficiency: 0.85,
    costPerKwhLow: 220,
    costPerKwhHigh: 420,
    cycleLife: "500–1,000 cycles",
    ventilation: "Minimal; sensitive to fast charging",
  },
  marine: {
    label: "Marine / deep-cycle hybrid",
    depthOfDischarge: 0.4,
    roundTripEfficiency: 0.75,
    costPerKwhLow: 90,
    costPerKwhHigh: 200,
    cycleLife: "200–400 cycles",
    ventilation:
      "Ventilate like flooded lead-acid; budget/emergency use only — not ideal for daily-cycled whole-home banks",
  },
};

export const DEFAULT_INPUTS: PlanInputs = {
  panelWattage: 400,
  sunHours: 4.5,
  deratingFactor: 0.75,
  autonomyDays: 1,
  chemistry: "lifepo4",
  criticalDailyKwh: 5,
  knownPeakKw: null,
  planType: "phased",
};

const AVG_MONTH_DAYS = 30.44;
const PANEL_SQFT_PER_400W = 21.7; // typical ~68" x 45" residential panel

function round(n: number, places = 1): number {
  const f = Math.pow(10, places);
  return Math.round(n * f) / f;
}

export function dailyKwhFromBill(bill: ExtractedBillData): number {
  if (bill.totalKwh && bill.billingDays && bill.billingDays > 0) {
    return bill.totalKwh / bill.billingDays;
  }
  if (bill.totalKwh) {
    return bill.totalKwh / AVG_MONTH_DAYS;
  }
  return 0;
}

export function costPerKwh(bill: ExtractedBillData): number {
  if (bill.estimatedCostPerKwh) return bill.estimatedCostPerKwh;
  if (bill.totalBillAmount && bill.totalKwh && bill.totalKwh > 0) {
    return bill.totalBillAmount / bill.totalKwh;
  }
  return 0.17; // US residential ballpark; labeled as estimated in assumptions
}

/**
 * Conservative peak-load estimate when the user has no measured value:
 * average continuous load x 4.5 (covers compressor starts, cooking, etc.),
 * floored at 3.5 kW for any normal household.
 */
export function estimatePeakKw(dailyKwh: number): number {
  const avgLoadKw = dailyKwh / 24;
  return Math.max(3.5, round(avgLoadKw * 4.5, 1));
}

function sizeSystem(
  dailyKwh: number,
  inputs: PlanInputs,
  peakKw: number,
  opts?: { fixedArrayKw?: number; fixedBatteryDays?: number }
): SizedSystem {
  const chem = CHEMISTRY[inputs.chemistry];
  const arrayKw =
    opts?.fixedArrayKw ??
    dailyKwh / (inputs.sunHours * inputs.deratingFactor);
  const panelCount = Math.max(1, Math.ceil((arrayKw * 1000) / inputs.panelWattage));
  const areaSqFt = round(panelCount * PANEL_SQFT_PER_400W * (inputs.panelWattage / 400), 0);

  const autonomy = opts?.fixedBatteryDays ?? inputs.autonomyDays;
  const usableNeeded = dailyKwh * autonomy;
  const nominalKwh =
    usableNeeded / (chem.depthOfDischarge * chem.roundTripEfficiency);

  const inverterKw = round(peakKw * 1.25, 1); // 25% headroom
  const surgeKw = round(inverterKw * 2, 1); // typical LRA/surge target

  // Budget model (equipment, DIY pricing, 2024–2026 ballparks — labeled estimated)
  const panelsLow = arrayKw * 1000 * 0.35;
  const panelsHigh = arrayKw * 1000 * 0.65;
  const rackLow = arrayKw * 1000 * 0.1;
  const rackHigh = arrayKw * 1000 * 0.28;
  const invLow = inverterKw * 1000 * 0.18;
  const invHigh = inverterKw * 1000 * 0.45;
  const battLow = nominalKwh * chem.costPerKwhLow;
  const battHigh = nominalKwh * chem.costPerKwhHigh;
  const equipLow = panelsLow + rackLow + invLow + battLow;
  const equipHigh = panelsHigh + rackHigh + invHigh + battHigh;
  // Balance of system: wire, breakers, disconnects, grounding, conduit, labels
  const bosLow = equipLow * 0.15;
  const bosHigh = equipHigh * 0.25;
  // Permits + licensed electrician for code-critical work
  const proLow = arrayKw >= 3 ? 1500 : 300;
  const proHigh = arrayKw >= 3 ? 6000 : 1500;

  return {
    solarArrayKw: round(arrayKw, 2),
    panelWattage: inputs.panelWattage,
    estimatedPanelCount: panelCount,
    estimatedPanelAreaSqFt: areaSqFt,
    batteryKwhNominal: round(nominalKwh, 1),
    batteryKwhUsable: round(usableNeeded, 1),
    inverterKwRecommended: inverterKw,
    inverterSurgeKw: surgeKw,
    chargeControllerNote:
      arrayKw >= 2
        ? "A hybrid (all-in-one) inverter with built-in MPPT is usually simpler at this size. If using a separate MPPT controller, size it to array voltage/current per manufacturer tables."
        : "An MPPT charge controller sized to panel Voc (cold-temperature corrected) and battery bank voltage. Follow the manufacturer's sizing tables.",
    estimatedBudgetLow: Math.round((equipLow + bosLow + proLow) / 100) * 100,
    estimatedBudgetHigh: Math.round((equipHigh + bosHigh + proHigh) / 100) * 100,
  };
}

export function criticalKwhFromLoads(loads: LoadItem[]): number {
  const critical = loads.filter((l) => l.critical);
  if (critical.length === 0) return 0;
  const wh = critical.reduce(
    (sum, l) => sum + l.watts * l.hoursPerDay * l.quantity,
    0
  );
  return round(wh / 1000, 2);
}

export function peakKwFromLoads(loads: LoadItem[]): number {
  if (loads.length === 0) return 0;
  // Assume ~60% coincidence of everything running plus largest motor surge x2
  const totalKw = loads.reduce((s, l) => s + (l.watts * l.quantity) / 1000, 0);
  const largest = Math.max(...loads.map((l) => l.watts / 1000));
  return round(totalKw * 0.6 + largest, 1);
}

const HIGH_LOAD_KEYWORDS: [RegExp, string][] = [
  [/heat pump|electric heat|baseboard|furnace/i, "Electric heating"],
  [/central a\/?c|hvac/i, "Central air conditioning"],
  [/water heater/i, "Electric water heater"],
  [/dryer/i, "Electric dryer"],
  [/stove|range|oven/i, "Electric stove/oven"],
  [/ev |ev charger|electric vehicle/i, "EV charging"],
  [/well pump/i, "Well pump (high surge current)"],
];

export function generatePlan(
  bill: ExtractedBillData,
  inputs: PlanInputs,
  loads: LoadItem[]
): SolarPlan {
  const dailyKwh = round(dailyKwhFromBill(bill), 1);
  const monthlyKwh = round(dailyKwh * AVG_MONTH_DAYS, 0);
  const annualKwh = round(dailyKwh * 365, 0);
  const kwhCost = round(costPerKwh(bill), 3);

  const loadsPeak = peakKwFromLoads(loads);
  const peakKw =
    inputs.knownPeakKw ?? (loadsPeak > 0 ? loadsPeak : estimatePeakKw(dailyKwh));
  const peakIsEstimated = inputs.knownPeakKw === null;

  const loadCritical = criticalKwhFromLoads(loads);
  const criticalDaily =
    loadCritical > 0 ? loadCritical : inputs.criticalDailyKwh;
  const criticalPeak = Math.min(peakKw, Math.max(2, round(criticalDaily / 24 * 6, 1)));

  const wholeHome = sizeSystem(dailyKwh, inputs, peakKw);
  const critical = sizeSystem(criticalDaily, inputs, criticalPeak);
  const starterDaily = Math.min(1.5, dailyKwh);
  const starter = sizeSystem(starterDaily, inputs, 1.5, { fixedArrayKw: 0.4 });

  // Recommended strategy
  let strategy = "Phased DIY Solar Plan";
  let reason =
    "Phasing spreads cost, lets you learn on low-voltage work first, and reserves code-critical steps for a licensed electrician.";
  if (dailyKwh > 60) {
    strategy = "Critical Loads Backup first, then phased expansion";
    reason =
      "Your usage is high — a full offset system would be very large and expensive. Start by protecting essentials, then expand.";
  } else if (dailyKwh > 0 && dailyKwh <= 12) {
    strategy = "Whole-Home Conversion (phased build-out)";
    reason =
      "Your usage is low enough that a whole-home system is realistically sized; building it in phases still reduces risk.";
  }

  const highLoadWarnings: string[] = [];
  for (const l of loads) {
    for (const [re, label] of HIGH_LOAD_KEYWORDS) {
      if (re.test(l.name)) {
        highLoadWarnings.push(
          `${label} ("${l.name}") drastically increases solar and battery requirements. Consider efficiency upgrades or keeping it on the grid initially.`
        );
      }
    }
  }
  if (dailyKwh > 45) {
    highLoadWarnings.push(
      "Usage above ~45 kWh/day usually means electric heat, central AC, an electric water heater, or EV charging. Offsetting these fully with batteries is expensive — plan those loads carefully."
    );
  }

  const phases = buildPhases(wholeHome, critical, starter, inputs);
  const componentList = buildComponentList(wholeHome, inputs);

  return {
    id: `plan_${Date.now().toString(36)}`,
    billId: bill.id,
    createdAt: new Date().toISOString(),
    inputs,
    usageSummary: {
      averageDailyKwh: dailyKwh,
      estimatedMonthlyKwh: monthlyKwh,
      estimatedAnnualKwh: annualKwh,
      estimatedCostPerKwh: kwhCost,
      estimatedPeakLoadKw: peakKw,
      peakLoadIsEstimated: peakIsEstimated,
    },
    recommendedStrategy: strategy,
    recommendedStrategyReason: reason,
    wholeHomePlan: wholeHome,
    criticalLoadsPlan: { ...critical, dailyCriticalKwh: criticalDaily },
    budgetStarterPlan: { ...starter, dailyKwhTarget: round(starterDaily, 1) },
    phases,
    componentList,
    safetyWarnings: SAFETY_WARNINGS,
    electricianRequiredTasks: ELECTRICIAN_TASKS,
    permitChecklist: PERMIT_CHECKLIST,
    maintenanceChecklist: MAINTENANCE_CHECKLIST,
    assumptions: buildAssumptions(inputs, bill, peakIsEstimated),
    highLoadWarnings,
  };
}

function buildPhases(
  whole: SizedSystem,
  critical: SizedSystem,
  starter: SizedSystem,
  inputs: PlanInputs
): PlanPhase[] {
  return [
    {
      phaseNumber: 1,
      name: "Reduce load & map your circuits",
      goal: "Cut waste before buying hardware and identify which circuits are truly critical.",
      components: [
        "Plug-in watt meter (e.g., Kill A Watt style)",
        "LED bulb swap-outs",
        "Smart plugs / power strips for phantom loads",
        "Notebook or spreadsheet load inventory",
      ],
      estimatedCostLow: 50,
      estimatedCostHigh: 300,
      estimatedUsageOffsetPercent: 5,
      difficulty: {
        level: "Beginner",
        reason: "Planning, measuring, and swapping bulbs only — no wiring.",
      },
      notes: [
        "Every $1 spent on efficiency typically saves $3–5 in solar/battery hardware.",
        "Label your breaker panel (with the panel cover ON) so you know what each circuit feeds.",
      ],
    },
    {
      phaseNumber: 2,
      name: "Small solar + battery for essentials",
      goal: "A starter system that keeps phones, internet, lights, and a fridge running.",
      components: [
        `${Math.max(1, Math.round(400 / inputs.panelWattage))}–2 x ${inputs.panelWattage}W panels or a portable panel kit`,
        "MPPT charge controller or small all-in-one power station",
        `~${Math.max(1, Math.round(starter.batteryKwhNominal))}–2 kWh ${CHEMISTRY[inputs.chemistry].label} battery`,
        "1,500–2,000W pure sine inverter",
        "Properly sized fuses, breakers, and battery cables",
      ],
      estimatedCostLow: starter.estimatedBudgetLow,
      estimatedCostHigh: starter.estimatedBudgetHigh,
      estimatedUsageOffsetPercent: 8,
      difficulty: {
        level: "Intermediate",
        reason:
          "Low-voltage DC assembly with proper fusing, following manufacturer instructions. No connection to house wiring.",
      },
      notes: [
        "Run selected loads via extension cords or dedicated outlets — do NOT tie into the service panel at this phase.",
        "This is where you learn safe battery handling, fusing, and wire sizing at low voltage.",
      ],
    },
    {
      phaseNumber: 3,
      name: "Expand the array and battery bank",
      goal: "Grow toward covering your critical daily load with headroom.",
      components: [
        `Add panels toward ${critical.solarArrayKw} kW total (${critical.estimatedPanelCount} x ${inputs.panelWattage}W)`,
        `Expand battery bank toward ${critical.batteryKwhNominal} kWh nominal (same chemistry, same age — never mix)`,
        "Combiner box and PV disconnect",
        "Ground-mount rack or roof racking (structural review for roof)",
        "Surge protection devices (DC and AC sides)",
      ],
      estimatedCostLow: Math.max(0, critical.estimatedBudgetLow - starter.estimatedBudgetLow),
      estimatedCostHigh: Math.max(0, critical.estimatedBudgetHigh - starter.estimatedBudgetHigh),
      estimatedUsageOffsetPercent: 30,
      difficulty: {
        level: "Advanced",
        reason:
          "Larger battery/inverter systems, mounting, and conduit planning. Roof structural questions go to a professional.",
      },
      notes: [
        "Keep strings within the controller/inverter voltage window including cold-weather voltage rise.",
        "Batteries must match in chemistry, capacity, and age within a bank.",
      ],
    },
    {
      phaseNumber: 4,
      name: "Hybrid inverter + critical loads panel",
      goal: "Automatically power selected circuits from solar/battery with grid or generator fallback.",
      components: [
        `${critical.inverterKwRecommended} kW hybrid inverter/charger (UL 1741 listed)`,
        "Critical loads subpanel and properly rated transfer equipment",
        "AC and DC disconnects, grounding/bonding hardware",
        "Monitoring system (shunt or inverter-integrated)",
      ],
      estimatedCostLow: 2000,
      estimatedCostHigh: 8000,
      estimatedUsageOffsetPercent: 60,
      difficulty: {
        level: "Licensed professional",
        reason:
          "Service-panel work, transfer switch installation, grounding/bonding, permits, and inspection require a licensed electrician and AHJ approval.",
      },
      notes: [
        "You can mount equipment, plan conduit runs, and pull permits yourself where allowed — but the panel tie-in and inspection sign-off belong to a pro.",
        "Never backfeed a panel through a dryer outlet or without listed transfer equipment.",
      ],
    },
    {
      phaseNumber: 5,
      name: "Whole-home / hybrid or off-grid transition",
      goal: `Scale to the full ${whole.solarArrayKw} kW array and ${whole.batteryKwhNominal} kWh bank for maximum grid independence.`,
      components: [
        `Full array: ${whole.estimatedPanelCount} x ${inputs.panelWattage}W panels (~${whole.estimatedPanelAreaSqFt} sq ft)`,
        `Battery bank: ~${whole.batteryKwhNominal} kWh nominal`,
        `Inverter capacity: ~${whole.inverterKwRecommended} kW continuous / ${whole.inverterSurgeKw} kW surge`,
        "Optional generator input with listed transfer equipment",
        "Utility interconnection agreement if staying grid-tied",
      ],
      estimatedCostLow: Math.max(0, whole.estimatedBudgetLow - critical.estimatedBudgetLow),
      estimatedCostHigh: Math.max(0, whole.estimatedBudgetHigh - critical.estimatedBudgetHigh),
      estimatedUsageOffsetPercent: 95,
      difficulty: {
        level: "Licensed professional",
        reason:
          "Utility interconnection, net metering agreements, and final inspection require professional involvement.",
      },
      notes: [
        "Full off-grid means you are your own utility: plan for maintenance, winter production, and generator backup.",
        "Grid-tied hybrid keeps the grid as your 'infinite battery' and is usually more cost-effective.",
      ],
    },
  ];
}

function buildComponentList(sys: SizedSystem, inputs: PlanInputs): ComponentLine[] {
  const chem = CHEMISTRY[inputs.chemistry];
  return [
    {
      category: "Solar panels",
      item: `${inputs.panelWattage}W monocrystalline panels (UL 61730 listed)`,
      quantity: `${sys.estimatedPanelCount}`,
      budgetLow: Math.round(sys.solarArrayKw * 1000 * 0.35),
      budgetHigh: Math.round(sys.solarArrayKw * 1000 * 0.65),
      notes: "Buy pallet quantities for best pricing; verify Voc/Vmp against your inverter's input window.",
      sources: ["Signature Solar", "Renogy", "A local solar distributor", "Santan Solar (used/surplus)"],
    },
    {
      category: "Racking",
      item: "Roof mount or ground mount racking + attachments",
      quantity: `for ${sys.estimatedPanelCount} panels (~${sys.estimatedPanelAreaSqFt} sq ft)`,
      budgetLow: Math.round(sys.solarArrayKw * 1000 * 0.1),
      budgetHigh: Math.round(sys.solarArrayKw * 1000 * 0.28),
      notes: "Ground mount is more DIY-friendly; roof mounts need flashing and possibly structural review.",
      sources: ["IronRidge dealers", "Signature Solar", "Home Depot / Lowe's (lumber for ground mount)"],
    },
    {
      category: "Hybrid inverter / charge controller",
      item: `${sys.inverterKwRecommended} kW hybrid inverter-charger (UL 1741) or MPPT controller + inverter`,
      quantity: "1 (or stacked units)",
      budgetLow: Math.round(sys.inverterKwRecommended * 1000 * 0.18),
      budgetHigh: Math.round(sys.inverterKwRecommended * 1000 * 0.45),
      notes: sys.chargeControllerNote,
      sources: ["Signature Solar (EG4)", "Current Connected (Victron, SOK)", "The AltE Store"],
    },
    {
      category: "Battery bank",
      item: `${chem.label} — ~${sys.batteryKwhNominal} kWh nominal (${sys.batteryKwhUsable} kWh usable)`,
      quantity: "server-rack or 12/24/48V blocks",
      budgetLow: Math.round(sys.batteryKwhNominal * chem.costPerKwhLow),
      budgetHigh: Math.round(sys.batteryKwhNominal * chem.costPerKwhHigh),
      notes: `Cycle life ${chem.cycleLife}. Ventilation: ${chem.ventilation}. Never mix chemistries, capacities, or ages in one bank.`,
      sources: ["Signature Solar", "Current Connected", "Local battery suppliers", "Costco/Sam's Club (lead-acid)"],
    },
    {
      category: "Battery enclosure",
      item: "Battery rack or enclosure with restraint, spill/thermal considerations",
      quantity: "1",
      budgetLow: 100,
      budgetHigh: 800,
      notes: "Flooded lead-acid needs a vented enclosure. Keep batteries off concrete floors in cold climates.",
      sources: ["Signature Solar", "Amazon", "DIY lumber (unsealed chemistries need venting)"],
    },
    {
      category: "DC overcurrent protection",
      item: "Class-T or MRBF main battery fuse + DC breakers per circuit",
      quantity: "1 main + 1 per branch",
      budgetLow: 80,
      budgetHigh: 400,
      notes: "Every battery bank needs a properly rated main fuse as close to the positive terminal as practical.",
      sources: ["Current Connected", "Blue Sea dealers", "The AltE Store"],
    },
    {
      category: "Disconnects",
      item: "PV DC disconnect + AC disconnect (lockable, labeled)",
      quantity: "1 each minimum",
      budgetLow: 60,
      budgetHigh: 350,
      notes: "Required for safe servicing and typically required by code/utility.",
      sources: ["Home Depot", "Lowe's", "Electrical supply houses"],
    },
    {
      category: "Transfer equipment",
      item: "Critical loads subpanel or listed transfer switch",
      quantity: "1",
      budgetLow: 150,
      budgetHigh: 1200,
      notes: "INSTALLED BY A LICENSED ELECTRICIAN. Never backfeed without listed transfer equipment.",
      sources: ["Electrical supply houses", "Home Depot", "Licensed electrician supply"],
    },
    {
      category: "Surge protection",
      item: "DC SPD (PV side) + AC SPD (panel side)",
      quantity: "2",
      budgetLow: 80,
      budgetHigh: 300,
      notes: "Cheap insurance for lightning-induced surges.",
      sources: ["Midnite Solar dealers", "The AltE Store", "Amazon"],
    },
    {
      category: "Grounding & bonding",
      item: "Ground rods, lugs, bare copper, equipment grounding conductors",
      quantity: "per layout",
      budgetLow: 50,
      budgetHigh: 300,
      notes: "Grounding/bonding must be code-compliant — verify the design with your electrician/AHJ.",
      sources: ["Home Depot", "Lowe's", "Electrical supply houses"],
    },
    {
      category: "Wire & cable",
      item: "PV wire, THHN/THWN-2 in conduit, battery cables with proper lugs",
      quantity: "per layout",
      budgetLow: 150,
      budgetHigh: 900,
      notes: "Size by ampacity tables and voltage drop for YOUR exact runs — never guess. Use listed lugs, correct crimps.",
      sources: ["Electrical supply houses", "Windy Nation", "Custom battery cable shops"],
    },
    {
      category: "Combiner / junction",
      item: "PV combiner box with touch-safe fuse holders (if 3+ strings)",
      quantity: "0–1",
      budgetLow: 0,
      budgetHigh: 250,
      notes: "Small systems with 1–2 strings often don't need one.",
      sources: ["Midnite Solar dealers", "Signature Solar"],
    },
    {
      category: "Conduit & fittings",
      item: "EMT/PVC conduit, glands, strain reliefs, labels",
      quantity: "per layout",
      budgetLow: 60,
      budgetHigh: 400,
      notes: "Outdoor runs need sunlight-resistant, wet-location rated materials.",
      sources: ["Home Depot", "Lowe's"],
    },
    {
      category: "Monitoring",
      item: "Battery shunt monitor or inverter-integrated monitoring",
      quantity: "1",
      budgetLow: 40,
      budgetHigh: 300,
      notes: "You cannot manage what you don't measure — state-of-charge monitoring prevents dead banks.",
      sources: ["Victron dealers", "Amazon", "Current Connected"],
    },
    {
      category: "Safety gear",
      item: "Class 0 gloves for battery work, safety glasses, ABC + Class D awareness, insulated tools, labels",
      quantity: "1 kit",
      budgetLow: 60,
      budgetHigh: 300,
      notes: "Include NEC-style placards: 'PV SYSTEM DISCONNECT', battery warnings, rapid shutdown labels where applicable.",
      sources: ["Harbor Freight", "Amazon", "Grainger"],
    },
    {
      category: "Optional: generator input",
      item: "Inlet box + interlock or transfer switch for generator backup",
      quantity: "0–1",
      budgetLow: 100,
      budgetHigh: 900,
      notes: "Electrician-installed. Pairs well with hybrid inverters that have generator inputs.",
      sources: ["Home Depot", "Electrical supply houses"],
    },
  ];
}

const SAFETY_WARNINGS = [
  "Never open or work inside an energized service panel. Panel work is for licensed electricians.",
  "Never backfeed your home through an outlet ('suicide cord') or without listed transfer equipment — it can kill utility line workers.",
  "PV strings can exceed 100–600VDC and CANNOT be switched off while the sun is up. Treat all PV conductors as live.",
  "Every battery bank needs a main fuse rated for the bank's fault current, as close to the battery as practical.",
  "Never mix battery chemistries, capacities, or ages in a single bank.",
  "Flooded lead-acid batteries vent explosive hydrogen while charging — ventilated enclosure required, no sparks/flames nearby.",
  "Wire ampacity and overcurrent protection must be calculated for your exact equipment and run lengths — never guess.",
  "Use UL-listed equipment (UL 1741 inverters, UL 9540/9540A energy storage where applicable, UL 61730 panels).",
  "Grounding and bonding must be code-compliant; improper grounding creates shock and fire hazards.",
  "Roof work: fall protection, never work alone, check structural capacity before adding panels.",
  "Follow every manufacturer instruction sheet — it is part of the product's listing and the code requires it.",
  "Utility interconnection requires an application and approval from your utility. Do not connect to the grid without it.",
];

const ELECTRICIAN_TASKS = [
  "Any work inside the main service panel or meter base",
  "Installing a critical loads subpanel or transfer switch",
  "Grid interconnection and net metering hookup",
  "Grounding electrode system verification and bonding",
  "Sizing/verifying service entrance impacts (load calculations per NEC Art. 220)",
  "Final wiring inspection and permit sign-off with the AHJ",
  "Generator inlet and interlock installation",
  "Any 240V circuit work (dryer, range, well pump, EV charger)",
];

const PERMIT_CHECKLIST = [
  "Contact your local building department (the AHJ) BEFORE buying major equipment",
  "Ask whether homeowner DIY electrical permits are allowed in your jurisdiction",
  "Electrical permit for the PV/battery system",
  "Building/structural permit if roof-mounting",
  "Utility interconnection application (grid-tied/hybrid systems)",
  "Net metering or export agreement if applicable",
  "HOA approval where applicable",
  "Rough-in and final inspections scheduled",
  "Rapid shutdown compliance for roof systems (NEC 690.12)",
  "Equipment spec sheets and one-line diagram ready for plan review",
];

const MAINTENANCE_CHECKLIST = [
  "Monthly: check state-of-charge history and inverter error logs",
  "Quarterly: inspect wire terminations for heat discoloration; re-torque per manufacturer spec",
  "Quarterly: clean panels if soiled; clear vegetation/shading",
  "Flooded lead-acid: check electrolyte levels monthly, equalize per manufacturer",
  "Annually: infrared or touch-test connections under load, inspect racking hardware",
  "Annually: test disconnects and verify labels are legible",
  "Keep a log of battery capacity over time to catch degradation early",
];

function buildAssumptions(
  inputs: PlanInputs,
  bill: ExtractedBillData,
  peakEstimated: boolean
): string[] {
  const a = [
    `Effective sun hours assumed: ${inputs.sunHours} h/day (US average range 3.5–6.0; your site varies by ZIP, season, shading, and panel orientation).`,
    `System derating factor: ${inputs.deratingFactor} (accounts for temperature, wiring, inverter, soiling, and angle losses).`,
    `Battery autonomy target: ${inputs.autonomyDays} day(s) of storage.`,
    `Battery chemistry assumed: ${CHEMISTRY[inputs.chemistry].label} at ${Math.round(CHEMISTRY[inputs.chemistry].depthOfDischarge * 100)}% depth of discharge.`,
    "Roof size, orientation, shading, and structural capacity are UNKNOWN — a site assessment is required before final design.",
    "All budget figures are ESTIMATED ranges for DIY equipment pricing; verify current pricing, shipping, warranty, and compatibility before purchasing.",
    "Local code amendments, utility rules, and permit requirements vary — your AHJ and utility have final say.",
    "This plan is educational and conceptual. It is not an engineered design, and it is not a substitute for a licensed electrician or professional solar designer.",
  ];
  if (peakEstimated) {
    a.unshift(
      "Peak household load was ESTIMATED conservatively from average usage (not measured). Enter appliance loads or a measured peak for better inverter sizing."
    );
  }
  if (!bill.billingDays) {
    a.push("Billing days were not confirmed; a 30.44-day average month was assumed.");
  }
  return a;
}
