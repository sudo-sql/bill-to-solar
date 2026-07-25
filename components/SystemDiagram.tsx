/**
 * Conceptual system layout — educational only, not a wiring schematic.
 * Panels → combiner/disconnect → charge controller or hybrid inverter →
 * battery bank → inverter → critical loads panel / selected loads.
 */
export default function SystemDiagram() {
  const box = "fill-white stroke-[#16233d]";
  const label = "fill-[#16233d] font-semibold";
  const small = "fill-[#64748b]";
  return (
    <div className="overflow-x-auto">
      <svg
        viewBox="0 0 760 360"
        className="min-w-[640px] w-full"
        role="img"
        aria-label="Conceptual solar system layout diagram"
      >
        {/* Sun */}
        <circle cx="60" cy="48" r="18" fill="#f6b40e" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1={60 + 24 * Math.cos((a * Math.PI) / 180)}
            y1={48 + 24 * Math.sin((a * Math.PI) / 180)}
            x2={60 + 32 * Math.cos((a * Math.PI) / 180)}
            y2={48 + 32 * Math.sin((a * Math.PI) / 180)}
            stroke="#f6b40e"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}

        {/* Panels */}
        <g>
          <rect x="20" y="100" width="120" height="70" rx="6" className={box} strokeWidth="2" fill="#233752" />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`${r}${c}`} x={28 + c * 27} y={108 + r * 19} width="23" height="15" rx="2" fill="#3b5a8f" stroke="#16233d" />
            ))
          )}
          <text x="80" y="192" textAnchor="middle" fontSize="13" className={label}>Solar panels</text>
          <text x="80" y="207" textAnchor="middle" fontSize="10" className={small}>DC — live whenever sun is up</text>
        </g>

        {/* Combiner + PV disconnect */}
        <g>
          <rect x="190" y="112" width="110" height="48" rx="8" className={box} strokeWidth="2" />
          <text x="245" y="132" textAnchor="middle" fontSize="12" className={label}>Combiner box</text>
          <text x="245" y="147" textAnchor="middle" fontSize="10" className={small}>+ PV disconnect</text>
        </g>

        {/* Charge controller / hybrid inverter */}
        <g>
          <rect x="350" y="96" width="150" height="80" rx="8" className={box} strokeWidth="2" />
          <text x="425" y="122" textAnchor="middle" fontSize="12" className={label}>MPPT controller</text>
          <text x="425" y="138" textAnchor="middle" fontSize="11" className={small}>or hybrid inverter</text>
          <text x="425" y="158" textAnchor="middle" fontSize="10" className={small}>(UL 1741 listed)</text>
        </g>

        {/* Battery bank */}
        <g>
          <rect x="360" y="240" width="130" height="70" rx="8" className={box} strokeWidth="2" />
          <rect x="372" y="252" width="30" height="46" rx="3" fill="#e8f3ec" stroke="#3e8e5a" />
          <rect x="410" y="252" width="30" height="46" rx="3" fill="#e8f3ec" stroke="#3e8e5a" />
          <rect x="448" y="252" width="30" height="46" rx="3" fill="#e8f3ec" stroke="#3e8e5a" />
          <text x="425" y="330" textAnchor="middle" fontSize="13" className={label}>Battery bank</text>
          <text x="425" y="345" textAnchor="middle" fontSize="10" className={small}>main fuse + disconnect, one chemistry only</text>
        </g>

        {/* Inverter */}
        <g>
          <rect x="550" y="112" width="90" height="48" rx="8" className={box} strokeWidth="2" />
          <text x="595" y="132" textAnchor="middle" fontSize="12" className={label}>Inverter</text>
          <text x="595" y="147" textAnchor="middle" fontSize="10" className={small}>DC → 120/240V AC</text>
        </g>

        {/* Loads panel */}
        <g>
          <rect x="550" y="230" width="180" height="80" rx="8" className={box} strokeWidth="2" fill="#fbf9f4" />
          <text x="640" y="255" textAnchor="middle" fontSize="12" className={label}>Critical loads panel</text>
          <text x="640" y="271" textAnchor="middle" fontSize="10" className={small}>or selected plug-in loads</text>
          <text x="640" y="290" textAnchor="middle" fontSize="10" fill="#b45309" fontWeight="bold">⚠ Panel work: licensed electrician</text>
        </g>

        {/* Arrows */}
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#f6b40e" />
          </marker>
        </defs>
        <g stroke="#f6b40e" strokeWidth="3" fill="none" markerEnd="url(#arr)">
          <line x1="142" y1="136" x2="186" y2="136" />
          <line x1="302" y1="136" x2="346" y2="136" />
          <line x1="425" y1="180" x2="425" y2="236" />
          <line x1="502" y1="136" x2="546" y2="136" />
          <line x1="595" y1="162" x2="595" y2="226" />
        </g>

        {/* Grid note */}
        <text x="20" y="270" fontSize="11" className={small}>
          <tspan x="20" dy="0">Grid-tied/hybrid systems also need utility</tspan>
          <tspan x="20" dy="14">approval + listed transfer equipment.</tspan>
          <tspan x="20" dy="14">Never backfeed without it.</tspan>
        </text>
      </svg>
    </div>
  );
}
