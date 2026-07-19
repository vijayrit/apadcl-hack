// Shared mock data + tiny helpers for the AP Freight & Mobility Intelligence POC.
// Numbers are illustrative — the platform is designed to plug into DGCA/AAI,
// FASTag, e-Way Bill, FOIS, port cargo, ICEGATE and district GSDP feeds.

export type Mode = "air" | "road" | "rail" | "port";

export const modeMeta: Record<Mode, { label: string; token: string }> = {
  air: { label: "Air", token: "var(--air)" },
  road: { label: "Road", token: "var(--road)" },
  rail: { label: "Rail", token: "var(--rail)" },
  port: { label: "Ports", token: "var(--port)" },
};

export const airports = [
  { code: "VGA", name: "Vijayawada", status: "operational", pax2024: 1.42, cap: 3.0, growth: 0.11 },
  { code: "TIR", name: "Tirupati",   status: "operational", pax2024: 1.85, cap: 3.5, growth: 0.09 },
  { code: "VTZ", name: "Visakhapatnam", status: "operational", pax2024: 2.90, cap: 4.5, growth: 0.10 },
  { code: "RJA", name: "Rajahmundry", status: "operational", pax2024: 0.42, cap: 1.0, growth: 0.13 },
  { code: "CDP", name: "Kadapa",      status: "operational", pax2024: 0.09, cap: 0.5, growth: 0.14 },
  { code: "PUT", name: "Puttaparthi", status: "operational", pax2024: 0.05, cap: 0.3, growth: 0.08 },
  { code: "BPM", name: "Bhogapuram",  status: "upcoming",    pax2024: 0.00, cap: 6.0, growth: 0.22, opens: 2026 },
  { code: "DGR", name: "Dagadarthi",  status: "upcoming",    pax2024: 0.00, cap: 1.0, growth: 0.18, opens: 2027 },
  { code: "ORV", name: "Oravakallu",  status: "upcoming",    pax2024: 0.00, cap: 1.0, growth: 0.17, opens: 2028 },
  { code: "KUP", name: "Kuppam",      status: "upcoming",    pax2024: 0.00, cap: 0.8, growth: 0.16, opens: 2028 },
] as const;

// Passenger forecast series (mn pax) — hindcast 2021-2024, forecast 2025-2035.
export function paxForecast(airport: string) {
  const a = airports.find((x) => x.code === airport) ?? airports[0];
  const start = 2021;
  const end = 2035;
  const rows: Array<{
    year: number;
    actual?: number;
    forecast: number;
    low: number;
    high: number;
  }> = [];
  const base = a.pax2024 || 0.15;
  for (let y = start; y <= end; y++) {
    const t = y - 2024;
    const forecast = +(base * Math.pow(1 + a.growth, t)).toFixed(2);
    const band = forecast * 0.12;
    const row: (typeof rows)[number] = {
      year: y,
      forecast,
      low: +(forecast - band).toFixed(2),
      high: +(forecast + band).toFixed(2),
    };
    if (y <= 2024 && a.status === "operational") {
      row.actual = +(forecast * (1 + (y % 2 === 0 ? -0.03 : 0.02))).toFixed(2);
    }
    rows.push(row);
  }
  return rows;
}

export function thresholdYear(airport: string, pct = 0.8): number | null {
  const rows = paxForecast(airport);
  const a = airports.find((x) => x.code === airport)!;
  const target = a.cap * pct;
  const hit = rows.find((r) => r.forecast >= target);
  return hit ? hit.year : null;
}

// Cargo (000 tonnes) at airports.
export function airCargoForecast(airport: string) {
  const a = airports.find((x) => x.code === airport) ?? airports[0];
  // Derived from ATM × per-flight cargo (1.75 t) assumption.
  const base = Math.max(0.5, a.pax2024 * 6);
  const rows = [];
  for (let y = 2021; y <= 2035; y++) {
    const t = y - 2024;
    const dom = +(base * Math.pow(1 + a.growth, t)).toFixed(2);
    const intl = +(dom * (a.code === "VTZ" || a.code === "BPM" ? 0.55 : 0.25)).toFixed(2);
    rows.push({ year: y, domestic: dom, international: intl });
  }
  return rows;
}

// Freight modal split (mn tonnes) up to 2047.
export function freightForecast() {
  const rows = [];
  for (let y = 2019; y <= 2047; y++) {
    const t = y - 2024;
    rows.push({
      year: y,
      road: +(180 * Math.pow(1.062, t)).toFixed(1),
      rail: +(95 * Math.pow(1.055, t)).toFixed(1),
      port: +(210 * Math.pow(1.071, t)).toFixed(1),
    });
  }
  return rows;
}

export const commodities = [
  { name: "Coal & Coke",         road: 22, rail: 48, port: 30, growth: 0.03 },
  { name: "Iron Ore & Minerals", road: 12, rail: 38, port: 50, growth: 0.05 },
  { name: "POL / Petroleum",     road: 18, rail: 24, port: 58, growth: 0.04 },
  { name: "Containers",          road: 28, rail: 22, port: 50, growth: 0.11 },
  { name: "Foodgrain & Agri",    road: 62, rail: 26, port: 12, growth: 0.06 },
  { name: "Cement",              road: 55, rail: 40, port: 5,  growth: 0.07 },
  { name: "Fertilizers",         road: 40, rail: 45, port: 15, growth: 0.05 },
  { name: "Autos & Engineering", road: 65, rail: 15, port: 20, growth: 0.09 },
  { name: "Seafood & Cold-chain",road: 58, rail: 8,  port: 34, growth: 0.12 },
];

