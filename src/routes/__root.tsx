import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import {
  LayoutDashboard,
  Plane,
  Truck,
  Route as RouteIcon,
  SlidersHorizontal,
  Database,
} from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/airports", label: "Airports", icon: Plane },
  { to: "/freight", label: "Freight", icon: Truck },
  { to: "/routes", label: "Routes & Corridors", icon: RouteIcon },
  { to: "/scenarios", label: "Scenarios", icon: SlidersHorizontal },
  { to: "/methodology", label: "Data & Methodology", icon: Database },
] as const;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Off the corridor</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route isn't in the forecasting graph. Head back to the command center.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Go to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This view didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. You can retry or return to the overview.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/10"
          >
            Overview
          </a>
        </div>
      </div>
    </div>
  );
}

const TITLE = "AP Freight & Mobility Intelligence — APADCL × APMB";
const DESC =
  "AI decision-support platform for Andhra Pradesh: passenger and cargo demand forecasting, corridor route planning, and scenario modelling across Air, Road, Rail and Ports.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Overview · AP Freight & Mobility Intelligence" },
      { property: "og:title", content: "Overview · AP Freight & Mobility Intelligence" },
      { name: "twitter:title", content: "Overview · AP Freight & Mobility Intelligence" },
      { name: "description", content: "Unified command center for Andhra Pradesh: passenger and cargo demand forecasts across air, road, rail and ports." },
      { property: "og:description", content: "Unified command center for Andhra Pradesh: passenger and cargo demand forecasts across air, road, rail and ports." },
      { name: "twitter:description", content: "Unified command center for Andhra Pradesh: passenger and cargo demand forecasts across air, road, rail and ports." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a17e8685-97be-4158-8122-bc7d663b9e67/id-preview-2a4f272c--7b730b89-7a5a-4d92-b685-be1f591d3cb0.lovable.app-1784443713084.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a17e8685-97be-4158-8122-bc7d663b9e67/id-preview-2a4f272c--7b730b89-7a5a-4d92-b685-be1f591d3cb0.lovable.app-1784443713084.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-radial-glow">
      <div className="min-h-screen bg-grid">
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center gap-6 px-6 py-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-[oklch(0.78_0.14_195)] to-[oklch(0.72_0.15_155)] text-[oklch(0.16_0.03_240)] shadow-glow">
                <span className="font-display text-lg font-bold">AP</span>
              </div>
              <div className="leading-tight">
                <div className="font-display text-sm font-semibold tracking-tight">
                  Freight & Mobility Intelligence
                </div>
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  APADCL · APMB · Govt. of Andhra Pradesh
                </div>
              </div>
            </Link>
            <nav className="ml-6 hidden flex-1 items-center gap-1 md:flex">
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  className="group flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                  activeProps={{
                    className:
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm bg-secondary text-foreground",
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto hidden items-center gap-2 md:flex">
              <span className="chip">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.15_155)] animate-pulse" />
                Live models
              </span>
              <span className="chip mono">v0.9 · POC</span>
            </div>
          </div>
          {/* Mobile nav */}
          <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground"
                activeProps={{
                  className:
                    "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs bg-secondary text-foreground",
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-[1400px] px-6 py-8">{children}</main>
        <footer className="border-t border-border/60 py-6">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 text-xs text-muted-foreground md:flex-row">
            <div>
              Proof-of-concept · Forecast horizons: Aviation 2035 · Freight 2047 ·
              Hindcast target ≥ 85%
            </div>
            <div className="mono">Explainable AI · Public-data only · DPDP-compliant</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Outlet />
      </AppShell>
    </QueryClientProvider>
  );
}
