import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowRight, Check, FileSpreadsheet, FileText, FileType2, Loader2, Save,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  completion, computeDpr, DEFAULTS, inr, narrativeSections, STEPS, type Answers, type Field,
} from "@/lib/dpr";
import { exportExcel, exportPdf, exportWord } from "@/lib/export-dpr";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  head: () => ({
    meta: [
      { title: "Build your DPR · AP MSME DPR Portal" },
      { name: "description", content: "Answer guided questions about your enterprise and instantly see project cost, means of finance, five-year projections, DSCR and break-even before downloading the DPR." },
      { property: "og:title", content: "Build your DPR · AP MSME DPR Portal" },
      { property: "og:description", content: "Guided questionnaire with live viability numbers and one-click DPR download." },
    ],
  }),
  component: ProjectPage,
});

function ProjectPage() {
  const { id } = Route.useParams();
  const [answers, setAnswers] = useState<Answers>({ ...DEFAULTS });
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"form" | "report">("form");

  const project = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dpr_projects")
        .select("id, business_name, answers, status")
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  useEffect(() => {
    const loaded = project.data?.answers as Answers | undefined;
    if (loaded) setAnswers({ ...DEFAULTS, ...loaded });
  }, [project.data]);

  const computed = useMemo(() => computeDpr(answers), [answers]);
  const done = completion(answers);
  const step = STEPS[stepIndex]!;

  function set(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  async function save(silent = false) {
    setSaving(true);
    const { error } = await supabase
      .from("dpr_projects")
      .update({
        answers: answers as never,
        computed: computed as never,
        business_name: String(answers.businessName || "Untitled enterprise"),
        status: done.pct === 100 ? "complete" : "draft",
      })
      .eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else if (!silent) toast.success("Saved");
  }

  if (project.isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <Link to="/dashboard" className="mono inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> My projects
          </Link>
          <h1 className="mt-2 text-4xl">{String(answers.businessName || "Untitled enterprise")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {done.done} of {done.total} required answers complete · figures update as you type.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save()} disabled={saving} className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-secondary disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
          <button
            onClick={() => { setTab(tab === "form" ? "report" : "form"); void save(true); }}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            {tab === "form" ? "View DPR" : "Back to questions"}
          </button>
        </div>
      </div>

      {tab === "form" ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="paper p-6">
            <div className="flex flex-wrap gap-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStepIndex(i)}
                  className={`rounded-full px-3 py-1 text-xs ${i === stepIndex ? "bg-primary text-primary-foreground" : "border border-input text-muted-foreground hover:bg-secondary"}`}
                >
                  {i + 1}. {s.title}
                </button>
              ))}
            </div>

            <h2 className="mt-5 text-2xl">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.blurb}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {step.fields.map((f) => (
                <FieldInput key={f.key} field={f} value={answers[f.key]} onChange={(v) => set(f.key, v)} />
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                disabled={stepIndex === 0}
                className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {stepIndex < STEPS.length - 1 ? (
                <button
                  onClick={() => { setStepIndex((i) => i + 1); void save(true); }}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => { setTab("report"); void save(true); }}
                  className="inline-flex items-center gap-2 rounded-md bg-[color:var(--clay)] px-4 py-2 text-sm text-white"
                >
                  <Check className="h-4 w-4" /> Generate DPR
                </button>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="paper p-5">
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Live viability</div>
              <div className="mt-3 space-y-2.5 text-sm">
                {[
                  ["Project cost", inr(computed.projectCost)],
                  ["Term loan", inr(computed.finance.termLoan)],
                  ["Debt : equity", `${computed.finance.debtEquity} : 1`],
                  ["Monthly EMI", inr(computed.emiMonthly)],
                  ["Yr-1 turnover", inr(computed.years[0]!.revenue)],
                  ["Yr-1 PAT", inr(computed.years[0]!.pat)],
                  ["Average DSCR", String(computed.avgDscr)],
                  ["Break-even", `${computed.breakEvenPct}% of Yr-1`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dashed border-border pb-1.5">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="paper p-5">
              <div className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Completion</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-[color:var(--leaf)]" style={{ width: `${done.pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {done.pct === 100 ? "All required answers captured — your DPR is ready." : "Fill the starred fields in each section to finish."}
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <ReportView answers={answers} computed={computed} />
      )}
    </>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: string | number | undefined; onChange: (v: string) => void }) {
  const label = (
    <label className="mb-1.5 block text-xs text-muted-foreground">
      {field.label}
      {field.required && <span className="text-[color:var(--clay)]"> *</span>}
      {field.suffix && <span className="mono"> ({field.suffix})</span>}
    </label>
  );
  const cls = "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      {label}
      {field.type === "select" ? (
        <select className={cls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea rows={3} className={cls} value={String(value ?? "")} placeholder={field.hint} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input
          type={field.type === "number" ? "number" : "text"}
          inputMode={field.type === "number" ? "decimal" : undefined}
          className={cls}
          value={String(value ?? "")}
          placeholder={field.hint}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.hint && field.type !== "textarea" && field.type !== "text" && (
        <p className="mt-1 text-[11px] text-muted-foreground">{field.hint}</p>
      )}
    </div>
  );
}

function ReportView({ answers, computed }: { answers: Answers; computed: ReturnType<typeof computeDpr> }) {
  const [busy, setBusy] = useState<string | null>(null);

  async function run(kind: "pdf" | "excel" | "word") {
    setBusy(kind);
    try {
      if (kind === "pdf") await exportPdf(answers, computed);
      if (kind === "excel") await exportExcel(answers, computed);
      if (kind === "word") await exportWord(answers, computed);
      toast.success(`${kind.toUpperCase()} downloaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(null);
    }
  }

  const money = (v: number) => new Intl.NumberFormat("en-IN").format(Math.round(v));

  return (
    <div className="mt-6 space-y-5">
      <div className="paper flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h2 className="text-2xl">Detailed Project Report</h2>
          <p className="text-sm text-muted-foreground">Download in the format your bank or scheme application needs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["pdf", "PDF", FileText],
            ["excel", "Excel", FileSpreadsheet],
            ["word", "Word", FileType2],
          ] as const).map(([kind, label, Icon]) => (
            <button
              key={kind}
              onClick={() => run(kind)}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-secondary disabled:opacity-60"
            >
              {busy === kind ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="paper space-y-6 p-7">
        {narrativeSections(answers, computed).map((s) => (
          <section key={s.heading}>
            <h3 className="text-xl">{s.heading}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}

        <section>
          <h3 className="text-xl">7. Project cost & means of finance</h3>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {([
                ["Land & building / civil work", computed.capex.landBuilding],
                ["Plant & machinery", computed.capex.plantMachinery],
                ["Furniture, fixtures & utilities", computed.capex.furniture],
                ["Preliminary & pre-operative", computed.capex.prelim],
                ["Contingency", computed.capex.contingency],
                ["Working capital", computed.workingCapital],
                ["Total project cost", computed.projectCost],
                ["Promoter contribution", computed.finance.own],
                ["Subsidy / margin money", computed.finance.subsidy],
                ["Term loan", computed.finance.termLoan],
              ] as [string, number][]).map(([k, v]) => (
                <tr key={k} className="border-b border-dashed border-border">
                  <td className="py-1.5 text-muted-foreground">{k}</td>
                  <td className="mono py-1.5 text-right">{inr(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3 className="text-xl">8. Projected profitability (₹)</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 font-medium">Particulars</th>
                  {computed.years.map((y) => (
                    <th key={y.year} className="mono py-2 text-right text-xs font-medium">Year {y.year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ["Capacity utilisation (%)", (y: typeof computed.years[number]) => String(y.utilisation)],
                  ["Revenue", (y) => money(y.revenue)],
                  ["Direct cost", (y) => money(y.directCost)],
                  ["EBITDA", (y) => money(y.ebitda)],
                  ["Depreciation", (y) => money(y.depreciation)],
                  ["Interest", (y) => money(y.interest)],
                  ["Profit after tax", (y) => money(y.pat)],
                  ["DSCR", (y) => String(y.dscr)],
                ] as [string, (y: typeof computed.years[number]) => string][]).map(([label, pick]) => (
                  <tr key={label} className="border-b border-dashed border-border">
                    <td className="py-1.5 text-muted-foreground">{label}</td>
                    {computed.years.map((y) => (
                      <td key={y.year} className="mono py-1.5 text-right">{pick(y)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
