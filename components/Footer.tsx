import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function Footer() {
  return (
    <footer className="no-print bg-brand-navy text-slate-300 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <div className="font-bold text-white mb-2">{BRAND.shortName}</div>
          <p className="text-sm leading-relaxed">
            Educational DIY solar planning from your real electric bill. Your
            data stays on your device in guest mode.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-white mb-2">Learn</div>
          <ul className="space-y-1.5">
            <li><Link className="hover:text-white" href="/basics">Solar Basics</Link></li>
            <li><Link className="hover:text-white" href="/library">Component Library</Link></li>
            <li><Link className="hover:text-white" href="/batteries">Battery Comparison</Link></li>
            <li><Link className="hover:text-white" href="/safety">Safety &amp; Code</Link></li>
          </ul>
        </div>
        <div className="text-xs leading-relaxed bg-brand-navylight rounded-xl p-4">
          <strong className="text-white block mb-1">Safety disclaimer</strong>
          This site provides educational planning only — not engineering,
          electrical, or legal advice. Final installation, utility
          interconnection, service-panel work, transfer switches,
          grounding/bonding, permits, and inspections may require a licensed
          electrician and approval from your local authority having
          jurisdiction (AHJ). Always follow the NEC, local code, and
          manufacturer instructions, and use UL-listed equipment.
        </div>
      </div>
      <div className="border-t border-brand-navylight py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {BRAND.name}. Estimates only — verify everything locally.
      </div>
    </footer>
  );
}
