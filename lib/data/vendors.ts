// Editable vendor/source registry. Update freely — nothing else depends on
// specific entries. In the Supabase build this becomes the vendor_sources table.

export interface Vendor {
  name: string;
  category:
    | "Big box hardware"
    | "Solar retailer"
    | "Battery supplier"
    | "Online marketplace"
    | "Electrical supply"
    | "Local professional";
  url?: string;
  goodFor: string;
  notes: string;
}

export const VENDOR_DISCLAIMER =
  "Verify current pricing, shipping, warranty, and compatibility before purchasing. Vendors and prices change; nothing here is an endorsement or affiliate link.";

export const VENDORS: Vendor[] = [
  { name: "Home Depot", category: "Big box hardware", url: "https://www.homedepot.com", goodFor: "Conduit, wire, breakers, disconnects, ground rods, lumber for ground mounts", notes: "Good for code-listed electrical parts you can inspect in person." },
  { name: "Lowe's", category: "Big box hardware", url: "https://www.lowes.com", goodFor: "Same as Home Depot; compare prices", notes: "Stock varies by store." },
  { name: "Harbor Freight", category: "Big box hardware", url: "https://www.harborfreight.com", goodFor: "PPE, hand tools, crimpers, small portable panels", notes: "Fine for tools; verify listings on anything electrical." },
  { name: "Amazon", category: "Online marketplace", url: "https://www.amazon.com", goodFor: "Monitors, small MPPT controllers, cable lugs, labels", notes: "Watch for counterfeit fuses/breakers — buy protection devices from reputable sellers only." },
  { name: "Walmart", category: "Online marketplace", url: "https://www.walmart.com", goodFor: "Budget starter kits, marine batteries", notes: "Marine batteries OK for emergency starter setups, not daily cycling." },
  { name: "Sam's Club", category: "Battery supplier", url: "https://www.samsclub.com", goodFor: "Duracell/lead-acid batteries at member pricing", notes: "Check date codes — buy fresh stock." },
  { name: "Costco", category: "Battery supplier", url: "https://www.costco.com", goodFor: "Interstate lead-acid batteries, generators", notes: "Generous return policies." },
  { name: "Renogy", category: "Solar retailer", url: "https://www.renogy.com", goodFor: "Small/mid DIY kits, panels, controllers, 12/24V gear", notes: "Popular for RV/cabin scale systems." },
  { name: "Eco-Worthy", category: "Solar retailer", url: "https://www.eco-worthy.com", goodFor: "Budget panels and kits", notes: "Entry-level pricing; check reviews per product." },
  { name: "Signature Solar", category: "Solar retailer", url: "https://signaturesolar.com", goodFor: "EG4 inverters, server-rack LiFePO4, pallet panel deals", notes: "Big in the DIY community; good bundle pricing." },
  { name: "Current Connected", category: "Solar retailer", url: "https://currentconnected.com", goodFor: "Victron, SOK batteries, quality fusing (Class-T)", notes: "Known for support and properly spec'd safety parts." },
  { name: "The AltE Store", category: "Solar retailer", url: "https://www.altestore.com", goodFor: "Design help, brand-name components", notes: "Long-running retailer with sizing resources." },
  { name: "Northern Arizona Wind & Sun", category: "Solar retailer", url: "https://www.solar-electric.com", goodFor: "Off-grid design expertise, forums", notes: "Deep off-grid knowledge base." },
  { name: "Santan Solar", category: "Solar retailer", url: "https://santansolar.com", goodFor: "Used/surplus panels at steep discounts", notes: "Great $/W for ground mounts where aesthetics don't matter." },
  { name: "Local electrical supply house", category: "Electrical supply", goodFor: "THHN wire by the foot, panels, breakers, code parts", notes: "Often price-competitive and staff know local code." },
  { name: "Local battery supplier", category: "Battery supplier", goodFor: "Forklift/golf-cart batteries, cores, testing", notes: "Ask about reconditioned industrial cells for budget banks." },
  { name: "Local licensed electrician / solar installer", category: "Local professional", goodFor: "Service panel work, transfer switches, interconnection, inspections", notes: "REQUIRED for code-critical work. Get 2–3 quotes; ask if they'll do 'owner-assisted' installs." },
];
