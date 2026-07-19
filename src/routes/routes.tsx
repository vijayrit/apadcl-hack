import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MapPin, Plane } from "lucide-react";
import { PageHeader, Panel, StatCard } from "@/components/ui-kit";
import { corridors, routeRecos, modeMeta, fmt } from "@/lib/mock-data";

export const Route = createFileRoute("/routes")({
  head: () => ({
    meta: [
      { title: "Routes & Corridors · AP Freight & Mobility" },
      { name: "description", content: "AI-recommended air routes and freight corridors for Andhra Pradesh — demand potential, connectivity gaps and multimodal optimisation." },
    ],
  }),
  component: RoutesPage,
});

function RoutesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Routes & Corridors"
        title="Where the next connection should go"
        description="Route recommendations for APADCL air services and corridor optimisation for APMB freight — both grounded in demand potential, catchment, connectivity gaps and regional growth."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Recommended air routes" value={routeRecos.length} tone="air" trend="Ranked by potential score" />
        <StatCard label="Freight corridors tracked" value={corridors.length} tone="road" trend="Road · Rail · Coastal" />
        <StatCard label="High-priority connectivity gaps" value={routeRecos.filter(r => r.gap === "High").length} tone="accent" />
        <StatCard label="Avg. logistics cost saving" value="14%" tone="port" trend="Modelled from modal shift" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Air route recommendations" subtitle="APADCL · new domestic & international services">
          <div className="space-y-2">
            {routeRecos.map((r) => (
              <div key={`${r.from}-${r.to}`} className="rounded-md border border-border/60 bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Plane className="h-3.5 w-3.5" style={{ color: "var(--air)" }} />
                    <span className="font-medium">{r.from}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{r.to}</span>
                    <span className="chip">{r.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="mono text-sm">{r.potential}</div>
                    <div className="text-[10px] text-muted-foreground">potential</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{r.basis}</span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      background: r.gap === "High" ? "oklch(0.68 0.20 25 / 0.15)"
                        : r.gap === "Medium" ? "oklch(0.82 0.15 82 / 0.15)"
                        : "oklch(0.72 0.15 155 / 0.15)",
                      color: r.gap === "High" ? "var(--destructive)"
                        : r.gap === "Medium" ? "var(--accent)"
                        : "var(--port)",
                    }}
                  >
                    {r.gap} gap
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full"
                    style={{
                      width: `${r.potential}%`,
                      background: "linear-gradient(90deg,var(--air),var(--pax))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Freight corridor intelligence" subtitle="APMB · tonnage, congestion & unit cost">
          <div className="space-y-2">
            {corridors.map((c) => {
              const meta = modeMeta[c.mode];
              return (
                <div key={c.id} className="rounded-md border border-border/60 bg-secondary/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5" style={{ color: meta.token }} />
                        <span className="font-medium">{c.name}</span>
                      </div>
                      <div className="mono mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {meta.label} · {c.id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mono text-sm">{fmt(c.tonnage, 0)} mn t</div>
                      <div className="text-[10px] text-muted-foreground">annual</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="mb-1 flex justify-between">
                        <span className="text-muted-foreground">Congestion</span>
                        <span className="mono">{(c.congestion * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-background">
                        <div
                          className="h-full"
                          style={{
                            width: `${c.congestion * 100}%`,
                            background: c.congestion > 0.65 ? "var(--destructive)"
                              : c.congestion > 0.4 ? "var(--accent)" : "var(--port)",
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between">
                        <span className="text-muted-foreground">Cost ₹/t-km</span>
                        <span className="mono">{c.cost.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-background">
                        <div className="h-full" style={{ width: `${(c.cost / 4) * 100}%`, background: meta.token }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Multimodal optimisation opportunities" subtitle="Model-suggested shifts (with-outlier / without-outlier scenarios shown)">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { title: "Coal · NH-16 → Rail VSKP-KRSN", save: "₹ 380 Cr/yr", note: "Divert 22% road tonnage to rail; cuts 18% CO₂ from corridor." },
              { title: "Containers · Krishnapatnam → Coastal", save: "₹ 210 Cr/yr", note: "Feeder coastal service to Chennai/Kolkata; 32% fuel savings." },
              { title: "Seafood cold-chain · Road-only", save: "+9 corridors", note: "Keep road-dominant; add refrigerated rail rakes @ 3 nodes." },
            ].map((s) => (
              <div key={s.title} className="rounded-md border border-border/60 bg-secondary/30 p-4">
                <div className="text-sm font-medium">{s.title}</div>
                <div className="mono mt-1 text-lg" style={{ color: "var(--accent)" }}>{s.save}</div>
                <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
