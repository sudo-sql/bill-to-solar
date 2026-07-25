export interface ComponentDoc {
  name: string;
  what: string;
  why: string;
  mistakes: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Licensed professional";
  callElectrician: string;
}

export const COMPONENT_DOCS: ComponentDoc[] = [
  {
    name: "Solar panels",
    what: "Convert sunlight to DC electricity. Residential panels are typically 350–550W each, about 3.5' x 6'.",
    why: "They're your power plant — everything else exists to move, store, and convert what panels produce.",
    mistakes: [
      "Ignoring shading — even one shaded panel can drag down a whole series string",
      "Exceeding the inverter/controller's max input voltage (panel voltage RISES in cold weather)",
      "Mixing very different panels in one string",
    ],
    difficulty: "Intermediate",
    callElectrician: "Roof structural questions, or any wiring entering the house.",
  },
  {
    name: "Racking (roof or ground mount)",
    what: "The structure that holds panels at the right angle and survives wind/snow loads.",
    why: "Panels last 25+ years only if the mounting does too. Wind uplift forces are enormous.",
    mistakes: [
      "Lag bolts missing rafters on roof mounts",
      "No flashing → roof leaks",
      "Undersized ground-mount footings",
    ],
    difficulty: "Advanced",
    callElectrician: "A roofer/structural pro for roof capacity; engineer-stamped plans if your AHJ requires them.",
  },
  {
    name: "Combiner box",
    what: "Joins multiple panel strings into one circuit, with a fuse per string.",
    why: "With 3+ parallel strings, a fault in one string can draw current from the others — string fuses prevent that.",
    mistakes: [
      "Skipping string fuses with 3+ parallel strings",
      "Using an indoor box outdoors",
    ],
    difficulty: "Intermediate",
    callElectrician: "If it's roof-mounted or feeds through the structure.",
  },
  {
    name: "MPPT charge controller",
    what: "Takes high-voltage panel power and charges the battery at the correct voltage/current. MPPT types harvest 20–30% more than cheap PWM units.",
    why: "Batteries are destroyed by wrong charge voltages. This is the brain between panels and battery.",
    mistakes: [
      "Sizing by watts only and ignoring max input VOLTAGE (cold-corrected Voc)",
      "Buying PWM thinking it's MPPT",
      "Wrong chemistry profile selected",
    ],
    difficulty: "Intermediate",
    callElectrician: "Not usually needed for low-voltage DC-only installs — follow the manual exactly.",
  },
  {
    name: "Inverter / inverter-charger",
    what: "Converts battery DC into 120/240V AC for normal appliances. Inverter-chargers also charge the battery from grid/generator.",
    why: "Almost everything in your house runs on AC. Pure sine wave models run motors and electronics safely.",
    mistakes: [
      "Buying modified sine wave for motors/electronics",
      "Ignoring surge rating — fridges and pumps need 2–3x running watts to start",
      "Undersized battery cables (the #1 DIY fire risk)",
    ],
    difficulty: "Advanced",
    callElectrician: "The moment its output connects to household wiring rather than plug-in loads.",
  },
  {
    name: "Hybrid inverter",
    what: "All-in-one: MPPT solar input + battery charging + AC output + grid/generator input with automatic switching.",
    why: "Simplifies mid/large systems dramatically — one listed box instead of four components.",
    mistakes: [
      "Not checking UL 1741 listing (utilities require it for interconnection)",
      "Ignoring idle power draw in small systems",
    ],
    difficulty: "Advanced",
    callElectrician: "Always, for the AC-side connections, grounding, and interconnection.",
  },
  {
    name: "Battery bank",
    what: "Stores energy for nights and cloudy days. Sized in kWh; wired at 12, 24, or 48V (48V for anything serious).",
    why: "Solar without storage only works when the sun shines.",
    mistakes: [
      "Mixing chemistries, ages, or capacities in one bank",
      "No main fuse on the bank",
      "Charging lithium below freezing; leaving lead-acid partially charged",
    ],
    difficulty: "Advanced",
    callElectrician: "Large banks, or anything your AHJ classifies under energy-storage rules (UL 9540).",
  },
  {
    name: "Transfer switch / critical loads panel",
    what: "Safely switches selected circuits between grid and inverter power so the two can never connect at once.",
    why: "Prevents backfeeding the grid, which can electrocute utility line workers and destroy equipment.",
    mistakes: [
      "'Suicide cords' or breaker backfeeding without an interlock — never do this",
      "Unrated DIY interlocks",
    ],
    difficulty: "Licensed professional",
    callElectrician: "Always. This is service-panel work with permits and inspection.",
  },
  {
    name: "Disconnects",
    what: "Lockable switches that isolate the PV array, battery, or inverter for service.",
    why: "You (and firefighters) need a way to de-energize sections of the system. Code requires them.",
    mistakes: [
      "Using an AC-rated switch on DC (DC arcs don't self-extinguish)",
      "No labels",
    ],
    difficulty: "Intermediate",
    callElectrician: "AC-side disconnects near the service equipment.",
  },
  {
    name: "Breakers & fuses (overcurrent protection)",
    what: "Devices that open the circuit when current exceeds the wire's safe rating.",
    why: "They protect the WIRE, not the device. Every conductor needs protection sized to its ampacity.",
    mistakes: [
      "Fuse sized to the load instead of the wire",
      "Cheap unbranded 'ANL' fuses on big banks (use Class-T/MRBF for high fault current)",
      "AC breakers used on DC circuits",
    ],
    difficulty: "Intermediate",
    callElectrician: "Anything in or feeding the service panel.",
  },
  {
    name: "Wire & cable",
    what: "Sized by ampacity (how much current it can carry safely) and voltage drop (how much you lose over distance).",
    why: "Undersized wire overheats — this is how DIY systems burn down.",
    mistakes: [
      "Guessing sizes instead of using ampacity tables",
      "Automotive wire outdoors (use PV wire/THWN-2)",
      "Loose or un-crimped lugs",
    ],
    difficulty: "Intermediate",
    callElectrician: "Sizing verification for large systems; anything in walls.",
  },
  {
    name: "Grounding & bonding",
    what: "Connecting equipment frames and one system conductor to earth so faults trip breakers instead of energizing metal parts.",
    why: "The difference between a tripped breaker and an electrified panel frame or house fire.",
    mistakes: [
      "Multiple neutral-ground bonds creating current on ground wires",
      "Skipping equipment grounding on panel frames/racking",
      "No lightning consideration on ground mounts",
    ],
    difficulty: "Licensed professional",
    callElectrician: "Always have the grounding design reviewed — it's subtle and code-critical.",
  },
  {
    name: "Monitoring (shunt / BMS / inverter apps)",
    what: "Measures real power flow and battery state of charge.",
    why: "Voltage alone lies about lithium state of charge. Monitoring prevents dead banks and finds problems early.",
    mistakes: [
      "Relying on the battery's voltage readout",
      "Not setting the shunt's charged-voltage parameters",
    ],
    difficulty: "Beginner",
    callElectrician: "Not needed for typical shunt installs on low-voltage DC.",
  },
  {
    name: "Surge protection (SPD)",
    what: "Diverts lightning-induced voltage spikes to ground before they reach electronics.",
    why: "A nearby strike can total an inverter. SPDs are cheap; inverters are not.",
    mistakes: ["Skipping the DC side", "Long, coiled SPD ground leads"],
    difficulty: "Intermediate",
    callElectrician: "AC-panel SPDs.",
  },
];
