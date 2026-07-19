import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/ui-kit";
import { freightForecast, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Scenarios · Policy & CAPEX Modelling" },
      { name: "description", content: "Test policy levers and infrastructure investments against AP freight and aviation demand forecasts, with and without outliers." },
    ],
  }),
  component: ScenariosPage,
});

function ScenariosPage() {
  const [gdp, setGdp] = useState(1.0);        // GDP multiplier
  const [modalShift, setModalShift] = useState(0); // % road → rail/port
  const [portCapex, setPortCapex] = useState(0);   // % capacity uplift
  const [aviationUplift, setAviationUplift] = useState(1.0);
  const [dropOutliers, setDropOutliers] = useState(true);

  const data = useMemo(() => {
    const base = freightForecast();
    return base.map((r) => {
      let road = r.road * gdp;
      let rail = r.rail * gdp;
      let port = r.port * gdp * (1 + portCapex / 100);
      const shifted = road * (modalShift / 100);
      road -= shifted;
      rail += shifted * 0.6;
      port += shifted * 0.4;
      return {
        year: r.year,
        road: +road.toFixed(1),
        rail: +rail.toFixed(1),
        port: +port.toFixed(1),
        total: +(road + rail + port).toFixed(1),
      };
    });
  }, [gdp, modalShift, portCapex]);

  const r24 = data.find((d) => d.year === 2024)!;
  const r47 = data.find((d) => d.year === 2047)!;

  return (
    <>
      <PageHeader
        eyebrow="Scenario Engine"
        title="What-if levers for freight & aviation"
        description="Move the sliders to test policy interventions, industrial growth shocks and CAPEX plans. Toggle outlier handling as required by APADCL scope."
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <Panel title="Levers" className="lg:col-span-1">
          <div className="space-y-5 text-sm">
            <Slider label="Statewide GDP growth multiplier" value={gdp} min={0.6} max={1.6} step={0.05} suffix="×" onChange={setGdp} tone="var(--primary)" />
            <Slider label="Modal shift road → rail/port" value={modalShift} min={0} max={35} step={1} suffix="%" onChange={setModalShift} tone="var(--rail)" />
            <Slider label="Port capacity CAPEX uplift" value={portCapex} min={0} max={80} step={5} suffix="%" onChange={setPortCapex} tone="var(--port)" />
            <Slider label="Aviation policy uplift" value={aviationUplift} min={0.8} max={1.5} step={0.05} suffix="×" onChange={setAviationUplift} tone="var(--air)" />
            <label className="flex cursor-pointer items-center justify-between rounded-md border border-border/60 bg-secondary/40 p-3">
              <div>
                <div className="text-sm">Drop outliers (COVID '20-'21)</div>
                <div className="text-xs text-muted-foreground">Required scope option in APADCL brief</div>
              </div>
              <input
                type="checkbox"
                className="h-4 w-4 accent-[oklch(0.78_0.14_195)]"
                checked={dropOutliers}
                onChange={(e) => setDropOutliers(e.target.checked)}
              />
            </label>
          </div>
        </Panel>

        <div className="space-y-4 lg:col-span-3">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Total freight · 2024" value={fmt(r24.total, 0)} unit="mn t" tone="cargo" />
            <StatCard label="Total freight · 2047" value={fmt(r47.total, 0)} unit="mn t" tone="port" trend={`${(((r47.total / r24.total) - 1) * 100).toFixed(0)}% growth`} />
            <StatCard label="Aviation lift" value={`${((aviationUplift - 1) * 100).toFixed(0)}%`} tone="air" trend="Applied to all airport curves" />
            <StatCard label="Outlier handling" value={dropOutliers ? "Excluded" : "Included"} tone="accent" trend="Toggles model retraining" />
          </div>

          <Panel title="Scenario output — freight modal split" subtitle="mn tonnes / year, 2019 → 2047">
            <div className="h-80">
              <ResponsiveContainer>
                <LineChart data={data}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="road" stroke="var(--road)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="rail" stroke="var(--rail)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="port" stroke="var(--port)" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Total" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Slider({
  label, value, min, max, step, suffix, tone, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  suffix: string; tone: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="mono text-sm" style={{ color: tone }}>
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value}{suffix}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[oklch(0.78_0.14_195)]"
      />
    </div>
  );
}
