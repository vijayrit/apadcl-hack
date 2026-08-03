import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, FileType2, ShieldCheck, Smartphone, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AP MSME DPR Portal — Build a bankable project report" },
      { name: "description", content: "Andhra Pradesh MSME entrepreneurs answer guided questions and get a bankable Detailed Project Report with cost, finance and 5-year projections — downloadable as PDF, Excel or Word." },
      { property: "og:title", content: "AP MSME DPR Portal — Build a bankable project report" },
      { property: "og:description", content: "Login with your mobile number, answer questions about your business, download a bank-ready DPR." },
    ],
  }),
  component: Landing,
});

const STEPS = [
  { n: "01", title: "Login with your mobile", body: "Enter your 10-digit number and the OTP. No passwords, no paperwork." },
  { n: "02", title: "Answer guided questions", body: "Six short sections: promoter, enterprise, market, project cost, operating costs and finance." },
  { n: "03", title: "Download your DPR", body: "Project cost, means of finance, 5-year P&L, DSCR and break-even — as PDF, Excel or Word." },
];

function Landing() {
  return (
    <>
      <section className="grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <span className="chip">Government of Andhra Pradesh · MSME support</span>
          <h1 className="mt-5 text-4xl leading-[1.05] md:text-6xl">
            A bankable project report for your enterprise,
            <em className="text-[color:var(--clay)]"> without a consultant.</em>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Answer plain questions about your business. The portal assembles a Detailed Project
            Report your bank recognises — project cost, means of finance, five-year profitability,
            DSCR and break-even — ready to download.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/auth" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm text-primary-foreground">
              <Smartphone className="h-4 w-4" /> Login with mobile OTP
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-input px-5 py-2.5 text-sm hover:bg-secondary">
              My projects
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> PDF</span>
            <span className="inline-flex items-center gap-1.5"><FileSpreadsheet className="h-3.5 w-3.5" /> Excel</span>
            <span className="inline-flex items-center gap-1.5"><FileType2 className="h-3.5 w-3.5" /> Word</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Your data stays in your account</span>
          </div>
        </div>

        <div className="paper p-6">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Sample output · viability snapshot
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {[
              ["Total project cost", "₹28,40,000"],
              ["Term loan", "₹19,88,000"],
              ["Year-1 turnover", "₹42,60,000"],
              ["Average DSCR", "2.14"],
              ["Break-even", "58% of Yr-1 sales"],
              ["Employment created", "7 persons"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-dashed border-border pb-2">
                <span className="text-muted-foreground">{k}</span>
                <span className="mono">{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Every figure is derived from your answers — nothing is pre-filled in your own report.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.n} className="paper p-5">
            <div className="mono text-xs text-[color:var(--clay)]">{s.n}</div>
            <h2 className="mt-2 text-xl">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="paper mt-6 flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl">Works for every MSME line of activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manufacturing, food processing, services, trading, handlooms and agri-allied units —
            with scheme context for PMEGP, Mudra, CGTMSE, PM Vishwakarma and AP MSME incentives.
          </p>
        </div>
        <Link to="/auth" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[color:var(--clay)] px-5 py-2.5 text-sm text-white">
          <Sparkles className="h-4 w-4" /> Start my DPR
        </Link>
      </section>
    </>
  );
}
