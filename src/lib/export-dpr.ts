import type { Answers, Computed } from "./dpr";
import { inr, narrativeSections, STEPS } from "./dpr";

const YEAR_LABELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];

function fileBase(a: Answers) {
  return String(a.businessName || "DPR").replace(/[^\w\d]+/g, "-").replace(/^-|-$/g, "") + "-DPR";
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function answerRows(a: Answers) {
  return STEPS.flatMap((step) => [
    [step.title.toUpperCase(), ""],
    ...step.fields.map((f) => [f.label, String(a[f.key] ?? "—")]),
    ["", ""],
  ]);
}

export async function exportExcel(a: Answers, c: Computed) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const summary = [
    ["DETAILED PROJECT REPORT", String(a.businessName || "")],
    ["District", String(a.district || "")],
    ["Sector", String(a.sector || "")],
    ["", ""],
    ["PROJECT COST", "Amount (₹)"],
    ["Land & building / civil work", c.capex.landBuilding],
    ["Plant & machinery", c.capex.plantMachinery],
    ["Furniture, fixtures & utilities", c.capex.furniture],
    ["Preliminary & pre-operative", c.capex.prelim],
    ["Contingency", c.capex.contingency],
    ["Working capital", c.workingCapital],
    ["Total project cost", c.projectCost],
    ["", ""],
    ["MEANS OF FINANCE", "Amount (₹)"],
    ["Promoter contribution", c.finance.own],
    ["Subsidy / margin money", c.finance.subsidy],
    ["Term loan", c.finance.termLoan],
    ["Debt-equity ratio", c.finance.debtEquity],
    ["Monthly EMI", c.emiMonthly],
    ["", ""],
    ["VIABILITY", ""],
    ["Break-even units / year", c.breakEvenUnits],
    ["Break-even revenue", c.breakEvenRevenue],
    ["Break-even as % of Yr-1 sales", c.breakEvenPct],
    ["Average DSCR", c.avgDscr],
    ["Payback (years)", c.paybackYears],
    ["Employment created", c.jobs],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "Summary");

  const head = ["Particulars", ...YEAR_LABELS];
  const line = (label: string, pick: (i: number) => number) => [label, ...c.years.map((_, i) => pick(i))];
  const pnl = [
    head,
    line("Capacity utilisation (%)", (i) => c.years[i]!.utilisation),
    line("Units sold", (i) => c.years[i]!.units),
    line("Revenue", (i) => c.years[i]!.revenue),
    line("Direct / raw material cost", (i) => c.years[i]!.directCost),
    line("Gross profit", (i) => c.years[i]!.grossProfit),
    line("Wages & salaries", (i) => c.years[i]!.labour),
    line("Power, fuel & water", (i) => c.years[i]!.power),
    line("Rent & lease", (i) => c.years[i]!.rent),
    line("Admin & selling overheads", (i) => c.years[i]!.admin),
    line("EBITDA", (i) => c.years[i]!.ebitda),
    line("Depreciation", (i) => c.years[i]!.depreciation),
    line("Interest on term loan", (i) => c.years[i]!.interest),
    line("Profit before tax", (i) => c.years[i]!.pbt),
    line("Tax", (i) => c.years[i]!.tax),
    line("Profit after tax", (i) => c.years[i]!.pat),
    line("Cash accrual", (i) => c.years[i]!.cashAccrual),
    line("Principal repayment", (i) => c.years[i]!.repayment),
    line("DSCR", (i) => c.years[i]!.dscr),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pnl), "Projections");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Particulars", "Response"], ...answerRows(a)]), "Questionnaire");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  download(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${fileBase(a)}.xlsx`);
}

