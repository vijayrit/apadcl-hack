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

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const TITLE = "AP MSME DPR Portal — Bankable project reports in minutes";
const DESC =
  "Andhra Pradesh MSME entrepreneurs log in with a mobile OTP, answer guided questions about their business, and download a bankable Detailed Project Report as PDF, Excel or Word.";

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
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
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

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-6xl">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page isn't part of the portal. Head back to the start.
        </p>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const { session } = useAuth();
  const phone = (session?.user.user_metadata as { phone?: string } | undefined)?.phone;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="rule-top" />
      <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-lg text-primary-foreground">
            ఆ
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base">AP MSME DPR Portal</span>
            <span className="mono block text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Andhra Pradesh · Entrepreneur services
            </span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 text-sm">
          {session ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "rounded-md px-3 py-1.5 bg-secondary text-foreground" }}
              >
                My projects
              </Link>
              <span className="mono hidden text-xs text-muted-foreground sm:inline">
                {phone ? `+91 ${phone}` : ""}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-secondary"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/auth" className="rounded-md bg-primary px-4 py-1.5 text-primary-foreground">
              Login with OTP
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-weave">
        <Header />
        <main className="mx-auto max-w-[1180px] px-5 py-8">
          <Outlet />
        </main>
        <footer className="border-t border-border py-6">
          <div className="mx-auto max-w-[1180px] px-5 text-xs text-muted-foreground">
            A guided DPR builder for Andhra Pradesh micro, small and medium enterprises.
            Financial projections are indicative and should be reviewed with your banker.
          </div>
        </footer>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