export const ports = [
  { code: "KRSN", name: "Krishnapatnam", tmt2024: 62, capacity: 100 },
  { code: "GNGV", name: "Gangavaram",    tmt2024: 38, capacity: 64 },
  { code: "VSKP", name: "Visakhapatnam", tmt2024: 72, capacity: 110 },
  { code: "KKND", name: "Kakinada",      tmt2024: 22, capacity: 40 },
  { code: "MCPT", name: "Machilipatnam", tmt2024: 4,  capacity: 25 },
  { code: "RMYP", name: "Ramayapatnam",  tmt2024: 0,  capacity: 20 },
];

export const corridors = [
  { id: "NH16-VZA-VSKP", name: "NH-16 Vijayawada ↔ Visakhapatnam", mode: "road" as Mode, tonnage: 92, congestion: 0.72, cost: 2.9 },
  { id: "NH65-VZA-HYD",  name: "NH-65 Vijayawada ↔ Hyderabad",     mode: "road" as Mode, tonnage: 74, congestion: 0.68, cost: 3.1 },
  { id: "RAIL-VSKP-KRSN",name: "Rail VSKP ↔ Krishnapatnam",         mode: "rail" as Mode, tonnage: 58, congestion: 0.44, cost: 1.6 },
  { id: "RAIL-GNTR-CHN", name: "Rail Guntur ↔ Chennai",             mode: "rail" as Mode, tonnage: 41, congestion: 0.38, cost: 1.7 },
  { id: "PORT-KRSN-CHN", name: "Coastal Krishnapatnam ↔ Chennai",   mode: "port" as Mode, tonnage: 34, congestion: 0.22, cost: 1.1 },
  { id: "PORT-VSKP-KOL", name: "Coastal Visakhapatnam ↔ Kolkata",   mode: "port" as Mode, tonnage: 48, congestion: 0.30, cost: 1.2 },
];

export const routeRecos = [
  { from: "Bhogapuram", to: "Singapore",   type: "International", potential: 92, gap: "High", basis: "IT/Pharma exports · tourism" },
  { from: "Bhogapuram", to: "Dubai",       type: "International", potential: 88, gap: "High", basis: "Diaspora · seafood cargo" },
  { from: "Tirupati",   to: "Ahmedabad",   type: "Domestic",      potential: 78, gap: "Medium", basis: "Pilgrimage · industrial" },
  { from: "Vijayawada", to: "Kolkata",     type: "Domestic",      potential: 71, gap: "Medium", basis: "Corridor complement to rail" },
  { from: "Visakhapatnam", to: "Colombo",  type: "International", potential: 69, gap: "Medium", basis: "Ports + tourism" },
  { from: "Kadapa",     to: "Chennai",     type: "Domestic",      potential: 55, gap: "Low",  basis: "Feeder / catchment" },
];

export const districts = [
  { name: "Visakhapatnam", generation: 82, attraction: 74 },
  { name: "Anantapur",     generation: 52, attraction: 41 },
  { name: "Krishna",       generation: 61, attraction: 58 },
  { name: "Guntur",        generation: 48, attraction: 52 },
  { name: "Chittoor",      generation: 44, attraction: 46 },
  { name: "East Godavari", generation: 39, attraction: 34 },
  { name: "West Godavari", generation: 36, attraction: 30 },
  { name: "Nellore",       generation: 58, attraction: 42 },
  { name: "Kurnool",       generation: 33, attraction: 28 },
  { name: "Kadapa",        generation: 24, attraction: 22 },
];

export const datasets = [
  { name: "DGCA / AAI air traffic", part: "Aviation", tier: "Mandatory", cadence: "Monthly" },
  { name: "Airport city-pair round-trip (2015–2026)", part: "Aviation", tier: "Mandatory", cadence: "Monthly" },
  { name: "Airport cargo (2015–2026)", part: "Aviation", tier: "Mandatory", cadence: "Monthly" },
  { name: "AP Aviation Policy 2026", part: "Aviation", tier: "Mandatory", cadence: "Static" },
  { name: "Historical port cargo · LDB", part: "Freight", tier: "Mandatory", cadence: "Daily" },
  { name: "E-Way Bill (anonymised)", part: "Freight", tier: "Mandatory", cadence: "Daily" },
  { name: "FASTag traffic", part: "Freight", tier: "Mandatory", cadence: "Hourly" },
  { name: "FOIS rail freight", part: "Freight", tier: "Mandatory", cadence: "Daily" },
  { name: "Industrial parks & SEZ inventory", part: "Freight", tier: "Mandatory", cadence: "Quarterly" },
  { name: "Commercial vehicle registry", part: "Freight", tier: "Mandatory", cadence: "Monthly" },
  { name: "Logistics infrastructure inventory", part: "Freight", tier: "Mandatory", cadence: "Quarterly" },
  { name: "Population & urbanisation projections", part: "Shared", tier: "Mandatory", cadence: "Annual" },
  { name: "District GSDP / employment", part: "Shared", tier: "Good to have", cadence: "Annual" },
  { name: "Tourism statistics by district", part: "Shared", tier: "Good to have", cadence: "Monthly" },
  { name: "ICEGATE trade data", part: "Freight", tier: "Good to have", cadence: "Daily" },
];

export function fmt(n: number, digits = 1) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: digits });
}