export async function exportWord(a: Answers, c: Computed) {
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType, PageOrientation,
  } = await import("docx");

  const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  const margins = { top: 80, bottom: 80, left: 120, right: 120 };

  const table = (rows: (string | number)[][], widths: number[]) =>
    new Table({
      width: { size: widths.reduce((s, v) => s + v, 0), type: WidthType.DXA },
      columnWidths: widths,
      rows: rows.map((cells, rowIndex) =>
        new TableRow({
          children: cells.map((cell, i) =>
            new TableCell({
              borders,
              margins,
              width: { size: widths[i]!, type: WidthType.DXA },
              shading: rowIndex === 0 ? { fill: "E7EFE7", type: ShadingType.CLEAR } : undefined,
              children: [
                new Paragraph({
                  alignment: i === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT,
                  children: [new TextRun({ text: String(cell), bold: rowIndex === 0 })],
                }),
              ],
            }),
          ),
        }),
      ),
    });

  const money = (v: number) => new Intl.NumberFormat("en-IN").format(Math.round(v));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: "Arial" }, paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial" }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 1 } },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840, orientation: PageOrientation.PORTRAIT },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(`Detailed Project Report — ${String(a.businessName || "MSME Enterprise")}`)] }),
          new Paragraph({ children: [new TextRun({ text: `${String(a.sector || "MSME")} · ${String(a.unitLocation || "")}${a.unitLocation ? ", " : ""}${String(a.district || "Andhra Pradesh")}`, italics: true })] }),
          ...narrativeSections(a, c).flatMap((s) => [
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(s.heading)] }),
            new Paragraph({ children: [new TextRun(s.body)] }),
          ]),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7. Project cost & means of finance")] }),
          table(
            [
              ["Particulars", "Amount (₹)"],
              ["Land & building / civil work", money(c.capex.landBuilding)],
              ["Plant & machinery", money(c.capex.plantMachinery)],
              ["Furniture, fixtures & utilities", money(c.capex.furniture)],
              ["Preliminary & pre-operative", money(c.capex.prelim)],
              ["Contingency", money(c.capex.contingency)],
              ["Working capital", money(c.workingCapital)],
              ["Total project cost", money(c.projectCost)],
              ["Promoter contribution", money(c.finance.own)],
              ["Subsidy / margin money", money(c.finance.subsidy)],
              ["Term loan", money(c.finance.termLoan)],
            ],
            [6360, 3000],
          ),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8. Projected profitability (₹)")] }),
          table(
            [
              ["Particulars", ...YEAR_LABELS],
              ["Revenue", ...c.years.map((y) => money(y.revenue))],
              ["Direct cost", ...c.years.map((y) => money(y.directCost))],
              ["EBITDA", ...c.years.map((y) => money(y.ebitda))],
              ["Depreciation", ...c.years.map((y) => money(y.depreciation))],
              ["Interest", ...c.years.map((y) => money(y.interest))],
              ["Profit after tax", ...c.years.map((y) => money(y.pat))],
              ["DSCR", ...c.years.map((y) => String(y.dscr))],
            ],
            [2760, 1320, 1320, 1320, 1320, 1320],
          ),
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9. Annexure — questionnaire responses")] }),
          ...answerRows(a).filter((r) => r[0]).map(([k, v]) =>
            new Paragraph({ children: [new TextRun({ text: `${k}: `, bold: true }), new TextRun(String(v ?? "—"))] }),
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  download(blob, `${fileBase(a)}.docx`);
}

export async function exportPdf(a: Answers, c: Computed) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  const page = () => {
    if (y > doc.internal.pageSize.getHeight() - margin - 40) {
      doc.addPage();
      y = margin;
    }
  };
  const h1 = (t: string) => { page(); doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text(t, margin, y); y += 22; };
  const h2 = (t: string) => { page(); doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text(t, margin, y); y += 16; };
  const p = (t: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const line of doc.splitTextToSize(t, width)) { page(); doc.text(line, margin, y); y += 14; }
    y += 6;
  };
  const row = (cells: string[], cols: number[], bold = false) => {
    page();
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(9.5);
    let x = margin;
    cells.forEach((cell, i) => {
      doc.text(cell, i === 0 ? x : x + cols[i]! - 4, y, { align: i === 0 ? "left" : "right" });
      x += cols[i]!;
    });
    y += 14;
  };

  h1(`Detailed Project Report — ${String(a.businessName || "MSME Enterprise")}`);
  p(`${String(a.sector || "MSME")} · ${String(a.unitLocation || "")}${a.unitLocation ? ", " : ""}${String(a.district || "Andhra Pradesh")} · prepared via AP MSME DPR Portal`);

  for (const s of narrativeSections(a, c)) { h2(s.heading); p(s.body); }

  h2("7. Project cost & means of finance");
  const cols2 = [width - 140, 140];
  row(["Particulars", "Amount"], cols2, true);
  ([
    ["Land & building / civil work", c.capex.landBuilding],
    ["Plant & machinery", c.capex.plantMachinery],
    ["Furniture, fixtures & utilities", c.capex.furniture],
    ["Preliminary & pre-operative", c.capex.prelim],
    ["Contingency", c.capex.contingency],
    ["Working capital", c.workingCapital],
    ["Total project cost", c.projectCost],
    ["Promoter contribution", c.finance.own],
    ["Subsidy / margin money", c.finance.subsidy],
    ["Term loan", c.finance.termLoan],
    ["Monthly EMI", c.emiMonthly],
  ] as [string, number][]).forEach(([k, v]) => row([k, inr(v)], cols2));

  y += 8;
  h2("8. Projected profitability (₹)");
  const colWidth = (width - 150) / 5;
  const cols6 = [150, colWidth, colWidth, colWidth, colWidth, colWidth];
  row(["Particulars", ...YEAR_LABELS], cols6, true);
  const fmt = (v: number) => new Intl.NumberFormat("en-IN").format(Math.round(v));
  row(["Revenue", ...c.years.map((v) => fmt(v.revenue))], cols6);
  row(["Direct cost", ...c.years.map((v) => fmt(v.directCost))], cols6);
  row(["EBITDA", ...c.years.map((v) => fmt(v.ebitda))], cols6);
  row(["Depreciation", ...c.years.map((v) => fmt(v.depreciation))], cols6);
  row(["Interest", ...c.years.map((v) => fmt(v.interest))], cols6);
  row(["Profit after tax", ...c.years.map((v) => fmt(v.pat))], cols6);
  row(["DSCR", ...c.years.map((v) => String(v.dscr))], cols6);

  y += 10;
  h2("9. Annexure — questionnaire responses");
  answerRows(a).filter((r) => r[0]).forEach(([k, v]) => p(`${k}: ${v ?? "—"}`));

  doc.save(`${fileBase(a)}.pdf`);
}
