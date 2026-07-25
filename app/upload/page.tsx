"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { extractText, validateFile } from "@/lib/extract";
import { emptyBill, parseBillText } from "@/lib/parse";
import { demoBill } from "@/lib/data/demo";
import { store } from "@/lib/storage";
import { ExtractedBillData } from "@/lib/types";

type Status =
  | { s: "idle" }
  | { s: "working"; msg: string }
  | { s: "error"; msg: string };

export default function UploadPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ s: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Demo mode via ?demo=1 (read client-side to avoid Suspense requirements)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("demo=1")) {
      store.setCurrentBill(demoBill());
      router.push("/review");
    }
  }, [router]);

  const handleFile = useCallback(
    async (file: File) => {
      const err = validateFile(file);
      if (err) {
        setStatus({ s: "error", msg: err });
        return;
      }
      try {
        setStatus({ s: "working", msg: "Preparing…" });
        const { text, source } = await extractText(file, (msg) =>
          setStatus({ s: "working", msg })
        );
        if (text.replace(/\s/g, "").length < 40) {
          setStatus({
            s: "error",
            msg: "We couldn't read enough text from this file. Try a clearer photo (good lighting, flat page) — or use manual entry below.",
          });
          return;
        }
        const bill = parseBillText(text, source, file.name);
        store.setCurrentBill(bill);
        router.push("/review");
      } catch (e: any) {
        setStatus({
          s: "error",
          msg:
            e?.message ||
            "Upload failed. Please try again, or use manual entry below.",
        });
      }
    },
    [router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="section-title">Upload your electric bill</h1>
      <p className="mt-2 text-slate-600">
        PDF, photo, or screenshot. Everything is processed{" "}
        <strong>in your browser</strong> — in guest mode your bill never
        leaves your device.
      </p>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mt-6 rounded-2xl border-2 border-dashed p-10 text-center transition ${
          dragOver
            ? "border-brand-sun bg-amber-50"
            : "border-slate-300 bg-white"
        }`}
      >
        {status.s === "working" ? (
          <div>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-sun border-t-transparent" />
            <p className="font-medium text-brand-navy">{status.msg}</p>
            <p className="text-xs text-slate-500 mt-2">
              Reading happens locally in your browser.
            </p>
          </div>
        ) : (
          <>
            <UploadIcon />
            <p className="mt-3 font-semibold text-brand-navy">
              Drag &amp; drop your bill here
            </p>
            <p className="text-sm text-slate-500 mt-1">
              PDF, JPEG, PNG, WEBP, or HEIC — up to 15 MB
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <button className="btn-primary" onClick={() => fileRef.current?.click()}>
                Choose a file
              </button>
              <button className="btn-secondary" onClick={() => cameraRef.current?.click()}>
                📷 Take a photo
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,application/pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.currentTarget.value = "";
              }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.currentTarget.value = "";
              }}
            />
          </>
        )}
      </div>

      {status.s === "error" && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          <strong>Couldn't process that file.</strong> {status.msg}
        </div>
      )}

      {/* Alternatives */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => setShowManual(!showManual)}
          className="card text-left hover:border-brand-sun transition"
        >
          <h3 className="font-bold text-brand-navy">✍️ Enter it manually</h3>
          <p className="text-sm text-slate-600 mt-1">
            No bill handy, or OCR struggling? Just type your kWh and billing
            days — that's all we truly need.
          </p>
        </button>
        <button
          onClick={() => {
            store.setCurrentBill(demoBill());
            router.push("/review");
          }}
          className="card text-left hover:border-brand-sun transition"
        >
          <h3 className="font-bold text-brand-navy">🎬 Try demo mode</h3>
          <p className="text-sm text-slate-600 mt-1">
            Explore the whole app with realistic sample bill data — no upload
            needed.
          </p>
        </button>
      </div>

      {showManual && <ManualEntry onDone={(b) => { store.setCurrentBill(b); router.push("/review"); }} />}

      <div className="mt-8 rounded-xl bg-brand-greenlight p-4 text-sm text-slate-700">
        <strong className="text-brand-green">Privacy:</strong> In guest mode,
        bill reading runs entirely in your browser and results are stored only
        on this device (you can delete them anytime from Saved Plans). We
        never need your name or account number — only usage figures — and we
        don't store your name even when it appears on the bill. Multiple
        bills from different seasons make your plan more accurate.
      </div>
    </div>
  );
}

function ManualEntry({ onDone }: { onDone: (b: ExtractedBillData) => void }) {
  const [kwh, setKwh] = useState("");
  const [days, setDays] = useState("30");
  const [zip, setZip] = useState("");
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    const k = parseFloat(kwh);
    if (!k || k <= 0) {
      setErr("Total kWh is required — it's on your bill, usually labeled 'kWh used' or 'total usage'.");
      return;
    }
    const b = emptyBill("manual");
    b.totalKwh = k;
    b.billingDays = parseInt(days, 10) || 30;
    b.serviceZip = zip.trim();
    b.totalBillAmount = parseFloat(amount) || null;
    b.estimatedCostPerKwh =
      b.totalBillAmount && k ? Math.round((b.totalBillAmount / k) * 1000) / 1000 : null;
    b.notes = ["Manually entered data.", "Upload bills from different seasons later for better accuracy."];
    onDone(b);
  };

  return (
    <div className="card mt-4">
      <h3 className="font-bold text-brand-navy text-lg">Manual bill entry</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Total kWh used (required)</label>
          <input className="field-input" inputMode="decimal" placeholder="e.g. 1180" value={kwh} onChange={(e) => setKwh(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Billing days</label>
          <input className="field-input" inputMode="numeric" placeholder="30" value={days} onChange={(e) => setDays(e.target.value)} />
        </div>
        <div>
          <label className="field-label">ZIP code (optional)</label>
          <input className="field-input" inputMode="numeric" placeholder="e.g. 30301" value={zip} onChange={(e) => setZip(e.target.value)} />
        </div>
        <div>
          <label className="field-label">Total bill amount $ (optional)</label>
          <input className="field-input" inputMode="decimal" placeholder="e.g. 187.42" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
      <button className="btn-primary mt-4" onClick={submit}>
        Continue to review →
      </button>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16233d" strokeWidth="1.5" aria-hidden>
      <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" />
    </svg>
  );
}
