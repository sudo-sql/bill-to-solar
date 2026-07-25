export interface BatteryProfile {
  chemistry: string;
  key: "lifepo4" | "flooded" | "agm" | "gel" | "marine";
  usableDoD: string;
  cycleLife: string;
  costPerUsableKwh: string;
  maintenance: string;
  ventilation: string;
  temperature: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  safety: string[];
}

export const BATTERY_PROFILES: BatteryProfile[] = [
  {
    chemistry: "LiFePO4 (lithium iron phosphate)",
    key: "lifepo4",
    usableDoD: "80–100%",
    cycleLife: "3,000–6,000+ cycles",
    costPerUsableKwh: "$$ (highest upfront, lowest lifetime)",
    maintenance: "None (BMS-managed)",
    ventilation: "None required (no off-gassing)",
    temperature: "Do NOT charge below 32°F unless heated/managed",
    pros: [
      "Longest cycle life by far",
      "Deep usable capacity (80%+)",
      "No maintenance, no fumes, indoor-friendly",
      "Holds voltage under load",
      "Built-in BMS protection on most units",
    ],
    cons: [
      "Highest upfront cost",
      "Charging below freezing damages cells (needs heater or low-temp cutoff)",
      "Quality varies — buy from reputable suppliers",
    ],
    bestFor: "Serious daily-cycled systems: whole-home, critical loads, cabins.",
    safety: [
      "Use a BMS-equipped battery (UL 1973/UL 9540 listings where possible)",
      "Main Class-T or MRBF fuse on the bank",
      "Follow manufacturer torque specs on terminals",
    ],
  },
  {
    chemistry: "Flooded lead-acid (FLA)",
    key: "flooded",
    usableDoD: "50% (for reasonable life)",
    cycleLife: "500–1,200 cycles (well maintained)",
    costPerUsableKwh: "$ (cheap upfront, high lifetime)",
    maintenance: "Monthly water top-off, equalization charges, terminal cleaning",
    ventilation: "REQUIRED — vents explosive hydrogen while charging",
    temperature: "Capacity drops hard in cold; keep warm-ish",
    pros: [
      "Cheapest upfront $/kWh",
      "Proven technology, widely available (golf cart GC2s)",
      "Tolerant of some abuse if maintained",
    ],
    cons: [
      "Only ~50% usable",
      "Hydrogen off-gassing — vented enclosure mandatory",
      "Monthly maintenance or they die early",
      "Heavy; acid spill risk",
    ],
    bestFor: "Budget off-grid where maintenance is acceptable (classic golf-cart-battery banks).",
    safety: [
      "Vented, spark-free enclosure; no flames or relays nearby",
      "Acid-rated gloves and eye protection when servicing",
      "Baking soda on hand for spills",
    ],
  },
  {
    chemistry: "AGM (sealed lead-acid)",
    key: "agm",
    usableDoD: "50%",
    cycleLife: "400–800 cycles",
    costPerUsableKwh: "$$",
    maintenance: "None (sealed)",
    ventilation: "Minimal — sealed, but avoid hot unventilated boxes",
    temperature: "Better cold performance than flooded",
    pros: [
      "No maintenance, no spills, mount in any orientation",
      "Handles high surge currents well",
      "Safer indoors than flooded",
    ],
    cons: [
      "Still only ~50% usable",
      "Shorter cycle life than LiFePO4 per dollar",
      "Sensitive to chronic undercharging",
    ],
    bestFor: "Backup systems that sit mostly full and cycle rarely.",
    safety: ["Correct AGM charge profile (no equalization)", "Main fuse on bank"],
  },
  {
    chemistry: "Gel (sealed lead-acid)",
    key: "gel",
    usableDoD: "50%",
    cycleLife: "500–1,000 cycles",
    costPerUsableKwh: "$$",
    maintenance: "None (sealed)",
    ventilation: "Minimal",
    temperature: "Good heat tolerance",
    pros: ["Deep-cycle tolerant for lead-acid", "No maintenance", "Good in hot climates"],
    cons: [
      "Must charge SLOWLY at correct gel voltage — easy to ruin with wrong charger",
      "Pricier than AGM for similar capacity",
      "Less common; fewer size options",
    ],
    bestFor: "Slow-cycled systems in hot climates with a gel-specific charge profile.",
    safety: ["Charger MUST have a gel setting", "Main fuse on bank"],
  },
  {
    chemistry: "Marine / deep-cycle hybrid",
    key: "marine",
    usableDoD: "30–40% realistically",
    cycleLife: "200–400 cycles",
    costPerUsableKwh: "$ upfront, $$$ per lifetime kWh",
    maintenance: "Depends (most are flooded — see FLA)",
    ventilation: "Same as flooded lead-acid",
    temperature: "Same as flooded",
    pros: [
      "Cheap and available everywhere (Walmart, auto stores)",
      "Fine for a first learning setup or emergencies",
      "Dual-purpose starting/cycling design",
    ],
    cons: [
      "NOT a true deep-cycle battery — plates are a compromise",
      "Short life if cycled daily",
      "Low usable capacity makes 'cheap' expensive per kWh delivered",
    ],
    bestFor:
      "Budget/emergency starter systems and learning — NOT serious whole-home solar. Upgrade the bank later; never mix old marine batteries into a new bank.",
    safety: ["Treat as flooded lead-acid: ventilation, fusing, acid PPE"],
  },
];
