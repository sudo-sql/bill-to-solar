"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/upload", label: "Upload Bill" },
  { href: "/plan", label: "My Plan" },
  { href: "/library", label: "Components" },
  { href: "/batteries", label: "Batteries" },
  { href: "/basics", label: "Solar Basics" },
  { href: "/safety", label: "Safety & Code" },
  { href: "/dashboard", label: "Saved Plans" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="no-print sticky top-0 z-40 bg-brand-navy text-white shadow-md">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <SunIcon />
          <span>{BRAND.shortName}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-brand-navylight hover:text-white transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          className="md:hidden p-2 rounded-lg hover:bg-brand-navylight"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {open && (
        <nav className="md:hidden border-t border-brand-navylight px-4 pb-3">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-brand-navylight"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

function SunIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="#f6b40e" />
      <g stroke="#f6b40e" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
      </g>
    </svg>
  );
}
