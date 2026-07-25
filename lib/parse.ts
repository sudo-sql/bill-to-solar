import type { BillConfidence, ExtractedBillData } from "./types";

/**
 * Heuristic utility-bill text parser with confidence scoring.
 * Works on text extracted from PDFs (pdf.js) or images (Tesseract OCR).
 * Confidence is 0–1; anything under 0.8 should be visually flagged for review.
 *
 * Security note: all extracted text is treated as untrusted. We only pull
 * numbers/short strings via anchored regexes and sanitize before display.
 */

const KNOWN_UTILITIES = [
  "Pacific Gas and Electric", "PG&E", "Southern California Edison", "SCE",
  "San Diego Gas & Electric", "SDG&E", "Duke Energy", "Florida Power & Light",
  "FPL", "Georgia Power", "Con Edison", "ConEd", "National Grid", "Xcel Energy",
  "Dominion Energy", "American Electric Power", "AEP", "PSEG", "PSE&G",
  "Entergy", "DTE Energy", "Ameren", "CenterPoint", "Oncor", "TXU",
  "Reliant", "Alabama Power", "Tampa Electric", "TECO", "Portland General",
  "Puget Sound Energy", "Rocky Mountain Power", "PacifiCorp", "APS",
  "Arizona Public Service", "Salt River Project", "SRP", "NV Energy",
  "Evergy", "Consumers Energy", "ComEd", "Commonwealth Edison", "PPL",
  "PECO", "BGE", "Baltimore Gas", "Pepco", "Eversource", "Avangrid",
  "Idaho Power", "Austin Energy", "CPS Energy", "Seattle City Light",
  "Sacramento Municipal", "SMUD", "LADWP", "JEA", "OUC", "OG&E",
];

export function sanitizeText(raw: string): string {
  // strip control chars, script-ish content, normalize whitespace
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/[ \t]+/g, " ");
}

function num(s: string): number {
  return parseFloat(s.replace(/,/g, ""));
}

function findKwh(text: string): { value: number | null; confidence: number } {
  // Strongest: labeled totals
  const labeled = text.match(
    /(?:total\s+(?:kwh|usage|energy)|kwh\s+used|usage\s*\(?kwh\)?|energy\s+used|electricity\s+used)[^\d-]{0,25}([\d,]+(?:\.\d+)?)/i
  );
  if (labeled) {
    const v = num(labeled[1]);
    if (v > 10 && v < 30000) return { value: v, confidence: 0.85 };
  }
  // Meter read difference pattern: "Current 45632  Previous 44521"
  const meter = text.match(
    /current(?:\s+read(?:ing)?)?[^\d]{0,15}([\d,]+)[^\d]{0,40}previous(?:\s+read(?:ing)?)?[^\d]{0,15}([\d,]+)/i
  );
  if (meter) {
    const diff = num(meter[1]) - num(meter[2]);
    if (diff > 10 && diff < 30000) return { value: diff, confidence: 0.7 };
  }
  // Weakest: any "1,234 kWh"
  const any = Array.from(text.matchAll(/([\d,]+(?:\.\d+)?)\s*kwh/gi))
    .map((m) => num(m[1]))
    .filter((v) => v > 50 && v < 30000);
  if (any.length) {
    // prefer the most common / largest plausible monthly figure
    any.sort((a, b) => b - a);
    const v = any.find((x) => x < 6000) ?? any[any.length - 1];
    return { value: v, confidence: 0.55 };
  }
  return { value: null, confidence: 0 };
}

