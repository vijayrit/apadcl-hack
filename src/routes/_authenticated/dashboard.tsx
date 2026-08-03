import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { completion, computeDpr, inr, type Answers } from "@/lib/dpr";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My DPR projects · AP MSME DPR Portal" },
      { name: "description", content: "All your saved Detailed Project Reports — resume the questionnaire, review viability and download the report as PDF, Excel or Word." },
      { property: "og:title", content: "My DPR projects · AP MSME DPR Portal" },
      { property: "og:description", content: "Resume, review and download your MSME project reports." },
    ],
  }),
  component: Dashboard,
});

type Project = {
  id: string;
  business_name: string;
  status: string;
  answers: Answers;
  updated_at: string;
};

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from("dpr_projects")
        .select("id, business_name, status, answers, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as Project[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const userId = userRes.user?.id;
      if (!userId) throw new Error("Please sign in again.");
      const { data, error } = await supabase
        .from("dpr_projects")
        .insert({ user_id: userId, business_name: "Untitled enterprise" })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return data.id as string;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/projects/$id", params: { id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create the project"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dpr_projects").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Project deleted");
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <span className="chip">My workspace</span>
          <h1 className="mt-3 text-4xl">My DPR projects</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Each project is one enterprise. Answer the questions once, download the report as often as you need.
          </p>
        </div>
        <button
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
          New DPR
        </button>
      </div>

      {projects.isLoading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </div>
      ) : projects.data?.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {projects.data.map((p) => {
            const done = completion(p.answers ?? {});
            const c = computeDpr(p.answers ?? {});
            return (
              <div key={p.id} className="paper p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl">{p.business_name || "Untitled enterprise"}</h2>
                    <div className="mono mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {String(p.answers?.sector ?? "Sector pending")} · updated{" "}
                      {new Date(p.updated_at).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                  <button
                    onClick={() => remove.mutate(p.id)}
                    aria-label="Delete project"
                    className="rounded-md border border-input p-2 text-muted-foreground hover:bg-secondary"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-[color:var(--leaf)]" style={{ width: `${done.pct}%` }} />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>{done.pct}% of required answers</span>
                  <span className="mono">{c.projectCost > 0 ? inr(c.projectCost) : "cost pending"}</span>
                </div>

                <Link
                  to="/projects/$id"
                  params={{ id: p.id }}
                  className="mt-4 inline-flex rounded-md border border-input px-3 py-1.5 text-sm hover:bg-secondary"
                >
                  {done.pct === 100 ? "Review & download" : "Continue questionnaire"}
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="paper mt-6 p-10 text-center">
          <h2 className="text-2xl">No projects yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Start your first DPR. It takes about ten minutes — you can save and return any time.
          </p>
          <button
            onClick={() => create.mutate()}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
          >
            <FilePlus2 className="h-4 w-4" /> Create my first DPR
          </button>
        </div>
      )}
    </>
  );
}
