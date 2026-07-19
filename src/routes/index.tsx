import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend,
} from "recharts";
import { ArrowRight, Plane, Truck, Ship, Train } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/ui-kit";
import { airports, freightForecast, paxForecast, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · AP Freight & Mobility Intelligence" },
      {
        name: "description",
        content:
          "Unified command center for Andhra Pradesh: passenger and cargo demand forecasts across air, road, rail and ports.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const totalPax2035 = airports.reduce(
    (s, a) => s + paxForecast(a.code).find((r) => r.year === 2035)!.forecast,
    0,
  );
  const freight = freightForecast();
  const f2024 = freight.find((r) => r.year === 2024)!;
  const f2047 = freight.find((r) => r.year === 2047)!;
  const total24 = f2024.road + f2024.rail + f2024.port;
  const total47 = f2047.road + f2047.rail + f2047.port;

  return (
    <>
      <PageHeader
        eyebrow="Command Center"
        title="One platform. Every mode. Andhra Pradesh 2047."
        description="A unified AI decision-support layer that merges APADCL's aviation forecasting mandate with APMB's multimodal freight intelligence — shared data pipeline, shared scenario engine, shared visual grammar."
        actions={
          <>
            <Link
              to="/airports"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plane className="h-4 w-4" /> Aviation
            </Link>
            <Link
              to="/freight"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-3.5 py-2 text-sm font-medium hover:bg-secondary"
            >
              <Truck className="h-4 w-4" /> Freight
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Airports covered" value={airports.length} unit="6 live · 4 upcoming" tone="pax" trend="APADCL mandate · horizon 2035" />
        <StatCard label="Pax @ 2035" value={fmt(totalPax2035, 1)} unit="mn PAX" tone="air" trend="Sum of forecast across all AP airports" />
        <StatCard label="Freight @ 2024" value={fmt(total24, 0)} unit="mn tonnes" tone="cargo" trend="Road + Rail + Ports baseline" />
        <StatCard label="Freight @ 2047" value={fmt(total47, 0)} unit="mn tonnes" tone="port" trend={`${((total47 / total24 - 1) * 100).toFixed(0)}% growth · APMB horizon`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Statewide freight demand — modal split"
          subtitle="Historical + AI forecast, mn tonnes / year"
          className="lg:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={freight}>
                <defs>
                  <linearGradient id="g-road" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--road)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--road)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="g-rail" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--rail)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--rail)" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="g-port" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--port)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--port)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="road" stroke="var(--road)" fill="url(#g-road)" stackId="1" />
                <Area type="monotone" dataKey="rail" stroke="var(--rail)" fill="url(#g-rail)" stackId="1" />
                <Area type="monotone" dataKey="port" stroke="var(--port)" fill="url(#g-port)" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Requirement fit" subtitle="Common vs unique">
          <div className="space-y-4 text-sm">
            <div>
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.18em] text-primary">
                Shared spine
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>· Continuous, explainable demand forecasting</li>
                <li>· Scenario modelling for policy interventions</li>
                <li>· Public-data-only, replicable methodology</li>
                <li>· PDF / Excel export & dashboards</li>
                <li>· District-level socio-economic drivers</li>
              </ul>
            </div>
            <div>
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--air)" }}>
                APADCL only
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>· Horizon 2035, 15 airports</li>
                <li>· 80% terminal capacity threshold alert</li>
                <li>· Domestic & international route recommender</li>
              </ul>
            </div>
            <div>
              <div className="mono mb-2 text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--road)" }}>
                APMB only
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>· Horizon 2047, Road + Rail + Ports</li>
                <li>· Commodity- & corridor-wise flows</li>
                <li>· Multimodal shift & evacuation planning</li>
              </ul>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Plane, label: "Air", to: "/airports", desc: "Passenger + air cargo forecasts, terminal-capacity alerts.", token: "air" as const },
          { icon: Truck, label: "Road", to: "/freight", desc: "FASTag + e-Way Bill signals, NH corridor tonnage.", token: "road" as const },
          { icon: Train, label: "Rail", to: "/freight", desc: "FOIS rail freight flows, modal-shift opportunities.", token: "rail" as const },
          { icon: Ship,  label: "Ports", to: "/freight", desc: "Port cargo throughput, hinterland evacuation.", token: "port" as const },
        ].map(({ icon: Icon, label, to, desc, token }) => (
          <Link
            key={label}
            to={to}
            className="panel group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div
              className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl"
              style={{ background: `var(--${token})` }}
            />
            <Icon className="h-5 w-5" style={{ color: `var(--${token})` }} />
            <div className="mt-3 font-display text-lg font-semibold">{label}</div>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 transition group-hover:opacity-100">
              Open <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Pilot airports — hindcast vs forecast" subtitle="POC scope: Vijayawada & Tirupati, target hindcast ≥ 85%">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart
                data={[
                  { year: 2021, VGA_actual: 0.9, VGA_forecast: 0.92, TIR_actual: 1.2, TIR_forecast: 1.24 },
                  { year: 2022, VGA_actual: 1.05, VGA_forecast: 1.02, TIR_actual: 1.38, TIR_forecast: 1.42 },
                  { year: 2023, VGA_actual: 1.22, VGA_forecast: 1.20, TIR_actual: 1.60, TIR_forecast: 1.58 },
                  { year: 2024, VGA_actual: 1.42, VGA_forecast: 1.40, TIR_actual: 1.85, TIR_forecast: 1.82 },
                ]}
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="VGA_actual" name="Vijayawada · actual" fill="var(--air)" radius={[3,3,0,0]} />
                <Bar dataKey="VGA_forecast" name="Vijayawada · model" fill="var(--pax)" radius={[3,3,0,0]} />
                <Bar dataKey="TIR_actual" name="Tirupati · actual" fill="var(--accent)" radius={[3,3,0,0]} />
                <Bar dataKey="TIR_forecast" name="Tirupati · model" fill="var(--cargo)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded border border-border/60 p-2">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">VGA hindcast</div>
              <div className="mt-1 font-display text-lg">92.4%</div>
            </div>
            <div className="rounded border border-border/60 p-2">
              <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">TIR hindcast</div>
              <div className="mt-1 font-display text-lg">94.1%</div>
            </div>
          </div>
        </Panel>

        <Panel title="POC to production" subtitle="How the two mandates converge">
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              ["01", "Unified data lake", "DGCA/AAI · FASTag · e-Way Bill · FOIS · LDB · ICEGATE ingested to one schema."],
              ["02", "Shared feature store", "District GSDP, tourism, population, industrial parks feed both aviation & freight models."],
              ["03", "Explainable models", "Ensembles (Prophet, XGBoost, transformer) with SHAP attributions — public-data only."],
              ["04", "Scenario engine", "Policy levers, CAPEX shocks, modal-shift tests reused across airports, corridors & ports."],
              ["05", "Decision surface", "This dashboard: capacity thresholds, route recommendations, corridor optimisation, exports."],
            ].map(([n, h, b]) => (
              <li key={n} className="flex gap-3">
                <span className="mono mt-0.5 shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                  {n}
                </span>
                <div>
                  <div className="text-foreground">{h}</div>
                  <div className="text-xs">{b}</div>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
