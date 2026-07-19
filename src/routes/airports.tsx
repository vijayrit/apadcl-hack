import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, ReferenceLine, Legend, BarChart, Bar,
} from "recharts";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/ui-kit";
import { airports, paxForecast, airCargoForecast, thresholdYear, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/airports")({
  head: () => ({
    meta: [
      { title: "Airports · APADCL Aviation Forecasting" },
      { name: "description", content: "Passenger & air cargo demand forecasts up to 2035 for all Andhra Pradesh airports, with terminal capacity threshold alerts." },
    ],
  }),
  component: AirportsPage,
});

function AirportsPage() {
  const [code, setCode] = useState<string>("BPM");
  const airport = airports.find((a) => a.code === code)!;
  const pax = paxForecast(code);
  const cargo = airCargoForecast(code);
  const threshold80 = thresholdYear(code, 0.8);
  const at2035 = pax.find((r) => r.year === 2035)!.forecast;
  const capUtil = airport.cap > 0 ? at2035 / airport.cap : 0;

  return (
    <>
      <PageHeader
        eyebrow="APADCL · Aviation"
        title="Passenger & cargo forecasts to 2035"
        description="AI ensemble forecasts per airport with confidence bands, terminal-capacity threshold detection, and cargo projections derived from ATMs × per-flight cargo (1.5–2 t)."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {airports.map((a) => (
          <button
            key={a.code}
            onClick={() => setCode(a.code)}
            className={`group rounded-md border px-3 py-2 text-left transition ${
              a.code === code
                ? "border-primary bg-primary/10"
                : "border-border/60 bg-secondary/40 hover:bg-secondary"
            }`}
          >
            <div className="mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {a.code} · {a.status}
            </div>
            <div className="text-sm font-medium">{a.name}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="2024 baseline" value={airport.pax2024 ? fmt(airport.pax2024, 2) : "—"} unit="mn PAX" tone="pax" trend={airport.status === "upcoming" ? `Opens ${airport.opens}` : "Actual DGCA/AAI"} />
        <StatCard label="2035 forecast" value={fmt(at2035, 2)} unit="mn PAX" tone="air" trend={`CAGR ${(airport.growth * 100).toFixed(1)}%`} />
        <StatCard label="Terminal capacity" value={fmt(airport.cap, 1)} unit="mn PAX / yr" tone="primary" trend={`Utilisation @ 2035: ${(capUtil * 100).toFixed(0)}%`} />
        <StatCard label="80% threshold" value={threshold80 ?? "—"} tone="accent" trend={threshold80 ? "Begin next-terminal build" : "Not reached in horizon"} />
      </div>

      {threshold80 && capUtil >= 0.8 && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-5 w-5" style={{ color: "var(--accent)" }} />
          <div>
            <div className="font-medium text-foreground">
              Capacity trigger: {airport.name} crosses 80% of {fmt(airport.cap, 1)} mn PAX in <b>{threshold80}</b>.
            </div>
            <div className="text-xs text-muted-foreground">
              Recommend CAPEX greenlight for terminal expansion, with commissioning 24–30 months ahead of saturation.
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel
          title={`${airport.name} — passenger forecast`}
          subtitle="Hindcast vs AI ensemble (mn PAX). Shaded band = 88% CI."
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer>
              <ComposedChart data={pax}>
                <defs>
                  <linearGradient id="paxBand" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--air)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--air)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="high" stroke="none" fill="url(#paxBand)" name="CI upper" />
                <Area type="monotone" dataKey="low" stroke="none" fill="var(--background)" name="CI lower" />
                <Line type="monotone" dataKey="forecast" stroke="var(--air)" strokeWidth={2.5} dot={false} name="AI forecast" />
                <Line type="monotone" dataKey="actual" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                <ReferenceLine y={airport.cap * 0.8} stroke="var(--accent)" strokeDasharray="4 4" label={{ value: "80% capacity", fill: "var(--accent)", fontSize: 10, position: "insideTopRight" }} />
                <ReferenceLine y={airport.cap} stroke="var(--destructive)" strokeDasharray="4 4" label={{ value: "Capacity", fill: "var(--destructive)", fontSize: 10, position: "insideTopRight" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Model drivers" subtitle="SHAP-style feature attribution (explainable)">
          <div className="space-y-3">
            {[
              { name: "District GSDP", w: 0.28 },
              { name: "Tourism arrivals", w: 0.19 },
              { name: "Population / urbanisation", w: 0.16 },
              { name: "Industrial output", w: 0.13 },
              { name: "Road & rail catchment", w: 0.11 },
              { name: "Aviation Policy 2026 uplift", w: 0.08 },
              { name: "Seasonality / event calendar", w: 0.05 },
            ].map((d) => (
              <div key={d.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="mono">{(d.w * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${d.w * 100}%`, background: "linear-gradient(90deg,var(--air),var(--primary))" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title={`${airport.name} — air cargo forecast`} subtitle="Domestic vs international, 000 tonnes / yr">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={cargo}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="domestic" name="Domestic" stackId="c" fill="var(--cargo)" radius={[3,3,0,0]} />
                <Bar dataKey="international" name="International" stackId="c" fill="var(--port)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="All-airport 2035 outlook" subtitle="Sorted by projected passenger volume">
          <div className="space-y-2">
            {airports
              .map((a) => ({ a, y2035: paxForecast(a.code).find((r) => r.year === 2035)!.forecast }))
              .sort((x, y) => y.y2035 - x.y2035)
              .map(({ a, y2035 }) => {
                const util = a.cap ? y2035 / a.cap : 0;
                return (
                  <button
                    key={a.code}
                    onClick={() => setCode(a.code)}
                    className="flex w-full items-center gap-3 rounded-md border border-border/60 bg-secondary/30 p-2.5 text-left transition hover:bg-secondary"
                  >
                    <div className="mono w-12 text-xs text-muted-foreground">{a.code}</div>
                    <div className="flex-1">
                      <div className="text-sm">{a.name}</div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background">
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(100, util * 100)}%`,
                            background: util > 0.8 ? "var(--destructive)" : util > 0.6 ? "var(--accent)" : "var(--air)",
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mono text-sm">{fmt(y2035, 2)} mn</div>
                      <div className="text-[10px] text-muted-foreground">{(util * 100).toFixed(0)}% of cap</div>
                    </div>
                    {util > 0.8 && (
                      <TrendingUp className="h-4 w-4" style={{ color: "var(--destructive)" }} />
                    )}
                  </button>
                );
              })}
          </div>
        </Panel>
      </div>
    </>
  );
}
