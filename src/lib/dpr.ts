/** DPR domain model: questionnaire definition + bankable financial projections. */

export type FieldType = "text" | "number" | "select" | "textarea";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  suffix?: string;
  hint?: string;
  required?: boolean;
};

export type Step = { id: string; title: string; blurb: string; fields: Field[] };

export const DISTRICTS = [
  "Anakapalli", "Anantapur", "Annamayya", "Bapatla", "Chittoor", "East Godavari",
  "Eluru", "Guntur", "Kakinada", "Konaseema", "Krishna", "Kurnool", "Manyam",
  "Nandyal", "NTR", "Palnadu", "Prakasam", "Sri Balaji", "Sri Sathya Sai",
  "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa",
];

export const STEPS: Step[] = [
  {
    id: "promoter",
    title: "Promoter details",
    blurb: "Who is setting up the enterprise. Used for the promoter profile section of the DPR.",
    fields: [
      { key: "promoterName", label: "Promoter name", type: "text", required: true },
      { key: "district", label: "District", type: "select", options: DISTRICTS, required: true },
      { key: "socialCategory", label: "Social category", type: "select", options: ["General", "OBC", "SC", "ST", "Minority"] },
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
      { key: "education", label: "Highest qualification", type: "select", options: ["Below 10th", "10th", "Intermediate", "ITI / Diploma", "Graduate", "Post-graduate"] },
      { key: "experienceYears", label: "Relevant experience", type: "number", suffix: "years" },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise profile",
    blurb: "Basic identity of the unit — appears on the DPR cover and Udyam annexure.",
    fields: [
      { key: "businessName", label: "Enterprise name", type: "text", required: true },
      { key: "entityType", label: "Constitution", type: "select", options: ["Proprietorship", "Partnership", "LLP", "Private Limited", "FPO / Society"] },
      { key: "sector", label: "Sector", type: "select", options: ["Manufacturing", "Food processing", "Services", "Trading", "Handicrafts / Handloom", "Agri-allied"], required: true },
      { key: "activity", label: "Proposed activity", type: "textarea", hint: "e.g. Cold-pressed groundnut oil milling and packaging", required: true },
      { key: "unitLocation", label: "Unit location (village / town)", type: "text" },
      { key: "premises", label: "Premises", type: "select", options: ["Owned", "Rented", "Industrial park allotment"] },
      { key: "udyam", label: "Udyam registration", type: "select", options: ["Not yet", "Applied", "Registered"] },
      { key: "startMonth", label: "Planned commencement", type: "text", hint: "e.g. Apr 2027" },
    ],
  },
  {
    id: "market",
    title: "Product & market",
    blurb: "Demand-side justification. Drives the market assessment and revenue build-up.",
    fields: [
      { key: "products", label: "Products / services offered", type: "textarea", required: true },
      { key: "customers", label: "Target customers", type: "textarea", hint: "e.g. local kirana stores, D2C, institutional buyers" },
      { key: "marketArea", label: "Market coverage", type: "select", options: ["Local (mandal)", "District", "State", "National", "Export"] },
      { key: "competition", label: "Key competition & your edge", type: "textarea" },
      { key: "unitName", label: "Unit of sale", type: "text", hint: "e.g. litre, kg, piece, service call" },
      { key: "sellingPrice", label: "Average selling price per unit", type: "number", suffix: "₹", required: true },
      { key: "monthlyUnits", label: "Expected sales volume", type: "number", suffix: "units / month", required: true },
      { key: "capacityUtil", label: "Capacity utilisation in year 1", type: "number", suffix: "%", hint: "Typically 55-70% in the first year" },
      { key: "growthRate", label: "Annual growth assumption", type: "number", suffix: "% / year" },
    ],
  },
  {
    id: "capex",
    title: "Project cost",
    blurb: "Capital expenditure blocks. Feeds the project cost and depreciation schedule.",
    fields: [
      { key: "landBuilding", label: "Land & building / civil work", type: "number", suffix: "₹" },
      { key: "plantMachinery", label: "Plant & machinery", type: "number", suffix: "₹" },
      { key: "furniture", label: "Furniture, fixtures & utilities", type: "number", suffix: "₹" },
      { key: "prelimExpenses", label: "Preliminary & pre-operative expenses", type: "number", suffix: "₹" },
      { key: "contingency", label: "Contingency", type: "number", suffix: "%" },
      { key: "wcMonths", label: "Working capital cycle", type: "number", suffix: "months" },
    ],
  },
  {
    id: "opex",
    title: "Operating costs",
    blurb: "Recurring cost base used for the profitability and break-even statements.",
    fields: [
      { key: "rawMaterialPerUnit", label: "Raw material / direct cost per unit", type: "number", suffix: "₹" },
      { key: "labourMonthly", label: "Wages & salaries", type: "number", suffix: "₹ / month" },
      { key: "powerMonthly", label: "Power, fuel & water", type: "number", suffix: "₹ / month" },
      { key: "rentMonthly", label: "Rent & lease", type: "number", suffix: "₹ / month" },
      { key: "adminMonthly", label: "Admin, selling & other overheads", type: "number", suffix: "₹ / month" },
      { key: "maleJobs", label: "Employment created (male)", type: "number", suffix: "persons" },
      { key: "femaleJobs", label: "Employment created (female)", type: "number", suffix: "persons" },
    ],
  },
  {
    id: "finance",
    title: "Means of finance",
    blurb: "How the project cost is funded. Drives the repayment schedule and DSCR.",
    fields: [
      { key: "ownContribution", label: "Promoter contribution", type: "number", suffix: "₹", required: true },
      { key: "subsidy", label: "Expected subsidy / margin money grant", type: "number", suffix: "₹" },
      { key: "interestRate", label: "Term loan interest rate", type: "number", suffix: "% p.a." },
      { key: "tenureYears", label: "Term loan tenure", type: "number", suffix: "years" },
      { key: "moratoriumMonths", label: "Moratorium", type: "number", suffix: "months" },
      { key: "scheme", label: "Scheme applied under", type: "select", options: ["None / plain term loan", "PMEGP", "PM Vishwakarma", "CGTMSE", "Mudra (Kishore / Tarun)", "AP MSME Policy incentives", "Stand-Up India"] },
    ],
  },
];

export const DEFAULTS: Record<string, string | number> = {
  capacityUtil: 60,
  growthRate: 12,
  contingency: 5,
  wcMonths: 3,
  interestRate: 11,
  tenureYears: 7,
  moratoriumMonths: 6,
  experienceYears: 2,
  maleJobs: 2,
  femaleJobs: 2,
};

export type Answers = Record<string, string | number>;

const n = (a: Answers, k: string) => {
  const v = a[k];
  const num = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(num) ? num : 0;
};

export type YearRow = {
  year: number;
  utilisation: number;
  units: number;
  revenue: number;
  directCost: number;
  grossProfit: number;
  labour: number;
  power: number;
  rent: number;
  admin: number;
  ebitda: number;
  depreciation: number;
  interest: number;
  pbt: number;
  tax: number;
  pat: number;
  repayment: number;
  cashAccrual: number;
  dscr: number;
};

export type Computed = {
  capex: { landBuilding: number; plantMachinery: number; furniture: number; prelim: number; contingency: number; subtotal: number };
  workingCapital: number;
  projectCost: number;
  finance: { own: number; subsidy: number; termLoan: number; debtEquity: number };
  emiMonthly: number;
  years: YearRow[];
  breakEvenUnits: number;
  breakEvenRevenue: number;
  breakEvenPct: number;
  avgDscr: number;
  paybackYears: number;
  jobs: number;
  monthlyFixedCost: number;
  contributionPerUnit: number;
};

export function computeDpr(raw: Answers): Computed {
  const a = { ...DEFAULTS, ...raw };

  const landBuilding = n(a, "landBuilding");
  const plantMachinery = n(a, "plantMachinery");
  const furniture = n(a, "furniture");
  const prelim = n(a, "prelimExpenses");
  const hardCost = landBuilding + plantMachinery + furniture + prelim;
  const contingency = Math.round((hardCost * n(a, "contingency")) / 100);
  const capexSubtotal = hardCost + contingency;

  const price = n(a, "sellingPrice");
  const monthlyUnits = n(a, "monthlyUnits");
  const rmPerUnit = n(a, "rawMaterialPerUnit");
  const labour = n(a, "labourMonthly");
  const power = n(a, "powerMonthly");
  const rent = n(a, "rentMonthly");
  const admin = n(a, "adminMonthly");

  const monthlyFixedCost = labour + power + rent + admin;
  const wcMonths = Math.max(1, n(a, "wcMonths"));
  const util1 = Math.min(100, Math.max(10, n(a, "capacityUtil"))) / 100;
  const monthlyOperating = monthlyUnits * util1 * rmPerUnit + monthlyFixedCost;
  const workingCapital = Math.round(monthlyOperating * wcMonths);

  const projectCost = capexSubtotal + workingCapital;
  const own = n(a, "ownContribution");
  const subsidy = n(a, "subsidy");
  const termLoan = Math.max(0, projectCost - own - subsidy);
  const debtEquity = own + subsidy > 0 ? +(termLoan / (own + subsidy)).toFixed(2) : 0;

  const rate = n(a, "interestRate") / 100;
  const tenure = Math.max(1, n(a, "tenureYears"));
  const r = rate / 12;
  const nMonths = tenure * 12;
  const emiMonthly = termLoan > 0 && r > 0
    ? Math.round((termLoan * r * Math.pow(1 + r, nMonths)) / (Math.pow(1 + r, nMonths) - 1))
    : Math.round(termLoan / nMonths);

  const growth = n(a, "growthRate") / 100;
  const depBuilding = landBuilding * 0.05;
  const depMachinery = plantMachinery * 0.15;
  const depFurniture = (furniture + prelim + contingency) * 0.10;

  let outstanding = termLoan;
  let bookBuilding = landBuilding;
  let bookMachinery = plantMachinery;
  let bookOther = furniture + prelim + contingency;

  const years: YearRow[] = [];
  for (let i = 0; i < 5; i++) {
    const utilisation = Math.min(1, util1 + i * 0.1);
    const units = Math.round(monthlyUnits * 12 * utilisation * Math.pow(1 + growth, i));
    const revenue = Math.round(units * price * Math.pow(1 + growth * 0.3, i));
    const directCost = Math.round(units * rmPerUnit);
    const infl = Math.pow(1.05, i);
    const yLabour = Math.round(labour * 12 * infl);
    const yPower = Math.round(power * 12 * infl);
    const yRent = Math.round(rent * 12 * infl);
    const yAdmin = Math.round(admin * 12 * infl);
    const ebitda = revenue - directCost - yLabour - yPower - yRent - yAdmin;

    const depreciation = Math.round(
      Math.min(bookBuilding, depBuilding) + Math.min(bookMachinery, depMachinery) + Math.min(bookOther, depFurniture),
    );
    bookBuilding = Math.max(0, bookBuilding - depBuilding);
    bookMachinery = Math.max(0, bookMachinery - depMachinery);
    bookOther = Math.max(0, bookOther - depFurniture);

    const interest = Math.round(outstanding * rate);
    const principalDue = i === 0 && n(a, "moratoriumMonths") >= 12 ? 0 : Math.min(outstanding, Math.max(0, emiMonthly * 12 - interest));
    outstanding = Math.max(0, outstanding - principalDue);

    const pbt = ebitda - depreciation - interest;
    const tax = pbt > 0 ? Math.round(pbt * 0.25) : 0;
    const pat = pbt - tax;
    const cashAccrual = pat + depreciation;
    const debtService = interest + principalDue;
    const dscr = debtService > 0 ? +((cashAccrual + interest) / debtService).toFixed(2) : 0;

    years.push({
      year: i + 1,
      utilisation: Math.round(utilisation * 100),
      units,
      revenue,
      directCost,
      grossProfit: revenue - directCost,
      labour: yLabour,
      power: yPower,
      rent: yRent,
      admin: yAdmin,
      ebitda,
      depreciation,
      interest,
      pbt,
      tax,
      pat,
      repayment: principalDue,
      cashAccrual,
      dscr,
    });
  }

  const contributionPerUnit = price - rmPerUnit;
  const y1 = years[0]!;
  const annualFixed = y1.labour + y1.power + y1.rent + y1.admin + y1.depreciation + y1.interest;
  const breakEvenUnits = contributionPerUnit > 0 ? Math.round(annualFixed / contributionPerUnit) : 0;
  const breakEvenRevenue = breakEvenUnits * price;
  const breakEvenPct = y1.units > 0 ? Math.round((breakEvenUnits / y1.units) * 100) : 0;

  const dscrs = years.filter((y) => y.dscr > 0).map((y) => y.dscr);
  const avgDscr = dscrs.length ? +(dscrs.reduce((s, v) => s + v, 0) / dscrs.length).toFixed(2) : 0;

  let cum = 0;
  let payback = 0;
  for (const y of years) {
    cum += y.cashAccrual;
    payback += 1;
    if (cum >= projectCost) break;
  }

  return {
    capex: { landBuilding, plantMachinery, furniture, prelim, contingency, subtotal: capexSubtotal },
    workingCapital,
    projectCost,
    finance: { own, subsidy, termLoan, debtEquity },
    emiMonthly,
    years,
    breakEvenUnits,
    breakEvenRevenue,
    breakEvenPct,
    avgDscr,
    paybackYears: payback,
    jobs: n(a, "maleJobs") + n(a, "femaleJobs"),
    monthlyFixedCost,
    contributionPerUnit,
  };
}

export const inr = (v: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(v || 0));

export const lakh = (v: number) => (v / 100000).toFixed(2) + " L";

export function completion(answers: Answers) {
  const required = STEPS.flatMap((s) => s.fields.filter((f) => f.required));
  const done = required.filter((f) => String(answers[f.key] ?? "").trim() !== "").length;
  return { done, total: required.length, pct: Math.round((done / required.length) * 100) };
}

export function narrativeSections(a: Answers, c: Computed) {
  const name = String(a.businessName || "The enterprise");
  return [
    {
      heading: "1. Executive summary",
      body: `${name} is a proposed ${String(a.sector || "MSME").toLowerCase()} unit to be set up at ${String(a.unitLocation || "the proposed site")}, ${String(a.district || "Andhra Pradesh")}, promoted by ${String(a.promoterName || "the promoter")} as a ${String(a.entityType || "proprietorship")}. The activity proposed is ${String(a.activity || "not specified")}. The total project cost is estimated at ${inr(c.projectCost)} (₹${lakh(c.projectCost)}), funded through promoter contribution of ${inr(c.finance.own)}, subsidy / margin money of ${inr(c.finance.subsidy)} and a term loan of ${inr(c.finance.termLoan)}. The unit is projected to achieve a turnover of ${inr(c.years[0]!.revenue)} in year 1, rising to ${inr(c.years[4]!.revenue)} by year 5, with an average DSCR of ${c.avgDscr} and direct employment for ${c.jobs} persons.`,
    },
    {
      heading: "2. Promoter background",
      body: `${String(a.promoterName || "The promoter")} (${String(a.gender || "—")}, ${String(a.socialCategory || "General")} category) holds a qualification of ${String(a.education || "not stated")} with about ${String(a.experienceYears || 0)} years of relevant experience in the line of activity. The promoter proposes to contribute ${inr(c.finance.own)} towards the project, representing a debt-equity ratio of ${c.finance.debtEquity}:1.`,
    },
    {
      heading: "3. Product / service and process",
      body: `The unit will offer: ${String(a.products || "not specified")}. Sales are measured in ${String(a.unitName || "units")} at an average realisation of ${inr(Number(a.sellingPrice) || 0)} per ${String(a.unitName || "unit")}. Installed capacity supports ${String(a.monthlyUnits || 0)} ${String(a.unitName || "units")} per month, with year-1 utilisation planned at ${c.years[0]!.utilisation}% and stabilising thereafter.`,
    },
    {
      heading: "4. Market assessment",
      body: `The enterprise will serve ${String(a.customers || "identified buyers")} across a ${String(a.marketArea || "local")} market. Competitive landscape: ${String(a.competition || "not stated")}. Demand is assumed to grow at ${String(a.growthRate ?? 12)}% per annum, which is conservative for the ${String(a.sector || "MSME")} segment in ${String(a.district || "Andhra Pradesh")}.`,
    },
    {
      heading: "5. Project cost and means of finance",
      body: `Capital cost aggregates ${inr(c.capex.subtotal)} (land & building ${inr(c.capex.landBuilding)}, plant & machinery ${inr(c.capex.plantMachinery)}, furniture & utilities ${inr(c.capex.furniture)}, preliminary expenses ${inr(c.capex.prelim)}, contingency ${inr(c.capex.contingency)}). Working capital for a ${String(a.wcMonths ?? 3)}-month cycle is assessed at ${inr(c.workingCapital)}, taking the project cost to ${inr(c.projectCost)}. Term loan of ${inr(c.finance.termLoan)} is proposed at ${String(a.interestRate ?? 11)}% p.a. for ${String(a.tenureYears ?? 7)} years with a ${String(a.moratoriumMonths ?? 6)}-month moratorium, implying an EMI of ${inr(c.emiMonthly)}. Scheme support considered: ${String(a.scheme || "None / plain term loan")}.`,
    },
    {
      heading: "6. Viability and risk",
      body: `Break-even is reached at ${new Intl.NumberFormat("en-IN").format(c.breakEvenUnits)} ${String(a.unitName || "units")} per year (${inr(c.breakEvenRevenue)}), i.e. ${c.breakEvenPct}% of year-1 projected sales. Average DSCR over the loan period is ${c.avgDscr} and the project cost is recovered from cash accruals in about ${c.paybackYears} year(s). Principal risks are raw-material price volatility, delayed capacity ramp-up and receivable stretch; these are mitigated by the ${String(a.wcMonths ?? 3)}-month working capital cushion and a conservative ${c.years[0]!.utilisation}% first-year utilisation assumption.`,
    },
  ];
}