function findBillingPeriod(text: string): {
  start: string;
  end: string;
  days: number | null;
  confidence: number;
} {
  const dateRe =
    /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/gi;

  // Explicit days
  const daysM = text.match(/(\d{1,3})\s*(?:billing\s*)?days?/i);
  let days: number | null = null;
  let dConf = 0;
  if (daysM) {
    const d = parseInt(daysM[1], 10);
    if (d >= 25 && d <= 36) {
      days = d;
      dConf = 0.85;
    } else if (d >= 15 && d <= 95) {
      days = d;
      dConf = 0.6;
    }
  }

  // Period "X to/through Y"
  const period = text.match(
    new RegExp(
      `${dateRe.source}\\s*(?:to|through|thru|[-–])\\s*${dateRe.source}`,
      "i"
    )
  );
  let start = "";
  let end = "";
  let pConf = 0;
  if (period) {
    start = period[1];
    end = period[2];
    pConf = 0.75;
    const s = new Date(start);
    const e = new Date(end);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const diff = Math.round((e.getTime() - s.getTime()) / 86400000);
      if (diff > 0 && diff < 95 && days === null) {
        days = diff;
        dConf = 0.75;
      }
    }
  }
  return { start, end, days, confidence: Math.max(dConf, pConf) };
}

function findAmount(text: string): { value: number | null; confidence: number } {
  const labeled = text.match(
    /(?:total\s+(?:amount\s+)?due|amount\s+due|total\s+(?:current\s+)?charges|please\s+pay|new\s+charges)[^\d$-]{0,25}\$?\s*([\d,]+\.\d{2})/i
  );
  if (labeled) {
    const v = num(labeled[1]);
    if (v > 5 && v < 10000) return { value: v, confidence: 0.85 };
  }
  const dollars = Array.from(text.matchAll(/\$\s*([\d,]+\.\d{2})/g))
    .map((m) => num(m[1]))
    .filter((v) => v > 20 && v < 5000);
  if (dollars.length) {
    dollars.sort((a, b) => b - a);
    return { value: dollars[0], confidence: 0.45 };
  }
  return { value: null, confidence: 0 };
}

function findZip(text: string): { value: string; confidence: number } {
  const serviceAddr = text.match(
    /service\s+(?:address|location)[^]{0,120}?\b(\d{5})(?:-\d{4})?\b/i
  );
  if (serviceAddr) return { value: serviceAddr[1], confidence: 0.8 };
  const anyZip = text.match(/\b(\d{5})(?:-\d{4})?\s*$/m) || text.match(/,\s*[A-Z]{2}\s+(\d{5})\b/);
  if (anyZip) return { value: anyZip[1], confidence: 0.5 };
  return { value: "", confidence: 0 };
}

function findUtility(text: string): { value: string; confidence: number } {
  for (const u of KNOWN_UTILITIES) {
    if (text.toLowerCase().includes(u.toLowerCase())) {
      return { value: u, confidence: 0.9 };
    }
  }
  const generic = text.match(
    /^([A-Z][A-Za-z&.\- ]{2,40}(?:Energy|Electric|Power|Utilities|Light|Cooperative|Co-op|EMC|PUD))\b/m
  );
  if (generic) return { value: generic[1].trim(), confidence: 0.55 };
  return { value: "", confidence: 0 };
}

