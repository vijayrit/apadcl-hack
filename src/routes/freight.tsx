import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis,
} from "recharts";
import { PageHeader, Panel, StatCard } from "@/components/ui-kit";
import { freightForecast, commodities, ports, districts, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/freight")({
  head: () => ({
    meta: [
      { title: "Freight · APMB Multimodal Forecasting" },
      { name: "description", content: "AI-driven cargo demand forecasting for Andhra Pradesh across Road, Rail and Ports up to 2047, with commodity- and district-level intelligence." },
    ],
  }),
  component: FreightPage,
});

function FreightPage() {
  const rows = freightForecast();
  const f24 = rows.find((r) => r.year === 2024)!;
  const f47 = rows.find((r) => r.year === 2047)!;

  return (
    <>
      <PageHeader
        eyebrow="APMB · Multimodal Freight"
        title="Cargo demand across Road, Rail & Ports · 2047"
        description="Continuous forecasting platform integrating LDB, e-Way Bill, FASTag, FOIS, ICEGATE and industrial park signals. Commodity-, corridor- and district-level intelligence for logistics planning."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Road freight · 2047" value={fmt(f47.road, 0)} unit="mn t" tone="road" trend={`+${(((f47.road / f24.road) - 1) * 100).toFixed(0)}% vs 2024`} />
        <StatCard label="Rail freight · 2047" value={fmt(f47.rail, 0)} unit="mn t" tone="rail" trend={`+${(((f47.rail / f24.rail) - 1) * 100).toFixed(0)}% vs 2024`} />
        <StatCard label="Port throughput · 2047" value={fmt(f47.port, 0)} unit="mn t" tone="port" trend={`+${(((f47.port / f24.port) - 1) * 100).toFixed(0)}% vs 2024`} />
        <StatCard label="Modal shift target" value="18" unit="% road → rail/port" tone="accent" trend="Cuts logistics cost & CO₂" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Modal split forecast 2019–2047" subtitle="mn tonnes / year" className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={rows}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="road" stroke="var(--road)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="rail" stroke="var(--rail)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="port" stroke="var(--port)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Port utilisation" subtitle="2024 · mn tonnes vs designed capacity">
          <div className="h-72">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="25%"
                outerRadius="95%"
                data={ports.map((p) => ({
                  name: p.name,
                  value: p.capacity > 0 ? Math.round((p.tmt2024 / p.capacity) * 100) : 0,
                  fill: p.tmt2024 / p.capacity > 0.75 ? "var(--destructive)"
                       : p.tmt2024 / p.capacity > 0.55 ? "var(--accent)" : "var(--port)",
                }))}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={4} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
            {ports.map((p) => (
              <div key={p.code} className="flex items-center justify-between rounded border border-border/60 px-2 py-1">
                <span className="text-muted-foreground">{p.name}</span>
                <span className="mono">{p.tmt2024}/{p.capacity}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Commodity-wise modal share" subtitle="% of tonnage, 2024 baseline">
          <div className="h-80">
            <ResponsiveContainer>
              <BarChart data={commodities} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={10} width={140} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="road" name="Road" stackId="m" fill="var(--road)" />
                <Bar dataKey="rail" name="Rail" stackId="m" fill="var(--rail)" />
                <Bar dataKey="port" name="Port" stackId="m" fill="var(--port)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="District freight generation ↔ attraction" subtitle="Index (0-100), 2024 baseline">
          <div className="space-y-1.5">
            {districts.map((d) => (
              <div key={d.name} className="rounded-md border border-border/60 p-2">
                <div className="flex items-center justify-between text-xs">
                  <span>{d.name}</span>
                  <span className="mono text-muted-foreground">
                    gen {d.generation} · att {d.attraction}
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-1">
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full" style={{ width: `${d.generation}%`, background: "var(--cargo)" }} />
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full" style={{ width: `${d.attraction}%`, background: "var(--port)" }} />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "var(--cargo)" }} /> Generation</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: "var(--port)" }} /> Attraction</span>
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}
