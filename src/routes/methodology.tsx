import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Database, FileDown, ShieldCheck } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-kit";
import { datasets } from "@/lib/mock-data";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Data & Methodology · AP Freight & Mobility Intelligence" },
      { name: "description", content: "Datasets, model stack, explainability approach and POC success criteria for the APADCL × APMB forecasting platform." },
    ],
  }),
  component: MethodologyPage,
});

function MethodologyPage() {
  const byPart = ["Aviation", "Freight", "Shared"] as const;

  return (
    <>
      <PageHeader
        eyebrow="Data & Methodology"
        title="How the forecasts are built"
        description="One data pipeline, one feature store, one explainable model stack. Different horizons and outputs for APADCL (2035) and APMB (2047)."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Data pipeline" subtitle="Public sources · DPDP-compliant anonymisation">
          <ol className="space-y-3 text-sm">
            {[
              ["Ingest", "DGCA/AAI, LDB, FASTag, e-Way Bill, FOIS, ICEGATE, GSDP, tourism"],
              ["Clean", "Deduplication, outlier flagging, seasonality decomposition"],
              ["Feature store", "District-level socio-economic + industrial + connectivity features"],
              ["Train", "Prophet + XGBoost + temporal transformer ensembles per airport / corridor"],
              ["Explain", "SHAP-style attributions on every published forecast"],
              ["Serve", "Continuous forecasts + scenario engine + exports"],
            ].map(([h, b]) => (
              <li key={h} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--port)" }} />
                <div>
                  <div className="text-foreground">{h}</div>
                  <div className="text-xs text-muted-foreground">{b}</div>
                </div>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="POC success criteria" subtitle="APADCL brief — POC scope">
          <ul className="space-y-3 text-sm">
            {[
              ["Hindcast accuracy", "≥ 85% for 2021-2024 actual vs model at pilot airports"],
              ["Coverage", "Vijayawada + Tirupati + 2-3 candidate site clusters"],
              ["Horizon", "10-year forecast with confidence intervals"],
              ["Outliers", "With / without-outlier scenarios both delivered"],
              ["Explainability", "Feature attributions surfaced in dashboard"],
              ["Extensibility", "Same pipeline extends to all AP airports & APMB corridors"],
            ].map(([h, b]) => (
              <li key={h} className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--air)" }} />
                <div>
                  <div className="text-foreground">{h}</div>
                  <div className="text-xs text-muted-foreground">{b}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Exports & integrations" subtitle="System requirements from both briefs">
          <ul className="space-y-3 text-sm">
            {[
              ["PDF & Excel reports", "One-click export for infrastructure planning"],
              ["API surface", "Read APIs for GIS, corridor and capacity data"],
              ["GIS overlays", "District generation/attraction, corridor heatmaps"],
              ["Alerts", "80% terminal capacity, corridor congestion, port saturation"],
              ["Audit trail", "Every forecast versioned with model + input snapshot"],
            ].map(([h, b]) => (
              <li key={h} className="flex gap-3">
                <FileDown className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} />
                <div>
                  <div className="text-foreground">{h}</div>
                  <div className="text-xs text-muted-foreground">{b}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {byPart.map((part) => (
          <Panel key={part} title={`${part} datasets`} subtitle={`${datasets.filter(d => d.part === part).length} sources`}>
            <div className="space-y-2">
              {datasets.filter((d) => d.part === part).map((d) => (
                <div key={d.name} className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-secondary/30 p-2.5">
                  <div className="flex items-start gap-2">
                    <Database className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <div className="text-sm">{d.name}</div>
                      <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {d.cadence}
                      </div>
                    </div>
                  </div>
                  <span
                    className="mono shrink-0 rounded px-1.5 py-0.5 text-[10px]"
                    style={{
                      background: d.tier === "Mandatory" ? "oklch(0.78 0.14 195 / 0.15)" : "oklch(0.82 0.15 82 / 0.15)",
                      color: d.tier === "Mandatory" ? "var(--primary)" : "var(--accent)",
                    }}
                  >
                    {d.tier}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}