export function parseBillText(
  rawText: string,
  source: "pdf" | "ocr",
  fileName?: string
): ExtractedBillData {
  const text = sanitizeText(rawText);
  const notes: string[] = [];

  const kwh = findKwh(text);
  const period = findBillingPeriod(text);
  const amount = findAmount(text);
  const zip = findZip(text);
  const utility = findUtility(text);

  const prevM = text.match(/(?:previous|last)\s+(?:month|period|usage)[^\d]{0,20}([\d,]+)\s*kwh/i);
  const rateM = text.match(/rate\s*(?:plan|schedule|code)?\s*[:#-]?\s*([A-Z0-9][A-Z0-9 \-]{1,25})/i);
  const tou = /time[- ]of[- ]use|\btou\b|on[- ]?peak|off[- ]?peak/i.test(text);
  const netMeter = /net\s*meter|net\s*energy\s*meter|nem\b/i.test(text);
  const solarCreditM = text.match(/(?:solar|generation|export)\s+credit[^\d$-]{0,20}\$?\s*-?([\d,]+\.\d{2})/i);
  const energyChargeM = text.match(/energy\s+charges?[^\d$-]{0,20}\$?\s*([\d,]+\.\d{2})/i);
  const deliveryM = text.match(/(?:delivery|distribution)\s+charges?[^\d$-]{0,20}\$?\s*([\d,]+\.\d{2})/i);
  const demandM = text.match(/demand\s+charges?[^\d$-]{0,20}\$?\s*([\d,]+\.\d{2})/i);
  const taxesM = text.match(/(?:taxes?(?:\s*(?:&|and)\s*fees)?|surcharges?)[^\d$-]{0,20}\$?\s*([\d,]+\.\d{2})/i);
  const peakRateM = text.match(/on[- ]?peak[^\d$]{0,25}\$?\s*(0?\.\d{2,5})/i);
  const offPeakRateM = text.match(/off[- ]?peak[^\d$]{0,25}\$?\s*(0?\.\d{2,5})/i);

  if (kwh.value === null) notes.push("Could not find kWh usage — please enter it manually.");
  if (period.days === null) notes.push("Billing days not found — assumed ~30 if left blank.");
  if (source === "ocr") notes.push("Values came from photo OCR — please double-check every number.");
  if (tou) notes.push("Time-of-use rate detected. TOU shifting can reduce battery size needs.");
  if (netMeter) notes.push("Net metering language detected — ask your utility about your export rate.");
  notes.push("One bill may not represent your annual usage. Upload bills from different seasons for better accuracy.");

  const estCost =
    amount.value && kwh.value ? amount.value / kwh.value : null;

  const confidence: BillConfidence = {
    utilityCompany: utility.confidence,
    billingDays: period.confidence,
    totalKwh: kwh.confidence,
    totalBillAmount: amount.confidence,
    serviceZip: zip.confidence,
  };

  return {
    id: `bill_${Date.now().toString(36)}`,
    source,
    fileName,
    utilityCompany: utility.value,
    serviceZip: zip.value,
    billingStartDate: period.start,
    billingEndDate: period.end,
    billingDays: period.days,
    totalKwh: kwh.value,
    previousKwh: prevM ? num(prevM[1]) : null,
    totalBillAmount: amount.value,
    energyCharges: energyChargeM ? num(energyChargeM[1]) : null,
    deliveryCharges: deliveryM ? num(deliveryM[1]) : null,
    demandCharge: demandM ? num(demandM[1]) : null,
    taxesFees: taxesM ? num(taxesM[1]) : null,
    estimatedCostPerKwh: estCost ? Math.round(estCost * 1000) / 1000 : null,
    ratePlan: rateM ? rateM[1].trim() : "",
    timeOfUse: tou,
    peakRate: peakRateM ? parseFloat(peakRateM[1]) : null,
    offPeakRate: offPeakRateM ? parseFloat(offPeakRateM[1]) : null,
    netMetering: netMeter,
    solarCredits: solarCreditM ? num(solarCreditM[1]) : null,
    confidence,
    needsUserReview: true,
    notes,
    createdAt: new Date().toISOString(),
  };
}

export function emptyBill(source: ExtractedBillData["source"]): ExtractedBillData {
  return {
    id: `bill_${Date.now().toString(36)}`,
    source,
    utilityCompany: "",
    serviceZip: "",
    billingStartDate: "",
    billingEndDate: "",
    billingDays: null,
    totalKwh: null,
    previousKwh: null,
    totalBillAmount: null,
    energyCharges: null,
    deliveryCharges: null,
    demandCharge: null,
    taxesFees: null,
    estimatedCostPerKwh: null,
    ratePlan: "",
    timeOfUse: false,
    peakRate: null,
    offPeakRate: null,
    netMetering: false,
    solarCredits: null,
    confidence: {
      utilityCompany: 1,
      billingDays: 1,
      totalKwh: 1,
      totalBillAmount: 1,
      serviceZip: 1,
    },
    needsUserReview: false,
    notes: [],
    createdAt: new Date().toISOString(),
  };
}
