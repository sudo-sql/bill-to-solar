"use client";

import { useState } from "react";
import { COMMON_LOADS } from "@/lib/data/demo";
import { LoadItem } from "@/lib/types";

export default function LoadInventory({
  loads,
  onChange,
}: {
  loads: LoadItem[];
  onChange: (loads: LoadItem[]) => void;
}) {
  const [custom, setCustom] = useState({ name: "", watts: "", hours: "" });

  const add = (base: Omit<LoadItem, "id">) => {
    onChange([...loads, { ...base, id: `load_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}` }]);
  };

  const update = (id: string, patch: Partial<LoadItem>) => {
    onChange(loads.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const remove = (id: string) => onChange(loads.filter((l) => l.id !== id));

  const notAdded = COMMON_LOADS.filter(
    (c) => !loads.some((l) => l.name === c.name)
  );

  const criticalKwh =
    loads.filter((l) => l.critical).reduce((s, l) => s + l.watts * l.hoursPerDay * l.quantity, 0) / 1000;

  return (
    <div>
      <p className="text-sm text-slate-600">
        Optional but recommended: list your appliances to refine the critical
        loads plan and inverter sizing. Mark the ones you'd want running
        during an outage as <strong>critical</strong>.
      </p>

      {/* quick add chips */}
      {notAdded.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {notAdded.map((c) => (
            <button
              key={c.name}
              onClick={() => add(c)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-brand-navy hover:border-brand-sun hover:bg-amber-50"
            >
              + {c.name}
            </button>
          ))}
        </div>
      )}

      {loads.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b">
                <th className="py-2 pr-2">Load</th>
                <th className="py-2 pr-2 w-24">Watts</th>
                <th className="py-2 pr-2 w-24">Hrs/day</th>
                <th className="py-2 pr-2 w-16">Qty</th>
                <th className="py-2 pr-2 w-20">Critical?</th>
                <th className="py-2 pr-2 w-24">kWh/day</th>
                <th className="py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loads.map((l) => (
                <tr key={l.id} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2 font-medium text-brand-navy">{l.name}</td>
                  <td className="py-1.5 pr-2">
                    <input className="field-input !py-1 !px-2" inputMode="numeric" value={l.watts}
                      onChange={(e) => update(l.id, { watts: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input className="field-input !py-1 !px-2" inputMode="decimal" value={l.hoursPerDay}
                      onChange={(e) => update(l.id, { hoursPerDay: parseFloat(e.target.value) || 0 })} />
                  </td>
                  <td className="py-1.5 pr-2">
                    <input className="field-input !py-1 !px-2" inputMode="numeric" value={l.quantity}
                      onChange={(e) => update(l.id, { quantity: parseInt(e.target.value) || 1 })} />
                  </td>
                  <td className="py-1.5 pr-2 text-center">
                    <input type="checkbox" className="h-4 w-4 accent-[#3e8e5a]" checked={l.critical}
                      onChange={(e) => update(l.id, { critical: e.target.checked })} />
                  </td>
                  <td className="py-1.5 pr-2 text-slate-600">
                    {((l.watts * l.hoursPerDay * l.quantity) / 1000).toFixed(2)}
                  </td>
                  <td className="py-1.5">
                    <button onClick={() => remove(l.id)} className="text-slate-400 hover:text-red-600" aria-label={`Remove ${l.name}`}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* custom load */}
      <div className="mt-4 flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="field-label">Custom load</label>
          <input className="field-input" placeholder="e.g. Aquarium pump" value={custom.name}
            onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
        </div>
        <div className="w-24">
          <label className="field-label">Watts</label>
          <input className="field-input" inputMode="numeric" value={custom.watts}
            onChange={(e) => setCustom({ ...custom, watts: e.target.value })} />
        </div>
        <div className="w-24">
          <label className="field-label">Hrs/day</label>
          <input className="field-input" inputMode="decimal" value={custom.hours}
            onChange={(e) => setCustom({ ...custom, hours: e.target.value })} />
        </div>
        <button
          className="btn-secondary !py-2"
          onClick={() => {
            if (!custom.name || !parseFloat(custom.watts)) return;
            add({ name: custom.name, watts: parseFloat(custom.watts), hoursPerDay: parseFloat(custom.hours) || 1, quantity: 1, critical: false });
            setCustom({ name: "", watts: "", hours: "" });
          }}
        >
          Add
        </button>
      </div>

      {criticalKwh > 0 && (
        <p className="mt-3 text-sm font-medium text-brand-green">
          Critical loads total: {criticalKwh.toFixed(1)} kWh/day — this now drives your critical loads plan.
        </p>
      )}
    </div>
  );
}
