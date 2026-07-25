export const metadata = { title: "Solar Basics — Bill-to-Solar" };

const CONCEPTS = [
  {
    term: "Watts (W)",
    plain: "How fast electricity is being used or made, right now.",
    example: "A fridge uses ~150W while running. A 400W panel makes up to 400W in full sun.",
  },
  {
    term: "Kilowatts (kW)",
    plain: "1,000 watts. Used for bigger things like solar arrays and inverters.",
    example: "A 5 kW array = about 12–13 panels at 400W each.",
  },
  {
    term: "Kilowatt-hours (kWh)",
    plain: "Energy over time — what your utility actually bills you for. 1 kW running for 1 hour = 1 kWh.",
    example: "A 150W fridge running 8 hours/day uses about 1.2 kWh/day.",
  },
  {
    term: "Voltage (V)",
    plain: "Electrical 'pressure.' Battery banks are 12, 24, or 48V; house outlets are 120/240V; panel strings can be 100–600V DC.",
    example: "48V banks are standard for serious systems — thinner wires, less loss, safer currents.",
  },
  {
    term: "Amperage (A)",
    plain: "Electrical 'flow rate.' Watts = volts × amps. Wire size is chosen by amps.",
    example: "A 2,000W load at 12V pulls a huge 167A; at 48V just 42A. That's why bigger systems use higher voltage.",
  },
  {
    term: "Inverter surge",
    plain: "Motors (fridges, pumps, AC units) briefly draw 2–3× their running watts at startup. Your inverter must handle that spike.",
    example: "A well pump running at 1,000W may surge to 3,000W for a second. A 1,200W inverter will trip; a 2,400W surge-rated one won't.",
  },
  {
    term: "Depth of discharge (DoD)",
    plain: "How much of the battery you actually use. Lead-acid dies young below 50%; LiFePO4 handles 80–100%.",
    example: "A '10 kWh' lead-acid bank gives you ~5 kWh usable. A 10 kWh LiFePO4 gives ~8–9 kWh.",
  },
  {
    term: "Sun hours",
    plain: "Not daylight hours — the equivalent hours of full-strength sun your location gets per day, averaged over the year.",
    example: "Phoenix ~6, Atlanta ~4.7, Seattle ~3.7. A 5 kW array in a 4.5-sun-hour area makes roughly 5 × 4.5 × 0.75 ≈ 17 kWh/day after losses.",
  },
  {
    term: "Derating factor",
    plain: "Real systems lose 20–30% to heat, wire resistance, inverter conversion, dust, angle, and shade. We assume 0.75 unless you change it.",
    example: "A 'perfect' 20 kWh/day array realistically delivers ~15 kWh/day.",
  },
];

export default function BasicsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="section-title">Solar basics, in plain English</h1>
      <p className="mt-2 text-slate-600 max-w-2xl">
        Nine concepts explain 95% of solar planning. Master these and every
        spec sheet starts making sense.
      </p>

      <div className="mt-8 space-y-4">
        {CONCEPTS.map((c) => (
          <div key={c.term} className="card">
            <h2 className="font-bold text-lg text-brand-navy">{c.term}</h2>
            <p className="mt-1 text-slate-700">{c.plain}</p>
            <p className="mt-2 text-sm text-slate-500 bg-brand-cream rounded-lg p-3">
              <strong>Example:</strong> {c.example}
            </p>
          </div>
        ))}
      </div>

      <div className="card mt-8 border-l-4 !border-l-brand-sun">
        <h2 className="font-bold text-lg text-brand-navy">The one formula to remember</h2>
        <p className="mt-2 text-slate-700 font-mono text-sm bg-slate-50 rounded-lg p-4">
          Solar array size (kW) = daily kWh ÷ (sun hours × derating factor)
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Example: 30 kWh/day ÷ (4.5 × 0.75) ≈ 8.9 kW of panels. Battery
          sizing works the same way: daily kWh × backup days ÷ (depth of
          discharge × efficiency). Your plan page does all of this
          automatically from your bill — these formulas are just so you can
          check our math.
        </p>
      </div>
    </div>
  );
}
