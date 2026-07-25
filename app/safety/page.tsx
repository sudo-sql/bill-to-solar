export const metadata = { title: "Safety & Code — Bill-to-Solar" };

const SECTIONS: { title: string; intro?: string; items: string[] }[] = [
  {
    title: "The non-negotiables",
    items: [
      "Never open or work inside an energized service panel. That is licensed-electrician territory, full stop.",
      "Never backfeed your house through a dryer outlet or any 'suicide cord.' It can kill utility line workers restoring power and it's illegal. Use listed transfer equipment only.",
      "Never bypass the utility meter or connect to the grid without an approved interconnection agreement.",
      "PV wiring is energized whenever light hits the panels — you cannot 'switch off' the sun. Cover panels or work at night per manufacturer guidance, and treat all PV conductors as live.",
      "If you are not certain a circuit is dead — tested with a meter you've verified on a known-live source — it's live.",
    ],
  },
  {
    title: "NEC & local code reminders",
    intro:
      "The National Electrical Code (NEC) — especially Articles 690 (solar), 705 (interconnection), 706 (energy storage), and 250 (grounding) — governs these systems. Your local jurisdiction may amend it.",
    items: [
      "Your local building department (the AHJ — authority having jurisdiction) has final say. Call them BEFORE buying major equipment.",
      "Use listed equipment: UL 1741 inverters, UL 9540/9540A energy storage systems, UL 61730 panels, listed disconnects and OCPD.",
      "Rapid shutdown (NEC 690.12) applies to most roof-mounted systems — plan for it.",
      "Manufacturer installation instructions are legally part of the listing. Follow them exactly.",
      "Some jurisdictions allow homeowner electrical permits for owner-occupied homes; many don't. Ask.",
    ],
  },
  {
    title: "Permitting checklist",
    items: [
      "Electrical permit for PV/battery work",
      "Building/structural permit for roof mounts",
      "One-line diagram and equipment spec sheets for plan review",
      "Rough-in inspection before covering wiring",
      "Final inspection before energizing",
      "HOA approval where applicable",
    ],
  },
  {
    title: "Utility interconnection checklist",
    items: [
      "Interconnection application filed and APPROVED before connecting",
      "Net metering / export rate agreement understood and signed",
      "Required external AC disconnect installed where the utility can access it",
      "UL 1741 (and possibly UL 1741-SA/SB) certified inverter documentation submitted",
      "Permission to operate (PTO) received before energizing grid-tied output",
    ],
  },
  {
    title: "Tasks that require a licensed electrician",
    items: [
      "Anything inside the main service panel or meter base",
      "Critical loads subpanel or transfer switch installation",
      "Grounding electrode system design and bonding verification",
      "Grid interconnection wiring",
      "240V circuits (well pump, dryer, range, EV charger)",
      "Final inspection sign-off work in most jurisdictions",
    ],
  },
  {
    title: "Battery safety",
    items: [
      "One chemistry, one capacity, one age per bank — never mix.",
      "Main fuse (Class-T or MRBF for lithium's high fault current) as close to the battery positive as practical.",
      "Flooded lead-acid vents explosive hydrogen — ventilated enclosure, no sparks, acid PPE for service.",
      "LiFePO4 must not be charged below freezing without heating or low-temp cutoff.",
      "Use insulated tools around battery terminals; remove rings and metal jewelry.",
      "Correct charge profile for the exact chemistry — a wrong profile ruins banks and can be dangerous.",
    ],
  },
  {
    title: "Fire safety",
    items: [
      "Loose connections cause most system fires — torque terminals to spec and re-check under load.",
      "Wire ampacity must match or exceed its overcurrent protection. Protect every conductor.",
      "Keep batteries and inverters away from living/sleeping areas where practical; check UL 9540 siting rules for large banks.",
      "Mount equipment on non-combustible surfaces per manufacturer instructions.",
      "Keep an ABC extinguisher near the equipment area; know that lithium fires need special handling — evacuate and call 911.",
      "Label everything: disconnects, conductors, voltage warnings. Firefighters need to understand your system fast.",
    ],
  },
  {
    title: "Roof safety",
    items: [
      "Fall protection (harness + anchor) any time you're on the roof — falls hurt more DIYers than electricity.",
      "Never work on a roof alone, wet, icy, or in high wind.",
      "Verify structural capacity before adding ~3 lb/sq ft of panels and racking — especially older roofs.",
      "If the roof needs replacement within ~10 years, do it BEFORE panels go up.",
    ],
  },
  {
    title: "Working near the service panel (as a DIYer)",
    intro:
      "There are legitimate DIY tasks near — not in — the panel: photographing it for your electrician, mapping circuits with a plug-in tester, and labeling breakers with the cover on.",
    items: [
      "Keep the dead-front cover ON. Everything you legitimately need is visible with it on.",
      "Map circuits by plugging a tester/lamp into outlets and flipping breakers — not by probing anything.",
      "Photograph the panel label and main breaker rating for your electrician discussion.",
      "If the panel is Federal Pacific, Zinsco, or visibly damaged/rusted, tell your electrician — it likely needs replacement before any solar work.",
    ],
  },
];

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="section-title">Safety &amp; code</h1>
      <p className="mt-2 text-slate-600 max-w-2xl">
        DIY solar is genuinely achievable — thousands of homeowners do it
        safely every year. The ones who get hurt skip the same few rules.
        Don't be them.
      </p>

      <div className="mt-6 rounded-xl bg-red-50 border-2 border-red-300 p-5 text-red-900">
        <h2 className="font-bold text-lg">⚠ Read this first</h2>
        <p className="mt-2 text-sm leading-relaxed">
          This site provides educational planning only. Final installation,
          utility interconnection, service-panel work, transfer switches,
          grounding/bonding, code compliance, permits, and inspections may
          require a licensed electrician and approval from your local
          authority having jurisdiction (AHJ). When any instruction here
          conflicts with your local code, your AHJ, or a manufacturer's
          manual — they win, not us.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {SECTIONS.map((s) => (
          <div key={s.title} className="card">
            <h2 className="font-bold text-lg text-brand-navy">{s.title}</h2>
            {s.intro && <p className="mt-2 text-sm text-slate-600">{s.intro}</p>}
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {s.items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-brand-sun shrink-0">▸</span>
                  {it}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
